import { LightningElement, api, track, wire } from 'lwc';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import CoBorrowerSR from '@salesforce/resourceUrl/CoBorrower';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js'
import { getFieldValue, getRecord } from 'lightning/uiRecordApi';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import mutateWithMap from '@salesforce/apex/GraphQLProxyController.mutateWithMap';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';

import { default as editMode } from './templates/edit.html';
import { default as viewMode } from './templates/view.html';

/**
 * @typedef {"isCurrentlyServing" | "isReserve" | "isRetired" | "isSurvivingSpouse"} DescriptionOption
 */

/**
 * @typedef {"borrower" | "coBorrower"} RoleOption
 */

/**
 * Participant Military Service section
 * @module c-mortgage-los-update-military-service
 * @property {string} recordId - Opportunity Id
 * @property {RoleOption} role - Role of Participant
 * @property {boolean} showBothParticipants - Used for show both forms
 */

export default class MortgageLosUpdateMilitaryService extends LightningElement {
  BorrowerIconURL = BorrowerSR;
  CoBorrowerIconURL = CoBorrowerSR;

  /**
   * Boolean used to change view mode - See {@tutorial view-edit-modes}
   * @type {boolean}
   */
  @api
  isEditing = false;

  @api
  recordId;

  @api
  role;

  @api
  showBothParticipants;

  @track
  borrowerServiceState = false;

  /**
   * @type {DescriptionOption[]}
   */
  @track
  borrowerServiceDescription = [];

  @track
  coBorrowerServiceState = false;

  /**
   * @type {DescriptionOption[]}
   */
  @track
  coBorrowerServiceDescription = [];

  @track
  borrowerExpirationDateOfService = null;

  @track
  coBorrowerExpirationDateOfService = null;

  handleBorrowerServiceStateChange = (value) => {
    this.borrowerServiceState = value;
  }

  handleBorrowerServiceDescriptionChange = (value) => {
    this.borrowerServiceDescription = value;
  }

  handleBorrowerExpirationDateChange = (value) => {
    this.borrowerExpirationDateOfService = value;
  }

  handleCoBorrowerServiceStateChange = (value) => {
    this.coBorrowerServiceState = value;
  }

  handleCoBorrowerServiceDescriptionChange = (value) => {
    this.coBorrowerServiceDescription = value;
  }

  handleCoBorrowerExpirationDateChange = (value) => {
    this.coBorrowerExpirationDateOfService = value;
  }

  borrowerUuid = null;
  coBorrowerUuid = null;
  statuslabel = `Did you (or your deceased spouse) ever serve, or are you currently
  serving, in the United States Armed Forces?`;
  descriptionLabel = "What is the status of the Service?";

  /**
   * @property {Function} handleEditClick Changes the visualization to Edit mode
   */
  handleEditClick = () => {
    this.isEditing = true;
  }

  /**
   * @property {Function} handleCancelClick Changes the visualization to View mode
   */
  handleCancelClick = () => {
    this.sectionController.hideContent();
    this.isEditing = false;
    getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
  }

  get showBorrower() {
    return this.role === "borrower" || this.showBothParticipants;
  }

  get showCoBorrower() {
    return this.role === "coBorrower" || this.showBothParticipants;
  }

  /**
   * Updates the participant info object with the data from DB
   * @param {*} result
   */
  submissionCallback(result){
    if (result) {
      if (this.showCoBorrower) {
        this.coBorrowerUuid = result.coBorrower.uuid;
        const militaryService = result.coBorrower.militaryService;
        if(militaryService){
          this.setCoBorrowerInfo(militaryService);
        }
      }
      if (this.showBorrower) {
        this.borrowerUuid = result.borrower.uuid;
        const militaryService = result.borrower.militaryService;
        if(militaryService) {
          this.setBorrowerInfo(militaryService);
        }
      }
      this.sectionController.showContent();
    } else {
      this.sectionController.showError();
    }
  }

  setCoBorrowerInfo = (coBorrower) => {
    this.coBorrowerServiceState = coBorrower.isServed;
    this.coBorrowerExpirationDateOfService = coBorrower.expirationDate;
    this.coBorrowerServiceDescription = this.getDescription(coBorrower);
  }

  setBorrowerInfo = (borrower) => {
    this.borrowerServiceState = borrower.isServed;
    this.borrowerExpirationDateOfService = borrower.expirationDate;
    this.borrowerServiceDescription = this.getDescription(borrower);
  }

