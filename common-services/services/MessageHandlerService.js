const {getCommunicationServiceInstance, getExtraCommunicationService} = require("./CommunicationService");

class MessageHandlerService {

    constructor(did, newMessageHandler) {
        if(typeof did === 'function') {
            newMessageHandler = did;
            did = null;
        }
        this.communicationService = did ? getExtraCommunicationService(did) : getCommunicationServiceInstance();
        this.newMessageHandler = newMessageHandler;

        this.communicationService.listenForMessages(this.mqListenerHandler);
    }

    mqListenerHandler = async (err, message) => {
        if (err) {
            if (err.originalMessage === "socket hang up") {
                console.log("Reloading after " + err.originalMessage);
                return this.communicationService.listenForMessages(this.mqListenerHandler);
            }

            // TODO: Check for other types of errors that should be handled and to restart the listener
            return console.error(err);
        }
        await this.newMessageHandler(message);
    }
}

let instance = null;
let customMessageHandlers = {};
const init = (newMessageHandler) => {
    if (instance === null) {
        instance = new MessageHandlerService(newMessageHandler);
    }
    return instance;
};

const initCustomMessageHandler = (did, messageHandler) => {
    if(!customMessageHandlers[did]) {
        customMessageHandlers[did] = new MessageHandlerService(did, messageHandler);
    }
    return customMessageHandlers[did];
}


module.exports = {init,initCustomMessageHandler};