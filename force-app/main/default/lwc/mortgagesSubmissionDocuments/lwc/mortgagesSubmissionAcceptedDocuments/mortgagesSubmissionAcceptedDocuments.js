import { LightningElement, api, track } from 'lwc';
import fetchDocuments from '@salesforce/apex/MortgagesSubmissionDocuments.fetchDocuments';

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

export default class MortgagesSubmissionAcceptedDocuments extends LightningElement {
  @api recordId;
  @track data = [];
  @track activeSections = [];
  @track loading = false;
  @track error;
  @track openAddLenderDocument;
  @track addLenderDocumentId;
  @track addLenderTags;
  @track documentsMap;
  columns = columns

  connectedCallback() {
    this.columns = [...columns, {
      type: 'folder',
      fieldName: 'documentId',
      typeAttributes: {
        onclick: this.openAddLenderDocumentHandler.bind(this),
        label: { fieldName: 'folderLabel' }
      }
    }];
    this.loadData(true);
  }

  @api refreshData() {
    this.loadData(false);
  }

  openAddLenderDocumentHandler(e) {
    this.openAddLenderDocument = true;
    this.addLenderDocumentId = [e.target.dataset.id];
    this.addLenderTags = this.documentsMap[this.addLenderDocumentId[0]].lenderTags.map((item) => item.value);
  }

  handleRowAction(e) {
    const id = e.target.dataset.id
    const arr = this.template.querySelector(`c-mortgages-documents-data-table[data-id="${id}"]`).getSelectedRows();
    const btn = this.template.querySelector(`lightning-button[data-id="${id}"]`);
    btn.disabled = !arr.length;
  }

  openBatchModal(e) {
    this.openAddLenderDocument = true;
    const id = e.target.dataset.id
    const documents =  this.template.querySelector(`c-mortgages-documents-data-table[data-id="${id}"]`).getSelectedRows();
    this.addLenderDocumentId = documents.map(d => d.documentId);
    this.addLenderTags = this.documentsMap[this.addLenderDocumentId[0]].lenderTags.map((item) => item.value);
  }

  updateAddLenderDocumentHandler(e) {
    this.addLenderDocumentId.map((id) => {
      this.documentsMap[id].lenderTags = e.detail;
      this.buildFolderLabel(this.documentsMap[id]);
    })
    
    this.data = this.processData(JSON.parse(JSON.stringify(this.data)));
    const updateEvent = new CustomEvent('updatelendertags');
    this.dispatchEvent(updateEvent);
  }

  closeAddLenderDocumentHandler(_e) {
    this.openAddLenderDocument = false;
    this.addLenderDocumentId = null;
    this.addLenderTags = null;
  }

  loadData(loading) {
    this.loading = loading;
    this.error = null;
    this.documentsMap = {};
    const promise = fetchDocuments({ opportunityId: this.recordId, onlyAccepted: true });
    
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
      item.items.forEach(this.processDocument.bind(this));
      this.activeSections.push(item.name);
    })
    
    return data;
  }
  processDocument(document) {
    this.documentsMap[document.documentId] = document;
    document.documentNeedReview = !document.reviewer;
    this.buildFolderLabel(document)
  }

  buildFolderLabel(document) {
    if (document.lenderTags && document.lenderTags.length !== 0) {
      const label = document.lenderTags[0].label.match(/(\d.\d)/)[0];
      document.folderLabel = `In Lender Folder ${label}`;
    } else {
      document.folderLabel = 'Add file to';
    }
  }
}