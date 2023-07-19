import TrialParticipantRepository from '../repositories/TrialParticipantRepository.js';
import HCOService from "../services/HCOService.js";
import DeviceAssignationService from "../services/DeviceAssignationService.js";
import {getNotificationsService} from "../services/NotificationsService.js";
import {getSubscriberService} from "../services/SubscriberService.js";

const {WebcController} = WebCardinal.controllers;
const commonServices = require("common-services");
const ConsentStatusMapper = commonServices.ConsentStatusMapper;
const Constants = commonServices.Constants;
const {ResponsesService} = commonServices;
const momentService  = commonServices.momentService;

const HealthDataService = commonServices.HealthDataService;
const healthDataService = new HealthDataService();

const {getCommunicationServiceInstance} = commonServices.CommunicationService;
const {getDidServiceInstance} = commonServices.DidService;
const MessageHandlerService = commonServices.MessageHandlerService;
const JWTService = commonServices.JWTService;
const BaseRepository = commonServices.BaseRepository;
const SharedStorage = commonServices.SharedStorage;

// TODO: Landing Controller will listen to all messages: incoming trials, questionnaires, consent updates, withdraws and so on...
export default class LandingPageController extends WebcController {
    constructor(element, history) {
        super(element, history);
        this.model = this.getInitialModel();

        this.didService = getDidServiceInstance();

        this.model.publicDidReady = false;
        this.CommunicationService = getCommunicationServiceInstance();
        this.CommunicationService.onPrimaryDidReady((err, didDocument)=>{

            if(err){
                throw err;
            }
            this.model.publicDidReady = true;
        })

        this._attachMessageHandlers();
        this.initHandlers();
        this.initServices();

        this.notificationService = getNotificationsService();
        this.subscriberService = getSubscriberService();
        this.notificationService.onNotification(this.getNumberOfNotifications.bind(this));
        this.getNumberOfNotifications();
    }

    getNumberOfNotifications() {
        this.notificationService.getNumberOfUnreadNotifications().then(numberOfNotifications => {
            {
                if(numberOfNotifications) {
                    this.model.notificationsNumber = numberOfNotifications;
                    console.log('numberOfNotifications', numberOfNotifications);
                    this.model.hasNotifications = true;
                } else this.model.hasNotifications = false;
            }
        })
    }

    async initServices() {
        this.ResponsesService = new ResponsesService();
        this.TrialParticipantRepository = TrialParticipantRepository.getInstance(this.DSUStorage);

        this.StorageService = SharedStorage.getSharedStorage(this.DSUStorage);
        this.DeviceAssignationService = new DeviceAssignationService();
        this.TrialParticipantRepository = BaseRepository.getInstance(BaseRepository.identities.HCO.TRIAL_PARTICIPANTS);
        this.NotificationsRepository = BaseRepository.getInstance(BaseRepository.identities.HCO.NOTIFICATIONS);
        this.VisitsAndProceduresRepository = BaseRepository.getInstance(BaseRepository.identities.HCO.VISITS);
        this.HCOService = new HCOService();
        this.hcoDSU = await this.HCOService.getOrCreateAsync();
        return this.hcoDSU;

    }

    initHandlers() {
        const pageHandlers = [
            {eventTag: "navigation:iot-manage-devices", pageTag: "iot-manage-devices"},
            {eventTag: "navigation:econsent-notifications", pageTag: "econsent-notifications"},
            {eventTag: "navigation:econsent-trial-management", pageTag: "econsent-trial-management"}
        ];

        pageHandlers.forEach(pageHandler => {
            this.onTagClick(pageHandler.eventTag, () => {
                this.navigateToPageTag(pageHandler.pageTag, {breadcrumb: this.model.toObject('breadcrumb')});
            })
        })

    }

    _attachMessageHandlers() {

        const loader = window.WebCardinal.loader;
        const onConfirmRefresh = function (event) {
            event.preventDefault();
            return event.returnValue = "Are you sure you want to leave?";
        }

        const blockUI = () =>{
            loader.hidden = false;
            loader.setAttribute("data-value","Updating wallet. Please wait...")
            window.addEventListener("beforeunload", onConfirmRefresh, { capture: true });
        }

        const unBlockUI = ()=>{
            loader.removeAttribute("data-value");
            loader.hidden = true;
            window.removeEventListener("beforeunload", onConfirmRefresh, { capture: true });
        }

        MessageHandlerService.init(async (data) => {
            data = JSON.parse(data);
            blockUI();
            await this.handleIotMessages(data);
            await this.handleEcoMessages(data);
            unBlockUI();

        })
    }

