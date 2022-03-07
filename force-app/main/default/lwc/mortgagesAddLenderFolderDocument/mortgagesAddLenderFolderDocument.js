import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import LENDER_TAGS_FIELD from '@salesforce/schema/Document__c.LenderTags__c';
import DocumentObject from '@salesforce/schema/Document__c';
import updateLenderTags from '@salesforce/apex/MortgagesSubmissionDocuments.updateLenderTags';
import bulkUpdateLenderTags from '@salesforce/apex/MortgagesSubmissionDocuments.bulkUpdateLenderTags';

export default class MortgagesAddLenderFolderDocument extends LightningElement {

  @wire (getObjectInfo, {objectApiName: DocumentObject}) objectInfo;

  @wire(getPicklistValues, { recordTypeId: '$objectInfo.data.defaultRecordTypeId', fieldApiName: LENDER_TAGS_FIELD })
  wiredPicklistValues({ error, data }) {
    this.values = undefined;
    if (data) {
      this.values = data.values.map((item) => {
        return {
          label: item.label,
          value: item.value,
          selected: this.selectedValues.indexOf(item.value) !== -1
        };
      });
    } else if (error) {
        this.error = error.body;
    }
}  

  @api documentId;
  @api selectedValues;
  @track loading;
  @track error;
  @track values;
  @track title;

  connectedCallback() {
    this.styles = `height:250px;left:${this.x}px;top:${this.y}px;position:absolute;`;
    this.title = (this.documentId.length > 1) ? 'Add Files to' : 'Add File to'
  }

  onChange(e) {
    this.selectedValues = e.detail;
  }

  close() {
    const closeEvent = new CustomEvent('close');
    this.dispatchEvent(closeEvent);
  }

  async submit() {
    this.error = null;
    this.loading = true;

    try {
      await this._updateLenderTags()
      const updateEvent = new CustomEvent('update', { detail: this.values.filter((item) => this.selectedValues.indexOf(item.value) !== -1) });
      this.dispatchEvent(updateEvent);
      this.close();
      const toastEvent = new ShowToastEvent({
        title: `Successfully added`,
        message: `Successfully added`,
        variant: 'success',
      });
      this.dispatchEvent(toastEvent);
    } catch(error) {
      this.error = error.body;
    } finally {
      this.loading = false;
    }  
  }

  _updateLenderTags() {
    if(this.documentId.length > 1) {
      return bulkUpdateLenderTags({documentIds: this.documentId, lenderTags: this.selectedValues});
    }
    return updateLenderTags({documentId: this.documentId[0], lenderTags: this.selectedValues});
  } 
}