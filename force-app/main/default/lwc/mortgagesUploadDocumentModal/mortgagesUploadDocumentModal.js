import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getDocumentCategories from '@salesforce/apex/MortgagesDocumentUploadController.getDocumentCategories';
import createDocument from '@salesforce/apex/MortgagesDocumentUploadController.createDocument';
import TITLE from '@salesforce/schema/ContentDocument.Title';

export default class MortgagesUploadDocumentModal extends LightningElement {
  approveDocument = false;

  @api documentId;
  // Opportunity Id
  @api recordId;
  @api
  fileNumber = 1;
  @api
  filesCount = 1;

  @track categories;
  @track category;
  @track document;
  @track expirationDate;
  @track details;
  @track documentUuid;
  @track loading;

  @wire(getRecord, { recordId: '$documentId', fields: [TITLE] })
  file;
  
  connectedCallback() { 
    getDocumentCategories().then((result) => {
      this.categories = result;
    });
  }

  get documentName() {
    return [
      this.category,
      this.document,
      this.details
    ].filter((e) => e != null).join(' - ') || '';
  }

  get fileTitle() {
    return this.file.data ? getFieldValue(this.file.data, TITLE) : '';
  }

  handleOnClose() {
    this.close();
  }

  handleOnSkip() {
    this.clearModalFields();
    this.close();
  }

  handleOnUpload(event) {
    this.loading = true;
    console.log('handleOnUpload')
    const metadata = {
      document: this.document,
      details: this.details,
      full: this.documentName
    };
    const filename = this.documentName || this.fileTitle;
    createDocument({ opportunityId: this.recordId, 
                     documentId: this.documentId,
                     category: this.category, 
                     expirationDate: this.expirationDate,
                     filename: filename,
                     metadata: metadata, 
                     approve: this.approveDocument }).then((documentId) => {
      const successEvent = new CustomEvent('successfull_document_upload');
      this.dispatchEvent(successEvent);
      
      this.clearModalFields();
    }).catch((error) => {
      this.handleError(error, filename)
    }).finally(() => {
      this.loading = false;
    });
  }

  close() {
    const selectedEvent = new CustomEvent('close_upload_modal');
    this.dispatchEvent(selectedEvent);
  }

  handleCategoryChange(event) {
    this.category = event.detail.value;
  }

  handleDocumentChange(event) {
    this.document = event.detail.value;
  }

  handleDetailsChange(event) {
    this.details = event.detail.value;
  }

  handleDocumentApproveChange(event) {
    this.approveDocument = event.detail.checked;
  }

  handleExpirationDateChange(event) {
    this.expirationDate = event.detail.value;
  }

  clearModalFields() {
    this.category = undefined;
    this.document = undefined;
    this.details = undefined;
    this.approveDocument = this.toggleApproveCheckbox(false);
  }

  toggleApproveCheckbox(value) {
    this.template.querySelector('[data-id="approveCheckbox"]').checked = value;
  }

  handleError(error, filename) {
    if(!this.handleAuthError(error.body)) {
      console.log('upload error', error);
      var message = error.body.exceptionType == 'MortgagesDocumentUploadController.ExpirationDateException' ? `${error.body.exceptionType} : ${error.body.message}` : 'lease try again later or upload manually.'
      const evt = new ShowToastEvent({
        title: `There was an error uploading ${filename}.`,
        message: message,
        variant: 'error',
      });
      this.dispatchEvent(evt);
    }
  }

  @track authErrorMessage;
  @track authId;

  authClickHandler() {
      window.open('/' + this.authId + '/e', 'Enter Login Details', 'width=900,height=600');
      this.authId = null;
      this.authErrorMessage = 'Please, refresh page';
  }
  
  handleAuthError(error) {
    switch(error.exceptionType) {
        case 'MortgagesNamedCredentialsGraphQLClient.TokenExpiredException':
            this.authErrorMessage = 'Your session is expired, please walk through sign-in process';
            this.authId = error.message;
            break;
        case 'MortgagesNamedCredentialsGraphQLClient.NoTokenException':
            this.authErrorMessage = 'Your session was not found, please create it by going through the sign-in process';
            this.authId = error.message;
            break;
        case 'MortgagesNamedCredentialsGraphQLClient.NoExternalSourceException':
            this.authErrorMessage = 'Your authentication settings was not found, please create it going through the sign-in process';
            this.authId = error.message;
            break;
        case 'MortgagesNamedCredentialsGraphQLClient.NoNamedCredentialsException':
            this.authErrorMessage = error.message;
            break;
        default:
            return false;
    }
    return true;
  }
}