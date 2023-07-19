const opendsu = require("opendsu");
const keySSISpace = opendsu.loadApi('keyssi')
const KEYSSI_FILE_PATH = 'keyssi.json';
const indexedTimestampField = "__timestamp";

class SharedStorage {

    constructor(dsuStorage) {
        const scApi = opendsu.loadApi("sc");
        scApi.getMainEnclave((err, enclaveDB) => {
            if (err) {
                return console.log(err);
            }
            this.mydb = enclaveDB;
            this.DSUStorage = dsuStorage;
        });
    }

    filter = (tableName, query, sort, limit, callback) => this.letDatabaseInit()
        .then(() => this.mydb.filter(tableName, query, sort, limit, callback)).catch(this.logError);

    filterAsync = async (tableName, query, sort, limit) => this.asyncMyFunction(this.filter, [tableName, query, sort, limit]);

    getRecord = (tableName, key, callback) => this.letDatabaseInit()
        .then(() => this.mydb.getRecord(tableName, key, callback)).catch(this.logError);

    getRecordAsync = async (tableName, key) => this.asyncMyFunction(this.getRecord, [tableName, key]);

    getAllRecords = (tableName, callback) => this.letDatabaseInit()
        .then(() => this.filter(tableName, callback)).catch(this.logError);

    getAllRecordsAsync = async (tableName) => this.asyncMyFunction(this.getAllRecords, [tableName]);

    insertRecord = (tableName, key, record, callback) => {
        if (typeof record === 'function') {
            callback = record;
        }
        if ((typeof record === 'function') || (typeof record === 'undefined' && typeof callback === 'function')) {
            record = key;
            key = this.generateGUID();
            record.uid = key;
        }
        this.letDatabaseInit()
            .then(() => {
                this.mydb.getIndexedFields(tableName, (err, indexedFields) => {
                    if (err) {
                        return callback(err);
                    }
                    if (!indexedFields.includes(indexedTimestampField)) {
                        return this.mydb.addIndex(tableName, indexedTimestampField, ()=>{
                            return this.mydb.insertRecord(tableName, key, record, () => this.getRecord(tableName, key, callback));
                        });
                    }
                    return this.mydb.insertRecord(tableName, key, record, () => this.getRecord(tableName, key, callback));
                    });
            })
            .catch(this.logError);
    }

    insertRecordAsync = async (tableName, key, record) => this.asyncMyFunction(this.insertRecord, [tableName, key, record]);

    updateRecord = (tableName, key, record, callback) => this.letDatabaseInit()
        .then(() => this.mydb.updateRecord(tableName, key, record, callback)).catch(this.logError);

    updateRecordAsync = async (tableName, key, record) => this.asyncMyFunction(this.updateRecord, [tableName, key, record]);

    deleteRecord = (tableName, key, callback) => this.letDatabaseInit()
        .then(() => this.mydb.deleteRecord(tableName, key, callback)).catch(this.logError);

    deleteRecordAsync = async (tableName, key) => this.asyncMyFunction(this.deleteRecord, [tableName, key]);

    beginBatch = () => this.letDatabaseInit()
        .then(() => this.mydb.beginBatch()).catch(this.logError);

    beginBatchAsync = async () => this.asyncMyFunction((callback) => {
        this.letDatabaseInit()
            .then(() => {
                this.mydb.beginBatch();
                callback();
            }).catch(this.logError);
    }, []);

    cancelBatch = (callback) => this.letDatabaseInit()
        .then(() => this.mydb.cancelBatch(callback)).catch(this.logError);

    cancelBatchAsync = async () => this.asyncMyFunction(this.cancelBatch, []);

    commitBatch = (callback) => this.letDatabaseInit()
        .then(() => this.mydb.commitBatch(callback)).catch(this.logError);

    commitBatchAsync = async () => this.asyncMyFunction(this.commitBatch, []);

    letDatabaseInit = () => {
        return new Promise((resolve) => {
            const checkDatabaseState = () => {
                if (this.mydb !== undefined) {
                    clearInterval(repeatDatabaseCheck);
                    resolve();
                }
            }
            let repeatDatabaseCheck = setInterval(checkDatabaseState, 10);
        });
    }

    logError = (err) => {
        console.error(err);
    }

    asyncMyFunction = (func, params) => {
        func = func.bind(this);
        return new Promise((resolve, reject) => {
            func(...params, (err, data) => {
                if (err) {
                    return reject(err);
                }
                resolve(data);
            })
        })
    }

    getSharedSSI = (callback) => {
        this.DSUStorage.listFiles('/', (err, fileList) => {
            if (err) {
                return callback(err);
            }
            if (fileList.includes(KEYSSI_FILE_PATH)) {
                this.DSUStorage.getObject(KEYSSI_FILE_PATH, (err, data) => {
                    if (err) {
                        return callback(err);
                    }
                    const parsed = keySSISpace.parse(data.sharedSSI);
                    callback(undefined, parsed);
                });
            } else {
                return this.createSharedSSI(callback);
            }
        });
    }

    createSharedSSI = (callback) => {
        const ssi = keySSISpace.createSeedSSI('default');
        this.DSUStorage.setObject(KEYSSI_FILE_PATH, { sharedSSI: ssi.derive().getIdentifier() },(err)=>{
            if(err){
                return callback(err);
            }
            callback(undefined, ssi);
        });
    }

    generateGUID = () => {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }

        return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }
}

let instance;
module.exports.getSharedStorage = function (dsuStorage) {
    if (typeof instance === 'undefined') {
        instance = new SharedStorage(dsuStorage);
        const promisifyFns = ["addSharedFile","cancelBatch","commitBatch","filter","getRecord","getSharedSSI","insertRecord","updateRecord"]
        for(let i = 0; i<promisifyFns.length; i++){
            let prop = promisifyFns[i];
            if(typeof instance[prop] ==="function"){
                instance[prop] = $$.promisify(instance[prop].bind(instance));
            }
        }
    }
    return instance;
}