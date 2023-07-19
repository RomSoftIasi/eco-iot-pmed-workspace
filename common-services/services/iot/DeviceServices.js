const DSUService = require("../DSUService");

class DeviceServices extends DSUService {

    constructor() {
        super('/device');
    }

    mountDevice = (keySSI, callback) => this.mountEntity(keySSI, callback);

    getDevices = (callback) => this.getEntities(callback);

    getDevice = (uid, callback) => this.getEntity(uid, callback);

    saveDevice = (device, callback) => this.saveEntity(device, callback);

    updateDevice = (device, callback) => this.updateEntity(device, callback);

}

module.exports = DeviceServices;
