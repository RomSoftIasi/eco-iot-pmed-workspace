const opendsu = require('opendsu');
const storage = opendsu.loadApi('storage');
const resolver = opendsu.loadAPI('resolver');
const SharedStorage = require("../services/SharedStorage.js");
const keySSISpace = opendsu.loadAPI('keyssi');
const getObjectNameFromPath = require("../utils/dsusMapper.js");
const {getHL7TransformationRegistry}  =  require("./HL7TransformationRegistry.js");
class DSUService {
    PATH = '/';

    constructor(path = this.PATH) {
        this.DSUStorage = storage.getDSUStorage();
        this.storageService = SharedStorage.getSharedStorage(this.DSUStorage);
        this.PATH = path;
        this.HL7TransformationRegistry = getHL7TransformationRegistry();
    }

    refreshDSU(ssi, callback) {
        resolver.invalidateDSUCache(ssi, (err) => {
            if (err) {
                return callback(err);
            }
            resolver.loadDSU(ssi, callback);
        });
    }

    letDSUStorageInit = () => {
        if (typeof this.initializationPromise === 'undefined') {
            this.initializationPromise = new Promise((resolve) => {
                if (this.DSUStorage === undefined || this.DSUStorage.directAccessEnabled === true) {
                    return resolve();
                }
                this.DSUStorage.enableDirectAccess(() => {
                    resolve();
                });
            });
        }
        return this.initializationPromise;
    };

