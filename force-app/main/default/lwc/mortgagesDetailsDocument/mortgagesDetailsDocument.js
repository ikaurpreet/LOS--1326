import { LightningElement, api, track, wire } from 'lwc';
import fetchDocument from '@salesforce/apex/MortgagesSubmissionDocuments.fetchDocument';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe as subscribePE, unsubscribe as unsubscribePE, onError } from 'lightning/empApi';

import { subscribe as subscribeLMS, unsubscribe as unsubscribeLMS, APPLICATION_SCOPE, MessageContext } from 'lightning/messageService';
import OpportunityChangeChannel from '@salesforce/messageChannel/OpportunityChangeChannel__c';

export default class MortgagesDetailsDocument extends NavigationMixin(LightningElement) {
  subscriptionLMS = null;
  subscriptionPE = null;
  channelName = '/event/Opportunity_Change__e';
  @wire(MessageContext) messageContext;
  @api recordId;
  
  @track loading;
  @track document;
  @track openAddLenderDocument;
  @track openAddExpirationDateDocument;

  connectedCallback() {
    // Invoke subscribe method of empApi. Pass reference to messageCallback
    this.subscribeLMS();
    this.subscribePE();
    this.loadDocument();
  }

  subscribePE() {
    const messageCallback = (response) => {
      console.log('New message received: ', JSON.stringify(response));
      const payload = response.data.payload;
      if (payload.Opportunity_Id__c === this.document.opportunity.Id && payload.Type__c === 'documents') {
        this.loadDocument();
      }
    };
    this.subscriptionPE = subscribePE(this.channelName, -1, messageCallback);
    onError(error => {
      console.log('Received error from server: ', JSON.stringify(error));
      // Error contains the server-side error
    });
  }

  unsubscribePE() {
    // Invoke unsubscribe method of empApi
    if (this.subscriptionPE) {
      unsubscribePE(this.subscriptionPE, response => {
        console.log('unsubscribe() response: ', JSON.stringify(response));
        // Response is true for successful unsubscribe
      });
    }
    this.subscriptionPE = null;    
  }

  disconnectedCallback() {
    this.unsubscribeLMS();
    this.unsubscribePE();
  }

  subscribeLMS() {
    const messageCallback = (message) => {
      console.log('New message received: ', JSON.stringify(message));
      if (message.OpportunityId === this.document.opportunity.Id) {
        this.loadDocument();
      }
    };
    this.subscriptionLMS = subscribeLMS(
      this.messageContext,
      OpportunityChangeChannel,
      messageCallback,
      { scope: APPLICATION_SCOPE }
    );
  }

  unsubscribeLMS() {
    if (this.subscriptionLMS) {
      unsubscribeLMS(this.subscriptionLMS);
    }
    this.subscriptionLMS = null;
  }

  openAddLenderDocumentHandler() {
    this.openAddLenderDocument = true;
    this.addLenderDocumentId = [this.document.id];
    this.addLenderTags = this.document.lenderTags.map((item) => item.value);
  }

  openAddExpirationDateDocumentHandler(e) {
    this.openAddExpirationDateDocument = true;
  }

  closeAddExpirationDateDocumentHandler(e) {
    this.openAddExpirationDateDocument = false;
  }

  closeAddLenderDocumentHandler() {
    this.openAddLenderDocument = false;
  }

  buildFolderLabel(document) {
    if (document.lenderTags && document.lenderTags.length !== 0) {
      const labels = document.lenderTags.map((item) => item.label);
      document.folderLabel = labels.join(', ');
    } else {
      document.folderLabel = '';
    }
  }

  loadDocument() {
    const promise = fetchDocument({ id: this.recordId })

    promise.then((data) => {
      this.document = JSON.parse(data);
      this.buildFolderLabel(this.document);
    });

    promise.catch((error) => {
      this.error = error.body;
    })

    promise.finally(() => {
      this.loading = false;
    })
  }

  openOpportunityHandler() {
    // Navigate to Account record page
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
          "recordId": this.document.opportunity.Id,
          "objectApiName": "Opportunity",
          "actionName": "view"
      },
  });
  }

  openUserHandler() {
    // Navigate to Account record page
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            "recordId": this.document.lastModifiedBy.Id,
            "objectApiName": "User",
            "actionName": "view"
        },
    });
  }
}