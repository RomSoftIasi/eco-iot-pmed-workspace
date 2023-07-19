var  getTrialResearchStudy = (data) =>{
    return {
        resourceType: "ResearchStudy",
        id: data.id,
        identifier: [
                {
                    type: {
                        text: "uid"
                    },
                    value: data.uid
                }
            ],
        title: data.name,
        status: data.status,
        extension: [
            {
                url: "http://pharmaleder.eu/fhir/StructureDefinition/visits",
                extension: [
                    {
                        url: "visitsKeySSI",
                        valueString: data.visitsKeySSI
                    },
                    {
                        url: "visitsUid",
                        valueString: data.visitsUid
                    }, 
                    {
                        url: "visitsSReadSSI",
                        valueString: data.visitsSReadSSI
                    }
                ]
            }, 
            {
                url: "http://pharmaleder.eu/fhir/StructureDefinition/sponsor",
                extension: [
                    {
                        url: "sponsor",
                        valueString: data.sponsor
                    },
                    {
                        url: "did",
                        valueString: data.did
                    }
                ]
            }
        ],
        period: {
            start: data.recruitmentPeriod.startDate,
            end: data.recruitmentPeriod.endDate
        },
        date: data.created
    }; 
}

var getHL7TrialConsents = (data) => {
var consents = [];
for(let i = 0; i < data.length; i++){
    var consent = {
        resourceType: "DocumentReference",
        id: data[i].id,
        description: data[i].name,
        identifier:[
           {
            type:{
               text: "uid"
              },
            value: data[i].uid
           }
        ],
        status: "current",
        type: {
        text: "Consent"
        },
        category: [
            {
                text: data[i].type
            }
        ],
        content: []
     };
     consents.push(consent);
     let versions = data[i].versions;
     for(let j = 0; j < versions.length; j++){
        consent.content.push({
            id: versions[j].version,
            attachment: {
               contentType: "application/pdf",
               url: versions[j].attachment,
               creation: versions[j].versionDate
            }
        });
     }
     
}
return consents;
}

var getStandardTrial = (data) => {
    var showDateFrom = new Date(data.period.start);
    showDateFrom.setDate(showDateFrom.getDate() + 1);
    var showDateTo = new Date(data.period.end);
    showDateTo.setDate(showDateTo.getDate() + 1);
    var strShowDate = showDateFrom.getDay()+"/"+showDateFrom.getMonth()+"/"+showDateFrom.getFullYear()+" - "+showDateTo.getDay()+"/"+showDateTo.getMonth()+"/"+showDateTo.getFullYear();

    return {
      name: data.title,
      id: data.id,
      sponsor: data.extension[1].extension[0].valueString,
      did: data.extension[1].extension[1].valueString,
      status: data.status,
      created: data.date,
      uid: data.identifier[0].value,
      visitsKeySSI: data.extension[0].extension[1].valueString,
      visitsUid: data.extension[0].extension[2].valueString,
      visitsSReadSSI: data.extension[0].extension[3].valueString,
      recruitmentPeriod: {
        startDate: data.period.start,
        endDate: data.period.end,
        toShowDate: strShowDate
      },
      consents: this.getStandrdTrialConsents(data.consents)
    }
}

var getStandrdTrialConsents = (data) => {
    var consents = [];
    for(let i = 0; i < data.length; i++){
        let consent = {
            name: data[i].description,
            type: data.category[0].text,
            id: data[i].id,
            uid: data[i].identifier[0].value,
            versions: []
        };
        consents.push(consent);
        var contents = data[i].content;
        for(let j = 0; j < contents.length; j++){
            consent.versions.push({
                version: contents[j].id,
                versionDate: contents[j].attachment.creation,
                file: {},
                attachment: contents[j].attachment.url
            });
         }
    }
    return consents;
}


module.exports = {
    getTrialResearchStudy,
    getHL7TrialConsents,
    getStandardTrial,
    getStandrdTrialConsents
};