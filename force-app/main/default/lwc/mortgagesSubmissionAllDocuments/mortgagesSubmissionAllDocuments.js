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

export default class MortgagesSubmissionAllDocuments extends LightningElement {
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

  openAddLenderDocumentHandler(e) {
    this.openAddLenderDocument = true;
    this.addLenderDocumentId = [e.target.dataset.id];
    this.addLenderTags = this.documentsMap[this.addLenderDocumentId[0]].lenderTags.map((item) => item.value);
    this.x = e.target.getBoundingClientRect().x
    this.y = e.target.getBoundingClientRect().y
  }

  updateAddLenderDocumentHandler(e) {
    this.documentsMap[this.addLenderDocumentId[0]].lenderTags = e.detail;
    this.buildFolderLabel(this.documentsMap[this.addLenderDocumentId[0]]);
    this.data = this.processData(JSON.parse(JSON.stringify(this.data)));
    const updateEvent = new CustomEvent('updatelendertags');
    this.dispatchEvent(updateEvent);
  }

  closeAddLenderDocumentHandler(e) {
    this.openAddLenderDocument = false;
    this.addLenderDocumentId = null;
    this.addLenderTags = null;
  }

  @api refreshData() {
    this.loadData(false);
  }

  @api loadData(loading) {
    this.loading = loading;
    this.error = null;
    this.documentsMap = {};
    const promise = fetchDocuments({ opportunityId: this.recordId });
    
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