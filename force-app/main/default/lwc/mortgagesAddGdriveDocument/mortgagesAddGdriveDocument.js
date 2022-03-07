import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addToGDrive from '@salesforce/apex/MortgagesSubmissionDocuments.addToGDrive';

export default class MortgagesAddGdriveDocument extends LightningElement {
  @api documentIds;
  @api folder;

  @track loading;
  @track error;
  @track title;
  @track progress;

  connectedCallback() {
    const subject = (this.documentIds.length > 1) ? "these documents" : "this document";
    this.title = `Are you sure that you want to add ${subject} to "${this.folder}" folder.`
  }

  async add() {
    this.error = null;
    this.progress = 0;
    this.loading = true;
    const progressTickValue = 100 / this.documentIds.length;
    const uploadedIds = [];
    const failedIds = [];
    let options = {};

    for (let index in this.documentIds) { 
      const documentId = this.documentIds[index];
      try {
        await addToGDrive({ documentId: documentId, folder: this.folder });
        uploadedIds.push(documentId);
      } catch(_e) {
        failedIds.push(documentId);
      } finally {
        this.progress += progressTickValue;
      }
    }

    const updateEvent = new CustomEvent('update', { detail: { uploadedIds: uploadedIds, failedIds: failedIds, uploadedFodler: this.folder } });
    this.dispatchEvent(updateEvent);

    this.loading = false;

    if (!failedIds.length) {
      options = {
        title: `Successfully added`,
        message: `Successfully added`,
        variant: 'success',
      };
    } else {
      options = {
        title: `Error`,
        message: `Error happened with some files`,
        variant: 'error',
      };
    }

    this.dispatchEvent(new ShowToastEvent(options));
    this.close();
  }

  close() {
    const closeEvent = new CustomEvent('close');
    this.dispatchEvent(closeEvent);
  }
}