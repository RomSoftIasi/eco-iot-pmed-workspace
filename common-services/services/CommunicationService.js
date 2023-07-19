const opendsu = require("opendsu");
const w3cDID = opendsu.loadAPI('w3cdid');
const scAPI = opendsu.loadAPI("sc");
const DidService = require("./DidService");
const messageQueueServiceInstance = require("./MessageQueueService");
const MAX_RECONNECTION_ATTEMPTS = 100;
const INITIAL_CONNECTION_DELAY = 1000;
const MAX_RECONNECT_DELAY = INITIAL_CONNECTION_DELAY * 60;

function getIotAdaptorEndpoint(endpoint) {
    return endpoint + "/iotAdapter/adaptorIdentity/";
}

class CommunicationService {

    /**
     * @param optionalDid: {didType: string, publicName: string}
     * <br /> <b>didType:</b> the type of the did (did:name, did:group...)
     * <br /> <b>publicName:</b> the public name used by the sender to send a message
     */
    constructor(optionalDid) {
        this.connectionDelay = INITIAL_CONNECTION_DELAY;
        this.reconnectionAttempts = 0;
        this.didReadyHandlers = [];
        if (!optionalDid || typeof optionalDid !== 'string') {
            return this.createOrLoadIdentity();
        }
        this.loadOptionalIdentity(optionalDid);

    }

    onPrimaryDidReady(callback) {
        if (!this.didDocument) {
            return this.didReadyHandlers.push(callback);
        }
        callback(undefined, this.didDocument)
    }

    notifySubscribers(err, didDocument) {
        while (this.didReadyHandlers.length > 0) {
            let handler = this.didReadyHandlers.pop();
            handler(err, didDocument);
        }
    }

    createOrLoadIdentity() {
        const sc = scAPI.getSecurityContext();

        const resolveDid = async() => {
            let didService = DidService.getDidServiceInstance();
            didService.getEnvironmentData().then(async (envData) => {
                this.environmentData = envData;
                const didData = DidService.getDidData(this.environmentData.did);

                try {
                    this.didDocument = await this.getDidDocumentInstance(didData);
                    this.notifySubscribers(undefined, this.didDocument);

                } catch (e) {
                    this.notifySubscribers(e);
                    console.log(e);
                }
            }).catch((e) => {
                console.error(e);
            });
        };

        if (sc.isInitialised()) {
            resolveDid();
        } else {
            sc.on('initialised', resolveDid);
        }
    }

    async loadOptionalIdentity(optionalDid) {

        const getDidData = (didString) => {
            const splitDid = didString.split(":");
            return {
                didType: `${splitDid[1]}:${splitDid[2]}`, publicName: splitDid[4], domain: splitDid[3]
            };
        }

        const didData = getDidData(optionalDid);
        try {
            this.didDocument = await this.getDidDocumentInstance(didData);
        } catch (e) {
            console.log(e);
        }
    }

    async getDidDocumentInstance(didData) {
        try {
            const didDocument = await this.resolveDidDocument(didData);
            console.log(`Identity ${didDocument.getIdentifier()} loaded successfully.`);
            return didDocument
        } catch (e) {
            try {
                const didDocument = await $$.promisify(w3cDID.createIdentity)(didData.didType, didData.domain, didData.publicName);
                console.log(`Identity ${didDocument.getIdentifier()} created successfully.`);
                return didDocument;
            } catch (e) {
                console.log(`DID creation failed for didType:'${didData.didType}' , publicName: '${didData.publicName}' , domain: '${didData.domain}'`)
                throw e;
            }
        }
    }

    async resolveDidDocument(didData) {
        const {didType, domain, publicName} = didData;
        try {
            const identifier = `did:${didType}:${domain}:${publicName}`;
            return await $$.promisify(w3cDID.resolveDID)(identifier);
        } catch (e) {
            console.log(`DID resolve failed for didType:'${didType}' , publicName: '${publicName}'`)
            throw e;
        }
    }

    async sendMessage(receiverDid, data) {
        if (!this.didDocument) {
            return this.sleep(async () => {
                await this.sendMessage(receiverDid, data);
            });
        }

        let receiverDidData = DidService.getDidData(receiverDid);

        try {
            const receiverDidDocument = await this.resolveDidDocument(receiverDidData);
            //temporary: trust the sender that he is who pretends to be: @senderIdentity
            data = {
                ...data, senderIdentity: await DidService.getDidServiceInstance().getDID()
            }
            return new Promise((resolve, reject) => {
                this.didDocument.sendMessage(JSON.stringify(data), receiverDidDocument, (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            })

        } catch (e) {
            console.log(`[ERROR] Could not send message to did '${receiverDid}'. Does it exists?`);
            console.error(e);
        }
    }

    async sendMessageToIotAdapter(data) {
        if (typeof this.environmentData.iotAdaptorEndpoint === "undefined") {
            throw new Error("iotAdaptorEndpoint not set in environment.js");
        }
        return fetch(getIotAdaptorEndpoint(this.environmentData.iotAdaptorEndpoint), {
            mode: 'cors'
        }).then(async response => {
            response.json().then(async (didMessage) => {
                await this.sendMessage(didMessage.message, data);
            })

        }).catch(e => {
            console.log(e);
        });
    }

    listenForMessages(callback) {
        if (!this.didDocument) {
            return this.sleep(() => {
                this.listenForMessages(callback);
            });
        }

        this.didDocument.readMessage((err, decryptedMessage) => {
            if (err) {
                console.log(err);
                if (this.establishedConnectionCheckId) {
                    clearTimeout(this.establishedConnectionCheckId);
                }

                if (this.pendingReadRetryTimeoutId) {
                    clearTimeout(this.pendingReadRetryTimeoutId);
                }
                if (this.reconnectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
                    if (this.connectionDelay < MAX_RECONNECT_DELAY) {
                        this.connectionDelay = this.connectionDelay * 2;
                    }

                    this.pendingReadRetryTimeoutId = setTimeout(() => {
                        this.reconnectionAttempts++;
                        console.log("Reading message attempt #", this.reconnectionAttempts)
                        this.listenForMessages(callback);
                        this.establishedConnectionCheckId = setTimeout(() => {
                            this.connectionDelay = INITIAL_CONNECTION_DELAY;
                            this.reconnectionAttempts = 0;
                            console.log("[MQ] Reconnecting was successfully ...")
                        }, this.connectionDelay*2)

                    }, this.connectionDelay);
                } else {
                    callback(new Error('Unexpected error occurred. Give up reconnecting...  Please refresh your application'));
                }
            } else {
                messageQueueServiceInstance.addCallback(async () => {
                    await callback(err, decryptedMessage);
                    this.listenForMessages(callback);
                });
            }
        });
    }

    sleep(callback) {
        const time = 500;
        setTimeout(() => {
            callback();
        }, time);
    }
}

let instance = null;
let extraCommunicationInstances = {};
const getCommunicationServiceInstance = () => {
    if (instance === null) {
        instance = new CommunicationService();
    }

    return instance;
};

const getExtraCommunicationService = (optionalDid) => {
    if (!extraCommunicationInstances[optionalDid]) {
        extraCommunicationInstances[optionalDid] = new CommunicationService(optionalDid);
    }
    return extraCommunicationInstances[optionalDid];
}

module.exports = {
    getCommunicationServiceInstance, getExtraCommunicationService,
};