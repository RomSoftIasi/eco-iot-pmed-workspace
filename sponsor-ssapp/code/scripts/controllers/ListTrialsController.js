// eslint-disable-next-line no-undef
const commonServices = require('common-services');
import TrialsService from '../services/TrialsService.js';
import { trialStatusesEnum, trialTableHeaders } from '../constants/trial.js';
const { getCommunicationServiceInstance } = commonServices.CommunicationService;
const MessageHandlerService = commonServices.MessageHandlerService;
const { Constants, momentService } = commonServices;
import ParticipantsService from '../services/ParticipantsService.js';
import SitesService from '../services/SitesService.js';

// eslint-disable-next-line no-undef
const { WebcController } = WebCardinal.controllers;

export default class ListTrialsController extends WebcController {
  statusesArray = Object.entries(trialStatusesEnum).map(([_k, v]) => v);

  itemsPerPageArray = [5, 10, 15, 20, 30];

  headers = trialTableHeaders;

  statuses = {
    label: 'Select a status',
    placeholder: 'Please select an option',
    required: false,
    options: [{ label: 'All statuses', value: '' }].concat(
      this.statusesArray.map((x) => ({
        label: x,
        value: x,
      }))
    ),
    value: '',
  };

  search = {
    label: 'Search for a trial',
    required: false,
    placeholder: 'Trial name...',
    value: '',
  };

  trials = null;

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
    this.participantsService = new ParticipantsService(this.DSUStorage);
    this.sitesService = new SitesService(this.DSUStorage);
    this.CommunicationService = getCommunicationServiceInstance();

    this.model.publicDidReady = false;
    this.CommunicationService.onPrimaryDidReady((err) => {
      if (err) {
        throw err;
      }

      this.model.publicDidReady = true;
    });

    this.model = {
      statuses: this.statuses,
      search: this.search,
      trials: [],
      pagination: this.pagination,
      headers: this.headers,
      clearButtonDisabled: true,
      type: 'trials',
      tableLength: 7,
      breadcrumb: [
        {
          label: 'Trials',
          tag: 'trials',
          state: {},
        },
      ],
    };

    this.listenForMessages();

    this.attachEvents();

