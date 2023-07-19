const HL7Models = require("../models/index.js");
class HL7ReversionRegistry{

    constructor() {
        this.availableRevertions = {};
    }

    registerReversion(dataType, reversionFn){
        if(!this.availableRevertions[dataType]){
            this.availableRevertions[dataType] = [];
        }
        this.availableRevertions[dataType].push(reversionFn);

    }

    reversionFnExists(dataType){
        return typeof this.availableRevertions[dataType] !=="undefined";
    }

    getReversionFn(dataType){
        return this.availableRevertions[dataType];
    }

}

let instance = null;
const getHL7ReversionRegistry = () => {
    if (instance === null) {
        instance = new HL7ReversionRegistry();
        instance.registerReversion("consent",HL7Models.revertTrialConsent);
        instance.registerReversion("consent",HL7Models.revertSiteConsent);
    }
    return instance;
};

module.exports = {
    getHL7ReversionRegistry
};