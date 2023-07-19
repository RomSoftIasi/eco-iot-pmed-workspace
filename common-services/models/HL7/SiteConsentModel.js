function setHL7SiteConsent (entity) {

    if(!entity.hasOwnProperty("trialConsentName")){
        return entity;
    }

    return  {
        description: "A record of a healthcare consumer’s  choices, which permits or denies identified recipient(s) or recipient role(s) to perform one or more actions within a given policy context, for specific purposes and periods of time.",
        properties: {
            resourceType: {
                description: "This is a Site Consent resource",
                const: "Site Consent"
            },
            id: {
                description: "The logical id of the resource, as used in the URL for the resource. Once assigned, this value never changes.",
                ref: "#/definitions/string"
            },
            meta: {
                description: "The metadata about the resource. This is content that is maintained by the infrastructure. Changes to the content might not always be associated with version changes to the resource.",
                trialConsentName: entity.trialConsentName,
                name: entity.name,
                ref: "#/definitions/Meta"
            },
            language: {
                description: "The base language in which the resource is written.",
                ref: "#/definitions/code"
            },
            extension: {
                description: "May be used to represent additional information that is not part of the basic definition of the resource. To make the use of extensions safe and manageable, there is a strict set of governance  applied to the definition and use of extensions. Though any implementer can define an extension, there is a set of requirements that SHALL be met as part of the definition of the extension.",
                items: {
                    ref: "#/definitions/Extension",
                    version: entity.trialConsentVersion,
                    versions: entity.versions
                },
                type: "array"
            },
            identifier: {
                description: "Unique identifier for this copy of the Consent Statement.",
                items: {
                    ref: "#/definitions/Identifier"
                },
                value: entity.trialConsentId,
                type: "array"
            },
            status: {
                description: "Indicates the current state of this consent.",
                ref: "#/definitions/code"
            },
            scope: {
                description: "A selector of the type of consent being presented: ADR, Privacy, Treatment, Research.  This list is now extensible.",
                ref: "patient-privacy"
            },
            category: {
                description: "A classification of the type of consents found in the statement. This element supports indexing and retrieval of consent statements.",
                items: {
                    type: entity.type
                },
                type: "array"
            },
            patient: {
                description: "The patient/healthcare consumer to whom this consent applies.",
                ref: "#/definitions/Reference"
            },
            dateTime: {
                description: "When this  Consent was issued / created / indexed.",
                ref: "#/definitions/dateTime"
            },
            performer: {
                description: "Either the Grantor, which is the entity responsible for granting the rights listed in a Consent Directive or the Grantee, which is the entity responsible for complying with the Consent Directive, including any obligations or limitations on authorizations and enforcement of prohibitions.",
                items: {
                    ref: "#/definitions/Reference"
                },
                type: "array"
            },
            organization: {
                description: "The organization that manages the consent, and the framework within which it is executed.",
                items: {
                    ref: "#/definitions/Reference"
                },
                type: "array"
            },
            sourceAttachment: {
                description: "The source on which this consent statement is based. The source might be a scanned original paper form, or a reference to a consent that links back to such a source, a reference to a document repository (e.g. XDS) that stores the original consent document.",
                ref: "#/definitions/Attachment",
                file: entity.file
            },
            policy: {
                description: "The references to the policies that are included in this consent scope. Policies may be organizational, but are often defined jurisdictionally, or in law.",
                items: {
                    ref: "#/definitions/Consent_Policy"
                },
                type: "array"
            },
            policyRule: {
                description: "A reference to the specific base computable regulation or policy.",
                ref: "#/definitions/CodeableConcept"
            },
            provision: {
                description: "An exception to the base policy of this consent. An exception can be an addition or removal of access permissions.",
                ref: "#/definitions/Consent_Provision"
            }
        },
        additionalProperties: false,
        required: [
        ]
    }
}

function revertSiteConsent (entity) {

    if((entity.properties) && entity.properties.resourceType.const === "Site Consent"){
        return  {
            file: entity.properties.sourceAttachment.file,
            name: entity.properties.meta.name,
            trialConsentId: entity.properties.identifier.value,
            trialConsentName: entity.properties.meta.trialConsentName,
            trialConsentVersion: entity.properties.extension.items.version,
            type: entity.properties.category.items.type,
            uid: entity.uid,
            versions: entity.properties.extension.items.versions
        }
    }
    else return entity;
}

module.exports = {
    setHL7SiteConsent,
    revertSiteConsent
};