    async handleIotMessages(data) {
        switch (data.operation) {
            case Constants.MESSAGES.PATIENT.QUESTIONNAIRE_RESPONSE: {
                this.ResponsesService.mount(data.ssi, async (err, qs) => {
                    if (err) {
                        return console.log(err);
                    }
                    this.hcoDSU = await this.HCOService.getOrCreateAsync();
                    const patientDID = qs.questionResponses[0].patientDID;
                    const tp = this.hcoDSU.volatile.tps.find(tp => tp.did === patientDID);
                    const trialUid = await this.HCOService.getAnchorIdAsync(tp.trialSReadSSI);
                    let patientName;
                    const tps = await this.TrialParticipantRepository.filterAsync(`did == ${patientDID}`, 'ascending', 30)
                    if (tps.length > 0) {
                        patientName = tps[0].name;
                    }

                    let notificationInfo = {
                        ...Constants.HCO_NOTIFICATIONS_TYPE.TRIAL_SUBJECT_QUESTIONNAIRE_RESPONSES,
                        state: {
                            participantDID: patientDID,
                            trialSSI: trialUid,
                            patientName: patientName
                        }
                    }
                    await this._saveNotification(data, `New questionnaire response from patient ${patientName} <${tp.number}>`, 'View responses', notificationInfo);
                });
                break;
            }
        }
    }

    async handleEcoMessages(data) {

        console.log('MESSAGE' , data)
        let senderIdentity = data.senderIdentity;
        if (typeof senderIdentity === "undefined") {
            throw new Error("Sender identity is undefined. Did you forgot to add it?")
        }
        switch (data.operation) {

            case Constants.MESSAGES.PATIENT.TP_CONTACT_DATA: {
                await this._saveNotification(data, data.shortDescription, '', Constants.HCO_NOTIFICATIONS_TYPE.TRIAL_UPDATES);
                await this.updateTpContactData(data);
                break;
            }

            case Constants.MESSAGES.PATIENT.TP_IS_UNAVAILABLE:{
                await this._saveNotification(data, 'TP is unavailable', '', Constants.HCO_NOTIFICATIONS_TYPE.TRIAL_UPDATES);
                await this.markTpAsUnavailable(data);
                break;
            }

            case Constants.MESSAGES.HCO.ADD_CONSENT_VERSION: {
                const site = await this.HCOService.findTrialSite(this.hcoDSU.volatile.site, data.ssi);
                const consents = site.consents;
                const consent = consents.find(x => x.uid === data.econsentUid);
                if (consent) {
                    const action = {
                        url: 'econsent-trial-consent-history',
                        data: {
                            breadcrumb: this.model.toObject('breadcrumb'),
                            trialUid: data.trialUid,
                            consentUid: data.econsentUid,
                            siteUid: data.ssi,
                            trialConsentId: consent.trialConsentId
                        }
                    }
                    await this._saveNotification(data, 'New econsent version was added', 'View consent version', Constants.HCO_NOTIFICATIONS_TYPE.TRIAL_UPDATES, action);
                }
                this.HCOService.refreshSite(async ()=> {
                    await this.sendRefreshConsentsToTrialParticipants(data);
                });
                break;
            }
            case Constants.MESSAGES.HCO.ADD_CONSENT: {
                const action = {
                    url: 'econsent-trial-consents',
                    data: {
                        breadcrumb: this.model.toObject('breadcrumb'),
                        trialUid: data.trialUid,
                        consentUid: data.econsentUid,
                        siteUid: data.ssi
                    }
                }
                this.HCOService.refreshSite(async ()=>{
                    await this.sendRefreshConsentsToTrialParticipants(data);
                })
                await this._saveNotification(data, 'New econsent was added', 'View consent', Constants.HCO_NOTIFICATIONS_TYPE.TRIAL_UPDATES, action);
                break;
            }
            case Constants.MESSAGES.HCO.SITE_STATUS_CHANGED: {
                await this._saveNotification(data, 'The status of site was changed', '', Constants.HCO_NOTIFICATIONS_TYPE.TRIAL_UPDATES);

                break;
            }
            case Constants.MESSAGES.HCO.ADD_SITE: {
                 const action = {
                    url: 'econsent-trial-management',
                    data: {
                        breadcrumb: this.model.toObject('breadcrumb'),
                    }
                }
            
                await this._saveNotification(data, 'Your site was added to the trial ', 'View trial', Constants.HCO_NOTIFICATIONS_TYPE.TRIAL_UPDATES, action);
                const mountSiteAndUpdateEntity = new Promise((resolve => {
                    this.HCOService.mountSite(data.ssi, (err, site) => {
                        if (err) {
                            return console.log(err);
                        }

                        this.HCOService.mountTrial(site.trialSReadSSI, (err, trial) => {
                            if (err) {
                                return console.log(err);
                            }

                            this.HCOService.mountVisit(site.visitsSReadSSI, (err, visit) => {
                                if (err) {
                                    return console.log(err);
                                }

                                this.sendMessageToSponsor(senderIdentity, Constants.MESSAGES.HCO.SEND_HCO_DSU_TO_SPONSOR, {ssi: this.HCOService.ssi}, null);
                                resolve();
                            })
                        });
                    });
                }))
                await mountSiteAndUpdateEntity;
                break;
            }
            case Constants.MESSAGES.HCO.NEW_HEALTHDATA: {
                await this.handleHealthData(data);
                break;
            }
            case Constants.MESSAGES.HCO.COMMUNICATION.TYPE.VISIT_RESPONSE: {
                await this._updateVisit(data);
                this.subscriberService.notifySubscribers("visits-update");
                break;
            }
            case Constants.MESSAGES.HCO.UPDATE_ECONSENT: {
                await this._updateEconsentWithDetails(data);
                break;
            }
        }
        await this._updateHcoDSU();
    }