  getDescription = (participant) => {
    let status = [];
    if (participant.isCurrentlyServing) { status.push("isCurrentlyServing") }
    if (participant.isReserve) { status.push("isReserve") }
    if (participant.isRetired) { status.push("isRetired") }
    if (participant.isSurvivingSpouse) { status.push("isSurvivingSpouse") }
    return status;
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
      getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
    }
  };

  mutationCallback(result) {
    this.submissionCallback(result);
  }

  get sectionController(){
    return this.template.querySelector('c-mortgage-los-section-controller');
  }

  prepareParticipantMilitaryServiceDescription = (descriptions, isServed) => {
    let emptyDescription = {
      isCurrentlyServing: false,
      isReserve: false,
      isRetired: false,
      isSurvivingSpouse: false
    };
    if (isServed) {
      descriptions.forEach((description) => {
        emptyDescription[description] = true;
      })
    }

    return emptyDescription;
  }

  handleSaveClick = () => {
    const sections = this.template.querySelectorAll('c-mortgage-los-military-service-edit-mode');
    let validForm = true;
    sections.forEach(section => {
      validForm = validForm && section.validate;
    });

    if (validForm) {
      this.sectionController.hideContent();
      this.isEditing = false;
      let variables = {};
      if (this.showBorrower) {
        variables["borrower"] = {
          uuid: this.borrowerUuid,
          isServed: this.borrowerServiceState,
          expirationDate: this.borrowerServiceState ? this.borrowerExpirationDateOfService : null,
          ...this.prepareParticipantMilitaryServiceDescription(this.borrowerServiceDescription, this.borrowerServiceState)
        };
      }
      if (this.showCoBorrower) {
        variables["coBorrower"] = {
          uuid: this.coBorrowerUuid,
          isServed: this.coBorrowerServiceState,
          expirationDate: this.coBorrowerServiceState ? this.coBorrowerExpirationDateOfService : null,
          ...this.prepareParticipantMilitaryServiceDescription(this.coBorrowerServiceDescription, this.coBorrowerServiceState)
        };
      }
      updateParticipant(this.opportunity, this.recordId, this.mutationCallback.bind(this), variables);
    }
  }

  render() {
    return this.isEditing ? editMode : viewMode;
  }
}

/**
 * Gets the data from database based on queries described in queries.js
 * @param {*} opportunity
 * @param {*} recordId
 * @param {*} submissionCallback
 * @returns void
 */
const getSubmission = (opportunity, recordId, submissionCallback) => {
  const submissionUuid = getFieldValue(opportunity, SUBMISSION_UUID);
  const submissionType = getFieldValue(opportunity, SUBMISSION_TYPE);
  let gqlQuery = null;

  if (submissionType === 'MortgageRefi') {
    gqlQuery = REFINANCE_SUBMISSION_QUERY;
  } else if (submissionType === 'HomePurchase') {
    gqlQuery = PURCHASE_SUBMISSION_QUERY;
  } else {
    submissionCallback({});
    console.error('Submission is not Mortgages Refinance nor Home Purchase.');
    return;
  }

  const promise = queryWithMap({ identifier: recordId, query: gqlQuery, variables: { submissionUuid } });
  promise.then(data => {
    const result = JSON.parse(data);
    submissionCallback(result)
  }).catch(error => {
    console.log(error);
    submissionCallback(null);
  })
}

/**
 * Updates the data based on mutations described in mutations.js
 * @param {*} opportunity
 * @param {*} recordId
 * @param {*} mutationCallback
 * @param {*} variables
 * @returns {void}
 */
const updateParticipant = (opportunity, recordId, mutationCallback, variables) => {
  const submissionType = getFieldValue(opportunity, SUBMISSION_TYPE);
  let gqlQuery = null;

  if (submissionType === 'MortgageRefi') {
    gqlQuery = REFINANCE_SUBMISSION_MUTATION;
  } else if (submissionType === 'HomePurchase') {
    gqlQuery = PURCHASE_SUBMISSION_MUTATION;
  } else {
    mutationCallback({});
    console.error('Submission is not Mortgages Refinance nor Home Purchase.');
    return;
  }

  const promise = mutateWithMap({ identifier: recordId, query: gqlQuery, variables: variables });
  promise.then(data => {
    const result = JSON.parse(data);
    mutationCallback(result)
  }).catch(error => {
    console.log(error);
    mutationCallback(null);
  })
}