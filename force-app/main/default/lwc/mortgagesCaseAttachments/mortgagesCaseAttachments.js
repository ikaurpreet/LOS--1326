import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import OPPORTUNITY_ID from '@salesforce/schema/Case.Opportunity__c'
import getCaseAttachments from '@salesforce/apex/MortgagesCaseAttachmentsController.getCaseAttachments';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MortgagesCaseAttachments extends NavigationMixin(LightningElement) {
  // caseId
  @api recordId;

  @track
  attachments = []
  @track
  attachmentsToDownload = [];
  @track
  attachmentIndex = 0;
  @track
  attachmentsDownloaded = 0;
  @track
  showAll = false;

  attachmentsToShowCount = 3;

  @wire(getRecord, { recordId: '$recordId', fields: [OPPORTUNITY_ID] })
  opportunity;

  get opportunityId() {
    return this.opportunity.data ? getFieldValue(this.opportunity.data, OPPORTUNITY_ID) : '';
  }

  get attachmentsPresent() {
    return this.attachments.length > 0;
  }

  get attachmentsLink() {
    return `/lightning/r/${this.recordId}/related/CombinedAttachments/view`
  }

  get attachmentId() {
    if (this.attachmentToDownload) {
      return this.attachmentToDownload.id;
    } else {
      return null;
    }
  }

  get attachmentToDownload() {
    return this.attachmentsToDownload[this.attachmentIndex];
  }

  get attachmentNumber() {
    return this.attachmentIndex + 1;
  }

  get attachmentsToShow() {
    if (this.showToggle && !this.showAll) {
      return this.attachments.slice(0, this.attachmentsToShowCount);
    } else {
      return this.attachments;
    }
  }

  get showToggle() {
    return this.attachments.length > this.attachmentsToShowCount;
  }

  connectedCallback() {
    const promise = getCaseAttachments({ caseId: this.recordId })

    promise.then(attachments => {
      this.attachments = JSON.parse(attachments).map(attachment => {
        return {
          id: attachment.Id,
          name: this.formatFileName(attachment.Title),
          extension: attachment.FileExtension,
          size: this.formatSize(attachment.ContentSize),
          date: this.formatDate(attachment.CreatedDate),
          thumbnailSrc: this.getThumbnailSrc(attachment.LatestPublishedVersionId)
        };
      });
    })

    promise.catch(error => {
      console.log('fetching attachments error:', error);
    })
  }

  formatFileName(name) {
    if (name.length > 40) {
      return this.truncStringPortion(name, 35, 0, 3);
    } else {
      return name;
    }
  }

  formatSize(sizeInBytes) {
    if (sizeInBytes < 1024 * 1024) {
      return `${Math.round(sizeInBytes / 1024)}KB`
    } else {
      return `${Math.round(sizeInBytes / (1024 * 1024), -2)}MB`
    }
  }

  formatDate(dateString) {
    const date = new Date(Date.parse(dateString));
    const month = date.toDateString().slice(4, 7);
    return `${month} ${date.getDate()}, ${date.getFullYear()}`
  }

  getThumbnailSrc(versionId) {
    return `/sfc/servlet.shepherd/version/renditionDownload?rendition=thumb120by90&versionId=${versionId}`
  }

  handleFilePreview(event) {
    this.openFilePreview(event.target.dataset.itemId);
  }

  handleDownload(event) {
    const attachmentId = event.target.dataset.itemId;
    this.attachmentsToDownload = this.attachments.filter(att => att.id == attachmentId);
    this.attachmentIndex = 0;
    this.attachmentsDownloaded = 0;
  }

  handleDownloadAll() {
    this.attachmentsToDownload = this.attachments;
    this.attachmentIndex = 0;
    this.attachmentsDownloaded = 0;
  }

  closeUploadModal() {
    this.selectNextFileToUpload();
  }

  closeUploadModalSuccess(_event) {
    this.attachmentsDownloaded += 1;
    this.selectNextFileToUpload();
  }

  selectNextFileToUpload() {
    this.attachmentIndex += 1;
    if (!this.attachmentToDownload && this.attachmentsDownloaded > 0) {
      const evt = new ShowToastEvent({
        title: `${this.attachmentsDownloaded} Document(s) uploaded successfully`,
        variant: 'success',
      });
      this.dispatchEvent(evt);
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

  toggleShowAll() {
    this.showAll = !this.showAll;
  }

  truncStringPortion(str, firstCharCount = str.length, endCharCount = 0, dotCount = 3) {
    let convertedStr = "";
    convertedStr += str.substring(0, firstCharCount);
    convertedStr += ".".repeat(dotCount);
    convertedStr += str.substring(str.length - endCharCount, str.length);
    return convertedStr;
  }
}