    async updateTpContactData(message) {
        try {
            const profileData = await this.HCOService.readDsuDataAsync(message.ssi);
            let tp;
            const tps = await this.TrialParticipantRepository.filterAsync(`did == ${message.tpDid}`, 'ascending', 30)
            if (tps.length > 0) {
                tp = tps[0];
            }
            tp.contactData = {
                emailAddress: profileData.emailAddress,
                phoneNumber: profileData.phoneNumber
            };
            this.TrialParticipantRepository.updateAsync(tp.pk, tp);
        } catch (e) {
            console.error(e);
        }
    }

    async markTpAsUnavailable(data) {
        this.hcoDSU = await this.HCOService.getOrCreateAsync();
        if (this.hcoDSU.volatile.tps) {

            const JWTServiceInstance = new JWTService();
            const {verifyCredentialStatus} = await JWTServiceInstance.verifyCredential(data.anonymousDIDVc);
            const anonymizedDID = verifyCredentialStatus.vc.credentialSubject.anonymizedDID;
            let tp = this.hcoDSU.volatile.tps.find(tp => tp.did === anonymizedDID);
            tp.status = Constants.TRIAL_PARTICIPANT_STATUS.UNAVAILABLE;
            this.HCOService.updateHCOSubEntity(tp, "tps", async (err, response) => {
                if (err) {
                    return console.log(err);
                }
            });
        }
    }

