const DSUService = require("../DSUService");

class ResultsService extends DSUService {

    constructor() {
        super('/results');
    }

    mount = (keySSI, callback) => this.mountEntity(keySSI, callback);

    getResults = (callback) => this.getEntities(callback);

    getResult = (uid, callback) => this.getEntity(uid, callback);

    saveResult = (data, callback) => this.saveEntity(data, callback);

    updateResult = (data, callback) => this.updateEntity(data, callback);

    addResultFile(file, resultUid) {
        return this.uploadFile("results" + '/' + resultUid + '/' + 'files' + '/' + file.name, file.file);
    }

    uploadFile(path, file) {
        function getFileContentAsBuffer(file, callback) {
            let fileReader = new FileReader();
            fileReader.onload = function (evt) {
                let arrayBuffer = fileReader.result;
                callback(undefined, arrayBuffer);
            };

            fileReader.readAsArrayBuffer(file);
        }

        return new Promise((resolve, reject) => {
            getFileContentAsBuffer(file, (err, arrayBuffer) => {
                if (err) {
                    return reject('Could not get file as a Buffer');
                }
                this.DSUStorage.writeFile(path, $$.Buffer.from(arrayBuffer), undefined, (err, keySSI) => {
                    if (err) {
                        return reject(new Error(err));
                    }
                    resolve();
                });
            });
        });
    }

}

module.exports = ResultsService;