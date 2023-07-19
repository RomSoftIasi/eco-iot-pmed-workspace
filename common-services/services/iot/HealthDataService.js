const DSUService = require("../DSUService");

class HealthDataService extends DSUService {

    constructor() {
        super('/health-data');
    }

    mountObservation = (keySSI, callback) => this.mountEntity(keySSI, callback);

    getAllObservations = (callback) => this.getEntities(callback);

    getObservation = (uid, callback) => this.getEntity(uid, callback);

    saveObservation = (data, patientNumber, deviceId, callback) => {
        const observations = {
            observations: data,
            patientNumber: patientNumber,
            deviceId: deviceId
        }
        this.saveEntity(observations, callback);
    }

    updateObservation = (data, callback) =>{
        this.updateEntity(data, callback);
    }

}

module.exports = HealthDataService;