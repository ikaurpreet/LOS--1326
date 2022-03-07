import { LightningElement, api } from 'lwc';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';

export default class MortgagesSubmissionDocuments extends LightningElement {
  channelName = '/event/Opportunity_Change__e';
  @api recordId;
  @api objectApiName;

  connectedCallback() {
    // Invoke subscribe method of empApi. Pass reference to messageCallback
    const messageCallback = (response) => {
        console.log('New message received: ', JSON.stringify(response));
        const payload = response.data.payload;
        if (payload.Opportunity_Id__c === this.recordId && payload.Type__c === 'documents') {
          this.refreshTabs();
        }
    };
    subscribe(this.channelName, -1, messageCallback);
  }

  refreshTabs() {
    const tabs = ['c-mortgages-submission-all-documents', 
                  'c-mortgages-submission-accepted-documents', 
                  'c-mortgages-submission-archived-documents', 
                  'c-mortgages-submission-3rd-party-documents',
                  'c-mortgages-submission-lender-documents',
                  'c-mortgages-submission-tasks'];     
    tabs.forEach((tab) => {
      const component = this.template.querySelector(tab);
      if(component) {
        component.refreshData();
      }
    });
  }

  uploadCompletedHandler() {
    const component = this.template.querySelector('c-mortgages-submission-all-documents');
    if(component) {
      component.loadData();
    }
  }

  updateLenderTagsHandler() {
    const component = this.template.querySelector('c-mortgages-submission-lender-documents');
    if(component) {
      component.loadData();
    }
  }
}