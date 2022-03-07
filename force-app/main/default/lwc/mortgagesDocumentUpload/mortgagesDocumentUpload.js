import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MortgagesUploadDocument extends NavigationMixin(LightningElement) {
  @api fileRecord;
  @api recordId;

  @track showUpload;
  @track showModal;
  @track fileIndex = 0;
  @track filesUploaded = 0;
  @track uploadedFiles = [];

  connectedCallback() {
    this.showUpload = true;
  }

  openUpload(e) {
    this.template.querySelector('.multiple-file-upload').template('.slds-file-selector__input').click()
  }

  get acceptedFormats() {
    return ['.pdf', '.png', '.jpg'];
  }

  handleUploadFinished(event) {
    this.uploadedFiles = event.detail.files;
    this.fileIndex = 0;
    this.filesUploaded = 0;
  }

  closeUploadModal() {
    this.selectNextFileToUpload();
  }

  closeUploadModalSuccess() {
    this.loadDocuments();
    this.filesUploaded += 1;
    this.selectNextFileToUpload();
  }

  selectNextFileToUpload() {
    this.fileIndex += 1;
    if (!this.uploadedFile && this.filesUploaded > 0) {
      const evt = new ShowToastEvent({
        title: `${this.filesUploaded} Document(s) uploaded successfully`,
        variant: 'success',
      });
      this.dispatchEvent(evt);
    }
  }

  get uploadedFile() {
    return this.uploadedFiles[this.fileIndex];
  }

  get fileNumber() {
    return this.fileIndex + 1;
  }

  get filesCount() {
    return this.uploadedFiles.length;
  }

  get documentId() {
    if (this.uploadedFile) {
      return this.uploadedFile.documentId;
    } else {
      return null;
    }
  }

  loadDocuments() {
    this.dispatchEvent(new CustomEvent('uploadcompleted'));
  }
}