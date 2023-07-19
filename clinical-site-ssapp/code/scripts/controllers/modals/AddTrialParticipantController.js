const openDSU = require("opendsu");
const commonServices = require("common-services");
const { DidService } = commonServices;
const {getCommunicationServiceInstance} = commonServices.CommunicationService
const momentService = commonServices.momentService;
const Constants = commonServices.Constants;

const {WebcController} = WebCardinal.controllers;
const LEGAL_ENTITY_MAX_AGE = 18;
let getInitModel = () => {
    return {
        name: {
            label: 'Name and Surname',
            name: 'name',
            required: true,
            placeholder: 'Full name',
            value: '',
        },
        did: {
            label: 'Public DID',
            name: 'did',
            required: true,
            placeholder: 'Public identifier',
            value: '',
        },
        anonymizedDID: {
            label: 'Anonymized DID',
            name: 'anonymized did',
            required: false,
            placeholder: 'Anonymized identifier',
            value: '',
        },
        birthdate: {
            label: 'Date of Birth',
            name: 'date',
            required: true,
            dataFormat: 'MM YYYY',
            type: 'month',
            value: '',
            min: '1900-01',
            max: momentService(Date.now()).format(Constants.DATE_UTILS.FORMATS.YearMonthPattern),
        },
        isUnder18:false,
        didDoesNotExist:false,
        didParent1: {
            label: 'Parent 1 Public Identifier',
            name: 'did',
            required: true,
            placeholder: 'Parent 1 Public Identifier',
            value: '',
        },
        didParent2: {
            label: 'Parent 2 Public Identifier',
            name: 'did',
            required: true,
            placeholder: 'Parent 2 Public Identifier',
            value: '',
        },
        gender: {
            label: 'Gender',
            required: true,
            options: [
                {
                    label: 'Select Gender',
                    value: '',
                    selected:true,
                    hidden:true
                },
                {
                    label: 'Male',
                    value: 'M',
                },
                {
                    label: 'Female',
                    value: 'F',
                },
            ],
            value: '',
        },

    };
};

export default class AddTrialParticipantController extends WebcController {
    constructor(...props) {
        super(...props);
        this.tpsDIDs = props[0].tpsDIDs;
        this.didService = DidService.getDidServiceInstance();
        this.communicationService = getCommunicationServiceInstance();
        this.model = getInitModel();
        this._initHandlers();

        this.observeInputs();
        this.generateAnonymizedDid();
        this.refreshHandler();
    }

    generateAnonymizedDid() {
        const crypto = openDSU.loadApi('crypto');
        let randomDidName = $$.Buffer.from(crypto.generateRandom(20)).toString('hex');
        this.didService.getWalletDomain().then(walletDomain => {
            const anonymizedDid = `did:ssi:name:${walletDomain}:${randomDidName}`;
            this.model.anonymizedDID.value = anonymizedDid;
        }).catch((err) => {
            console.log(err);
        });
    }

    refreshHandler() {
        this.onTagClick('refresh-identifier', this.generateAnonymizedDid.bind(this));
    }


    async observeInputs() {
        const validateInputs = async () => {
            this.model.didDoesNotExist = false;
            if(this.model.name.value.trim() === '' || this.model.did.value.trim() === '') {
                return this.model.isBtnDisabled = true;
            }
            //known did schema has the next format : did:type:name:domain:uniqueIdentifier
            const didSegments = this.model.did.value.split(':');
            if(didSegments.length !== 5) {
                return this.model.isBtnDisabled = true;
            }
            if(didSegments.some(segment => segment.trim() === '')) {
                return this.model.isBtnDisabled = true;
            }
            this.model.isBtnDisabled = this.tpsDIDs.some(tpDid => tpDid === this.model.did.value);

        }

        this.model.onChange('name.value', validateInputs);
        this.model.onChange('did.value', validateInputs);
    }

    _initHandlers() {
        this._attachHandlerSubmit();
    }

    _attachHandlerSubmit() {
        this.model.onChange("birthdate.value",()=>{
            let currentDate = Date.now()
            let birthDate = new Date(this.model.birthdate.value).getTime();

            let daysSinceBirth = (currentDate - birthDate) / (1000 * 3600 * 24);
            let legalEntityMaxAge = LEGAL_ENTITY_MAX_AGE * 365;

            this.model.isUnder18 = legalEntityMaxAge > daysSinceBirth;
        })

        this.onTagEvent('tp:submit', 'click', async(model, target, event) => {
            window.WebCardinal.loader.hidden = false;
            event.preventDefault();
            event.stopImmediatePropagation();
            const trialParticipant = {
                name: this.model.name.value,
                publicDid: this.model.did.value,
                did: this.model.anonymizedDID.value,
                birthdate: this.model.birthdate.value,
                gender: this.model.gender.value,
            };


            try{
                let tpPublicDidData = DidService.getDidData(trialParticipant.publicDid);
                await this.communicationService.resolveDidDocument(tpPublicDidData);
                this.model.didDoesNotExist = false;
                window.WebCardinal.loader.hidden = true;
                this.send('confirmed', trialParticipant);
            }
            catch (e) {
                this.model.didDoesNotExist = true;
                window.WebCardinal.loader.hidden = true;
            }


        });
    }
}
