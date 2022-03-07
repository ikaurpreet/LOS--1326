import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateLenderTags from '@salesforce/apex/MortgagesSubmissionDocuments.updateExpirationDate';

export default class MortgagesAddExpirationDateDocument extends LightningElement {
  @api value;
  @api documentId;

  @track error;
  
  close() {
    const closeEvent = new CustomEvent('close');
    this.dispatchEvent(closeEvent);
  }

  onChange(e) {
    this.value = e.target.value;
  }

  async submit() {
    this.error = null;
    this.loading = true;

    try {
      await this._updateExpirationDate()
      const updateEvent = new CustomEvent('update', { value: this.value });
      this.dispatchEvent(updateEvent);
      this.close();
      const toastEvent = new ShowToastEvent({
        title: `Expiration date updated`,
        message: `Expiration date updated`,
        variant: 'success',
      });
      this.dispatchEvent(toastEvent);
    } catch(error) {
      this.error = error.body;
    } finally {
      this.loading = false;
    }  
  }

  _updateExpirationDate() {
    return updateLenderTags({documentId: this.documentId, expirationDate: this.value});
  }
}