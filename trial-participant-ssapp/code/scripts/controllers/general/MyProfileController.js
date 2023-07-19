import ProfileService from '../../services/ProfileService.js';
import {getTPService} from "../../services/TPService.js";

const commonServices = require("common-services");
const {getCommunicationServiceInstance} = commonServices.CommunicationService;
const { getDidServiceInstance } = commonServices.DidService;
const Constants = commonServices.Constants;

const getContactModel = () => {
    return {
        emailAddress:"",
        phoneNumber:"",
        addressText:"",
        address:undefined,
    }
}
const {WebcIonicController} = WebCardinal.controllers;

export default class MyProfileController extends WebcIonicController {


    constructor(...props) {
        super(...props);

        this.patientTmpState = this.getState();
        this.model.isBtnDisabled = true;
        this.isProfilePictureChanged = false;
        this.inputProperties = {};
        this.profileService = ProfileService.getProfileService();
        this.CommunicationService = getCommunicationServiceInstance();

        this.profileService.getContactData((err, contactData) => {
            if (err) {
                return console.error(err);
            }
            if (contactData) {
                this.model.contactData = contactData;
            } else {
                this.model.contactData = getContactModel();
            }

            this.observeInputs();

            if (this.patientTmpState !== undefined) {
                this.model.contactData.emailAddress = this.patientTmpState.patientEmail;
                this.model.contactData.phoneNumber = this.patientTmpState.patientPhoneNumber;
                if (this.patientTmpState.cameFromSaveButton) {
                    this.model.contactData.address = this.patientTmpState.address;
                    this.model.contactData.addressText = this.patientTmpState.addressText;
                } else {
                    this.model.contactData.addressText = contactData.addressText;
                }
                if (this.patientTmpState.patientProfilePicture !== undefined) {
                    this.model.profilePicture = this.patientTmpState.patientProfilePicture;
                    this.isProfilePictureChanged = true;
                }
            }
        });

        this.profileService.getProfilePicture((err, data) => {
            this.model.profilePicture = data;
        });
        this.didService = getDidServiceInstance();
        this.didService.getDID().then(did => {
            this.model.publicDid = did;
        });

        this.getParticipantName();
        this.addTagsListeners();
        this.addProfilePictureHandler();

        this._attachHandlerBack();
        this._attachHandlerEditAddress();
    }

    observeInputs() {
        const validateEmail = (email) => {
            return String(email)
                .toLowerCase()
                .match(
                    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                );
        }

        const validateInputs = (...validateResults) => {
            let valid = true;
            validateResults.forEach(result => {
                if(!result) valid = false;
            });
            return valid;
        }

        Object.assign(this.inputProperties, {
            'emailAddress':0,
            'phoneNumber':0,
            'addressText':0,
            'profilePicture':0,
        });

        if (this.patientTmpState !== undefined) Object.assign(this.inputProperties, this.patientTmpState.inputProperties);

        for (const property in this.inputProperties) {
            let initialValue = property !== 'profilePicture' ? this.model.contactData[property].trim() : 'profilePicture';
            let inputModelValue = property !== 'profilePicture' ? 'contactData.' + property : 'profilePicture';
            this.model.onChange(inputModelValue, () => {
                let inputsAreValidate = validateInputs(
                    validateEmail(this.model.contactData.emailAddress.trim()),
                );
                if (inputsAreValidate) {
                    if (this.isProfilePictureChanged) {
                        this.inputProperties['profilePicture'] = 1;
                        let inputPropertiesSum = Object.values(this.inputProperties).reduce((acc, val) => acc + val, 0);
                        this.model.isBtnDisabled = inputPropertiesSum > 0 ? false : true;
                    } else {
                        if (initialValue !== this.model.contactData[property].trim() && initialValue !== 'profilePicture') {
                            this.inputProperties[property] = 1;
                            let inputPropertiesSum = Object.values(this.inputProperties).reduce((acc, val) => acc + val, 0);
                            this.model.isBtnDisabled = inputPropertiesSum > 0 ? false : true;
                        } else {
                            this.inputProperties[property] = 0;
                            let inputPropertiesSum = Object.values(this.inputProperties).reduce((acc, val) => acc + val, 0);
                            this.model.isBtnDisabled = inputPropertiesSum > 0 ? false : true;
                        }
                    }
                } else {
                    this.inputProperties[property] = 0;
                    let inputPropertiesSum = Object.values(this.inputProperties).reduce((acc, val) => acc + val, 0);
                    this.model.isBtnDisabled = inputPropertiesSum > 0 ? false : true;
                }
            });
        }
    }


    async getParticipantName() {
        const tpService = getTPService();
        tpService.getTp((err, participant) => {
            if (err) {
                return console.log(err);
            }
            this.model.tp = participant.tp;
            this.hcoIdentity = participant.hcoIdentity;
        })
    }


    addTagsListeners() {
        this.onTagClick('profile:save', () => {
            window.WebCardinal.loader.hidden = false;
            let contactData = this.model.toObject("contactData");

            const updateContactInformation = (callback) => {
                this.profileService.saveContactData(contactData, (err, contactDataSReadSSI)=>{
                    if (err) {
                        return console.log(err);
                    }
                    this.sendMessageToHCO(this.hcoIdentity, Constants.MESSAGES.PATIENT.TP_CONTACT_DATA, contactDataSReadSSI, "TP updated contact data!");
                    callback();
                });
            }

            if (this.isProfilePictureChanged) {
                return this.profileService.saveProfilePicture(this.model.profilePicture, () => {
                    updateContactInformation(()=>{
                        window.WebCardinal.loader.hidden = true;
                        this.navigateToPageTag("home");
                    })
                })
            }

            updateContactInformation(()=>{
                window.WebCardinal.loader.hidden = true;
                this.navigateToPageTag("home");
            })
        })
    }

    sendMessageToHCO(siteDID, operation, ssi, shortMessage) {
        this.CommunicationService.sendMessage(siteDID, {
            operation: operation,
            ssi: ssi,
            tpDid: this.model.tp.did,
            shortDescription: shortMessage,
        });
    }

    _attachHandlerBack() {
        this.onTagClick('back', () => {
            this.navigateToPageTag('home');
        });
    }

    _attachHandlerEditAddress() {
        this.onTagClick('edit-address', () => {
            this.navigateToPageTag('edit-address', {
                patientEmail: this.model.contactData.emailAddress.trim(),
                patientPhoneNumber: this.model.contactData.phoneNumber.trim(),
                patientProfilePicture: this.isProfilePictureChanged ? this.model.profilePicture : undefined,
                isProfilePictureChanged:this.isProfilePictureChanged,
                inputProperties:this.inputProperties,
            });
        });
    }

    addProfilePictureHandler() {
        const profilePictureUpload = this.querySelector('#profileImageUpload');

        profilePictureUpload.addEventListener('change', (data) => {
            this.isProfilePictureChanged = true;
            let imageFile = data.target.files[0];
            let reader = new FileReader();
            reader.readAsDataURL(imageFile);

            reader.onload = (evt) => {
                this.model.profilePicture = evt.target.result
            }
        });
    }
}