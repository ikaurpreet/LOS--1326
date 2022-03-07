import { LightningElement, api, track } from 'lwc';
import downloadDocument from '@salesforce/apex/MortgagesSubmissionDocuments.downloadDocument';
import reviewDocument from '@salesforce/apex/MortgagesSubmissionDocuments.reviewDocument';
import generateDirectDownloadURL from '@salesforce/apex/MortgagesViewDocumentController.generateDirectDownloadURL';
import { NavigationMixin } from 'lightning/navigation';

export default class MortgagesPreviewDocument extends NavigationMixin(LightningElement) {
  
  @api documentId;
  @api fileId;
  @api review;

  @track loading;
  @track error;
  @track downloadModalOpen;

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