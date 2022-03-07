import { LightningElement, api, track } from 'lwc';
import fetchLenderDocuments from '@salesforce/apex/MortgagesSubmissionDocuments.fetchLenderDocuments';

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

export default class MortgagesSubmissionLenderDocuments extends LightningElement {
  @api recordId;
  @track data = [];
  @track activeSections = [];
  @track loading = false;
  @track error;
  @track modalIsShown;
  @track documentIds;
  @track folder;
  columns = columns;

  @api refreshData() {
    this.loadData(false);
  }
  @track sortBy = 'name';
  @track sortDirection = 'asc';

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
    this.documentIds = [e.target.dataset.id];
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
    this.documentIds = documents.map((i) => i.documentId);
    this.folder = e.target.dataset.id;
  }

  close(_e) {
    this.modalIsShown = false;
    this.documentIds = null;
    this.folder = null;
  }

  updateHandler(e) {
    this.uploadedIds = e.detail.uploadedIds;
    this.failedIds = e.detail.failedIds;
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
      item.items.forEach((document) => {
        this.processDocument(document, item.name);
      });
      this.activeSections.push(item.name);
    })
    
    return data;
  }
  
  processDocument(document, name) {
    document.folder = name;
    document.actionLabel = this._getActionLabel(document);
    document.documentNeedReview = !document.reviewer;
  }

  _getActionLabel(document) {
    if(this._isDocumentUploaded(document)) {
      return 'In GDrive'
    }

    if(this._isDocumentFailed(document)) {
      return '[Error] click to retry'
    }

    return 'Add to GDrive'
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

  _isDocumentUploaded(document) {
    const isUploadedInCurrentSession = this.uploadedIds && this.uploadedIds.includes(document.documentId) && document.folder == this.uploadedFolder;
    if (isUploadedInCurrentSession) {
      return true;
    }

    const gdriveMetadata = document.gdriveMetadata && JSON.parse(document.gdriveMetadata);
    if(!gdriveMetadata) {
      return false;
    }

    const listOfUploadedFiles = gdriveMetadata.map(file => file.path);
    return listOfUploadedFiles.find(path => path.indexOf(document.folder) !== -1);
  }

  _isDocumentFailed(document) {
    return this.failedIds && this.failedIds.includes(document.documentId) && document.folder == this.uploadedFolder
  }
}