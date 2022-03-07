import { LightningElement, track, api } from 'lwc';
import fetchDocuments from '@salesforce/apex/MortgagesSubmissionDocuments.fetchSubmissionTasks';

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

export default class MortgagesSubmissionTasks extends LightningElement {
  @api recordId;
  @track data = [];
  @track activeSections = [];
  @track loading = false;
  @track error;
  @track sortBy = 'name';
  @track sortDirection = 'asc';
  columns = columns

  connectedCallback() {
    this.loadData(true);
  }

  @api refreshData() {
    this.loadData(false);
  }

  loadData(loading) {
    this.loading = loading;
    const promise = fetchDocuments({ opportunityId: this.recordId, onlyTasks: true });
    
    promise.then((data) => {
      this.data = this.processData(JSON.parse(data));
      this.removeForReviewTask();
      if (this.sortBy && this.sortDirection) {
        this.sortData(this.sortBy, this.sortDirection);
      }
    });

    promise.catch((error) => {
      this.error = error.body;
    });

    promise.finally(() => {
      this.loading = false;
    });
  }

  processData(data) {
    data.forEach((item) => {
      item.label = `${item.name} (${item.items.length})`
      item.items.forEach(this.processTask);
      this.activeSections.push(item.name);
    })
    
    return data;
  }

  processTask(task) {
    task.documentNeedReview = !task.reviewer;
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

  removeForReviewTask() {
    const otherDocsIndex = this.data.findIndex(item => item.name === 'Other');
    if (otherDocsIndex !== -1) {
      const fileterdItems = this.data[otherDocsIndex].items.filter(item => item.type !== 'review');
      if (fileterdItems.length > 0) {
        this.data[otherDocsIndex].items = fileterdItems;
        this.data[otherDocsIndex].label = `Other (${fileterdItems.length})`;  
      } else {
        this.data = this.data.splice(otherDocsIndex, otherDocsIndex);
      }
    }
  }
}