import { LightningElement, api, track } from 'lwc';
import getDocuments from '@salesforce/apex/MortgagesDocumentGridController.getDocuments';
import getFolders from '@salesforce/apex/MortgagesDocumentGridController.getFolders';
import addDocumentNote from '@salesforce/apex/MortgagesSpruceDocumentsController.addDocumentNote';
import reviewDocument from '@salesforce/apex/MortgagesDocumentGridController.reviewDocument';
import downloadDocument from '@salesforce/apex/MortgagesViewDocumentController.downloadDocument';
import generateDirectDownloadURL from '@salesforce/apex/MortgagesViewDocumentController.generateDirectDownloadURL';
import uploadToGDrive from '@salesforce/apex/MortgagesDocumentGridController.uploadToGDrive';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class MortgagesDocumentsGridComponent extends NavigationMixin(LightningElement) {
  @api recordId;
  @api title;
  @api objectApiName;
  @api fileRecord;

  error = null;
  showUpload = true;

  gridColumns = [
    { label: 'Document Name' },
    { label: 'Source' },
    { label: 'Date Received' },
    { label: 'Notes' },
    { label: 'Link to GDrive' },
  ];

  get acceptedFormats() {
    return ['.pdf', '.png', '.jpg'];
  }

  get documentId() {
    if (this.uploadedFile) {
      return this.uploadedFile.documentId;
    } else {
      return null;
    }
  }

  get uploadedFile() {
    return this.uploadedFiles[this.fileIndex];
  }

  get fileNumber() {
    return this.fileIndex + 1;
  }

  get filesCount() {
    return this.uploadedFiles.length;
  }

  @track gridData;
  @track error;
  @track loading;
  @track authError;
  @track folderOptions;
  @track folder;
  @track renderFoldersSelect;
  @track renderRequestNewDocument = false;
  @track isNotesModalOpen = false;
  @track activeDocumentIdNote;
  @track activeDocumentNoteText;
  @track
  fileIndex = 0;
  @track
  filesUploaded = 0;
  @track
  uploadedFiles = [];

  @track isDownloadFileModalOpen = false;

  documentDownloadId = null;


  changeFolder(event) {
    this.folder = event.detail.value;
    this.loadDocuments();
  }

  authClickHandler() {}

  connectedCallback() {
    var promise;
    this.loading = true;

    this.renderRequestNewDocument = this.objectApiName === 'Opportunity';

    promise = getFolders({ recordId: this.recordId, recordType: this.objectApiName });

    promise.then((folders) => {
      folders = JSON.parse(folders);
      if (!folders || folders.length === 0) {
        this.error = 'No folders were found';
        this.loading = false;
      } else {
        this.renderFoldersSelect = folders.length > 1;
        this.folder = folders[0].Id;
        this.folderOptions = [];
        folders.forEach((item) => {
          this.folderOptions.push({ label: item.Name, value: item.Id });
        });
        this.loadDocuments();
      }
    });

    promise.catch((error) => {
      this.error = error.body.message;
      this.loading = false;
    });
  }

  loadDocuments() {
    this.loading = true;
    var documentsPromise = getDocuments({ recordId: this.folder, recordType: 'Folder__c' });
    documentsPromise.then((documents) => {
      this.gridData = JSON.parse(documents);
      this.gridData.forEach((document) => {
        if(document.versions) {
          document.versions.forEach((version) => {
            if (version.driveUploadDate) {
              version.driveUploadDate = this.formatDriveUploadDate(version.driveUploadDate);
            }
            version.formattedNotes = this.formatNotes(version);
          });
        }
      });
    });
    documentsPromise.catch((error) => {
      this.error = error.body.message;
    });
    documentsPromise.finally(() => {
      this.loading = false;
    });
  }

  findDocument(documentId) {
    var document;
    this.gridData.forEach((item) => {
      item.versions.forEach((version) => {
        if (version.id === documentId) {
          document = version;
        }
      });
    });
    return document;
  }

  handleAddNote(event) {
    event.preventDefault();
    console.log(event.target.dataset.itemId);
    var documents = [];

    this.openModal(event.target.dataset.itemId);
  }

  openModal(documentId) {
    this.activeDocumentIdNote = documentId;

    this.gridData.map((document) => {
      document.versions.find((version) => {
        if (version.id == documentId) {
          this.activeDocumentNoteText = version.notes;
        }
      });
    });

    this.isNotesModalOpen = true;
  }

  closeModal() {
    this.activeDocumentIdNote = null;
    this.isNotesModalOpen = false;
  }

  handlePreviewDocument(event) {
    event.preventDefault;
    // Naviagation Service to the show preview
    var document = this.findDocument(event.target.dataset.itemId);
    console.info(document);
    if (!document.reviewer) {
      this.reviewDocument(document);
    } else {
      this.openPreview(document);
    }
  }

  handleUploadFinished(event) {
    const uploadedFiles = event.detail.files;
    this.uploadedFiles = uploadedFiles;
    this.fileIndex = 0;
    this.filesUploaded = 0;
  }

  closeUploadModal() {
    this.selectNextFileToUpload();
  }

  closeUploadModalSuccess() {
    this.loadDocuments();
    this.filesUploaded += 1;
    this.selectNextFileToUpload();
  }

  openDownloadFileModal(documentId) {
    console.log('Open download file modal');
    console.log('documentId: ' + documentId);
    this.isDownloadFileModalOpen = true;
    this.documentDownloadId = documentId;
  }

  closeDownloadFileModal() {
    this.isDownloadFileModalOpen = false;
    this.documentDownloadId = null;
  }

  downloadDocumentDirectly() {
    if (this.documentDownloadId) {
      generateDirectDownloadURL({ documentId: this.documentDownloadId })
      .then(url => {
        window.open(url);
      }).catch(error => this.handleError(error));
    }
  }

  selectNextFileToUpload() {
    this.fileIndex += 1;
    if (!this.uploadedFile && this.filesUploaded > 0) {
      const evt = new ShowToastEvent({
        title: `${this.filesUploaded} Document(s) uploaded successfully`,
        variant: 'success',
      });
      this.dispatchEvent(evt);
    }
  }

  reviewDocument(document) {
    this.loading = true;

    var promise = reviewDocument({ documentId: document.id });

    promise.then((results) => {
      results = JSON.parse(results);
      document.reviewer = results.reviewer;
      document.reviewedAt = results.reviewedAt;
      this.openPreview(document);
    });

    promise.finally(() => {
      this.loading = false;
    });
  }

  openPreview(document) {
    console.log('PREVIEW', document);
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
        pageName: 'filePreview',
      },
      state: {
        recordIds: fileId,
        selectedRecordId: fileId,
      },
    });
  }

  getDocumentId(domElem) {
    const documentId = domElem.dataset.itemId;
    if (!documentId && documetId !== 0) {
      throw new Error("Document ID couldn't be found");
    }
    return parseInt(documentId);
  }

  submitDetails(event) {
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
    this.closeModal();
    this.activeDocumentNoteText = null;
  }

  handleCommentChanges(event) {
    this.activeDocumentNoteText = event.target.value;
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

  handleError(error, documentId = null) {
    console.log('error handler!!', error)
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
}