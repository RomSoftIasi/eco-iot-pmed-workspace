import ConsentService from '../../services/ConsentService.js';
import { consentTypeEnum } from '../../constants/consent.js';
const commonServices = require('common-services');
const { getCommunicationServiceInstance } = commonServices.CommunicationService;
const Constants = commonServices.Constants;
// eslint-disable-next-line no-undef
const { WebcController } = WebCardinal.controllers;

export default class AddNewSiteConsentModalController extends WebcController {
  name = {
    readOnly: false,
    label: 'Site Consent Name',
    name: 'name',
    required: true,
    placeholder: 'Please insert a name...',
    value: '',
  };

  version = {
    label: 'Site Consent Version',
    name: 'version',
    required: true,
    placeholder: 'Please insert version number...',
    value: '',
  };

  attachment = {
    label: 'Select file',
    listFiles: true,
    filesAppend: false,
    files: [],
    name: '',
  };

  file = {
    label: 'Site Consent File (*.pdf)',
    name: 'file',
    required: true,
    placeholder: 'Please select a consent file',
    value: null,
    invalidValue: false,
  };

  isUpdate = false;

  constructor(...props) {
    super(...props);

    this.site = props[0].site || null;
    this.consents = props[0].consents || [];
    this.siteConsent = props[0].siteConsent || null;
    this.selectedConsent = props[0].selectedConsent || [];
    this.trialUid = props[0].trialUid || null;
    this.mandatoryExists = props[0].mandatoryExists;

    let { trialKeySSI } = this.history.location.state;

    this.keySSI = trialKeySSI;

    this.consentsService = new ConsentService(this.DSUStorage);

    if (this.selectedConsent && this.siteConsent) {
      this.siteSelectedConsent =
        this.site.consents &&
        this.site.consents.length &&
        this.site.consents.find((x) => x.trialConsentId === this.selectedConsent.id);

      this.selectedVersion = this.siteSelectedConsent
        ? Math.max.apply(
            Math,
            this.siteSelectedConsent.versions.map((o) => parseInt(o.version))
          ) + 1
        : 1;

      this.model = {
        newConsent: !(this.selectedConsent && this.siteConsent),
        existingConsent: this.selectedConsent && this.siteConsent,
        consent: {
          file: this.file,
          type: this.selectedConsent.type,
          trialConsentName: this.selectedConsent.name,
          trialConsentId: this.selectedConsent.id,
          trialConsentVersion: Math.max.apply(
            Math,
            this.selectedConsent.versions.map((o) => parseInt(o.version))
          ),
          name: {
            ...this.name,
            value: (this.siteConsent && this.siteConsent.name) || this.name,
            readOnly: !!(this.siteConsent && this.siteConsent.name),
          },
          version: {
            ...this.version,
            value: this.selectedVersion,
            disabled: true,
          },
          attachment: this.attachment,
        },
        submitButtonDisabled: true,
      };
    } else {
      let filteredConsents = this.consents.filter(
        (x) => this.site.consents.findIndex((y) => y.trialConsentId === x.id) === -1
      );
      if (!this.mandatoryExists) {
        filteredConsents = this.consents
          .filter((x) => this.site.consents.findIndex((y) => y.trialConsentId === x.id) === -1)
          .filter((x) => x.type === consentTypeEnum.Mandatory);
      }

      this.model = {
        newConsent: !(this.selectedConsent && this.siteConsent),
        existingConsent: this.selectedConsent && this.siteConsent,
        consent: {
          file: this.file,
          type: filteredConsents[0].type,
          trialConsentName: {
            label: 'Select type',
            placeholder: 'Please select an option',
            required: true,
            selectOptions: filteredConsents.map((x) => ({
              value: x.name,
              label: x.name,
            })),
            disabled: false,
            value: filteredConsents[0].name,
          },
          trialConsentId: filteredConsents[0].id,
          trialConsentVersion: Math.max.apply(
            Math,
            filteredConsents[0].versions.map((o) => parseInt(o.version))
          ),
          name: {
            ...this.name,
            value: (this.siteConsent && this.siteConsent.name) || this.name.value,
            readOnly: !!(this.siteConsent && this.siteConsent.name),
          },
          version: {
            ...this.version,
            value: 1,
            disabled: true,
          },
          attachment: this.attachment,
        },
        submitButtonDisabled: true,
      };
    }
    this.attachAll();
  }

