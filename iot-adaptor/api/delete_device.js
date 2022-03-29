const _ = require('lodash');

function deleteDevice(request, response, next) {
    const domainConfig = {
        "type": "IotAdaptor",
        "option": {
            "endpoint": "http://127.0.0.1:1000/adaptor"
        }
    };
    let flow = $$.flow.start(domainConfig.type);
    flow.init(domainConfig);
    const queryParams = _.merge({}, request.query);
    const id  = request.params.id;
    const keySSI = request.headers['x-keyssi'];
    const dbName = "clinicalDecisionSupport";
    flow.deleteDsuResource(keySSI, dbName, "Device", id, (error, result) => {
        if (error) {
          return response.send(error.status, error);
        } else {
          return response.send(200, result);
        }
    });
}

module.exports = deleteDevice;
