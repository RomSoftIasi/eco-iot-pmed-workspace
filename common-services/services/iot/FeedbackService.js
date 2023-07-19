const DSUService = require("../DSUService");

class FeedbackService extends DSUService {

    constructor() {
        super('/feedback');
    }

    mount = (keySSI, callback) => this.mountEntity(keySSI, callback);

    getFeedbacks = (callback) => this.getEntities(callback);

    getFeedback = (uid, callback) => this.getEntity(uid, callback);

    saveFeedback = (data, callback) => this.saveEntity(data, callback);

    updateFeedback = (data, callback) => this.updateEntity(data, callback);

}

module.exports = FeedbackService;