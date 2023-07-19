function getOrganizationModel() {
    return {
        // HL7 Organization Model //
        OrganizationId: {
            name: 'Organization System id',
            label: "organization_system_id",
            value: ''
        },
        OrganizationIdentifier: {
            name: 'Organization Identifier',
            label: "organization_identifier",
            value: ''
        },
        OrganizationActive: {
            name: 'Organization Active',
            label: "organization_active",
            value: ''
        },
        OrganizationType: {
            name: 'Organization Type',
            label: "organization_type",
            value: ''
        },
        OrganizationName: {
            name: 'Organization Name',
            label: "organization_name",
            value: ''
        },
        OrganizationPartOf: {
            name: 'Organization Part Of',
            label: "organization_part_of",
            value: ''
        },

    };
}

module.exports = {
    getOrganizationModel
};