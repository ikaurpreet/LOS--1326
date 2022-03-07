import { LightningElement, api, track, wire } from 'lwc';
import getDocuments from '@salesforce/apex/MortgagesSpruceDocumentsController.getDocuments';
import getSubTasks from '@salesforce/apex/MortgagesSpruceDocumentsController.getSubTasks';
import addDocumentNote from '@salesforce/apex/MortgagesSpruceDocumentsController.addDocumentNote';
import downloadDocument from '@salesforce/apex/MortgagesViewDocumentController.downloadDocument';
import generateDirectDownloadURL from '@salesforce/apex/MortgagesViewDocumentController.generateDirectDownloadURL';
import reviewDocument from '@salesforce/apex/MortgagesDocumentGridController.reviewDocument';
import reviewedDocuments from '@salesforce/apex/MortgagesSpruceDocumentsController.reviewedDocuments';
import moveDocuments from '@salesforce/apex/MortgagesSpruceDocumentsController.moveDocuments';
import uploadToGDrive from '@salesforce/apex/MortgagesDocumentGridController.uploadToGDrive';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue, getRecordNotifyChange } from 'lightning/uiRecordApi';
import STATUS_FIELD from '@salesforce/schema/Custom_Task__c.Status__c';
import { publish, MessageContext } from 'lightning/messageService';
// import SAMPLEMC from '@salesforce/messageChannel/SpruceMessageChannel__c';


export default class MortgagesSpruceDocumentsGrid extends NavigationMixin(LightningElement) {
  @api recordId;
  @wire(MessageContext)
    messageContext;

  gridColumns = [
    { label: 'Document Name' },
    { label: 'Date Received' },
    { label: 'Source' },
    { label: 'Doc Type' },
    { label: 'Borrower' },
    { label: 'Notes' },
    { label: 'Link to GDrive' },
  ];

  @track title;
  @track notification;
  @track newDocuments = [];
  @track documents = [];
  @track tabs = [{ id: 'all-documents', name: 'All documents', active: true }];
  @track activeTab;
  @track documentTypes;
  @track isNotesModalOpen = false;
  @track isDownloadFileModalOpen = false;
  @track activeDocumentIdNote;
  @track activeDocumentNoteText;
  @track loading = false;

  documentDownloadId = null;

  @wire(getRecord, { recordId: '$recordId', fields: [STATUS_FIELD] })
    customTask;
  connectedCallback() {
    this.loadSubTasks().then(() => { this.loadDocuments() });
    this.title = 'Spruce Documents';
  }

  get status() {
    return this.customTask.data
          ? getFieldValue(this.customTask.data, STATUS_FIELD)
          : "";
  }

  get hasNewDocuments() {
    return this.status === 'Docs Awaiting Review';
  }


  loadDocuments() {
    return getDocuments({ taskId: this.recordId }).then((response) => {
      var sourceDocuments = this.mapDocuments(JSON.parse(response));
      this.sourceDocuments = sourceDocuments;
      this.documents = sourceDocuments;
      this.collectNewDocuments();
    }).catch(error => console.log(error));
  }

  handleDocTypeChange(event) {
    event.preventDefault();
    console.log('Changing status event');
    var documentId = event.target.dataset.itemId;
    var taskId = event.detail.value;
    console.info(documentId);
    console.info(taskId);
    this.loading = true;
    var document = this.findDocument(documentId);
    moveDocuments({documentId: documentId, taskId: taskId}).then(() => {
      this.loading = false;
      document.taskId = taskId;
    });
  }

  collectNewDocuments() {
    var fileNames = [];
    this.newDocuments = [];

    this.sourceDocuments.forEach((document) => {
      document.versions.forEach((version) => {
        if (!version.reviewer) {
          this.newDocuments.push(version);
          fileNames.push(version.fileName);
        }
      })
    })

    if (this.newDocuments.length > 0) {
      this.notification = `Summary of documents to review(${fileNames.length}). ${fileNames.join(', ')}`;
      this.title = `Spruce Documents(${fileNames.length})`;
    } else {
      this.notification = false;
      this.title = 'Spruce Documents';
    }
  }

