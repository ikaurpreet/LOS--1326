import { LightningElement, track, api } from 'lwc';
import fetchDocuments from '@salesforce/apex/MortgagesSubmissionDocuments.fetchSubmissionTasks';

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
  },
];

export default class MortgagesSubmissionTasks extends LightningElement {
  @api recordId;
  @track data = [];
  @track activeSections = [];
  @track loading = false;
  @track error;
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
}