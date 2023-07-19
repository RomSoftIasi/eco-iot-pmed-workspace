const MESSAGES = {

    HCO: {
        ADD_TRIAL : 'add-trial',
        ADD_CONSENT_VERSION: 'add-econsent-version',
        ADD_CONSENT : 'add-site-consent',
        DELETE_TRIAL : 'delete-trial',
        UPDATE_ECONSENT : 'update-econsent',
        SITE_STATUS_CHANGED: 'site-status-change',
        ADD_SITE : 'add-site',
        ADD_TRIAl_CONSENT : 'add-trial-consent',
        ADD_PATIENT_TO_TRIAL: 'add-to-trial',
        // NEW MESSAGES
        SEND_HCO_DSU_TO_PATIENT: 'send_hco_dsu_to_patient',
        SEND_HCO_DSU_TO_SPONSOR: 'send-hco-dsu-to-sponsor',
        SEND_REFRESH_CONSENTS_TO_PATIENT: 'send_refresh_consents',
        CLINICAL_SITE_QUESTIONNAIRE: 'clinical_site_questionnaire',
        CLINICAL_SITE_QUESTIONNAIRE_UPDATE: 'clinical_site_questionnaire_update',
        REFRESH_VISITS: 'refresh_visits',
        UPDATE_STATUS: 'update_status',
        VISIT_SCHEDULED: 'schedule_visit',
        VISIT_CONFIRMED: 'visit_confirmed',
        NEW_HEALTHDATA: "new_healthdata",
        ADD_DEVICE:"add_device",
        DEVICE_ASSIGNATION: 'device_assignation',
        DEVICE_DEASSIGNATION: 'device_deassignation',

        COMMUNICATION: {
            SPONSOR: {
                SIGN_ECONSENT: 'HCO signed econsent',
                DECLINE_ECONSENT: 'HCO declined econsent',
                VISIT_CONFIRMED: 'HCO confirmed a visit'
            },
            PATIENT: {
                ADD_TO_TRIAL: 'You were added to trial',
                SCHEDULE_VISIT: 'A visit was scheduled.',
                VISIT_DECLINED: 'A visit was declined by the patient',
                VISIT_ACCEPTED: 'A visit was accepted by the patient',
                VISIT_RESCHEDULED: 'A visit was rescheduled by the patient',
            },
            TYPE: {
                ADD_TO_TRIAL: 'add-to-trial',
                SCHEDULE_VISIT: 'schedule_visit',
                UPDATE_TP_NUMBER: 'update-tpNumber',
                UPDATE_VISIT: 'update_visit',
                VISIT_RESPONSE: 'visit-response',
                VISIT_CONFIRMED: 'visit_confirmed',

            }
        },
        FEEDBACK: {
            SUCCESS: {
                ADD_TRIAL_PARTICIPANT: 'Trial participant added successfully!'
            },
            ERROR: {
                ADD_TRIAL_PARTICIPANT: 'ERROR: There was an issue creating the trial participant'
            }
        }
    },

    PATIENT: {
        ADD_TO_TRIAL: 'add-to-trial',
        ADD_TRIAL_SUBJECT: 'add-trial-subject',
        SCHEDULE_VISIT: 'schedule-visit',
        UPDATE_TP_NUMBER: 'update_tpNumber',
        UPDATE_VISIT: 'update_visit',
        VISIT_RESPONSE: 'visit-response',
        VISIT_CONFIRMED: 'visit-confirmed',
        CREATE_DP: 'create_dp',
        TP_IS_UNAVAILABLE:"tp-is-unavailable",
        SEND_TRIAL_CONSENT_DSU_TO_HCO: 'send-trial-consent-to-hco',
        TP_CONTACT_DATA: 'tp-profile-data',
        QUESTIONNAIRE_RESPONSE:'questionnaire-responses',
    },

    SPONSOR :{
        SIGN_ECONSENT : 'sign-econsent',
        DECLINE_ECONSENT : 'decline-econsent',
        ADD_CONSENT_VERSION:"add-econsent-version",
        UPDATE_ECONSENT: 'update-econsent',
        UPDATE_SITE_STATUS: 'update-site-status',
        UPDATE_SITE: 'update-site',
        TP_ADDED:"tp-added",
        TP_CONSENT_UPDATE:"tp-consent-update",
        ADDED_TS_NUMBER:"added-ts-number"
    },

    RESEARCHER: {
        NEW_FEEDBACK: 'new_feedback',
        NEW_RESULT:"new_result",
        NEW_STUDY: "new_study",
        DATA_MATCH_MAKING: "datamatchmaking",
        ADD_DYNAMIC_PERMISSION: "dp_updated_add",
        REMOVE_DYNAMIC_PERMISSION: "dp_updated_remove",
        REJECT_DYNAMIC_PERMISSION: "dp_updated_reject",
        ADD_PARTICIPANTS_TO_STUDY: "add_participants_to_study",
        REMOVE_PARTICIPANTS_FROM_STUDY: "remove_participants_from_study",
        REJECT_PARTICIPANTS_FROM_STUDY: "reject_participants_from_study",
        COMMUNICATE_STUDY_DATA_MATCHMAKING: "communicate_study_data_matchmaking",
        GENERATE_ANONYMIZE_DATA: "generate_anonymize_data",
        ANONYMIZED_DATA: "anonymized_data"
    }

}

