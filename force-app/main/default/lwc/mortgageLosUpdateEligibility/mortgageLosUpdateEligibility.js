import { getFieldValue, getRecord } from 'lightning/uiRecordApi';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import { LAST_ELIGIBILITY_QUERY } from './queries.js';
import { LightningElement, api, wire, track } from 'lwc';
import { MessageContext } from 'lightning/messageService'
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';
import { RERUN_ELIGIBILITY } from './mutations.js';
import { cloneObjectFrom } from 'c/util';

/**
 * Eligibility Data Information section
 * @module c-mortgage-los-update-eligibility
 * @property {string} recordId - Opportunity Id
 */

export default class MortgageLosUpdateEligibility extends LightningElement {

  /**
   * Field Info
   * @typedef {Object} FieldInfo
   * @property {any} value - The field value
   * @property {string} label - The field title
   */

  /**
   * @typedef {Object} EligibilitySummaryInfo
   * @property {FieldInfo} uuid - Eligibility uuid
   * @property {FieldInfo} date - Eligibility execution date
   * @property {FieldInfo} result - Eligibility result
   * @property {FieldInfo} elapsedTime - How long the execution took to complete
   */

  /**
   * Eligibility Info Object
   * @type {EligibilitySummaryInfo}
   */
  eligibilityEmptyFormValues = {
    uuid: {
      value: null,
      label: 'UUID',
      showViewMode: true
    },
    date: {
      value: null,
      label: "Date of eligibility run",
      showViewMode: true
    },
    status: {
      value: null,
      label: "Status",
      showViewMode: true
    },
    result: {
      value: null,
      label: "Result",
      showViewMode: true
    },
    elapsedTime: {
      value: null,
      label: "Total execution time",
      showViewMode: true
    }
  };

  /**
   * @typedef {Object} ProductInfo
   * @property {FieldInfo} rate - Product rate
   * @property {FieldInfo} lender - Lender name
   * @property {FieldInfo} points - Porduct points
   * @property {FieldInfo} dti - Product dti
   */

  /**
   * Product Info Object
   * @type {ProductInfo}
   */
  productEmptyFormValues = {
    rate: {
      value: null,
      label: "Rate",
      showViewMode: true
    },
    lender: {
      value: null,
      label: "Lender",
      showViewMode: true
    },
    points: {
      value: null,
      label: "Points",
      showViewMode: true
    },
    dti: {
      value: null,
      label: "DTI",
      showViewMode: true
    }
  };

  @wire(MessageContext)
  messageContext;

  @track _eligibility = Object.assign({}, this.eligibilityEmptyFormValues);

  set eligibility(value) {
    this._eligibility = value;
  }

  get eligibility() {
    return this._eligibility;
  }

  @track lowestParRateProduct = Object.assign({}, this.productEmptyFormValues);
  @api recordId;

  dayjsInitialized = false;

  renderedCallback() {
    if (this.dayjsInitialized) {
      return;
    }
    loadScript(this, Dayjs + '/package/dayjs.min.js').then(() => {
      this.dayjsInitialized = true;
    }).catch(error => {
      console.log(error);
    });
  }

  /**
   * Boolean used to change view mode - See {@tutorial view-edit-modes}
   * @type {boolean}
   */
  @api isEditing = false;

  get summarySectionController() {
    return this.template.querySelector('c-mortgage-los-section-controller[data-id="summary"]');
  }

  get lowestParRateProductSectionController() {
    return this.template.querySelector('c-mortgage-los-section-controller[data-id="lowest-par-rate-product"]');
  }

  /**
   * @property {Function} handleEditClick Changes the visualization to Edit mode
   */
  handleEditClick = () => {
    this.isEditing = true;
  }

  @wire(getRecord, {
    recordId: '$recordId', fields: [
      SUBMISSION_UUID,
      SUBMISSION_TYPE
    ]
  })
  initialize({ data }) {
    if (data) {
      this.opportunity = data;
      this.submissionUuid = getFieldValue(this.opportunity, SUBMISSION_UUID);
      getLastEligibility(this.recordId, this.submissionUuid, this.lastEligibilityCallback.bind(this));
    }
  };

