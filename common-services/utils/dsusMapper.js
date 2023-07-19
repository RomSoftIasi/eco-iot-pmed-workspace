const knownDSUsSubPaths = {
    "tp":["tp", "tps"],
    "ifc":["ifc","ifcs"],
    "consent":["consent"]
}

let getObjectNameFromPath = (path)=>{
    if (path.endsWith("/") && path.length > 1) {
        path = path.substring(0, path.lastIndexOf("/"))
    }
    let mountetPathSegments = path.split("/")
    let mountedPath = mountetPathSegments[mountetPathSegments.length-1];

    for( let key in knownDSUsSubPaths){
        if(knownDSUsSubPaths[key].includes(mountedPath)){
            return key;
        }
    }
    console.error(`${mountedPath} from ${path} is not declared in knownDSUsSubPath`)
}


module.exports = getObjectNameFromPath

