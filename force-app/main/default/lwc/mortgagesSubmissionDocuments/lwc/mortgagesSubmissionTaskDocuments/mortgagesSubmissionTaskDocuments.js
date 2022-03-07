import { LightningElement, api, track } from 'lwc';
import fetchDocuments from '@salesforce/apex/MortgagesSubmissionDocuments.fetchSubmissionTaskDocuments';
const columns = [
  { label: 'Document Name', fieldName: 'url', type: 'url', typeAttributes: { label: { fieldName: 'name' } } },
  { label: 'Internal Note', 
    type: 'note', 
    fieldName: 'note',
    typeAttributes: {
      documentId: { fieldName: 'documentId' }
    }
  },
  { type: 'preview', 
    fieldName: 'documentId', 
    fixedWidth: 32, 
    hideDefaultActions: true, 
    typeAttributes: {
      fileId: { fieldName: 'fileId' },
      review: { fieldName: 'documentNeedReview' }
    } 
  },
  { label: 'Status', fieldName: 'status' },
  { label: 'Last Updated', 
    fieldName: 'updatedAt', 
    type: 'date', 
    typeAttributes: {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: "false"
    } 
  }
];

export default class MortgagesSubmissionTaskDocuments extends LightningElement {
  @api recordId;
  @track data = [];
  @track loading = false;
  @track error;
  columns = columns;

  connectedCallback() {
    this.loadData();
  }

  @api loadData() {
    this.loading = true;
    this.error = null;
    this.documentsMap = {};
    const promise = fetchDocuments({ id: this.recordId });
    
    promise.then((data) => {
      this.data = JSON.parse(data);
    });

    promise.finally(() => {
      this.loading = false;
    })

    promise.catch((error) => {
      this.error = error.body;
    })
  }

  closeError() {
    this.error = null;
  }

  processData(data) {
    data.forEach((item) => {
      item.label = `${item.name} (${item.items.length})`
      item.items.forEach(this.processDocument.bind(this));
    })
    
    return data;
  }
  processDocument(document) {
    this.documentsMap[document.documentId] = document;
    document.documentNeedReview = !document.reviewer;
  }
}