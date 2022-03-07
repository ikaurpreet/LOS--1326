import { getFieldValue, getRecord } from 'lightning/uiRecordApi';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import CoBorrowerSR from '@salesforce/resourceUrl/CoBorrower';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import mutateWithMap from '@salesforce/apex/GraphQLProxyController.mutateWithMap';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import { LightningElement, api, wire, track } from 'lwc';
import BorrowerMaritalChannel from '@salesforce/messageChannel/BorrowerMaritalStatus__c';
import { publish, MessageContext } from 'lightning/messageService'
import { SSNMask } from 'c/inputMaskUtils';

import { default as editMode } from './templates/edit.html';
import { default as viewMode } from './templates/view.html';

/**
 * @typedef {"borrower" | "coBorrower"} RoleOption
 */

/**
 * Borrower Personal Information section
 * @module c-mortgage-los-update-profile
 * @property {string} recordId - Opportunity Id
 * @property {RoleOption} role - Role of Participant
 * @property {boolean} showBothParticipants - Used for show both forms
 */

export default class MortgageLosUpdateProfile extends LightningElement {
  BorrowerIconURL = BorrowerSR;
  CoBorrowerIconURL = CoBorrowerSR;

  /**
   * Participant Field Info
   * @typedef {Object} ParticipantFieldInfo
   * @property {any} value - The field value
   * @property {string} label - The field title
   */

  /**
   * @typedef {Object} ParticipantInfo
   * @property {ParticipantFieldInfo} firstName - Participant First Name
   * @property {ParticipantFieldInfo} middleNameInitial - Participant Middle Name
   * @property {ParticipantFieldInfo} lastName - Participant Last Name
   * @property {ParticipantFieldInfo} suffixType - Suffix
   * @property {ParticipantFieldInfo} ssn - SSN number
   * @property {ParticipantFieldInfo} dob - Date of Birthday
   * @property {ParticipantFieldInfo} citizenship - Participant Citizenship
   * @property {ParticipantFieldInfo} maritalType - Participant Marital Status
   * @property {ParticipantFieldInfo} dependentsNumber - Participant dependets number
   * @property {ParticipantFieldInfo} dependentsAge - Dependents age
   * @property {ParticipantFieldInfo} phone - Participant Phone
   * @property {ParticipantFieldInfo} homePhone - Participant Home Phone
   * @property {ParticipantFieldInfo} workPhone - Participant Work Phone
   * @property {ParticipantFieldInfo} email - Participant Email
   */

  /**
   * Participant Info Object
   * @type {ParticipantInfo}
   */
  emptyFormValues = {
    firstName: {
      value: null,
      label: "First Name"
    },
    middleNameInitial: {
      value: null,
      label: "Middle"
    },
    lastName: {
      value: null,
      label: "Last Name"
    },
    suffixType: {
      value: null,
      label: "Suffix"
    },
    ssn: {
      value: null,
      label: "SSN"
    },
    dob: {
      value: null,
      label: "DOB"
    },
    citizenship: {
      value: null,
      label: "Citizenship"
    },
    maritalType: {
      value: null,
      label: "Marital Status"
    },
    dependentsNumber: {
      value: null,
      label: "Dependents"
    },
    dependentsAges: {
      value: null,
      label: "Ages"
    },
    dependentsSummary: {
      value: null,
      label: "Number of Dependents & Age"
    },
    homePhone: {
      value: null,
      label: "Home Phone"
    },
    phone: {
      value: null,
      label: "Cell Phone"
    },
    workPhone: {
      value: null,
      label: "Work Phone"
    },
    email: {
      value: null,
      label: "Email"
    }
  };

  @wire(MessageContext)
  messageContext;

  @track borrowerInfo = Object.assign({}, this.emptyFormValues);
  @track coBorrowerInfo = Object.assign({}, this.emptyFormValues);
  @api recordId;
  @api showBothParticipants;
  @api role;
  borrowerUuid = null;
  coBorrowerUuid = null;
  coBorrowed = false;
  /**
   * Boolean used to change view mode - See {@tutorial view-edit-modes}
   * @type {boolean}
   */
  @api isEditing = false;

  get sectionController() {
    return this.template.querySelector('c-mortgage-los-section-controller');
  }

  getDependentsSummary(participant) {
    return `${participant.dependentsNumber}${participant.dependentsAges ? (": (Ages: " + participant.dependentsAges + ")") : ''}`;
  }

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

  /**
   * Prepare participant object
   * @param {ParticipantInfo} participant 
   * @param {string} uuid 
   * @returns {Object} to be send for mutation
   */
  prepareParticipantObject = (participant, uuid) => {
    let objectResult = {};
    Object.keys(participant).forEach(property => {
      if (property === "dependentsAges") {
        objectResult[property] = participant[property].value ? participant[property].value.split(",").map(Number) : null;
      }
      else if (property === "dependentsSummary" || property === "dependentsNumber") { }//ignore
      else if (property === "phone") {
        objectResult["cellPhone"] = participant.phone.value;
      }
      else if (property === 'ssn') {
        objectResult[property] = participant.ssn.value ? participant.ssn.value.replace(/\D/g, '') : null
      }
      else {
        objectResult[property] = participant[property].value;
      }
    });
    return { ...objectResult, uuid: uuid };
  }

