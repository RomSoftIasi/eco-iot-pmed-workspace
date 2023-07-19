const DSUService = require("../DSUService");
const StudyNotesService = require('./StudyNotesService.js');


class StudiesService extends DSUService {

    constructor() {
        super('/studies');
        this.StudyNotesService = new StudyNotesService();
    }

    mount = (keySSI, callback) => this.mountEntity(keySSI, callback);

    unMount = (uid, callback) => this.unMount(uid, callback);

    getStudies = (callback) => this.getEntities(callback);

    getStudy = (uid, callback) => this.getEntity(uid, callback);

    saveStudy = (data, callback) => this.saveEntity(data, callback);

    updateStudy = (data, note, callback) => {
        if (typeof callback !== "function") {
            callback = note;
            note = undefined;
        }

        this.updateEntity(data, (err, studyEntity) => {
            if (err) {
                return callback(err);
            }
            if (note) {
                return this.StudyNotesService.saveNote(note, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(undefined, studyEntity)
                });
            }
            callback(undefined, studyEntity);
        });
    }

    getDSUsReadSSI = (uid, callback) => {
        this.getEntityMountSSI("studies", uid, (err, keySSI) => {
            this.getSReadSSI(keySSI, (err, sReadSSI) => {
                if (err) {
                    return callback(err);
                }
                callback(undefined, sReadSSI);
            })
        });
    }

}

module.exports = StudiesService;