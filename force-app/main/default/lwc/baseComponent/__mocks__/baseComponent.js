import { LightningElement, wire, api, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';

import { getFieldValue } from 'lightning/uiRecordApi';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import submissionUpdateChannel from '@salesforce/messageChannel/SubmissionUpdateChannel__c';
import { loadScript } from 'lightning/platformResourceLoader';
import uuid from '@salesforce/resourceUrl/uuidv4';
import { publish, subscribe, MessageContext } from 'lightning/messageService';

/**
 * Base Component
 * @see {@link https://medium.com/@yuribett/javascript-abstract-method-with-es6-5dbea4b00027|Implementation based on - Javascript Abstract Method with ES6}
 * @module BaseComponent
 * @property {string} recordId - Opportunity Id
*/
export default class BaseComponent extends LightningElement {
  @api recordId;
  @track submissionType;

  // jest mocks
  @api updateParticipant;
  @api loadSubmissionStartStub;
  @api loadSubmissionSuccessStub;
  @api loadSubmissionErrorStub;

  /**
   * Implementation required
   */
  loadSubmissionData() {
    throw new Error('You have to implement the method loadSubmissionData.');
  }

  /**
   * Query selector to get Section Controller component
   * @see {@link external:MortgageLosSectionController|MortgageLosSectionController}
   */
  get sectionController() {
    return this.template.querySelector('c-mortgage-los-section-controller');
  }

  @wire(MessageContext)
  messageContext;

  @wire(getRecord, {
    recordId: '$recordId', fields: [
      SUBMISSION_UUID,
      SUBMISSION_TYPE,
    ]
  })
  initialize({ data }) {
    loadScript(this, uuid).then(() => {
      // Generate a Uuid for this component.  This is used when sending on the Submission Update message channel.
      this.componentId = uuidv4();
    });
    this.opportunity = data;
    this.submissionUuid = getFieldValue(this.opportunity, SUBMISSION_UUID);
    this.submissionType = getFieldValue(this.opportunity, SUBMISSION_TYPE);
    if (data) {
      this.loadSubmissionData();
    }
  };

  get isRefiSubmission() {
    return this.submissionType === "MortgageRefi";
  }

  get isPurchaseSubmission() {
    return this.submissionType === "HomePurchase";
  }

  /**
   * Queries
   * @typedef {Object} Queries
   * @property {string} REFINANCE_SUBMISSION_QUERY - Query for refinance submission
   * @property {string} PURCHASE_SUBMISSION_QUERY - Query for purchase submission
   */

  /**
   * getSubmission
   * @param {function} submissionCallback - callback function
   * @param {Queries} queries - query body
   */
  getSubmission(submissionCallback, queries) {
    if (this.loadSubmissionStartStub) this.loadSubmissionStartStub();
    let gqlQuery = null;

    if (!queries || (!queries.REFINANCE_SUBMISSION_QUERY && !queries.PURCHASE_SUBMISSION_QUERY)) {
      console.error('No query provided');
      return;
    }
    if (this.submissionType === 'MortgageRefi') {
      gqlQuery = queries.REFINANCE_SUBMISSION_QUERY;
    } else if (this.submissionType === 'HomePurchase') {
      gqlQuery = queries.PURCHASE_SUBMISSION_QUERY;
    } else {
      submissionCallback({});
      console.error('Submission is not Mortgages Refinance nor Home Purchase.');
      return;
    }

    const promise = queryWithMap({ identifier: this.recordId, query: gqlQuery, variables: { submissionUuid: this.submissionUuid } });
    promise.then(data => {
      const result = JSON.parse(data);
    if (this.loadSubmissionSuccessStub) this.loadSubmissionSuccessStub(result);
    submissionCallback(result)
    }).catch(error => {
      console.log(error);
      if (this.loadSubmissionErrorStub) this.loadSubmissionErrorStub(error);
      submissionCallback(null);
    })
  }

  /**
   * Mutations
   * @typedef {Object} Mutations
   * @property {string} REFINANCE_SUBMISSION_MUTATION - Mutation for refinance submission
   * @property {string} PURCHASE_SUBMISSION_MUTATION - Mutation for purchase submission
   */

  /**
   * Call to register which section ids to watch for.  Also, to set message callback.
   * @param {array} sectionIds - array of SectionIds you are interested in receiving messages for
   * @param {function} handleMessageCallback - function to call when a new message you are interested in is received. will pass message as parameter if interested in seeing message data
   * @param {boolean} notifyOfOwnPosts - set to true if you want to receive message that you post
   */
  registerSubscription = (sectionIds, handleMessageCallback, notifyOfOwnPosts = false) => {
    this.sectionIds = sectionIds;
    this.handleMessageCallback = handleMessageCallback;
    this.notifyOfOwnPosts = notifyOfOwnPosts;
    this.subscribeToSubmissionChannel();
  }

  /**
   * subscribes to submissionUpdateChannel 
   */
  subscribeToSubmissionChannel() {
    if (this.submissionSubscription) return;

    this.submissionSubscription = subscribe(this.messageContext, submissionUpdateChannel, (message) => this.handleNewMessage(message));
  }

  /**
   * Calls handleMessageCallback method when a message arrives that you are interested in.  May be overriden 
   * if you want some other functionality when a message is received.
   * @param {object} message - message from channel
   */
  handleNewMessage(message) {
    if (message.oppId === this.opportunity.id
      && (this.notifyOfOwnPosts || message.componentId !== this.componentId)
      && this.sectionIds.includes(message.sectionId)
    ) {
      this.handleMessageCallback(message);
    }
  }

  /**
   * Call to publich a message to submissionUpdateChannel
   * @param {SectionId} sectionId - section id to add to message
   * @param {object} result - mutation result data to add to message
   */
  publishMessage(sectionId, result = null) {
    publish(this.messageContext, submissionUpdateChannel, {
      oppId: this.opportunity.id,
      componentId: this.componentId,
      result,
      sectionId
    });
  }
}