  validateMaritalStatus = () => {
    if (this.showBorrower && this.showCoBorrower) {
      if (this.borrowerInfo.maritalType.value === "marriedSameBorrower" || this.coBorrowerInfo.maritalType.value === 'marriedSameBorrower') {
        return this.borrowerInfo.maritalType.value === "marriedSameBorrower" && this.coBorrowerInfo.maritalType.value === 'marriedSameBorrower';
      }
      return true;
    }
    return true;
  }

  sectionsValidate = () => {
    const sections = this.template.querySelectorAll('c-mortgage-los-profile-edit-mode');
    let validForm = true;
    sections.forEach(section => {
      validForm = validForm * section.validate;
    });
    return validForm;
  }

  handleSaveClick = () => {
    if (this.sectionsValidate()) {
      this.sectionController.hideContent();
      this.isEditing = false;
      let variables = {};

      if (this.borrowerUuid) {
        variables["borrower"] = this.prepareParticipantObject(this.borrowerInfo, this.borrowerUuid);
      }

      if (this.coBorrowerUuid) {
        variables["coBorrower"] = this.prepareParticipantObject(this.coBorrowerInfo, this.coBorrowerUuid);
      }

      if ((this.borrowerInfo.maritalType.value === "marriedSameBorrower" || this.coBorrowerInfo.maritalType.value === 'marriedSameBorrower') &&
        (this.borrowerUuid && this.coBorrowerUuid)) {
        variables["borrower"]["maritalType"] = "marriedSameBorrower";
        variables["coBorrower"]["maritalType"] = "marriedSameBorrower";
      }

      updateParticipant(this.opportunity, this.recordId, this.mutationCallback.bind(this), variables);
    }
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

  get showBorrower() {
    return this.role === "borrower" || this.showBothParticipants;
  }

  get showCoBorrower() {
    return this.role === "coBorrower" || this.showBothParticipants;
  }

  /**
   * Takes the profile from BE and update participant object values
   * @param {Object} profile - participant profile object from query result
   * @param {ParticipantInfo} toUpdate - current participant object
   * @returns Current participant with updated values
   */
  setParticipantProfile = (profile, toUpdate) => {
    const dependentsNumber = profile.dependentsAges ? profile.dependentsAges.split(",").length : 0;
    const dependentsAges = profile.dependentsAges ? profile.dependentsAges.replace(' ', '') : null;
    return {
      firstName: { ...toUpdate.firstName, value: profile.firstName },
      middleNameInitial: { ...toUpdate.middleNameInitial, value: profile.middleNameInitial },
      lastName: { ...toUpdate.lastName, value: profile.lastName },
      suffixType: { ...toUpdate.suffixType, value: profile.suffixType },
      dob: { ...toUpdate.dob, value: profile.dob },
      citizenship: { ...toUpdate.citizenship, value: profile.citizenship },
      maritalType: { ...toUpdate.maritalType, value: profile.maritalType },
      dependentsNumber: { ...toUpdate.dependentsNumber, value: dependentsNumber },
      dependentsAges: { ...toUpdate.dependentsAges, value: dependentsAges },
      dependentsSummary: { ...toUpdate.dependentsSummary, value: this.getDependentsSummary({ dependentsNumber: dependentsNumber, dependentsAges: dependentsAges }) },
      homePhone: { ...toUpdate.homePhone, value: profile.homePhone },
      phone: { ...toUpdate.phone, value: profile.phone },
      workPhone: { ...toUpdate.workPhone, value: profile.workPhone },
      email: { ...toUpdate.email, value: profile.email }
    }
  }

  handleParticipantChange = (event) => {
    if (event.detail.role === "borrower") {
      this.borrowerInfo[event.detail.propertyName].value = event.detail.value;
    }
    if (event.detail.role === "coBorrower") {
      this.coBorrowerInfo[event.detail.propertyName].value = event.detail.value;
    }
    this.sectionsValidate();
  }

  submissionCallback(result) {
    if (result) {
      if (result.coBorrower) {
        const cProfile = result.coBorrower.profile;
        this.coBorrowerUuid = result.coBorrower.uuid;
        const coBorrowerProfile = this.setParticipantProfile(cProfile, this.coBorrowerInfo);
        this.coBorrowerInfo = {
          ...coBorrowerProfile,
          ssn: { ...this.coBorrowerInfo.ssn, value: SSNMask(result.coBorrower.ssn) }
        }
      }

      if (result.borrower) {
        const bProfile = result.borrower.profile;
        this.borrowerUuid = result.borrower.uuid;
        const borrowerProfile = this.setParticipantProfile(bProfile, this.borrowerInfo);
        this.borrowerInfo = {
          ...borrowerProfile,
          ssn: { ...this.borrowerInfo.ssn, value: SSNMask(result.borrower.ssn) }
        }
      }

      this.coBorrowed = result.coBorrower && result.coBorrower.uuid;
      this.sectionController.showContent();
    } else {
      this.sectionController.showError();
    }
  }

  mutationCallback = (result) => {
    if (result) {
      let payload = { maritalType: result.borrower.profile.maritalType };
      publish(this.messageContext, BorrowerMaritalChannel, payload); //To update tabs (borrower/coBorrower) position if any changes
    }
    this.submissionCallback(result);
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
 * @returns {void}
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