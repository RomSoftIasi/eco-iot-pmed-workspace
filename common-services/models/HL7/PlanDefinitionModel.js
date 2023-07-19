function getPlanDefinitionModel() {
    return {
        PlanDefinitionId: {
            name: 'Plan Definition System id',
            label: "plan_definition_system_id",
            value: ''
        },
        PlanDefinitionUrl: {
            name: 'Plan Definition Url',
            label: "plan_definition_url",
            value: ''
        },
        PlanDefinitionIdentifier: {
            name: 'Plan Definition Identifier',
            label: "plan_definition_identifier",
            value: ''
        },
        PlanDefinitionVersion: {
            name: 'Plan Definition Version',
            label: "plan_definition_version",
            value: ''
        },
        PlanDefinitionName: {
            name: 'Plan Definition Name',
            label: "plan_definition_name",
            value: ''
        },
        PlanDefinitionTitle: {
            name: 'Plan Definition Title',
            label: "plan_definition_title",
            value: ''
        },
        PlanDefinitionType: {
            name: 'Plan Definition Type',
            label: "plan_definition_type",
            value: ''
        },
        PlanDefinitionStatus: {
            name: 'Plan Definition Status',
            label: "plan_definition_status",
            value: ''
        },
        PlanDefinitionDate: {
            name: 'Plan Definition Date',
            label: "plan_definition_date",
            value: ''
        },
        PlanDefinitionPublisher: {
            name: 'Plan Definition Publisher',
            label: "plan_definition_publisher",
            value: ''
        }
    };
}

module.exports = {
    getPlanDefinitionModel
};