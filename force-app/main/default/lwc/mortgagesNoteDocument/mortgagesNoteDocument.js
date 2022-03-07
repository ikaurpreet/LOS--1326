import { LightningElement, api, track } from 'lwc';
import addNote from '@salesforce/apex/MortgagesSubmissionDocuments.addNote';

export default class MortgagesNoteDocument extends LightningElement {
  @api documentId;
  
  @track isOpen;
  @track viewNote;
  @track editNote;
  @track loading;
  @track error = false;

  privateNote;
  @api
  get note() {
      return this.privateNote;
  }

  set note(value) {
    console.info('set note ' + value);
    this.privateNote = value;
    this.init();
  }

  connectedCallback() {
    this.init();
  }

  closeError() {
    this.error = null;
  }

  init() {
    this.loading = false;
    if (!this.privateNote) {
      this.viewNote = 'Add notes';
      this.editNote = null;
    } else {
      this.viewNote = this.privateNote;
      this.editNote = this.privateNote;
    }
  }

  handleChange(e) {
    this.editNote = e.target.value;
  }

  submit() {
    this.loading = true;
    this.error = false;
    const promise = addNote({
      documentId: this.documentId,
      note: this.editNote
    });

    promise.then(() => {
      this.privateNote = this.editNote;
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