    async sendRefreshConsentsToTrialParticipants(data) {
        //refresh hcoDSU
        this.hcoDSU = await this.HCOService.getOrCreateAsync();
        const site = await this.HCOService.findTrialSite(this.hcoDSU.volatile.site, data.ssi);
        let loader = window.WebCardinal.loader;
        loader.hidden = false;
        let promisesArr = [];

        this.TrialParticipantRepository.findAll(async (err, tps) => {
            if (err) {
                return console.log(err);
            }

            let counter = 0;
            let availableStatuses = [Constants.TRIAL_PARTICIPANT_STATUS.SCREENED, Constants.TRIAL_PARTICIPANT_STATUS.PLANNED, Constants.TRIAL_PARTICIPANT_STATUS.IN_TREATMENT,
                Constants.TRIAL_PARTICIPANT_STATUS.ENROLLED, Constants.TRIAL_PARTICIPANT_STATUS.WITHDRAWN, Constants.TRIAL_PARTICIPANT_STATUS.DISCONTINUED];

            tps = tps.filter(tp => tp.trialId === site.trialId);

            tps = tps.filter(tp => availableStatuses.includes(tp.status));

            let nrOfTps = tps.length;

            const cloneIFCs = (tps, callback) => {
                if (tps.length === 0) {
                    return callback();
                }

                let tp = tps.shift();
                let percentage = Math.floor((counter * 100) / nrOfTps) + '%';
                let message = `Updating inform consents. Please wait... ${percentage}`;
                loader.setAttribute("data-value", message);

                this.HCOService.cloneIFCs(data.ssi, tp.pk, (err) => {
                    if (err) {
                        return console.error(err);
                    }

                    counter = counter + 1;

                    if (tps.length > 0) {
                        return cloneIFCs(tps, callback);
                    }

                    loader.setAttribute("data-value", "Update successfully completed");
                    loader.setAttribute("completed","");
                    setTimeout(() => {
                        loader.removeAttribute("data-value");
                        loader.removeAttribute("completed");
                        loader.hidden = true;
                    } ,2000)
                    callback();
                });
            }

            cloneIFCs([...tps], async () => {
                if (tps.length === 0) {
                    return loader.hidden = true;
                }
                this.hcoDSU = await this.HCOService.getOrCreateAsync();
                let ifcs = this.hcoDSU.volatile.ifcs || [];
                tps.forEach(tp => {
                    let tpIfcs = ifcs.filter(ifc => ifc.genesisUid === data.econsentUid && ifc.tpUid === tp.pk);

                    let promise = new Promise((resolve) => {
                        tpIfcs.forEach(econsent => {
                            this.sendMessageToPatient(tp, Constants.MESSAGES.HCO.SEND_REFRESH_CONSENTS_TO_PATIENT,
                                econsent.keySSI, null);

                            let visits = this.hcoDSU.volatile.visit[0].visits.filter(v => v.consentId === econsent.trialConsentId);
                            let lastVisit = visits[visits.length-1];

                            if(econsent.type === 'Mandatory' && econsent.trialConsentVersion === lastVisit.updatedAtConsentVersion) {
                                let tpDsu = this.hcoDSU.volatile.tps.find(tpDsu => tpDsu.did === tp.did);
                                if (tpDsu.hasOwnProperty('visits')) {
                                    tpDsu.visits = [];
                                    this.HCOService.updateHCOSubEntity(tpDsu, "tps", async (err) => {
                                        if (err) {
                                            return console.log(err);
                                        }
                                    })
                                }

                                if (tp.status !== Constants.TRIAL_PARTICIPANT_STATUS.PLANNED) {
                                    this.sendMessageToPatient(tp, Constants.MESSAGES.HCO.REFRESH_VISITS, null, null);
                                }
                            }
                        });

                        const consentsKeySSIs = tpIfcs.map(econsent => econsent.keySSI);
                        this.sendMessageToSponsor(site.sponsorDid, Constants.MESSAGES.SPONSOR.TP_CONSENT_UPDATE, {
                            ssi: tp.uid,
                            consentsKeySSIs
                        }, "Consent Changed");
                        resolve();
                    })
                    promisesArr.push(promise);
                })
            })
            await Promise.allSettled(promisesArr);
        })
    }

    async _updateHcoDSU() {
        this.hcoDSU = await this.HCOService.getOrCreateAsync();
    }

    async handleHealthData(data) {
        const action = {
            url: 'econsent-trial-participant-health-data',
            data: {
                breadcrumb: this.model.toObject('breadcrumb'),
                deviceId: data.deviceId,
                trialParticipantNumber:data.trialParticipantNumber
            }
        }

        const notificationTitle = typeof data.sReadSSI === "undefined" ? "Updated Health Data" : "New Health Data";
        await this._saveNotification(data,`${notificationTitle} from device "${data.deviceId}" for patient number "${data.trialParticipantNumber}"`, 'View Health Data', Constants.HCO_NOTIFICATIONS_TYPE.PATIENT_HEALTH_DATA, action);

        //health data update in existing dsu;
        if(typeof data.sReadSSI === "undefined"){
            console.log("Health data was updated");
            return;
        }
        return new Promise((resolve, reject) => {
            healthDataService.mountObservation(data.sReadSSI, (err, healthData) => {
                if (err) {
                    return reject(err);
                }

                this.DeviceAssignationService.getAssignedDevices((err, devices) => {
                    if (err) {
                         return reject(err)
                    }

                    let assignedDevice = devices.find(device => device.deviceId === data.deviceId);
                    assignedDevice.healthDataIdentifiers.push(healthData.uid);
                    this.DeviceAssignationService.updateAssignedDevice(assignedDevice, (err) => {
                        if (err) {
                            return reject(err)
                        }
                        resolve();
                    })
                });
            });
        })

    }

