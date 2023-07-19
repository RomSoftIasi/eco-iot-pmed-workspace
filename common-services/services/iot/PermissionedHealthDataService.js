const DSUService = require("../DSUService");

class PermissionedHealthDataService extends DSUService {

    constructor() {
        super('/permissioned-health-data');
    }

    mountObservation = (keySSI, callback) => this.mountEntity(keySSI, callback);

    getAllObservations = (callback) => this.getEntities(callback);

    getObservation = (uid, callback) => this.getEntity(uid, callback);

    saveObservation = (data, callback) => this.saveEntity(data, callback);
    
}

module.exports = PermissionedHealthDataService;