  lastEligibilityCallback(result) {
    if (result) {
      this.eligibility.uuid.value = result.uuid;
      const createdDate = dayjs(result.createdAt);
      this.eligibility.date.value = createdDate.format('MM/DD/YYYY HH:mm:ss');
      this.eligibility.status.value = result.status;
      this.eligibility.result.value = '';

      let endTime = dayjs();
      if (this.isEligibilityCompleted(result.status)) {
        endTime = dayjs(result.endTime);

        this.eligibility.result.value = result.outcome;

        if (result.lowestParRateProduct) {
          const lowestParRateProduct = result.lowestParRateProduct[0];
          this.lowestParRateProduct.rate.value = lowestParRateProduct.rate;
          this.lowestParRateProduct.lender.value = lowestParRateProduct.lender.name;
          this.lowestParRateProduct.points.value = lowestParRateProduct.points;
          this.lowestParRateProduct.dti.value = lowestParRateProduct.dti;
        }

        this.lowestParRateProductSectionController.showContent();
      }
      const elapsedTime = endTime.diff(createdDate, 'second', true);

      if (this.isToKeepPolling(result.status, elapsedTime)) {
        window.setTimeout(this.fetchLastEligibility, 5000);
      }

      this.eligibility.elapsedTime.value = `${elapsedTime} sec`;

      this.summarySectionController.showContent();
      return;
    }

    this.summarySectionController.showError();
    this.lowestParRateProductSectionController.showError();
  }

  runEligibilityLite = () => {
    rerunEligibility({
      recordId: this.recordId,
      submissionUuid: this.submissionUuid,
      reuseData: true,
      newCreditReport: false,
      newProducts: true,
      newClosingCosts: true,
      rerunEligibilityCallback: this.rerunEligibilityCallback
    });
  }

  rerunEligibilityCallback = (result) => {
    this.summarySectionController.hideContent();
    this.lowestParRateProductSectionController.hideContent();
    this.eligibility = cloneObjectFrom(this.eligibilityEmptyFormValues);
    this.lowestParRateProduct = cloneObjectFrom(this.productEmptyFormValues);
    getLastEligibility(this.recordId, this.submissionUuid, this.lastEligibilityCallback.bind(this));
  }

  isToKeepPolling = (status, duration) => {
    if (this.isEligibilityCompleted(status)) {
      return false;
    }

    // Duration is calculated in seconds
    // if it took more 3 min then we stop polling
    if (duration > 180) {
      return false;
    }

    return true;
  }

  isEligibilityCompleted = (status) => {
    if (!status) {
      return false;
    }
    return ['completed', 'failed'].includes(status);
  }

  fetchLastEligibility = () => {
    getLastEligibility(this.recordId, this.submissionUuid, this.lastEligibilityCallback.bind(this));
  }

}

/**
 * Gets the data from database based on queries described in queries.js
 * @param {*} submissionUuid
 * @param {*} recordId
 * @param {*} lastEligibilityCallback
 * @returns {void}
 */
const getLastEligibility = (recordId, submissionUuid, lastEligibilityCallback) => {
  const promise = queryWithMap({ identifier: recordId, query: LAST_ELIGIBILITY_QUERY, variables: { submissionUuid } });
  promise.then(data => {
    const result = JSON.parse(data);
    lastEligibilityCallback(result)
  }).catch(error => {
    console.log(error);
    lastEligibilityCallback(null);
  })
}

const rerunEligibility = ({ recordId, submissionUuid, reuseData, newCreditReport, newProducts, newClosingCosts, rerunEligibilityCallback }) => {
  const promise = queryWithMap({
    identifier: recordId,
    query: RERUN_ELIGIBILITY,
    variables: {
      uuid: submissionUuid,
      reuseData,
      newCreditReport,
      newProducts,
      newClosingCosts
    }
  });
  promise.then(data => {
    const result = JSON.parse(data);
    rerunEligibilityCallback(result);
  }).catch(error => {
    console.log(error);
    rerunEligibilityCallback(null);
  })
}