    async _updateEconsentWithDetails(message) {
        let tpDSU, tpRecord;
        this.hcoDSU = await this.HCOService.getOrCreateAsync();

        tpDSU = this.hcoDSU.volatile.tps.find(tp => tp.did === message.useCaseSpecifics.tpDid)
        if (!tpDSU) {
            return console.error('Cannot find tp.');
        }

        const tps = await this.TrialParticipantRepository.filterAsync(`did == ${tpDSU.did}`, 'ascending', 30)
        tpRecord = tps[0];

        const consentSSI = message.ssi;
        let econsent = this.hcoDSU.volatile.ifcs.find(ifc => ifc.keySSI === consentSSI && ifc.tpUid === tpRecord.pk )
        if (econsent === undefined) {
            return console.error('Cannot find econsent.');
        }
        let currentVersionIndex = econsent.versions.findIndex(eco => eco.version === message.useCaseSpecifics.version)
        if (currentVersionIndex === -1) {
            return console.log(`Version ${message.useCaseSpecifics.version} of the econsent ${consentSSI} does not exist.`)
        }
        let currentVersion = econsent.versions[currentVersionIndex]
        if (currentVersion.actions === undefined) {
            currentVersion.actions = [];
        }

        let actionNeeded = 'No action required';
        let status = Constants.TRIAL_PARTICIPANT_STATUS.SCREENED;
        let statusUpdateDetails = {};
        let currentDate = new Date();
        switch (message.useCaseSpecifics.action.name) {
            case ConsentStatusMapper.consentStatuses.withdraw.name: {
                if(econsent.type === "Mandatory") {
                    actionNeeded = 'TP Withdrawn';
                    status = Constants.TRIAL_PARTICIPANT_STATUS.TP_WITHDRAWN;
                }

                const action = {
                    url: 'econsent-trial-participant',
                    data: {
                        breadcrumb: this.model.toObject('breadcrumb'),
                        trialUid: message.useCaseSpecifics.trialSSI,
                        tpUid: tpDSU.uid,
                        tpDid: message.useCaseSpecifics.tpDid,
                        tpPk: tpRecord.pk,
                        econsentUid: econsent.uid
                    }
                }

                let patientName;
                const tps = await this.TrialParticipantRepository.filterAsync(`did == ${message.useCaseSpecifics.tpDid}`, 'ascending', 30)
                if (tps.length > 0) {
                    patientName = tps[0].name;
                }

                await this._saveNotification(message,`Trial participant ${patientName} withdraw from ${econsent.name} (${econsent.type.toLowerCase()}) consent.`, 'View participant', Constants.HCO_NOTIFICATIONS_TYPE.WITHDRAWS, action);
                statusUpdateDetails = {
                    actionNeeded,
                    status,
                    withdrewDate: currentDate.toLocaleDateString()
                }
                break;
            }
            case ConsentStatusMapper.consentStatuses.decline.name: {
                if(econsent.type === "Mandatory") {
                    actionNeeded = 'TP Declined';
                    status = currentVersionIndex > 0? Constants.TRIAL_PARTICIPANT_STATUS.DISCONTINUED : Constants.TRIAL_PARTICIPANT_STATUS.SCREEN_FAILED;
                }

                const action = {
                    url: 'econsent-trial-participant',
                    data: {
                        breadcrumb: this.model.toObject('breadcrumb'),
                        trialUid: message.useCaseSpecifics.trialSSI,
                        tpUid: tpDSU.uid,
                        tpDid: message.useCaseSpecifics.tpDid,
                        tpPk: tpRecord.pk,
                        econsentUid: econsent.uid
                    }
                }

                let patientName;
                const tps = await this.TrialParticipantRepository.filterAsync(`did == ${message.useCaseSpecifics.tpDid}`, 'ascending', 30)
                if (tps.length > 0) {
                    patientName = tps[0].name;
                }

                await this._saveNotification(message,`Trial participant ${patientName} declined ${econsent.name} (${econsent.type.toLowerCase()}) consent.`, 'View participant', Constants.HCO_NOTIFICATIONS_TYPE.WITHDRAWS, action);
                statusUpdateDetails = {
                    actionNeeded,
                    status,
                    discontinuedDate: currentDate.toLocaleDateString()
                }
                break;
            }
            case ConsentStatusMapper.consentStatuses.signed.name: {
                if(econsent.type === 'Mandatory') {
                    actionNeeded = 'Acknowledgement required';
                    if(tpDSU.status === Constants.TRIAL_PARTICIPANT_STATUS.PLANNED) {
                        status =  Constants.TRIAL_PARTICIPANT_STATUS.SCREENED;
                    }
                }

                const action = {
                    url: 'econsent-trial-participant',
                    data: {
                        breadcrumb: this.model.toObject('breadcrumb'),
                        trialUid: message.useCaseSpecifics.trialSSI,
                        tpUid: tpDSU.uid,
                        tpDid: message.useCaseSpecifics.tpDid,
                        tpPk: tpRecord.pk,
                        econsentUid: econsent.uid
                    }
                }

                let patientName;
                const tps = await this.TrialParticipantRepository.filterAsync(`did == ${message.useCaseSpecifics.tpDid}`, 'ascending', 30)
                if (tps.length > 0) {
                    patientName = tps[0].name;
                }
                await this._saveNotification(message, `Trial participant ${patientName} signed ${econsent.name} (${econsent.type.toLowerCase()}) consent.`, 'View participant', Constants.HCO_NOTIFICATIONS_TYPE.CONSENT_UPDATES, action);

                statusUpdateDetails = {
                    actionNeeded,
                    status,
                    screenedDate: currentDate.toLocaleDateString()
                }
                break;
            }
        }

        currentVersion.actions.push({
            ...message.useCaseSpecifics.action,
            tpDid: message.useCaseSpecifics.tpDid,
            status: status,
            type: 'tp',
            actionNeeded: actionNeeded
        });

        const sites = this.hcoDSU.volatile.site;
        const site = sites.find(site => site.trialSReadSSI === tpDSU.trialSReadSSI);

        if(econsent.type === "Optional") {
            econsent.versions[currentVersionIndex] = currentVersion;
            return this.HCOService.updateHCOSubEntity(econsent, "ifcs/" + tpRecord.pk, (err) => {
                if (err) {
                    return console.log(err);
                }

                this.sendMessageToSponsor(site.sponsorDid, Constants.MESSAGES.SPONSOR.TP_CONSENT_UPDATE, {
                    ssi: tpRecord.pk,
                    consentsKeySSIs: [econsent.uid]
                }, "Consent Changed");
            })
        }

        Object.assign(tpDSU, statusUpdateDetails);
        Object.assign(tpRecord, statusUpdateDetails);
        tpDSU['statusHistory'].push(statusUpdateDetails.status);
        tpRecord['statusHistory'].push(statusUpdateDetails.status);
        this.HCOService.updateHCOSubEntity(tpDSU, "tps", async (err) => {
            if (err) {
                return console.log(err);
            }

            econsent.versions[currentVersionIndex] = currentVersion;
            this.HCOService.updateHCOSubEntity(econsent, "ifcs/" + tpRecord.pk, (err) => {
                if (err) {
                    return console.log(err);
                }

                this.TrialParticipantRepository.update(tpRecord.pk, tpRecord, async (err) => {
                    if (err) {
                        return console.log(err);
                    }

                    this.hcoDSU = await this.HCOService.getOrCreateAsync();

                    this.CommunicationService.sendMessage(tpRecord.did, {
                        status: status,
                        operation: Constants.MESSAGES.HCO.UPDATE_STATUS
                    });

                    this.sendMessageToSponsor(site.sponsorDid, Constants.MESSAGES.SPONSOR.TP_CONSENT_UPDATE, {
                        ssi: tpRecord.pk,
                        consentsKeySSIs: [econsent.uid]
                    }, "Consent Changed");

                });
            });

        });
    }