    this.init();
  }

  listenForMessages() {
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
      console.log('DATA MESSAGE:', data);
      blockUI();
      data = JSON.parse(data);
      switch (data.operation) {
        case Constants.MESSAGES.SPONSOR.UPDATE_SITE_STATUS: {
          if (data.stageInfo.siteSSI) {
            await this.sitesService.updateSiteStage(data.stageInfo.siteSSI);
          }
          break;
        }
        case Constants.MESSAGES.HCO.SEND_HCO_DSU_TO_SPONSOR: {
          if (data.ssi) {
            await this.sitesService.addHCODsu(data.ssi, data.senderIdentity);
          }
          break;
        }
        case Constants.MESSAGES.SPONSOR.TP_ADDED: {
          if (data.ssi) {
            await this.participantsService.addParticipant(
              data.ssi,
              data.senderIdentity,
              data.tpUid,
              data.consentsKeySSIs
            );
          }
          break;
        }
        case Constants.MESSAGES.SPONSOR.DECLINE_ECONSENT:
        case Constants.MESSAGES.SPONSOR.TP_CONSENT_UPDATE:
        case Constants.MESSAGES.SPONSOR.SIGN_ECONSENT: {
          if (data.ssi) {
            await this.participantsService.updateParticipantConsent(
              data.ssi,
              data.senderIdentity,
              data.consentsKeySSIs
            );
          }
          break;
        }
        case Constants.MESSAGES.SPONSOR.ADDED_TS_NUMBER:
        case Constants.MESSAGES.PATIENT.UPDATE_TP_NUMBER: {
          if (data.ssi) {
            await this.participantsService.addParticipantNumber(data.ssi, data.senderIdentity);
          }
          break;
        }
      }
      unBlockUI();
    });
  }

  async init() {
    await this.getTrials();
  }

  async getTrials() {
    try {
      window.WebCardinal.loader.hidden = false;
      this.trials = await this.trialsService.getTrials();
      this.trials.sort((a, b) => {
        return momentService(a.created).isBefore(momentService(b.created)) ? 1 : -1;
      });
      for (const trial of this.trials) {
        trial.disabledEdited = !!(await this.participantsService.getParticipantCount(trial.id));
      }
      this.setTrialsModel(this.trials);
      window.WebCardinal.loader.hidden = true;
    } catch (error) {
      window.WebCardinal.loader.hidden = true;
      console.error(error);
      this.showInformationModal('There was an issue accessing trials object', 'error');
    }
  }

  setTrialsModel(trials) {
    const model = trials
      .map((trial) => ({
        ...trial,
        created: new Date(trial.created).toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE),
        recruitmentPeriod: trial.recruitmentPeriod
          ? {
              ...trial.recruitmentPeriod,
              toShowDate:
                new Date(trial.recruitmentPeriod.startDate).toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE) +
                '-' +
                new Date(trial.recruitmentPeriod.endDate).toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE),
            }
          : { ...trial.recruitmentPeriod, toShowDate: '-' },
      }))
      .sort((a, b) => a.id - b.id);

    this.model.trials = model;
    this.model.data = model;
    this.model.headers = this.model.headers.map((x) => ({ ...x, asc: false, desc: false }));
  }

  filterData() {
    let result = this.trials;

    if (this.model.statuses.value) {
      result = result.filter((x) => x.status === this.model.statuses.value);
    }
    if (this.model.search.value && this.model.search.value !== '') {
      result = result.filter((x) => x.name.toUpperCase().search(this.model.search.value.toUpperCase()) !== -1);
    }

    this.setTrialsModel(result);
  }

  showInformationModal(message, alertType) {
    this.model.message = {
      content: message,
      type: alertType,
    };
  }

  attachEvents() {
    this.model.onChange('statuses.value', () => {
      this.model.clearButtonDisabled = false;
      this.filterData();
    });

    this.model.onChange('search.value', () => {
      this.model.clearButtonDisabled = false;
      this.filterData();
    });

    this.model.addExpression(
      'trialArrayNotEmpty',
      () => !!(this.model.trials && Array.isArray(this.model.trials) && this.model.trials.length > 0),
      'trials'
    );

    this.on('run-filters', () => {
      this.filterData();
    });

    this.onTagClick('add-trial', async () => {
      this.showModalFromTemplate(
        'add-new-trial',
        () => {
          window.WebCardinal.loader.hidden = true;
          this.getTrials();
          this.showInformationModal('Trial added successfully', 'success');
        },
        (event) => {
          window.WebCardinal.loader.hidden = true;
          const error = event.detail || null;
          if (error instanceof Error) {
            console.error(error);
            this.showInformationModal('ERROR: There was an issue creating the new trial', 'error');
          }
        },
        {
          controller: 'modals/AddNewTrialModalController',
          disableExpanding: false,
          disableBackdropClosing: true,
          existingIds: this.trials.map((x) => x.id) || [],
        }
      );
    });

    this.onTagClick('edit-trial', async (model) => {
      this.showModalFromTemplate(
        'edit-trial',
        async (event) => {
          await this.getTrials();
          this.showInformationModal('Trial edited changed successfully', 'success');
        },
        (event) => {
          const error = event.detail || null;
          if (error instanceof Error) {
            console.error(error);
            this.showInformationModal('ERROR: There was an issue editing the trial', 'error');
          }
        },
        {
          controller: 'modals/EditTrialModalController',
          disableExpanding: true,
          disableBackdropClosing: true,
          trial: model,
          existingIds: this.trials.map((x) => x.id) || [],
        }
      );
    });

    this.onTagClick('view-trial-sites', async (model) => {
      this.navigateToPageTag('sites', {
        id: model.id,
        keySSI: model.keySSI,
        uid: model.uid,
        status: model.status,
        breadcrumb: this.model.toObject('breadcrumb'),
      });
    });

    this.onTagClick('view-trial-consents', async (model) => {
      this.navigateToPageTag('trial-consents', {
        id: model.id,
        keySSI: model.keySSI,
        uid: model.uid,
        status: model.status,
        breadcrumb: this.model.toObject('breadcrumb'),
      });
    });

    this.onTagClick('view-trial-status', async (model) => {
      this.showModalFromTemplate(
        'add-new-trial-status',
        async (event) => {
          await this.updateSiteStatuses(event.detail);
          await this.getTrials();
          this.showInformationModal('Trial status changed successfully', 'success');
        },
        (event) => {
          const error = event.detail || null;
          if (error instanceof Error) {
            console.error(error);
            this.showInformationModal('ERROR: There was an issue creating the new trial', 'error');
          }
        },
        {
          controller: 'modals/AddNewTrialStatusModalController',
          disableExpanding: true,
          disableBackdropClosing: true,
          trial: model,
        }
      );
    });

    this.onTagClick('set-recruitment-period', (model, target, event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const onCloseHandler = () => {};
      const recruitmentPeriodSetHandler = async (event) => {
        window.WebCardinal.loader.hidden = false;
        const response = event.detail;
        const recruitmentPeriod = {
          ...response,
          toShowDate:
            new Date(response.startDate).toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE) +
            ' - ' +
            new Date(response.endDate).toLocaleDateString(Constants.DATE_UTILS.DATE_LOCALE),
        };
        await this.trialsService.updateTrialDetails(model, { recruitmentPeriod });
        await this.getTrials();
        window.WebCardinal.loader.hidden = true;
      };
      const modalConfiguration = {
        controller: 'modals/EditRecruitmentPeriodController',
        disableExpanding: false,
        disableBackdropClosing: true,
        title: 'Edit Recruitment Period',
        recruitmentPeriod: model.recruitmentPeriod,
      };

      this.showModalFromTemplate(
        'edit-recruitment-period',
        recruitmentPeriodSetHandler,
        onCloseHandler,
        modalConfiguration
      );
    });

    this.onTagClick('filters-cleared', async () => {
      this.model.clearButtonDisabled = true;
      this.model.statuses.value = null;
      this.model.search.value = null;
      this.filterData();
    });

    const searchField = this.element.querySelector('#search-field');
    searchField.addEventListener('keydown', () => {
      setTimeout(() => {
        this.model.clearButtonDisabled = false;
        this.filterData();
      }, 300);
    });
  }

  sendMessageToHco(operation, ssi, shortMessage, receiverDid) {
    this.CommunicationService.sendMessage(receiverDid, {
      operation: operation,
      ssi: ssi,
      shortDescription: shortMessage,
    });
  }

  async updateSiteStatuses(trial) {
    const sites = await this.sitesService.getSites(trial.keySSI);

    for (const site of sites) {
      await this.sitesService.changeSiteStatus(trial.status, site.did, trial.keySSI);
      this.sendMessageToHco(Constants.MESSAGES.SPONSOR.UPDATE_SITE_STATUS, site.uid, 'Status updated', site.did);
    }
  }
}
