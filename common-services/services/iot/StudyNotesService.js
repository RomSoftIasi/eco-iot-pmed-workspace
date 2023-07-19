const DSUService = require("../DSUService");

class StudyNotesService extends DSUService {

    constructor() {
        super('/notes');
    }

    mount = (keySSI, callback) => this.mountEntity(keySSI, callback);

    getNotes = (callback) => this.getEntities(callback);

    saveNote = (data, callback) => this.saveEntity(data, callback);

}

module.exports = StudyNotesService;