    getFilteredEntities(path, filterPath, callback) {
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.listMountedDSUs(path, (err, dsuList) => {
                if (err) {
                    return callback(err, undefined);
                }
                dsuList = dsuList.filter(dsu => dsu.path.startsWith(filterPath + "/"));
                this.readDSUsData(dsuList, callback);
            });
        });
    }

    async readDsuDataAsync(ssi) {
        return await this.asyncMyFunction(this.readDsuData, [...arguments]);
    }

    readDsuData(ssi, callback) {
        resolver.loadDSU(ssi, (err, dsu) => {
            if (err) {
                return callback(err);
            }
            dsu.readFile('/data.json', (err, content) => {
                if (err) {
                    return callback(err, undefined);
                }
                let entity = JSON.parse(content.toString());
                callback(undefined, entity);
            });
        });
    }

    readDSUsData(dsuList, callback) {
        let entities = [];
        let getServiceDsu = (dsuItem) => {
            let objectName = this.PATH.substring(1);
            let itemPathSplit = dsuItem.path.split('/');
            if (itemPathSplit.length > 1) {
                objectName = itemPathSplit[0];
            }

            this.readDsuData(dsuItem.identifier, (err, entity) => {
                if (err) {
                    entities.slice(0);
                    return callback(err, undefined);
                }
                entity.objectName = objectName;
                entities.push(entity);

                if (dsuList.length === 0) {
                    return callback(undefined, entities);
                }
                getServiceDsu(dsuList.shift());
            })

        };
        if (dsuList.length === 0) {
            return callback(undefined, []);
        }
        getServiceDsu(dsuList.shift());
    }

    getEntities(path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.listMountedDSUs(path, (err, dsuList) => {
                if (err) {
                    return callback(err, undefined);
                }
                this.readDSUsData(dsuList, callback);
            });
        });
    }

    async getEntitiesAsync(path) {
        return this.asyncMyFunction(this.getEntities, [...arguments]);
    }

    getEntity(uid, path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.getItem(this._getDsuStoragePath(uid, path), (err, content) => {
                if (err) {
                    return callback(err, undefined);
                }
                let textDecoder = new TextDecoder('utf-8');
                callback(undefined, JSON.parse(textDecoder.decode(content)));
            });
        });
    }

    async getEntityAsync(uid, path) {
        return this.asyncMyFunction(this.getEntity, [...arguments]);
    }

    createDSUAndMount(path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        const keySSISpace = opendsu.loadAPI('keyssi');
        const config = opendsu.loadAPI('config');

        config.getEnv('domain', (err, domain) => {
            if (err || !domain) {
                throw new Error('No domain was set up in the environment configuration file.');
            }
            const templateSSI = keySSISpace.createTemplateSeedSSI(domain);
            resolver.createDSU(templateSSI, (err, dsuInstance) => {
                if (err) {
                    return callback(err);
                }
                dsuInstance.getKeySSIAsString((err, keySSI) => {
                    if (err) {
                        return callback(err);
                    }
                    this.letDSUStorageInit().then(() => {
                        const keySSIObj = keySSISpace.parse(keySSI);
                        keySSIObj.getAnchorId((err, anchorId) => {
                            if (err) {
                                return callback(err)
                            }
                            this.DSUStorage.mount(path + '/' + anchorId, keySSI, (err) => {
                                if (err) {
                                    return callback(err)
                                }
                                callback(undefined, keySSI);
                            });
                        });
                    });
                });
            });
        });
    }

    saveEntity(entity, path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);

        const config = opendsu.loadAPI('config');
        config.getEnv('hl7', (err, hl7Enabled) => {

            if (hl7Enabled) {
                const objectName = getObjectNameFromPath(path);
                console.log("*******", objectName, "****");
                if (this.HL7TransformationRegistry.transformationFnExists(objectName)) {
                    let transformationMethods = this.HL7TransformationRegistry.getTransformationFn(objectName);
                    let originalEntity = entity;
                    for (let i = 0; i < transformationMethods.length; i++) {
                        let tranformMethod = transformationMethods[i];
                        originalEntity = tranformMethod(originalEntity);
                    }
                }
            }

            config.getEnv('domain', (err, domain) => {
                if (err || !domain) {
                    throw new Error('No domain was set up in the environment configuration file.');
                }

                const templateSSI = keySSISpace.createTemplateSeedSSI(domain);
                resolver.createDSU(templateSSI, (err, dsuInstance) => {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }

                    dsuInstance.getKeySSIAsString((err, seedSSI) => {
                        if (err) {
                            return callback(err);
                        }

                        const keySSIObj = keySSISpace.parse(seedSSI);
                        keySSIObj.getAnchorId((err, anchorId) => {
                            if (err) {
                                return callback(err);
                            }
                            dsuInstance.getKeySSIAsString('sread', (err, sreadSSI) => {
                                if (err) {
                                    return callback(err);
                                }
                                this.letDSUStorageInit().then(() => {
                                    this.DSUStorage.mount(path + '/' + anchorId, seedSSI, (err) => {
                                        if (err) {
                                            console.log(err);
                                        }
                                        entity.uid = anchorId;

                                        this.updateEntity(entity, path, (err, entity) => {
                                            if (err) {
                                                return callback(err, entity);
                                            }

                                            entity.keySSI = seedSSI;
                                            entity.sReadSSI = sreadSSI;
                                            callback(undefined, entity);
                                        });
                                    });
                                });
                            });

                        });

                    });
                });
            });


        })
    }

    async saveEntityAsync(entity, path) {
        return this.asyncMyFunction(this.saveEntity, [...arguments]);
    }

    updateEntity(entity, path, callback) {
        entity.volatile = undefined;
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.setObject(this._getDsuStoragePath(entity.uid, path), entity, (err) => {
                if (err) {
                    return callback(err, undefined);
                }
                callback(undefined, entity);
            });
        });
    }

    async updateEntityAsync(entity, path) {
        return this.asyncMyFunction(this.updateEntity, [...arguments]);
    }

    mountEntity(keySSI, path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);

        const keySSIObj = keySSISpace.parse(keySSI);
        keySSIObj.getAnchorId((err, anchorId) => {
            if (err) {
                return callback(err)
            }
            this.letDSUStorageInit().then(() => {
                this.DSUStorage.mount(path + '/' + anchorId, keySSI, (err) => {
                    this.getEntity(anchorId, path, (err, entity) => {
                        if (err) {
                            return callback(err, undefined);
                        }
                        callback(undefined, entity);
                    });
                });
            });
        });
    }

    async mountEntityAsync(keySSI, path) {
        return this.asyncMyFunction(this.mountEntity, [...arguments]);
    }

    unmountEntity(uid, path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        let unmountPath = path + '/' + uid;
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.unmount(unmountPath, (err, result) => {
                if (err) {
                    return callback(err, undefined);
                }
                callback(undefined, result);
            });
        });
    }

    async unmountEntityAsync(uid, path) {
        return this.asyncMyFunction(this.unmountEntity, [...arguments]);
    }

    getSReadSSI(seedSSI, callback) {
        const keySSISpace = opendsu.loadAPI('keyssi');
        let parsedSeedSSI = keySSISpace.parse(seedSSI);
        return parsedSeedSSI.derive((err, derivedSSI) => {
            if (err) {
                return callback(err);
            }
            callback(undefined, derivedSSI.getIdentifier())
        });
    }

    getAnchorId(ssi, callback) {
        const keySSIObj = keySSISpace.parse(ssi);
        return keySSIObj.getAnchorId(callback);
    }

    async getAnchorIdAsync(ssi) {
        return this.asyncMyFunction(this.getAnchorId, [...arguments]);
    }

    _getDsuStoragePath(keySSI, path = this.PATH) {
        return path + '/' + keySSI + '/data.json';
    }

    swapParamsIfPathIsMissing(path, callback) {
        return typeof path === 'function' ? [this.PATH, path] : [path, callback];
    }

    asyncMyFunction = (func, params) => {
        func = func.bind(this);
        return new Promise((resolve, reject) => {
            func(...params, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            });
        });
    };

    cloneDSU = (tpUid, fromDSUSSI, toDSUPath, callback) => {
        this.createDSUAndMount(toDSUPath, (err, keySSI) => {
            if (err) {
                return callback(err);
            }
            this.copyDSU(tpUid, fromDSUSSI, keySSI, (err, copiedFiles) => {
                if (err) {
                    return callback(err);
                }
                let cloneDetails = {
                    ssi: keySSI,
                    copiedFiles: copiedFiles,
                };
                callback(undefined, cloneDetails);
            });
        });
    };

    copyDSU = (tpUid, fromDSUSSI, toDSUSSI, callback) => {
        resolver.loadDSU(fromDSUSSI, {skipCache: true}, (err, fromDSU) => {
            if (err) {
                return callback(err);
            }
            resolver.loadDSU(toDSUSSI, {skipCache: true}, (err, toDSU) => {
                if (err) {
                    return callback(err);
                }
                fromDSU.listFiles('/', (err, files) => {
                    if (err) {
                        return callback(err);
                    }
                    let copiedFiles = [];
                    let copyFileToDSU = (file) => {
                        fromDSU.readFile(file, (err, data) => {
                            if (err) {
                                return copyFileToDSU(files.pop());
                            }

                            this.getAnchorId(toDSUSSI, (err, anchorId) => {
                                if (err) {
                                    return callback(err);
                                }
                                if (file === 'data.json') {
                                    data = JSON.parse(data.toString());
                                    data.genesisUid = data.uid;
                                    data.uid = anchorId;
                                    data.keySSI = toDSUSSI;
                                    data.tpUid = tpUid;
                                    data = JSON.stringify(data);
                                }
                                toDSU.writeFile(file, data, (err) => {
                                    if (err) {
                                        return callback(err);
                                    }

                                    copiedFiles.push(file);
                                    if (files.length === 0) {
                                        return callback(undefined, copiedFiles);
                                    }
                                    copyFileToDSU(files.pop());
                                });
                            });
                        });
                    };
                    copyFileToDSU(files.pop());
                });
            });
        });
    };


    cancelBatchOnError(error, callback) {
        this.storageService.cancelBatch((err) => {
            if (err) {
                console.error(err);
            }

            callback(error);
        });
    }

    copyFile(path, destination, callback) {
        this.readFile(path, (err, data) => {
            if (err) {
                return callback(err);
            }
            this.writeFile(destination, data, callback)
        })
    }

    readFile(path, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.readFile(path, (err, data) => {
                if (err) {
                    return callback(err, undefined);
                }
                return callback(null, data);
            });
        });
    }

    writeFile(path, fileBuffer, callback) {
        [path, callback] = this.swapParamsIfPathIsMissing(path, callback);
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.writeFile(path, fileBuffer, (err, data) => {
                if (err) {
                    return callback(err, undefined);
                }
                return callback(null, data);
            });
        });
    }

    async readFileAsync(path) {
        return this.asyncMyFunction(this.readFile, [...arguments]);
    }

    async writeFileAsync(path, fileBuffer) {
        return this.asyncMyFunction(this.writeFile, [...arguments]);
    }

    getEntityPath(keySSI, pathPrefix, callback) {
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.listMountedDSUs(pathPrefix, (err, dsuList) => {
                const dsu = dsuList.find((dsu) => dsu.identifier === keySSI);
                if (!dsu) {
                    return callback(undefined, keySSI);
                }
                callback(undefined, dsu.path);
            });
        });
    }

    getMountedSSI(dsuUid, pathPrfix, callback) {

        if (typeof pathPrfix === "function") {
            callback = pathPrfix;
            pathPrfix = "/";
        }
        let searchedPath = this.PATH + "/" + dsuUid;
        if (searchedPath[0] === "/") {
            searchedPath = searchedPath.substring(1);
        }
        this.DSUStorage.listMountedDSUs(pathPrfix, (err, dsuList) => {
            if (err) {
                return callback(err);
            }

            const mountedDSU = dsuList.find(item => item.path === searchedPath);
            callback(undefined, mountedDSU.identifier);
        })
    }


    async getEntityPathAsync(knownIdentifier, pathPrefix) {
        return this.asyncMyFunction(this.getEntityPath, [...arguments]);
    }

    getEntityMountSSI(pathPrefix, entityUid, callback) {
        if (typeof entityUid === "function") {
            callback = entityUid;
            entityUid = undefined;
        }
        this.letDSUStorageInit().then(() => {
            this.DSUStorage.listMountedDSUs(pathPrefix, (err, dsuList) => {
                if (err) {
                    return callback(err);
                }
                if (dsuList.length === 0) {
                    return callback(new Error('No mounted entity found for ' + pathPrefix));
                }

                const targetedDSU = entityUid ? dsuList.find(dsu => dsu.path === entityUid) : dsuList[0];
                return callback(undefined, targetedDSU.identifier);
            });
        });
    }
}

module.exports = DSUService;