    sendMessageToPatient(trialParticipant, operation, ssi, shortMessage) {
        this.CommunicationService.sendMessage(trialParticipant.did, {
            operation: operation,
            ssi: ssi,
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

    async _saveNotification(message, name, recommendedAction, notificationInfo, action = null) {

        console.log('notification message:', message)

        let notification = {
            ...message,
            recommendedAction: recommendedAction,
            ssi: message.ssi,
            viewed: false,
            read: false,
            date: Date.now(),
            name: name,
            type: notificationInfo.notificationTitle,
            tagPage: notificationInfo.tagPage,
            state: notificationInfo.state,
            action: action
        }

        return await this.notificationService.insertNotification(notification);
    }

    sendVisitToPatient(trialParticipantDid, visit, operation) {
        this.CommunicationService.sendMessage(trialParticipantDid, {
            operation: Constants.MESSAGES.HCO.VISIT_CONFIRMED,
            useCaseSpecifics: {
                tpDid: trialParticipantDid,
                visit: {
                    confirmed: visit.confirmed,
                    confirmedDate: visit.confirmedDate,
                    procedures: visit.procedures,
                    name: visit.name,
                    uuid: visit.uuid,
                    id: visit.id,
                    proposedDate: visit.proposedDate,
                    suggestedInterval: visit.suggestedInterval,
                    isExtended: visit.isExtended
                },
            },
            shortDescription: operation
        });
    }

    async _updateVisit(message) {

        this.hcoDSU = await this.HCOService.getOrCreateAsync();
        const tpDSU = this.hcoDSU.volatile.tps.find(tp => tp.did === message.useCaseSpecifics.tpDid);
        let objIndex = tpDSU?.visits?.findIndex((visit => visit.uuid === message.useCaseSpecifics.visit.uuid));

        tpDSU.visits[objIndex].accepted = message.useCaseSpecifics.visit.accepted;
        tpDSU.visits[objIndex].declined = message.useCaseSpecifics.visit.declined;
        tpDSU.visits[objIndex].rescheduled = message.useCaseSpecifics.visit.rescheduled;
        tpDSU.visits[objIndex].proposedDate = message.useCaseSpecifics.visit.proposedDate;

        tpDSU.visits[objIndex].confirmedDate = message.useCaseSpecifics.visit.confirmedDate;

        console.log('message', message);

        let visit = message.useCaseSpecifics.visit;

        if(visit.accepted) {
            tpDSU.visits[objIndex].confirmed = true;
            tpDSU.visits[objIndex].hcoRescheduled = false;
            tpDSU.visits[objIndex].confirmedDate = momentService(visit.proposedDate).format(Constants.DATE_UTILS.FORMATS.DateTimeFormatPattern);

            this.sendVisitToPatient(message.useCaseSpecifics.tpDid, tpDSU.visits[objIndex],Constants.MESSAGES.HCO.VISIT_CONFIRMED);
        }

        if(visit.rescheduled || visit.declined) {
            tpDSU.actionNeeded = Constants.TP_ACTIONNEEDED_NOTIFICATIONS.TP_VISIT_RESCHEDULED;
            tpDSU.visits[objIndex].confirmed = false;
        }

        const trial = this.hcoDSU.volatile.trial.find(trial => tpDSU.trialId === trial.id);

        const action = {
            url: 'econsent-visits-procedures',
            data: {
                breadcrumb: this.model.toObject('breadcrumb'),
                trialUid: trial.uid,
                tpUid: tpDSU.uid,
                trialId: tpDSU.trialId,
                pk: tpDSU.pk,
            }
        }

        this.HCOService.updateHCOSubEntity(tpDSU, "tps", async (err, data) => {
            this.hcoDSU = await this.HCOService.getOrCreateAsync();
            let notification = message;
            notification.tpUid = data.uid;

            await this._saveNotification(notification, `${message.shortDescription} ${tpDSU.subjectName} <${tpDSU.number}>`, 'View visits', Constants.HCO_NOTIFICATIONS_TYPE.MILESTONES_REMINDERS, action);
        });

    }

    getInitialModel() {
        return {
            breadcrumb: [{
                label: "Dashboard",
                tag: "home",
                state: {}
            }]
        };
    }


}