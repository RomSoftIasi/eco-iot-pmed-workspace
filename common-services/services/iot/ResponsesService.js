const DSUService = require("../DSUService");

class ResponsesService extends DSUService {

    constructor() {
        super('/responses');
    }

    mount = (keySSI, callback) => this.mountEntity(keySSI, callback)

    saveResponse(response,callback) {
        if (response.uid) {
            return this.updateEntity(response, (err, responses) => {
                if (err) {
                    return callback(err);
                }
                this.getMountedSSI(responses.uid, (err, responsesIdentifier) => {
                    if (err) {
                        return callback(err);
                    }

                    this.getSReadSSI(responsesIdentifier, (err, responsesReadSSI)=>{
                        if(err){
                            return callback(err);
                        }
                        callback(undefined, responsesReadSSI);
                    });

                })

            });
        }
        this.saveEntity(response, (err, responses) => {
            if (err) {
                return callback(err);
            }
            callback(undefined, responses.sReadSSI);
        });
    }

    getResponses = (callback) => this.getEntities(callback);

}

module.exports = ResponsesService;