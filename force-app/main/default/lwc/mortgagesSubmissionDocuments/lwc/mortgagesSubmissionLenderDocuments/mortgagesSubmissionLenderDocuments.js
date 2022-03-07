import { LightningElement, api, track } from 'lwc';
import fetchLenderDocuments from '@salesforce/apex/MortgagesSubmissionDocuments.fetchLenderDocuments';

const columns = [
  { label: 'Document Name', fieldName: 'url', type: 'url', typeAttributes: { label: { fieldName: 'name' } } },
  { label: 'Internal Note', 
    type: 'note', 
    fieldName: 'note',
    typeAttributes: {
      documentId: { fieldName: 'documentId' }
    }
  },
  { label: 'Document Owner', fieldName: 'owner' },
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

export default class MortgagesSubmissionLenderDocuments extends LightningElement {
  @api recordId;
  @track data = [];
  @track activeSections = [];
  @track loading = false;
  @track error;
  @track modalIsShown;
  @track documentId;
  @track folder;
  columns = columns;

  @api refreshData() {
    this.loadData(false);
  }

  connectedCallback() {
    this.loadData(true);
    this.columns = [...columns, {
      type: 'gdrive',
      fieldName: 'documentId',
      typeAttributes: {
        onclick: this.openModalHandler.bind(this),
        label: { fieldName: 'actionLabel' },
        folder: { fieldName: 'folder' }
      }
    }];

    this.loadData(true);
  }

  openModalHandler(e) {
    this.modalIsShown = true;
    this.documentId = [e.target.dataset.id];
    this.folder = e.target.dataset.folder;
  }

  handleRowAction(e) {
    const id = e.target.dataset.id;
    const arr = this.template.querySelector(`c-mortgages-documents-data-table[data-id="${id}"]`).getSelectedRows();
    const btn = this.template.querySelector(`lightning-button[data-id="${id}"]`);
    btn.disabled = !arr.length;
  }

  openBatchModal(e) {
    this.modalIsShown = true;
    const id = e.target.dataset.id;
    const documents = this.template.querySelector(`c-mortgages-documents-data-table[data-id="${id}"]`).getSelectedRows();
    this.documentId = documents.map((i) => i.documentId);
    this.folder = e.target.dataset.id;
  }

  close(_e) {
    this.modalIsShown = false;
    this.documentId = null;
    this.folder = null;
  }

  updateHandler(e) {
    this.uploadedIds = e.detail.uploadedIds;
    this.uploadedFolder = e.detail.uploadedFodler;
    this.processData(this.data);
    this.data = JSON.parse(JSON.stringify(this.data));
  }

  @api loadData(loading) {
    this.loading = loading;
    this.error = null;
    const promise = fetchLenderDocuments({ opportunityId: this.recordId });
    
    promise.then((data) => {
      this.data = this.processData(JSON.parse(data));
    });

    promise.finally(() => {
      this.loading = false;
    })

    promise.catch((error) => {
      this.error = error.body;
    })
  }

  processData(data) {
    data.forEach((item) => {
      item.label = `${item.name} (${item.items.length})`
      item.items.forEach((document) => {
        this.processDocument(document, item.name);
      });
      this.activeSections.push(item.name);
    })
    
    return data;
  }
  
  processDocument(document, name) {
    document.folder = name;
    document.actionLabel =  this._isDocumentUploaded(document) ? 'In GDrive' :'Add to Gdive';
    document.documentNeedReview = !document.reviewer;
  }

  _isDocumentUploaded(document) {
    return this.uploadedIds && this.uploadedIds.includes(document.documentId) && document.folder == this.uploadedFolder
  }
}