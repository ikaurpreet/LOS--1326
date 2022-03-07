import { LightningElement, api, wire, track } from 'lwc';
import { getFieldValue, getRecord } from 'lightning/uiRecordApi';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import { LAST_HARD_CREDIT_REPORT_QUERY, CREDIT_REPORT_PDF_URL_QUERY } from './queries.js';
import { RE_PULL_HARD_CREDIT_REPORT } from './mutations.js';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';
import HardCreditPullChannel from '@salesforce/messageChannel/HardCreditPullChannel__c';
import { publish, MessageContext } from 'lightning/messageService';

const HARD_CREDIT_PULL_ROLE_OPTIONS = new Map([
  ['borrower', 'borrower'],
  ['coBorrower', 'co_borrower'],
]);

export default class MortgageLosCreditReport extends LightningElement {

  @api recordId;
  @api role;
  @api participantUuid;

  @track creditReportDetails;
  @track loading = true;
  @track creditReportUrlLoading = false;

  @wire(MessageContext)
  messageContext;

  dayjsInitialized = false;

  renderedCallback() {
    if (this.dayjsInitialized) {
        return;
    }
    Promise.all([
      loadScript(this, Dayjs + '/package/dayjs.min.js'),
      loadScript(this, Dayjs + '/package/plugin/utc.js'),
      loadScript(this, Dayjs + '/package/plugin/timezone.js'),
      loadScript(this, Dayjs + '/package/plugin/advancedFormat.js'),
    ]).then(() => {
      this.dayjsInitialized = true;
      dayjs.extend(dayjs_plugin_utc);
      dayjs.extend(dayjs_plugin_timezone);
      dayjs.extend(dayjs_plugin_advancedFormat);
    });
  }

  get creditReportFailed() {
    if (this.creditReportDetails) {
      return this.creditReportDetails.status === 'failed';
    }
    return false;
  }

  get creditReportDetailsDescription() {
    if (this.creditReportDetails) {
      return this.creditReportDetails.description;
    }
    return "";
  }

  get sectionController() {
    return this.template.querySelector('c-mortgage-los-section-controller');
  };

  get showCreditReportDetails() {
    return this.creditReportDetails && this.creditReportDetails !== null;
  }

  get showBorrower() {
    return this.role === "borrower";
  }

  get showCoBorrower() {
    return this.role === "coBorrower";
  }

  get humanCreditReportDate() {
    if (this.dayjsInitialized && this.creditReportDetails) {
      return dayjs.utc(this.creditReportDetails.createdAt).local().format("MM/DD/YY [at] h:mm A z");
    }
    return "";
  }

  get reportDocumentUuid() {
    if (this.creditReportDetails) {
      return this.creditReportDetails.documentUuid;
    }
    return "";
  }

  openCreditReport = (event) => {
    event.preventDefault();
    this.creditReportUrlLoading = true;
    getCustomerResportPDFUrl(this.recordId, this.participantUuid, this.openCreditReportCallback.bind(this));
  }

  openCreditReportCallback = (result) => {
    this.creditReportUrlLoading = false;
    if (result) {
      window.open(result.link, '_blank');
    }
  }

  @wire(getRecord, {
    recordId: '$recordId', fields: [
      SUBMISSION_UUID
    ]
  })
  initialize({ data }) {
    if (data) {
      this.opportunity = data;
      this.submissionUuid = getFieldValue(this.opportunity, SUBMISSION_UUID);
      this.fetchLastCreditReport();
    }
  };

  lastCreditReportCallback(result) {
    if (result) {
      if (this.showBorrower) {
        if(result.borrower && result.borrower.length > 0) {
          this.creditReportDetails = result.borrower[0];
        }
      }

      if (this.showCoBorrower) {
        if(result.coBorrower && result.coBorrower.length > 0) {
          this.creditReportDetails = result.coBorrower[0];
        }
      }

      if (this.creditReportDetails) {
        const elapsedTime = dayjs().diff(this.startPollingDate, 'second', true)
        if (this.isToKeepPolling(this.creditReportDetails, elapsedTime)) {
          window.setTimeout(this.fetchLastCreditReport, 5000);
          return;
        }
      }

      publish(this.messageContext, HardCreditPullChannel, { requestStatus: 'COMPLETED' });
      this.sectionController.showContent();
      return;
    }
    this.sectionController.showError();
  }

  runNewCreditReport = () => {
    runCreditReport({
      recordId: this.recordId,
      submissionUuid: this.submissionUuid,
      role: HARD_CREDIT_PULL_ROLE_OPTIONS.get(this.role),
      callback: this.runCreditReportCallback
    });
  }

  runCreditReportCallback = (result) => {
    if (result) {
      this.sectionController.hideContent();
      this.creditReportDetails = undefined;
      this.startPollingDate = dayjs();
      publish(this.messageContext, HardCreditPullChannel, { requestStatus: 'STARTED' });
      this.fetchLastCreditReport();
      return;
    }
    this.sectionController.showError();
  }

  fetchLastCreditReport = () => {
    lastCreditReport(this.recordId, this.submissionUuid, this.lastCreditReportCallback.bind(this));
  }

  isToKeepPolling = (details, duration) => {

    // Duration is calculated in seconds
    // if it took more 3 min then we stop polling
    if (duration > 180) {
      return false;
    }

    if (!this.isFinalState(details.status)) {
      return true;
    }

    if (this.isCompleted(details.status) && !this.isDocumentReady(details.documentUuid)) {
      return true;
    }

    return false;
  }

  isDocumentReady = (documentUuid) => {
    return documentUuid && documentUuid !== null && documentUuid !== "";
  }

  isFinalState = (status) => {
    if (!status) {
      return false;
    }
    return ['completed','failed'].includes(status);
  }

  isCompleted = (status) => {
    if (!status) {
      return false;
    }
    return status === 'completed';
  }

}

const lastCreditReport = (recordId, submissionUuid, lastCreditReportCallback) => {
  const promise = queryWithMap({ identifier: recordId, query: LAST_HARD_CREDIT_REPORT_QUERY, variables: { submissionUuid } });
  promise.then(data => {
    const result = JSON.parse(data);
    lastCreditReportCallback(result)
  }).catch(error => {
    console.log(error);
    lastCreditReportCallback(null);
  })
}

const runCreditReport = ({recordId, submissionUuid, role, callback}) => {
  const promise = queryWithMap({
    identifier: recordId,
    query: RE_PULL_HARD_CREDIT_REPORT,
    variables: {
      submissionUuid,
      role
    }
  });
  promise.then(data => {
    const result = JSON.parse(data);
    callback(result);
  }).catch(error => {
    console.log(error);
    callback(null);
  })
}

const getCustomerResportPDFUrl = (recordId, participantUuid, callback) => {
  const promise = queryWithMap({
    identifier: recordId,
    query: CREDIT_REPORT_PDF_URL_QUERY,
    variables: {
      participantUuid
    }
  });
  promise.then(data => {
    const result = JSON.parse(data);
    callback(result);
  }).catch(error => {
    console.log(error);
    callback(null);
  })
}