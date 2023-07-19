import ProfileService from '../../services/ProfileService.js';
import {getTPService} from "../../services/TPService.js";

const commonServices = require("common-services");
const {getCommunicationServiceInstance} = commonServices.CommunicationService;
const { getDidServiceInstance } = commonServices.DidService;
const {WebcIonicController} = WebCardinal.controllers;

const getContactModel = () => {
    return {
        country:"",
        county:"",
        city:"",
        street:"",
        number:"",
        extraInfo:"",
        postalCode:"",
    };
};

export default class EditAddressController extends WebcIonicController {
    constructor(...props) {
        super(...props);

        this.patientTmpState = this.getState();
        this.profileService = ProfileService.getProfileService();
        this.CommunicationService = getCommunicationServiceInstance();

        this.profileService.getContactData((err, contactData) => {
            if (err) {
                return console.error(err);
            }
            this.model.contactData = {
                ...this.model.contactData, 
                address: {},
            };
            if (contactData.address) {
                this.model.contactData.address = contactData.address;
            } else {
                this.model.contactData.address = getContactModel();
            }
            this.observeInputs();
        });

        this.didService = getDidServiceInstance();
        this.didService.getDID().then(did => {
            this.model.publicDid = did;
        });
        this.getParticipantName();

        this.addSaveButtonListener();
        this._attachHandlerBack();

        this.model.isBtnDisabled = true;
    }

    observeInputs() {
        for (const property in this.model.contactData.address) {
            let initialValue = this.model.contactData.address[property].trim();
            this.model.onChange('contactData.address.' + property, () => {
                if (initialValue !== this.model.contactData.address[property].trim())
                    this.model.isBtnDisabled = false;
                else
                    this.model.isBtnDisabled = true;
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

    addSaveButtonListener() {
        this.onTagClick('address:save', () => {
            let contactData = this.model.toObject("contactData");
            let shownAddress = "";
            let proprietiesCount = 0;
            for (const property in this.model.contactData.address) {
                if (this.model.contactData.address[property] !== "") {
                    shownAddress += this.model.contactData.address[property] + ", ";
                    proprietiesCount++;
                }
            }
            if (proprietiesCount !== 0) {
                shownAddress = shownAddress.substring(0, shownAddress.length - 2);
            }
            this.navigateToPageTag("my-profile", {
                ...this.patientTmpState,
                addressText:shownAddress,
                cameFromSaveButton:true,
                address:contactData.address,
            });
        })
    }

    _attachHandlerBack() {
        this.onTagClick('back', () => {
            this.navigateToPageTag('my-profile', {
                ...this.patientTmpState,
                addressText:'',
                cameFromSaveButton:false,
                address:undefined,
            });
        });
    }
}

