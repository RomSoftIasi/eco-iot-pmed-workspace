import HCOService from "../../services/HCOService.js";
const commonServices = require("common-services");
const Constants = commonServices.Constants;

const CommunicationService = commonServices.CommunicationService;
const BaseRepository = commonServices.BaseRepository;
const BreadCrumbManager = commonServices.getBreadCrumbManager();
const DataSourceFactory = commonServices.getDataSourceFactory();
const ConsentStatusMapper = commonServices.ConsentStatusMapper;

let getInitModel = () => {
    return {
        trial: {},
        trialParticipants: [],
    };
};

export default class TrialParticipantDetailsController extends BreadCrumbManager {

    constructor(...props) {
        super(...props);
        this.model = {
            ...getInitModel(),
            consentsSigned: [],
            userActionsToShow: []
        };


        this.model = this.getState();
        this.model.breadcrumb = this.setBreadCrumb(
            {
                label: "Status - Trial Participant Details",
                tag: "econsent-trial-participant-details"
            }
        );

        this._initServices().then(() => {
            this.model.dataSourceInitialized = true;

            let tableData = [];
            let dataObject = {
                consentsSigned: this.model.consentsSigned,
                lastBadAction: this.model.lastBadAction,
                userActionsToShow: this.model.userActionsToShow,
            }
            tableData.push(dataObject);
            this.model.participantDetailsDataSource = DataSourceFactory.createDataSource(1, 4, tableData);
        });
        this._initHandlers();
    }

    getDataForStatusesDiagram() {
        let statuses = Object.keys(Constants.PROGRESS_BAR_STATUSES).map((status,index) => {
            return {
                statusName: Constants.PROGRESS_BAR_STATUSES[status],
                index: index+1,
                isActive: false,
                isNegativeStatus: false,
                alreadyCompleted: false,
                isCurrentStatus: false,
                invisible: false,
                isDisabled: false,
            }
        })

        let tp = this.model.trialParticipant;
        let statusHistory = tp.statusHistory;
        this.currentStatus = tp.statusHistory[tp.statusHistory.length - 1];

        let negativeStatuses = [Constants.PROGRESS_BAR_STATUSES.UNAVAILABLE,Constants.PROGRESS_BAR_STATUSES.SCREEN_FAILED, Constants.PROGRESS_BAR_STATUSES.WITHDRAWN, Constants.PROGRESS_BAR_STATUSES.DISCONTINUED];
        statuses.forEach(status => {
            if(negativeStatuses.includes(status.statusName)) {
                status.isNegativeStatus = true;
                status.invisible = true;
            }
            if(statusHistory.includes(status.statusName)) {
                if(status.isNegativeStatus !== true) {
                    status.alreadyCompleted = true;
                }
            }
        });

        let precedentStatus = statusHistory[statusHistory.length - 2];
        let newPosition = statuses.findIndex(item => item.statusName === precedentStatus);
        let index = statuses.findIndex(status => status.statusName === this.currentStatus);
        if( index > -1) {
            if(statuses[index].isNegativeStatus === true) {
                statuses[index].isCurrentStatus = true;
                statuses[index].invisible = false;

                if(negativeStatuses.includes(statuses[index].statusName)){
                    statuses.splice(newPosition+1, 0, statuses[index]);
                }

            } else statuses[index].isActive = true;
        }
        let endOfTreatmentStatusIndex = statuses.findIndex(status => status.statusName === Constants.TRIAL_PARTICIPANT_STATUS.END_OF_TREATMENT);
        statuses.splice(endOfTreatmentStatusIndex+1);
        if(negativeStatuses.includes(this.currentStatus)) {
            let newCurrentStatusIndex = statuses.findIndex(status => status.statusName === this.currentStatus);
            for(let i = newCurrentStatusIndex+1; i < statuses.length; i++ ) {
                statuses[i].isDisabled = true;
            }
        }

        this.model.statuses = statuses;

    }

    async _initServices() {
        window.WebCardinal.loader.hidden = false;
        this.CommunicationService = CommunicationService.getCommunicationServiceInstance();
        this.TrialParticipantRepository = BaseRepository.getInstance(BaseRepository.identities.HCO.TRIAL_PARTICIPANTS);
        this.HCOService = new HCOService();
        this.hcoDSU = await this.HCOService.getOrCreateAsync();
        await this._initTrialParticipant(this.model.trialUid);
        let statuses = [Constants.TRIAL_PARTICIPANT_STATUS.DISCONTINUED, Constants.TRIAL_PARTICIPANT_STATUS.SCREEN_FAILED, Constants.TRIAL_PARTICIPANT_STATUS.UNAVAILABLE,
            Constants.TRIAL_PARTICIPANT_STATUS.END_OF_TREATMENT];
        this.model.isBtnDisabled = statuses.includes(this.model.trialParticipant.status);
        this.getDataForStatusesDiagram();
        window.WebCardinal.loader.hidden = true;
    }

    _initHandlers() {
        this._attachHandlerChangeStatus();
    }

