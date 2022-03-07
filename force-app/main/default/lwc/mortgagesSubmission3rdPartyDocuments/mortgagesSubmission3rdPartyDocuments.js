import { LightningElement, api, track } from 'lwc';
import fetchDocuments from '@salesforce/apex/MortgagesSubmissionDocuments.fetchDocuments';

const columns = [
  { label: 'Document Name', sortable: 'true', fieldName: 'url', type: 'url', typeAttributes: { label: { fieldName: 'name' } } },
  { label: 'Internal Note', 
    type: 'note', 
    sortable: 'true',
    fieldName: 'note',
    typeAttributes: {
      documentId: { fieldName: 'documentId' }
    }
  },
  { label: 'Document Owner', fieldName: 'owner', sortable: 'true' },
  { type: 'preview', 
    fieldName: 'documentId', 
    fixedWidth: 32, 
    hideDefaultActions: true, 
    typeAttributes: {
      fileId: { fieldName: 'fileId' },
      review: { fieldName: 'documentNeedReview' }
    } 
  },
  { label: 'Status', fieldName: 'status', sortable: 'true' },
  { label: 'Last Updated', 
    fieldName: 'updatedAt', 
    type: 'date', 
    sortable: 'true',
    typeAttributes: {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: "false"
    } 
  },
  { label: 'Expiration Date', 
    fieldName: 'expirationDate', 
    type: 'date', 
    typeAttributes: {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    } 
  }
];

export default class MortgagesSubmission3rdPartyDocuments extends LightningElement {
  @api recordId;
  @track data = [];
  @track activeSections = [];
  @track loading = false;
  @track error;
  @track openAddLenderDocument;
  @track addLenderDocumentId;
  @track addLenderTags;
  @track documentsMap;
  @track sortBy = 'name';
  @track sortDirection = 'asc';
  columns = columns;

  @api refreshData() {
    this.loadData(false);
  }

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

  openAddLenderDocumentHandler(e) {
    this.openAddLenderDocument = true;
    this.addLenderDocumentId = [e.target.dataset.id];
    this.addLenderTags = this.documentsMap[this.addLenderDocumentId[0]].lenderTags.map((item) => item.value);
  }

  handleRowAction(e) {
    const id = e.target.dataset.id
    const arr = this.template.querySelector(`c-mortgages-documents-data-table[data-id="${id}"]`).getSelectedRows()
    const btn = this.template.querySelector(`lightning-button[data-id="${id}"]`)
    btn.disabled = !arr.length;
  }

  openBatchModal(e) {
    this.openAddLenderDocument = true;
    const id = e.target.dataset.id
    const documents = this.template.querySelector(`c-mortgages-documents-data-table[data-id="${id}"]`).getSelectedRows()
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
    const promise = fetchDocuments({ opportunityId: this.recordId, only3rdParty: true });
    
    promise.then((data) => {
      this.data = this.processData(JSON.parse(data));
      this.prexifyReviewDocuments();
      if (this.sortBy && this.sortDirection) {
        this.sortData(this.sortBy, this.sortDirection);
      }
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
      const label = document.lenderTags[0].label.match(/(\d{1,2}.\d{1,2})/)[0];
      document.folderLabel = `In Lender Folder ${label}`;
    } else {
      document.folderLabel = 'Add file to';
    }
  }

  handleSortdata(event) {
    // field name
    this.sortBy = event.detail.fieldName;

    // sort direction
    this.sortDirection = event.detail.sortDirection;

    let sortField = this.sortBy == 'url' ? 'name' : this.sortBy;
    // calling sortdata function to sort the data based on direction and selected field
    this.sortData(sortField, event.detail.sortDirection);
  }

  sortData(fieldname, direction) {
    // serialize the data before calling sort function
    let categoriesWithDocuments = JSON.parse(JSON.stringify(this.data));

    // Return the value stored in the field
    let keyValue = (a) => {
        return a[fieldname].toLowerCase();
    };

    // cheking reverse direction 
    let isReverse = direction === 'asc' ? 1: -1;
    
    
    categoriesWithDocuments.forEach((category) => {
    // sorting data 
    category.items.sort((x, y) => {
        x = keyValue(x) ? keyValue(x) : ''; // handling null values
        y = keyValue(y) ? keyValue(y) : '';

        // sorting values based on direction
        return isReverse * ((x > y) - (y > x));
      });
    });
    

    // set the sorted data to data table data
    this.data = categoriesWithDocuments;
  }

  prexifyReviewDocuments() {
    const otherDocsIndex = this.data.findIndex(item => item.name === 'Non-Borrower Docs');
    if (otherDocsIndex !== -1) {
      const fileterdItems = this.data[otherDocsIndex].items;
      if (fileterdItems.length > 0) {
        let correctedDocs = [];
        fileterdItems.forEach((document) => {
          if (document.category === 'Review') {
            document.name = 'For Review ' + document.name;
          }
          correctedDocs.push(document);
          });
        this.data[otherDocsIndex].items = correctedDocs;
        }
      }
  }
}