const ECO_STATUSES = {
    TO_BE_SIGNED: 'Acknowledgement required',
    WITHDRAWN: 'TP Withdrawn',
    DECLINED: 'TP Declined',
    DECLINED_OPTIONAL: 'TP Declined Optional'
}

const STUDY_ACTIONS = {

    EDIT: "edit",
    VIEW: "view",
    FEEDBACK: "feedback",
    RESULT: "result",
    DATA: "data"

}

const STUDY_STATUSES = {

    STATUS_APPROVED: 'approved',
    STATUS_ACTIVE: 'active',
    STATUS_WITHDRAWN: 'withdrawn',
    STATUS_ON_HOLD: 'onHold',
    STATUS_CLOSED: 'closed',
    STATUS_COMPLETED: 'completed',

    ACTION_RUN: "Run",
    ACTION_WITHDRAW: "Withdraw",
    ACTION_HOLD: "Hold",
    ACTION_CLOSE: "Close",
    ACTION_RESUME: "Resume",
    ACTION_FINALISE: "Finalise",

    LABEL_APPROVED: "Approved",
    LABEL_ACTIVE: "Active",
    LABEL_ON_HOLD: "On Hold",
    LABEL_CLOSED: "Closed",
    LABEL_COMPLETED: "Completed",
    LABEL_WITHDRAWN: "Withdrawn",

}

const PATIENT_NOTIFICATIONS_TYPE = {
    NEW_TRIAL : {
        notificationTitle:"New trial",
        tagPage:"trial",
    },
    NEW_VISIT : {
        notificationTitle:"New visit received",
        tagPage:"task-calendar",
    },
    VISIT_UPDATE : {
        notificationTitle:"Visit updated",
        tagPage:"task-calendar",
    },
    REFRESH_VISITS : {
        notificationTitle:"All the Confirmed Visits & Procedures have been removed from calendar. HCP will send new appointment proposals",
        tagPage:"task-calendar",
    },
    NEW_FEEDBACK : {
        notificationTitle:"New feedback",
        tagPage:"iot-health-studies",
    },
    NEW_RESULT : {
        notificationTitle:"New result",
        tagPage:"iot-health-studies",
    },
    NEW_STUDY : {
        notificationTitle:"New study",
        tagPage:"iot-health-studies",
    },
    NEW_HEALTHDATA : {
        notificationTitle:"New health data available",
        tagPage:"iot-data-selection",
    },
    DEVICE_ASSIGNED:{
        notificationTitle:"A new device was assigned to yourself",
        tagPage:"iot-data-selection",
    },
    DEVICE_UNASSIGNED:{
        notificationTitle:"A device was unassigned from yourself",
        tagPage:"iot-data-selection",
    },
    NEW_INVITATION : {
        notificationTitle:"New research study invitation",
        tagPage:"iot-health-studies",
    },
    NEW_TPNUMBER : {
        notificationTitle:"TP number was assigned for yourself",
        tagPage:"trial",
    },
    NEW_CONSENTS: {
        notificationTitle :"New Consents",
        tagPage:"trial",
    },
    UPDATE_STATUS: {
        notificationTitle :"Tp status updated",
        tagPage:"trial",
    },
    VISIT_CONFIRMED: {
        notificationTitle :"HCO confirmed a visit",
        tagPage:"task-calendar",
    },
    VISIT_DETAILS_UPDATED : {
        notificationTitle :"Visit details updated!",
        tagPage:"task-calendar"
    },
    CLINICAL_SITE_QUESTIONNAIRE: {
        notificationTitle :"Received a new questionnaire",
        tagPage:"task-calendar",
    },
    CLINICAL_SITE_QUESTIONNAIRE_UPDATE: {
        notificationTitle: "Questionnaire update",
        tagPage:"task-calendar",
    }
}

