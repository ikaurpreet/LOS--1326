import { LightningElement, api, track } from 'lwc';
import addNote from '@salesforce/apex/MortgagesSubmissionDocuments.addNote';

export default class MortgagesNoteDocument extends LightningElement {
  @api note;
  @api documentId;
  
  @track isOpen;
  @track originNote;
  @track loading;
  @track error = false;

  connectedCallback() {
    this.init();
  }

  closeError() {
    this.error = null;
  }

  init() {
    this.loading = false;
    if (!this.note) {
      this.note = 'Add notes';
    } else {
      this.originNote = this.note;
    }
  }

  handleChange(e) {
    this.originNote = e.target.value;
  }

  submit() {
    this.loading = true;
    this.error = false;
    const promise = addNote({
      documentId: this.documentId,
      note: this.originNote
    });

    promise.then(() => {
      this.note = this.originNote
      this.init();
      this.close();
    });
    
    promise.finally(() => {
      this.loading = false;
    });

    promise.catch((error) => {
      this.error = error.body;
    });
  }

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }
}