    async _initTrialParticipant(keySSI) {
        this.hcoDSU = await this.HCOService.getOrCreateAsync();
        let trialParticipant = this.hcoDSU.volatile.tps.find(tp => tp.uid === this.model.tpUid);
        let nonObfuscatedTps = await this.TrialParticipantRepository.filterAsync(`did == ${trialParticipant.did}`);
        if (nonObfuscatedTps.length > 0) {
            trialParticipant.name = nonObfuscatedTps[0].name;
        }
        this.model.trialParticipant = trialParticipant;

        let userActions = await this._getUserActionsFromEconsents(keySSI, this.model.trialParticipant.did);
        userActions = userActions.filter(ua => ua.action.type === 'tp');
        let userActionsToShow = [];
        userActions.forEach(ua => {
            let actualAction = ua.action;
            userActionsToShow.push({
                name: actualAction.status,
                date: actualAction.toShowDate
            })
        });
        this.addSiteStatusChangeActions(nonObfuscatedTps[0], userActionsToShow);
        this.model.userActionsToShow = userActionsToShow;
        this.model.lastAction = userActions.length === 0 ? undefined : userActions[userActions.length - 1].action.name
            .split('-')
            .filter(action => action.length > 0)
            .map(action => action.charAt(0).toUpperCase() + action.slice(1))
            .join(" ");

        this.model.consentsSigned = userActions
            .filter(ac => ac.action.name === ConsentStatusMapper.consentStatuses.signed.name)
            .map(ac => ac.version.version + ' - ' + ac.econsent.name);

        let lastBadActions = userActions
            .filter(ac => ac.action.name === ConsentStatusMapper.consentStatuses.withdraw.name);

        let lastBadAction = lastBadActions.length === 0 ? undefined : lastBadActions[lastBadActions.length - 1];

        let initials = lastBadAction === undefined ? 'N/A' : lastBadAction.action.name
            .split('-')
            .filter(action => action.length > 0)
            .map(action => action.charAt(0).toUpperCase())
            .join("");
        this.model.lastBadAction = lastBadAction === undefined ? 'N/A'
            : initials + ' - ' + lastBadAction.action.toShowDate;
    }

    async _getUserActionsFromEconsents(keySSI, tpDid) {
        // TODO: re-check this logic.
        let userActions = [];
        this.hcoDSU = await this.HCOService.getOrCreateAsync();
        this.hcoDSU.volatile.ifcs
            .forEach(econsent => {
                if (econsent.versions === undefined) {
                    return userActions;
                }
                econsent.versions.forEach(version => {
                    if (version.actions === undefined) {
                        return userActions;
                    }
                    version.actions.forEach(action => {
                        if (action.tpDid === tpDid) {
                            userActions.push({
                                econsent: {
                                    uid: econsent.uid,
                                    keySSI: econsent.keySSI,
                                    name: econsent.name,
                                    type: econsent.type,
                                },
                                version: {
                                    version: version.version,
                                    versionDate: version.versionDate,
                                },
                                action: action
                            })
                        }
                    })
                })
            });
        return userActions;
    }

