var  getSiteHL7Organization = (data) =>{
    return {
        resourceType: "Organization",
        id: data.id,
        identifier: [
                {
                    type: {
                        text: "uid"
                        },
                    value: data.uid
                },
                {
                    type: {
                        text: "did"
                        },
                    value: data.did
                }
    
            ],
        name: data.siteName,
        extension: [
            {
                url: "http://pharmaleder.eu/fhir/StructureDefinition/trial",
                extension: [
                    {
                        url: "trialName",
                        valueString: data.trialName
                    },
                    {
                        url: "trialSponsor",
                        valueString: data.trialSponsor
                    }, 
                    {
                        url: "trialId",
                        valueString: data.trialId
                    },
                    {
                        
                        url: "trialSReadSSI",                        
                        value: data.trialSReadSSI
                    }
                ]
            },
            {
                url: "http://pharmaleder.eu/fhir/StructureDefinition/sponsor",
                extension: [
                    {
                        url: "sponsorDid",
                        valueString: data.sponsorDid
                    }
                ]
            },
            {
                url: "http://pharmaleder.eu/fhir/StructureDefinition/status",
                extension: [
                    {
                        url: "statusKeySSI",
                        valueString: data.statusKeySSI
                    }
                ]
            }, 
            {
                url: "http://pharmaleder.eu/fhir/StructureDefinition/visits",
                extension: [
                    {
                        url: "visitsSReadSSI",
                        valueString: data.visitsSReadSSI
                    }
                ]
            }
        ],
        address: {
            country: data.country
        },
        contact: {
            name: data.name
        }
    }; 
}
var getHL7OrganizationConsents = (data) => {
    var consents = [];
    for(let i = 0; i < data.length; i++){
        var consent = {
            resourceType: "DocumentReference",
            id: data[i].trialConsentId,
            description: data[i].trialConsentName,
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
            extension: [
                {
                    url: "http://pharmaleder.eu/fhir/StructureDefinition/name",
                    extension: [
                        {
                            url: "name",
                            valueString: data.name
                        },
                    ]
                }, 
                {
                    url: "http://pharmaleder.eu/fhir/StructureDefinition/trialConsent",
                    extension: [
                        {
                            url: "trialConsentVersion",
                            valueString: data.trialConsentVersion
                        }
                    ]
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


var getStandardClinicalSiteData = (data) => {
    return {
      siteName: data.name,
      id: data.id,
      sponsorDid: data.extension[1].extension[0].valueString,
      did: data.identifier[1].value,
      uid: data.identifier[0].value,
      trialName: data.extension[0].extension[0].valueString,
      trialSponsor: data.extension[0].extension[1].valueString,
      trialId: data.extension[0].extension[2].valueString,
      trialSReadSSI: data.extension[0].extension[3].valueString,
      statusKeySSI: data.extension[2].extension[0].valueString,
      visitsSReadSSI: data.extension[3].extension[0].valueString,
      country: address.country,
      name: contact.name,
      consents: this.getStandrdTrialConsents(data.consents)
    }
}

var getStandrdClinicalSiteConsents = (data) => {
    var consents = [];
    for(let i = 0; i < data.length; i++){
        let consent = {
            trialConsentName: data[i].description,
            type: data.category[0].text,
            trialConsentId: data[i].id,
            uid: data[i].identifier[0].value,
            name: data.extension[0].extension[0].valueString,
            trialConsentVersion: data.extension[1].extension[0].valueString,
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
    getSiteHL7Organization,
    getHL7OrganizationConsents,
    getStandardClinicalSiteData,
    getStandrdClinicalSiteConsents
};