const HCO_NOTIFICATIONS_TYPE = {
    TRIAL_UPDATES : {
        notificationTitle:"Trial Updates",
    },
    WITHDRAWS : {
        notificationTitle:"Withdraws",
    },
    CONSENT_UPDATES : {
        notificationTitle:"Inform Consents Updates",
    },
    MILESTONES_REMINDERS : {
        notificationTitle:"Milestones Reminders",
    },
    TRIAL_SUBJECT_QUESTIONNAIRE_RESPONSES : {
        notificationTitle: "Patient Questionnaire Responses",
    },
    PATIENT_HEALTH_DATA : {
        notificationTitle: "Patient Health Data",
    },
}


const TRIAL_PARTICIPANT_STATUS = {
    ENROLLED: 'Enrolled',
    DECLINED: 'Declined',
    TP_WITHDRAWN: 'Withdraw Intention',
    SCREENED: 'Screened',
    PLANNED: 'Planned',
    END_OF_TREATMENT: "End Of Treatment",
    COMPLETED: "Completed",
    DISCONTINUED: "Discontinued",
    SCREEN_FAILED: "Screen Failed",
    UNAVAILABLE:"Unavailable",
    WITHDRAWN: 'Withdrawn',
    IN_TREATMENT: 'In Treatment'
}

const PROGRESS_BAR_STATUSES = {
    PLANNED: 'Planned',
    SCREENED: 'Screened',
    ENROLLED: 'Enrolled',
    IN_TREATMENT: 'In Treatment',
    COMPLETED: "Completed",
    END_OF_TREATMENT: "End Of Treatment",
    UNAVAILABLE:"Unavailable",
    DISCONTINUED: "Discontinued",
    SCREEN_FAILED: "Screen Failed",
    WITHDRAWN: 'Withdrawn',
}

const TP_ACTIONNEEDED_NOTIFICATIONS = {
    SET_TP_NUMBER: 'tp-number-set',
    TP_VISIT_CONFIRMED: 'tp-visit-confirmed',
    TP_VISIT_RESCHEDULED: "visit-rescheduled",
    VISIT_CONFIRMED: 'visit-confirmed',
    TP_WITHDRAWN: 'TP Withdrawn',
    TP_DECLINED: 'TP Declined',
    TP_DECLINED_OPTIONAL: 'TP Declined Optional',
    HCP_SIGNED: 'HCP SIGNED -no action required',
    NO_ACTION_REQUIRED: "No action required"
}

const QUESTION_TYPES = {
    FREE_TEXT:"string",
    SLIDER:"slider",
    CHECKBOX:"checkbox"
}

const HCO_STAGE_STATUS = {
    ENROLLING: 'Enrolling'
}

const DATE_UTILS = {
    FORMATS: {
        YearMonthDayPattern: "YYYY-MM-DD",
        YMDDateTimeFormatPattern: 'YYYY-MM-DD',
        HourFormatPattern: "HH:mm",
        DateTimeFormatPattern: 'DD/MM/YYYY, HH:mm',
        YearMonthPattern:  'YYYY-MM',
        DDMMYYYY:"DD/MM/YYYY",
        YYYYMMDD:"YYYY-MM-DD"
    },
    DATE_LOCALE: 'en-UK',
}

const RECRUITING_STAGES = {
    NOT_YET_RECRUITING: "Not yet recruiting",
    RECRUITING: "Recruiting",
    ACTIVE_NOT_RECRUITING: "Active, not recruiting"
}

module.exports = {
    DATE_UTILS,
    MESSAGES,
    ECO_STATUSES,
    TRIAL_PARTICIPANT_STATUS,
    HCO_STAGE_STATUS,
    HCO_NOTIFICATIONS_TYPE,
    PATIENT_NOTIFICATIONS_TYPE,
    TP_ACTIONNEEDED_NOTIFICATIONS,
    QUESTION_TYPES,
    RECRUITING_STAGES,
    STUDY_STATUSES,
    STUDY_ACTIONS,
    PROGRESS_BAR_STATUSES
};