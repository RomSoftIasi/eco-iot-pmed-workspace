const DSUService = require("../DSUService");

class DeviceAssignationService extends DSUService {

    constructor() {
        super('/assigned-devices');
    }

    mount = (keySSI, callback) => this.mountEntity(keySSI, callback);

    getAssignedDevices = (callback) => this.getEntities(callback);

    assignDevice = (data, callback) => this.saveEntity(data, callback);

    updateAssignedDevice = (data, callback) => this.updateEntity(data, callback);

}

module.exports = DeviceAssignationService;