  handleReviewedDocs() {
    this.loading = true;
    const message = {
        recordId: this.recordId,
    };
    reviewedDocuments({taskId: this.recordId}).then(() => {
      getRecordNotifyChange([{recordId: this.recordId}]);
      // updateRecord({fields: { Id: this.recordId }});
      this.loadDocuments();
      this.loading = false;
      // publish(this.messageContext, SAMPLEMC, message);
    });
  }

  loadSubTasks() {
    return getSubTasks({ taskId: this.recordId }).then((response) => {
      var subTasks = JSON.parse(response);
      this.subTasks = subTasks;
      this.tabs = this.tabs.concat(subTasks);
      this.documentTypes = this.subTasks.map((item) => { return { label: item.name, value: item.id } });
    })
  }

  handleError(error, documentId = null) {
    if (error && error.body.message.includes('Exceeded max size limit')) {
      this.openDownloadFileModal(documentId);
    } else if(!this.handleAuthError(error.body)) {
        this.error = error.body.message;
        this.loading = false;
    }
  }

  @track authErrorMessage;
  @track authId;

  authClickHandler() {
      window.open('/' + this.authId + '/e', 'Enter Login Details', 'width=900,height=600');
      this.authId = null;
      this.authErrorMessage = 'Please, refresh page';
  }
  
  handleAuthError(error) {
    switch(error.exceptionType) {
        case 'MortgagesNamedCredentialsGraphQLClient.TokenExpiredException':
            this.authErrorMessage = 'Your session is expired, please walk through sign-in process';
            this.authId = error.message;
            break;
        case 'MortgagesNamedCredentialsGraphQLClient.NoTokenException':
            this.authErrorMessage = 'Your session was not found, please create it by going through the sign-in process';
            this.authId = error.message;
            break;
        case 'MortgagesNamedCredentialsGraphQLClient.NoExternalSourceException':
            this.authErrorMessage = 'Your authentication settings was not found, please create it going through the sign-in process';
            this.authId = error.message;
            break;
        case 'MortgagesNamedCredentialsGraphQLClient.NoNamedCredentialsException':
            this.authErrorMessage = error.message;
            break;
        default:
            return false;
    }
    return true;
  }

  changeTabHandle(e) {
    e.preventDefault();
    var tabid = e.target.dataset.id;
    this.tabs.forEach((tab) => {
      tab.active = tab.id === tabid;
    })
    this.filterDocuments(tabid);
  }

  handleAddNote(event) {
    event.preventDefault();
    this.openModal(event.target.dataset.itemId);
  }

  handleAddToDrive(event) {
    event.preventDefault();

    var document = this.findDocument(event.target.dataset.itemId);
    var path = '';
    console.log(document);

    this.loading = true;
    var promise = uploadToGDrive({ externalId: document.externalId, path: path, customTaskId: this.recordId });

    promise
      .then((data) => {
        console.log(data);
        document.driveUploadDate = this.formatDriveUploadDate((new Date()).toISOString());
        document.driveLink = JSON.parse(data);
        const evt = new ShowToastEvent({
          title: `Document ${document.fileName} has been uploaded`,
          message: `Please check google drive ${path}`,
          variant: 'success',
        });
        this.dispatchEvent(evt);
      })
      .catch((error) => {
        this.handleError(error, document.id);
      });

    promise.finally(() => {
      this.loading = false;
    });
  }

  filterDocuments(taskId) {
    var results = [];
    if (taskId === 'all-documents') {
      results = this.sourceDocuments;
    } else {
      if (this.sourceDocuments !== undefined) {
        this.sourceDocuments.forEach((document) => {
          if (document.versions !== undefined) {
            document.versions.forEach((version) => {
              if (results.indexOf(document) === -1 && version.taskId === taskId) {
                results.push(document);
              }
            });
          }
        });
      }
    }
    this.documents = results;
  }

  findDocument(documentId) {
    var document;
    this.sourceDocuments.forEach((item) => {
        item.versions.forEach((version) => {
            if (version.id === documentId) {
                document = version;
            }
        })
    })
    return document;
  }