  attachAll() {
    this.on('add-file', (event) => {
      if (event.data) {
        this.model.consent.file.value = event.data;
        this.model.consent.attachment.name = event.data[0].name;
      }
      if (!event.data || event.data.length === 0) {
        this.model.consent.file.value = null;
        this.model.consent.attachment.name = '';
      }
    });

    this.onTagEvent('selected-consent-changed', 'change', (model, target, event) => {
      const selectedConsent = this.consents.find((x) => x.name === this.model.consent.trialConsentName.value);

      this.model.consent.type = selectedConsent.type;
      this.model.consent.trialConsentId = selectedConsent.id;
      this.model.consent.trialConsentVersion = Math.max.apply(
        Math,
        selectedConsent.versions.map((o) => parseInt(o.version))
      );
    });

    this.onTagClick('create-consent', async () => {
      try {
        window.WebCardinal.loader.hidden = false;
        let valid = true;
        for (const x in this.model.consent) {
          // TODO: check if file selected
          if (!this.model.consent.name.value || this.model.consent.name.value === '') {
            Object.assign(this.model.consent.name, { invalidValue: true });
            setTimeout(() => {
              Object.assign(this.model.consent.name, { invalidValue: null });
            }, 1000);
            valid = false;
          }

          if (!this.model.consent.file.value || this.model.consent.file.value === '') {
            Object.assign(this.model.consent.file, { invalidValue: true });
            setTimeout(() => {
              Object.assign(this.model.consent.file, { invalidValue: null });
            }, 1000);
            valid = false;
          }
        }

        if (!valid) {
          window.WebCardinal.loader.hidden = true;
          return;
        }

        const result = {
          trialConsentVersion: this.model.consent.trialConsentVersion,
          trialConsentId: this.model.consent.trialConsentId,
          trialConsentName: this.model.consent.trialConsentName.value || this.model.consent.trialConsentName,
          file: this.model.consent.file.value[0],
          type: this.model.consent.type,
          versions: [
            {
              version: this.model.consent.version.value,
              versionDate: new Date().toISOString(),
              file: this.model.consent.file.value[0],
              trialConsentVersion: this.model.consent.trialConsentVersion,
            },
          ],
          name: this.model.consent.name.value,
        };

        let outcome = null;
        const exists = this.site.consents.find((x) => x.trialConsentId === this.model.consent.trialConsentId && x.name);
        if (exists) {
          outcome = await this.consentsService.addSiteConsentVersion(result, this.keySSI, this.site);
          this.sendMessageToHco(
            Constants.MESSAGES.SPONSOR.ADD_CONSENT_VERSION,
            this.site.uid,
            'Site consent',
            this.site.did,
            outcome.uid
          );
        } else {
          outcome = await this.consentsService.addSiteConsent(result, this.keySSI, this.site);
          this.sendMessageToHco(
            Constants.MESSAGES.HCO.ADD_CONSENT,
            this.site.uid,
            'Site consent',
            this.site.did,
            outcome.uid
          );
        }
        this.model.submitButtonDisabled = false;
        window.WebCardinal.loader.hidden = true;
        this.send('confirmed', outcome);
      } catch (error) {
        window.WebCardinal.loader.hidden = true;
        this.send('closed', new Error('There was an issue creating the site consent'));
        console.error(error);
      }
    });
  }

  sendMessageToHco(operation, ssi, shortMessage, receiverDid, econsentUid = null) {
    let communicationService = getCommunicationServiceInstance();
    const message = {
      operation: operation,
      ssi: ssi,
      shortDescription: shortMessage,
      trialUid: this.trialUid,
    };

    if (econsentUid) {
      message.econsentUid = econsentUid;
    }
    communicationService.sendMessage(receiverDid, message);
  }
}
