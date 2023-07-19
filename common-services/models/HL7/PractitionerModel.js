function getPractitionerModel() {
    return {
        PractitionerId: {
            name: 'Practitioner System id',
            label: "practitioner_system_id",
            value: ''
        },
        PractitionerIdentifier: {
            name: 'Practitioner Identifier',
            label: "practitioner_identifier",
            value: ''
        },
        PractitionerActive: {
            name: 'Practitioner Active',
            label: "practitioner_active",
            value: ''
        },
        PractitionerName: {
            name: 'Practitioner Name',
            label: "practitioner_name",
            value: ''
        },
        PractitionerGender: {
            name: 'PractitionerGender',
            label: "practitioner_gender",
            value: ''
        }
    };
}

module.exports = {
    getPractitionerModel
};