    _attachHandlerChangeStatus() {
        this.onTagEvent('change-status-popup', 'click', (model, target, event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.showModalFromTemplate(
                'change-participant-status',
                async (event) => {
                    console.log("Status outcome");
                    console.log(event.detail);
                    if (this.hcoDSU.volatile.tps) {
                        const tp = this.hcoDSU.volatile.tps.find(tp => tp.uid === this.model.tpUid);
                        if (tp === undefined) {
                            return console.error('Cannot find tp.');
                        }
                        let tpObjectToAssign = {};
                        const currentDate = new Date();
                        switch (event.detail) {
                            case Constants.TRIAL_PARTICIPANT_STATUS.END_OF_TREATMENT:
                                tpObjectToAssign = {
                                    actionNeeded: "No action required",
                                    status: Constants.TRIAL_PARTICIPANT_STATUS.END_OF_TREATMENT,
                                    endOfTreatmentDate: currentDate.toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE)
                                }
                            break;
                            case Constants.TRIAL_PARTICIPANT_STATUS.IN_TREATMENT:
                                tpObjectToAssign = {
                                    actionNeeded: "No action required",
                                    status: Constants.TRIAL_PARTICIPANT_STATUS.IN_TREATMENT,
                                    inTreatmentDate: currentDate.toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE)
                                }
                                break;
                            case Constants.TRIAL_PARTICIPANT_STATUS.COMPLETED:
                                tpObjectToAssign = {
                                    actionNeeded: "No action required",
                                    status: Constants.TRIAL_PARTICIPANT_STATUS.COMPLETED,
                                    completedDate: currentDate.toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE)
                                }
                            break;
                            case Constants.TRIAL_PARTICIPANT_STATUS.DISCONTINUED:
                                tpObjectToAssign = {
                                    actionNeeded: "No action required",
                                    status: Constants.TRIAL_PARTICIPANT_STATUS.DISCONTINUED,
                                    discontinuedDate: currentDate.toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE)
                                }
                            break;
                            case Constants.TRIAL_PARTICIPANT_STATUS.SCREEN_FAILED: 
                                tpObjectToAssign = {
                                    actionNeeded: "No action required",
                                    status: Constants.TRIAL_PARTICIPANT_STATUS.SCREEN_FAILED,
                                    screenFailedDate: currentDate.toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE)
                                }
                            break;
                            case Constants.TRIAL_PARTICIPANT_STATUS.WITHDRAWN:
                                tpObjectToAssign = {
                                    actionNeeded: Constants.TRIAL_PARTICIPANT_STATUS.WITHDRAWN,
                                    status: Constants.TRIAL_PARTICIPANT_STATUS.WITHDRAWN,
                                    screenFailedDate: currentDate.toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE)
                                }
                            break;
                            case Constants.TRIAL_PARTICIPANT_STATUS.UNAVAILABLE:
                                tpObjectToAssign = {
                                    actionNeeded: Constants.TRIAL_PARTICIPANT_STATUS.UNAVAILABLE,
                                    status: Constants.TRIAL_PARTICIPANT_STATUS.UNAVAILABLE,
                                    screenFailedDate: currentDate.toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE)
                                }
                                break;
                        }
                        Object.assign(tp, tpObjectToAssign);
                        tp['statusHistory'].push(tpObjectToAssign.status);
                        this.HCOService.updateHCOSubEntity(tp, "tps", async (err, response) => {
                            if (err) {
                                return console.log(err);
                            }
                            this.TrialParticipantRepository.filter(`did == ${tp.did}`, 'ascending', 30, (err, tps) => {
                                if (tps && tps.length > 0) {
                                    Object.assign(tps[0], tpObjectToAssign);
                                    tps[0]['statusHistory'].push(tpObjectToAssign.status);
                                    this.TrialParticipantRepository.update(tps[0].pk, tps[0], (err, trialParticipant) => {
                                        if (err) {
                                            return console.log(err);
                                        }
                                        console.log(trialParticipant);
                                        const sites = this.hcoDSU.volatile.site;
                                        const site = sites.find(site => site.trialSReadSSI === tp.trialSReadSSI);
                                        this.sendMessageToPatient(tp, Constants.MESSAGES.HCO.UPDATE_STATUS, null, null, tp.status);
                                        this.sendMessageToSponsor(site.sponsorDid, Constants.MESSAGES.SPONSOR.TP_CONSENT_UPDATE, {
                                            ssi: tp.pk,
                                            consentSSI: null
                                        }, 'Participant status changed');
                                    });
                                }
                            });
                        });

                        await this._initServices();
                    }
                },
                () => {},
                {
                    controller: 'modals/ChangeParticipantStatusController',
                    disableExpanding: false,
                    disableBackdropClosing: true,
                    title: 'Edit Participant Status',
                    currentStatus: this.currentStatus
                });
        });
    }

    sendMessageToPatient(trialParticipant, operation, ssi, shortMessage, status = null) {
        this.CommunicationService.sendMessage(trialParticipant.did, {
            operation: operation,
            ssi: ssi,
            status,
            useCaseSpecifics: {
                tpName: trialParticipant.name,
                did: trialParticipant.did,
                sponsorDid: trialParticipant.sponsorDid,
                trialSSI: ssi
            },
            shortDescription: shortMessage,
        });
    }

    sendMessageToSponsor(sponsorDid, operation, data, shortMessage) {
        this.CommunicationService.sendMessage(sponsorDid, {
            operation: operation,
            ...data,
            shortDescription: shortMessage,
        });
    }

    addSiteStatusChangeActions(tp, userActions) {
        // This is not tied to consents, so manually inserted in userActions?
            switch (tp.status) {
                case Constants.TRIAL_PARTICIPANT_STATUS.END_OF_TREATMENT:
                    userActions.push({
                        name: Constants.TRIAL_PARTICIPANT_STATUS.END_OF_TREATMENT,
                        date: tp.endOfTreatmentDate
                    })
                    break;
                case Constants.TRIAL_PARTICIPANT_STATUS.IN_TREATMENT:
                    userActions.push({
                        name: Constants.TRIAL_PARTICIPANT_STATUS.IN_TREATMENT,
                        date: tp.inTreatmentDate
                    })
                    break;
                case Constants.TRIAL_PARTICIPANT_STATUS.COMPLETED:
                    userActions.push({
                        name: Constants.TRIAL_PARTICIPANT_STATUS.COMPLETED,
                        date: tp.completedDate
                    })
                    break;
                case Constants.TRIAL_PARTICIPANT_STATUS.DISCONTINUED:
                    userActions.push({
                        name: Constants.TRIAL_PARTICIPANT_STATUS.DISCONTINUED,
                        date: tp.discontinuedDate
                    })
                    break;
                case Constants.TRIAL_PARTICIPANT_STATUS.SCREEN_FAILED:
                    userActions.push({
                        name: Constants.TRIAL_PARTICIPANT_STATUS.SCREEN_FAILED,
                        date: tp.screenFailedDate
                    })
                    break;
                case Constants.TRIAL_PARTICIPANT_STATUS.WITHDRAWN:
                    userActions.push({
                        name: Constants.TRIAL_PARTICIPANT_STATUS.WITHDRAWN,
                        date: tp.withdrewDate
                    })
                    break;
                default:
                    return;
            }
    }
}