  openModal(documentId) {
    this.activeDocumentIdNote = documentId;
  
    this.sourceDocuments.map((document) => {
      document.versions.find((version) => {
        if (version.id == documentId) {
          this.activeDocumentNoteText = version.notes;
        }
      });
    });

    this.isNotesModalOpen = true;
  }

  openDownloadFileModal(documentId) {
    console.log('Open download file modal');
    console.log('documentId: ' + documentId);
    this.isDownloadFileModalOpen = true;
    this.documentDownloadId = documentId;
  }

  closeModal() {
    this.activeDocumentIdNote = null;
    this.isNotesModalOpen = false;
  }

  closeDownloadFileModal() {
    this.isDownloadFileModalOpen = false;
    this.documentDownloadId = null;
  }

  downloadDocumentDirectly() {
    if (this.documentDownloadId) {
      generateDirectDownloadURL({ documentId: this.documentDownloadId })
      .then(url => window.open(url))
      .catch(error => this.handleError(error));
    }
  }

  handleCommentChanges(event) {
    this.activeDocumentNoteText = event.target.value;
  }

  submitDetails(event) { 
    // if (this.activeDocumentNoteText) {
      this.loading = true;   
      addDocumentNote({
        documentId: this.activeDocumentIdNote,
        documentNote: this.activeDocumentNoteText
      }).then((response) => {
        console.log(response);
        this.loadDocuments();
        this.loading = false;
      }).catch(error => {
        this.loading = false;
      });
    // }
    this.closeModal();
    this.activeDocumentNoteText = null;
  }

  findDocument(documentId) {
    var document;
    this.documents.forEach((item) => {
        item.versions.forEach((version) => {
            if (version.id === documentId) {
                document = version;
            }
        })
    })
    return document;
  }

  handlePreviewDocument(event)  {
      // Naviagation Service to the show preview
      var document = this.findDocument(event.target.dataset.itemId);
      if (!document.reviewer) {
          this.reviewDocument(document);
      } else {
          this.openPreview(document);
      }

  }

  reviewDocument(document) {
      this.loading = true;

      var promise = reviewDocument({ documentId: document.id }) 

      promise.then((results) => {
          results = JSON.parse(results);
          document.reviewer = results.reviewer
          document.reviewedAt = results.reviewedAt
          this.collectNewDocuments();
          this.openPreview(document);
      });

      promise.finally(() => {
          this.loading = false;
      });
  }

  openPreview(document) {
      if (document.fileId) {
          this.openFilePreview(document.fileId);
      } else {
          this.loading = true;

          downloadDocument({ documentId: document.id })
          .then((fileId) => {
            this.openFilePreview(fileId);
          }).catch((error) => {
            this.handleError(error, document.id);
          }).finally(() => {
            this.loading = false;
          });
      }
  }

  openFilePreview(fileId) {
      this[NavigationMixin.Navigate]({
          type: 'standard__namedPage',
          attributes: {
              pageName: 'filePreview'
          },
          state : {
              recordIds: fileId,
              selectedRecordId: fileId
          }
      }) 
  }

  getDocumentId(domElem) {
      const documentId = domElem.dataset.itemId;
      if (!documentId && documetId !== 0) {
          throw new Error('Document ID couldn\'t be found');
      }
      return parseInt(documentId);
  }

  mapDocuments(documents) {
    return documents.map(document => {
        document.versions = document.versions.map(version => {
          if (version.driveUploadDate) {
            version.driveUploadDate = this.formatDriveUploadDate(version.driveUploadDate);
          }
          version.formattedNotes = this.formatNotes(version);
          return version;    
        });
        return document;
    });
  }
  
  formatNotes(version) {
    if (version.notes) {
      console.info(version.notes);
      var date = new Date(version.notesDate);
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var year = date.getFullYear();
      return `${month}/${day}/${year} ${version.notes}`;
    }
    return null;
  }

  formatDriveUploadDate(driveUploadDate) {
    var date = new Date(driveUploadDate);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    return `Added on ${month}/${day}/${year}`;
  }
}