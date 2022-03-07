import { LightningElement, wire, api, track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getRecord, getFieldValue, getRecordNotifyChange } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import fetchDocument from '@salesforce/apex/MortgagesSubmissionDocuments.fetchDocument';
import acceptDocument from '@salesforce/apex/MortgagesSubmissionDocuments.acceptDocument';
import archiveDocument from '@salesforce/apex/MortgagesSubmissionDocuments.archiveDocument';
import reRequestDocument from '@salesforce/apex/MortgagesSubmissionDocuments.reRequestDocument';
import renameDocument from '@salesforce/apex/MortgagesSubmissionDocuments.renameDocument';
import DOCUMENT_OBJECT from '@salesforce/schema/Document__c';
import DOCUMENT_NAME_FIELD from '@salesforce/schema/Document__c.Name';
import DOCUMENT_BUSINESS_NAME_FIELD from '@salesforce/schema/Document__c.Name__c';
import DOCUMENT_FILENAME_FIELD from '@salesforce/schema/Document__c.Filename__c';
import SUBMISSION_TASK_NAME_FIELD from '@salesforce/schema/Submission_Task__c.Name';
import SUBMISSION_TASK_OBJECT from '@salesforce/schema/Submission_Task__c';

export default class MortgagesActionsDocument extends LightningElement {
  @api recordId;
  @api objectApiName;

  @track document;
  @track loading;
  @track error;
  @track modal;
  @track modalHeader;
  @track modalDescription;
  @track modalSubmitLabel;
  @track modalRerequest;
  @track modalRename;
  
  @wire(getObjectInfo, { objectApiName: DOCUMENT_OBJECT })
  documentInfo;

  @wire(getObjectInfo, { objectApiName: SUBMISSION_TASK_OBJECT })
  submissionTaskInfo;

  @wire(getRecord, { recordId: '$recordId', fields: [DOCUMENT_NAME_FIELD, DOCUMENT_FILENAME_FIELD, DOCUMENT_BUSINESS_NAME_FIELD] })
  _document;

  @wire(getRecord, { recordId: '$recordId', fields: [SUBMISSION_TASK_NAME_FIELD] })
  _submissionTask;

  connectedCallback() {
    this.loadDocument();
  }

  closeError() {
    this.error = null;
  }

  loadDocument() {
    const promise = fetchDocument({ id: this.recordId })

    promise.then((data) => {
      this.document = JSON.parse(data);
    });

    promise.catch((error) => {
      this.error = error.body;
    })

    promise.finally(() => {
      this.loading = false;
    })
  }

  get canAccept() {
    return this.document && this.document.status === 'Awaiting Approval';
  }
  
  get canArchive() {
    return this.document && this.document.status !== 'Archived' && this.document.status !== 'Denied';
  }

  get canReRequest() {
    return this.document && this.document.status === 'Awaiting Approval' && this.document.origin === 'borrower';
  }

  get canRename() {
    return this.objectApiName === 'Document__c' && this.document && this.document.status !== 'Archived';
  }
  
  get objectInfo() {
    if (this.objectApiName === 'Document__c') {
      return this.documentInfo.data;
    } else {
      return this.submissionTaskInfo.data;
    }
  }

  get name() {
    if (this.objectApiName === 'Document__c') {
      const fileName = getFieldValue(this._document.data, DOCUMENT_FILENAME_FIELD);
      const businessName = getFieldValue(this._document.data, DOCUMENT_BUSINESS_NAME_FIELD);
      return businessName && businessName !== '' ? businessName : fileName;
    } else {
      return getFieldValue(this._submissionTask.data, SUBMISSION_TASK_NAME_FIELD);
    }
  }

  get iconUrl() {
    return this.objectInfo.themeInfo.iconUrl;
  }

  get iconColor() {
    return `background-color: #${this.objectInfo.themeInfo.color}`;
  }

  get objectName() {
    return this.objectInfo.label;
  }

  renameHandler() {
    this.modalRename = true;
    this.modal = 'rename';
    this.modalHeader = 'Rename document';
    this.modalSubmitLabel = 'Rename';
    this.modalDescription = '';
  }

  acceptHandler() {
    this.modal = 'accept';
    this.modalHeader = 'Accept document';
    this.modalSubmitLabel = 'Accept';
    this.modalDescription = 'Accept document';
  }

  archiveHandler() {
    this.modal = 'archive';
    this.modalHeader = 'Archive document';
    this.modalSubmitLabel = 'Archive';
    this.modalDescription = 'Archive document';
  }

  rerequestHandler() {
    this.modal = 're-request';
    this.modalHeader = 'Re-request document';
    this.modalSubmitLabel = 'Re-request';
    this.modalRerequest = true;
  }

  closeModal() {
    this.modal = false;
    this.modalHeader = null;
    this.modalDescription = null;
    this.modalSubmitLabel = null;
    this.modalRerequest = false;
    this.modalRename = false;
  }

  showNotification(message) {
    const event = new ShowToastEvent({
      title: this.objectName,
      message: message,
      variant: 'success',
    });
    this.dispatchEvent(event);
  }

  submitAccept() {
    this.loading = true;
    this.error = null;
    const promise = acceptDocument({ id: this.document.id });

    promise.then((document) => {
      this.document = JSON.parse(document);
      this.closeModal();
      getRecordNotifyChange([{recordId: this.recordId}]);
      this.showNotification('Accepted');
    });

    promise.catch((error) => {
      this.error = error.body;
      this.closeModal();
    });

    promise.finally(() => {
      this.loading = false;
    });
  }

  submitArchive() {
    this.loading = true;
    this.error = null;
    const promise = archiveDocument({ id: this.document.id });

    promise.then((document) => {
      this.document = JSON.parse(document);
      this.closeModal();
      getRecordNotifyChange([{recordId: this.recordId}]);
      this.showNotification('Archived');
    });

    promise.catch((error) => {
      this.error = error.body;
      this.closeModal();
    });

    promise.finally(() => {
      this.loading = false;
    });
  }

  submitRerequest() {
    const textarea = this.template.querySelector('lightning-textarea');
    
    if (!textarea.checkValidity()) {
      textarea.reportValidity();
      return;
    }

    this.loading = true;
    this.error = null;
    const promise = reRequestDocument({ id: this.document.id, description: textarea.value });

    promise.then((document) => {
      this.document = JSON.parse(document);
      this.closeModal();
      getRecordNotifyChange([{recordId: this.recordId}]);
      this.showNotification('Re-requested');
    });

    promise.catch((error) => {
      this.error = error.body;
      this.closeModal();
    });

    promise.finally(() => {
      this.loading = false;
    });
  }

  submitRename() {
    const input = this.template.querySelector('lightning-input');

    if (!input.checkValidity()) {
      input.reportValidity();
      return;
    }

    this.loading = true;
    this.error = null;
    const promise = renameDocument({ id: this.document.id, name: input.value });

    promise.then((document) => {
      this.document = JSON.parse(document);
      this.closeModal();
      getRecordNotifyChange([{recordId: this.recordId}]);
      this.showNotification('Rename');
    });

    promise.catch((error) => {
      this.error = error.body;
      this.closeModal();
    });

    promise.finally(() => {
      this.loading = false;
    });
  }

  submitModal() {
    switch(this.modal) {
      case 're-request':
        this.submitRerequest();
        break;
      case 'archive':
        this.submitArchive();
        break;
      case 'accept':
        this.submitAccept();
        break;
      case 'rename':
        this.submitRename();
      default:
        this.closeModal();
    }
  }
}