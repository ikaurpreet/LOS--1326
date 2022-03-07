import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import addToGDrive from '@salesforce/apex/MortgagesSubmissionDocuments.addToGDrive';
import bulkAddToGDrive from '@salesforce/apex/MortgagesSubmissionDocuments.bulkAddToGDrive';

export default class MortgagesAddGdriveDocument extends LightningElement {
  @api documentId;
  @api folder;

  @track loading;
  @track error;
  @track title;

  connectedCallback() {
    const subject = (this.documentId.length > 1) ? "these documents" : "this document";
    this.title = `Are you sure that you want to add ${subject} to "${this.folder}" folder.`
  }

  add() {
    this.error = null;
    this.loading = true;
    const promise = this._addToGDrive();
    
    promise.then(() => {
      console.info('success');
      const updateEvent = new CustomEvent('update', { detail: { uploadedIds: this.documentId, uploadedFodler: this.folder } });
      this.dispatchEvent(updateEvent);
      const toastEvent = new ShowToastEvent({
        title: `Successfully added`,
        message: `Successfully added`,
        variant: 'success',
      });
      this.dispatchEvent(toastEvent);
      this.close();
    });

    promise.catch((error) => {
      this.error = error.body;
    })

    promise.finally(() => {
      this.loading = false;
    });
  }

  close() {
    const closeEvent = new CustomEvent('close');
    this.dispatchEvent(closeEvent);
  }

  _addToGDrive() {
    if(this.documentId.length > 1) {
      return bulkAddToGDrive({ documentIds: this.documentId, folder: this.folder });
    }
    return addToGDrive({ documentId: this.documentId[0], folder: this.folder });
  } 
}