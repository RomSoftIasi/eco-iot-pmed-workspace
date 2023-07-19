// eslint-disable-next-line no-undef
const commonServices = require('common-services');
const Constants = commonServices.Constants;
import TrialsService from '../services/TrialsService.js';
import { consentTableHeaders } from '../constants/consent.js';
const { getCommunicationServiceInstance } = commonServices.CommunicationService;
const BreadCrumbManager = commonServices.getBreadCrumbManager();
import SitesService from '../services/SitesService.js';
import ConsentService from '../services/ConsentService.js';
import { consentTypeEnum } from '../constants/consent.js';
import { trialStatusesEnum } from '../constants/trial.js';
import VisitsService from '../services/VisitsService.js';

export default class ListTrialConsentsController extends BreadCrumbManager {
  itemsPerPageArray = [5, 10, 15, 20, 30];

  headers = consentTableHeaders;

  consents = null;

  pagination = {
    previous: false,
    next: false,
    items: null,
    pages: {
      selectOptions: '',
    },
    slicedPages: null,
    currentPage: 0,
    itemsPerPage: 10,
    totalPages: null,
    itemsPerPageOptions: {
      selectOptions: this.itemsPerPageArray.map((x) => ({ value: x, label: x })),
      value: this.itemsPerPageArray[1].value,
    },
  };

  constructor(...props) {
    super(...props);

    this.trialsService = new TrialsService(this.DSUStorage);
    this.sitesService = new SitesService(this.DSUStorage);
    this.consentService = new ConsentService(this.DSUStorage);
    this.visitsService = new VisitsService(this.DSUStorage);

    let { id, keySSI, uid, status } = this.history.location.state;

    this.model = {
      id,
      keySSI,
      uid,
      status,
      consents: [],
      pagination: this.pagination,
      headers: this.headers,
      clearButtonDisabled: true,
      type: 'consents',
      tableLength: 7,
      numberOfMandatoryConsents: null,
    };

    this.model.breadcrumb = this.setBreadCrumb({
      label: `${id} / Consents`,
      tag: `trial-consents`,
    });

    this.model.trialIsNotActive = this.model.status !== trialStatusesEnum.Active;

    this.attachEvents();
    this.init();
  }

  async init() {
    await this.getConsents();
  }

  async getConsents() {
    window.WebCardinal.loader.hidden = false;
    const consents = await this.consentService.getTrialConsents(this.model.keySSI);
    this.setConsentsModel(JSON.parse(JSON.stringify(consents)));
    this.consents = consents;
    window.WebCardinal.loader.hidden = true;
  }

  setConsentsModel(consents) {
    const model = consents.map((consent) => ({
      ...consent,
      ...consent.versions.map((x) => ({ ...x, versionDate: new Date(x.versionDate).toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE) }))[
        consent.versions.length - 1
      ],
      trialIsNotActive: this.model.trialIsNotActive
    }));

    this.model.consents = model;
    this.model.numberOfMandatoryConsents = consents.filter((x) => x.type === consentTypeEnum.Mandatory).length;
    this.model.data = model;
  }

  showInformationModal(message, alertType) {
    this.model.message = {
      content: message,
      type: alertType,
    };
  }

  attachEvents() {
    this.model.addExpression(
      'consentsArrayNotEmpty',
      () => !!(this.model.consents && Array.isArray(this.model.consents) && this.model.consents.length > 0),
      'consents'
    );

    this.onTagClick('add-consent', async () => {
      const visits = await this.visitsService.getVisitsFromDB(this.model.keySSI);
      this.showModalFromTemplate(
        'add-new-trial-consent',
        async (_event) => {
          await this.getConsents();
          this.showInformationModal('Consent added successfully', 'success');
        },
        (event) => {
          const error = event.detail || null;
          if (error instanceof Error) {
            console.error(error);
            this.showInformationModal('ERROR: There was an issue creating the new consent', 'error');
          }
        },
        {
          controller: 'modals/AddNewTrialConsentModalController',
          disableExpanding: false,
          disableBackdropClosing: true,
          model: {
            isUpdate: false,
            existingIds: this.model.consents.map((x) => x.id) || [],
            numberOfMandatoryConsents: this.model.numberOfMandatoryConsents,
            existingVisits: visits,
          },
        }
      );
    });

    this.onTagClick('add-trial-version', async (model, _target) => {
      const visits = await this.visitsService.getVisitsFromDB(this.model.keySSI);
      const selectedConsent = model;
      const existingVersions = selectedConsent.versions.map((x) => x.version);

      this.showModalFromTemplate(
        'add-new-trial-consent',
        (_event) => {
          this.getConsents();
          this.showInformationModal('Consent added successfully', 'success');
        },
        (event) => {
          const error = event.detail || null;
          if (error instanceof Error) {
            console.error(error);
            this.showInformationModal('ERROR: There was an issue creating the new consent', 'error');
          }
        },
        {
          controller: 'modals/AddNewTrialConsentModalController',
          disableExpanding: false,
          disableBackdropClosing: true,
          model: {
            isUpdate: selectedConsent,
            existingVersions: existingVersions || [],
            numberOfMandatoryConsents: this.model.numberOfMandatoryConsents,
            existingVisits: visits,
          },
        }
      );
    });

    this.onTagClick('view-consent-history', async (model) => {
      const selectedConsent = this.model.consents.find((x) => x.uid === model.uid);
      const data = selectedConsent.versions.map((x) => ({
        ...selectedConsent,
        ...x,
        versionDate: new Date(x.versionDate).toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE),
      }));

      this.navigateToPageTag('consent-history', {
        id: this.model.id,
        keySSI: this.model.keySSI,
        uid: this.model.uid,
        data: JSON.parse(JSON.stringify(data)),
        breadcrumb: this.model.toObject('breadcrumb'),
      });
    });

    this.onTagClick('view-visits', async (model) => {
      this.navigateToPageTag('visits', {
        trialKeySSI: this.model.keySSI,
        trialId: this.model.id,
        consentData: model,
        breadcrumb: this.model.toObject('breadcrumb'),
      });
    });

    this.onTagClick('view-attachment', async (model) => {
      this.navigateToPageTag('preview-consent', {
        id: this.model.id,
        keySSI: this.model.keySSI,
        uid: this.model.uid,
        data: model,
        history: null,
        breadcrumb: this.model.toObject('breadcrumb'),
      });
    });
  }

  sendMessageToHco(operation, ssi, shortMessage, receiverDid) {
    let communicationService = getCommunicationServiceInstance();
    communicationService.sendMessage(receiverDid, {
      operation: operation,
      ssi: ssi,
      shortDescription: shortMessage,
    });
  }
}
