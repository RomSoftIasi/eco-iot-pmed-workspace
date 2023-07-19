const DSUService = require("../DSUService");

// NOTE that DP stands for Dynamic Permission
class DPService extends DSUService {

    constructor() {
        super('/dynamic-permision');
    }

    mount = (keySSI, callback) => this.mountEntity(keySSI, callback);

    saveDP(dp, callback) {
        this.saveEntity(dp, callback);
    }

    updateDP(dp, callback) {
        this.updateEntity(dp, callback);
    }

    getDPs(callback) {
        this.getEntities(callback);
    }

}

let instance = null

const getDPService = () => {
    if (!instance) {
        instance = new DPService()
    }
    return instance
}

module.exports = {
    getDPService
};