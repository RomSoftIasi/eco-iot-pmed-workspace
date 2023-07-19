const DSUService = require("../DSUService");

class QuestionnaireService extends DSUService {

    constructor() {
        super('/questionnaires');
    }

    mount = (keySSI, callback) => this.mountEntity(keySSI, callback);

    getAllQuestionnaires = (callback) => this.getEntities(callback);

    getQuestionnaire = (uid, callback) => this.getEntity(uid, callback);

    saveQuestionnaire = (data, callback) => this.saveEntity(data, callback);

    updateQuestionnaire = (data, callback) => this.updateEntity(data, callback);

    getQuestionnaireSReadSSI = (questionnaire, callback) => {
        this.getEntityMountSSI("questionnaires", questionnaire.uid, (err, ssi) => {
            if(err){
                return callback(err);
            }
            this.getSReadSSI(ssi, (err, sReadSSI) => {
                if (err) {
                    return callback(err);
                }
                callback(undefined, sReadSSI);
            });

        });
    }
}

module.exports = QuestionnaireService;