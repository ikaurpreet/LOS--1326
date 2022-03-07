import { LightningElement, api, track } from 'lwc';
import downloadDocument from '@salesforce/apex/MortgagesSubmissionDocuments.downloadDocument';
import reviewDocument from '@salesforce/apex/MortgagesSubmissionDocuments.reviewDocument';
import generateDirectDownloadURL from '@salesforce/apex/MortgagesViewDocumentController.generateDirectDownloadURL';
import generateViewerUrl from '@salesforce/apex/MortgagesSubmissionDocuments.generateViewerUrl';
import generatePDFDocument from '@salesforce/apex/MortgagesSubmissionDocuments.generatePDFDocument';
import { NavigationMixin } from 'lightning/navigation';
import button from './button.html';
import preview from './preview.html';

export default class MortgagesPreviewDocument extends NavigationMixin(LightningElement) {
  @api recordId;
  @api documentId;
  @api fileId;
  @api review;
  @api variant;

  @track loading;
  @track error;
  @track url;
  @track downloadModalOpen;
  @track previewNotGenerated;

  connectedCallback() {
    if (this.variant === 'preview') {
      this.initPreview();
    } else {
      this.initButton();
    }
  }

  initButton() {
    if (!this.documentId) {
      this.documentId = this.recordId;
    }
  }

  onload() {
    this.loading = false;
  }

  generatePdfClick() {
    this.loading = true;
    this.error = null;
    this.previewNotGenerated = null;
    const promise = generatePDFDocument({ documentId: this.recordId });

    promise.then(() => {
      this.initPreview();
    });

    promise.catch((error) => {
      this.error = error.body;
      this.loading = false;
    });
  }

  initPreview() {
    this.loading = true;
    this.error = null;
    const promise = generateViewerUrl({ documentId: this.recordId })
    
    promise.then((url) => {
      this.url = url;
    });

    promise.catch((error) => {
      if (error.body.message === 'PDF document not generated') {
        this.previewNotGenerated = true;
        this.loading = false;
      } else if(error.body.message === 'PDF document generation is in progress') {
        setTimeout(this.initPreview.bind(this), 1000);
      } else {
        this.error = error.body;
        this.loading = false;
      } 
    });
  }

  render() {
    if (this.variant === 'preview') {
      return preview;
    } else {
      return button;
    }
  }

  openPreviewHandler(event) {
    event.preventDefault();
    if (this.fileId) {
      this.openPreview();
    } else {
      this.downloadDocument();
    } 
  }

  downloadDocument() {
    this.loading = true;
    this.error = false;
    
    const promise = downloadDocument({ documentId: this.documentId });
    promise.then((fileId) => {
      this.fileId = fileId;
      this.loading = false;
      this.openPreview();
    })

    promise.catch(this.errorHandler.bind(this));

    promise.finally(() => {
      this.loading = false;
    });
  }

  reviewDocument() {
    this.loading = true;
    this.error = false;
    var promise = reviewDocument({ documentId: this.documentId });

    promise.then((_results) => {
      this.review = false;
    });

    promise.catch((error) => {
      this.error = error.body;
      this.loading = false;
    });
  }

  openPreview() {
    this.loading = true;
    this[NavigationMixin.Navigate]({
      type: 'standard__namedPage',
      attributes: {
        pageName: 'filePreview',
      },
      state: {
        recordIds: this.fileId,
        selectedRecordId: this.fileId,
      },
    });
    setTimeout(() => {
      this.loading = false;
    }, 1000);
    
    if(this.review) { this.reviewDocument(); }
  }

  errorHandler(error) {
    if (error.body.message.includes('Exceeded max size limit')) {
      this.downloadModalOpen = true;
    } else {
      this.error = error.body;
    }    
  }

  closeDownload() {
    this.downloadModalOpen = false;
  }

  download() {
    this.loading = true;
    var promise = generateDirectDownloadURL({ documentId: this.documentId });

    promise.then((url) => {
      window.open(url);
      this.downloadModalOpen = false;
      this.loading = false;
    });

    promise.catch((error) => {
      this.downloadModalOpen = false;
      this.loading = false;
      this.errorHandler(error);
    });
  }

  closeError() {
    this.error = null;
  }
}