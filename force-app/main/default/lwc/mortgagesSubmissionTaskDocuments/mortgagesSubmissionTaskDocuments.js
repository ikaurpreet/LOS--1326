import { LightningElement, api, track } from 'lwc';
import fetchDocuments from '@salesforce/apex/MortgagesSubmissionDocuments.fetchSubmissionTaskDocuments';
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
  }
];

export default class MortgagesSubmissionTaskDocuments extends LightningElement {
  @api recordId;
  @track data = [];
  @track loading = false;
  @track error;
  @track sortBy = 'name';
  @track sortDirection = 'asc';
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
}