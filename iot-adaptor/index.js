function IotAdapter(server) {
    console.log("IotAdapter called")
    require('./strategies/IotAdapter');

    const DynavisionPlatform = require('./platform/dynavision');

    const CreateResource = require('./resource/create');
    const SearchResource = require('./resource/search');
    const UpdateResource = require('./resource/update');
    const DeleteResource = require('./resource/delete');
    const GetResourceById = require('./resource/getById');
    // const DeleteObservationById = require('./observation/deleteById');



    const { responseModifierMiddleware, requestBodyJSONMiddleware } = require('../privatesky/modules/apihub/utils/middlewares');
    const { requestBodyXMLMiddleware } = require('./utils/middlewares');

    server.use(`/iotAdapter/*`, responseModifierMiddleware);

    server.get(`/iotAdapter/resource/:resource_type`, SearchResource);
    // server.get(`/iotAdapter/Resource/:id`, requestBodyJSONMiddleware);
    server.get(`/iotAdapter/resource/:resource_type/:id`, GetResourceById);
    // server.delete(`/iotAdapter/Resource/:id`, DeleteResourceById);
    server.post(`/iotAdapter/resource/:resource_type`, requestBodyJSONMiddleware);
    server.post(`/iotAdapter/resource/:resource_type`, CreateResource);
    server.put(`/iotAdapter/resource/:resource_type/:id`, requestBodyJSONMiddleware);
    server.put(`/iotAdapter/resource/:resource_type/:id`, UpdateResource);
    server.delete(`/iotAdapter/resource/:resource_type/:id`, DeleteResource);

    server.post(`/iotAdapter/platform/dynavision`, requestBodyXMLMiddleware);
    server.post(`/iotAdapter/platform/dynavision`, DynavisionPlatform);
}

module.exports = IotAdapter;
