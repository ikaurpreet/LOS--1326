import { LightningElement, track, api, wire} from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import VERSION_ID from '@salesforce/schema/ContentDocument.LatestPublishedVersionId';
import FILE_TYPE from '@salesforce/schema/ContentDocument.FileType';
import TITLE from '@salesforce/schema/ContentDocument.Title';

export default class FileCard extends NavigationMixin(LightningElement) {
  @track
  isLoading = true;

  @api fileId;
  @api description;

  @wire(getRecord, { recordId: '$fileId', fields: [VERSION_ID, FILE_TYPE, TITLE] })
  file;

  get fileName() {
    return this.title + '.' + this.fileType.toLowerCase();
  }

  get fileNamePreview() {
    if (this.fileName.length > 32) {
      return this.truncStringPortion(this.fileName, 20, 7, 3);
    } else {
      return this.fileName;
    }
  }

  get versionId() {
    return this.file.data ? getFieldValue(this.file.data, VERSION_ID) : '';
  }

  get fileType() {
    return this.file.data ? getFieldValue(this.file.data, FILE_TYPE) : '';
  }

  get title() {
    return this.file.data ? getFieldValue(this.file.data, TITLE) : '';
  }

  get fileSrc() {
    return '/sfc/servlet.shepherd/version/download/' + this.versionId;
  }

  get previewSrc() {
    return `/sfc/servlet.shepherd/version/renditionDownload?rendition=thumb720by480&versionId=${this.versionId}&page=0`
  }

  get isPdf() {
    return this.fileType == 'PDF';
  }

  handlePreviewFile(_event) {
    this.openFilePreview(this.fileId);
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

  truncStringPortion(str, firstCharCount = str.length, endCharCount = 0, dotCount = 3) {
    let convertedStr = "";
    convertedStr += str.substring(0, firstCharCount);
    convertedStr += ".".repeat(dotCount);
    convertedStr += str.substring(str.length - endCharCount, str.length);
    return convertedStr;
  }
}