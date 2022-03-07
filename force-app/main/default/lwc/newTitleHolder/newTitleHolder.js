import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';

export default class NewTitleHolder extends LightningElement  {
    @api isOpened = false; // Modal exibition control

    @api recordId;

    openModal() {
        this.isOpened = true
    }

    closeModal() {
      const closeEvent = new CustomEvent('close');
      this.dispatchEvent(closeEvent);
      this.isOpened = false
    }

    handleSuccess(event) {
      this.closeModal();
      const evt = new ShowToastEvent({
          title: 'Title Holder Created',
          variant: 'success',
          mode: 'dismissable'
      });
      this.dispatchEvent(evt);
    }
}