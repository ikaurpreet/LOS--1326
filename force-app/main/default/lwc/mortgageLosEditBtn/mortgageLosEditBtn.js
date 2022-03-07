import { LightningElement, wire, api } from 'lwc';
import getAccessLevel from '@salesforce/apex/GetRelatedRecordsLOC.getAccessLevel';

/**
 * @callback editeventcb
 */

/**
 * The pencil icon used to edit a field in the 1003 sections
 * @module c-mortgage-los-edit-btn
 * @property {editeventcb} oneditevent - the callback function for click
 */
export default class MortgageLosEditBtn extends LightningElement {
  @api detail;
  showEditButton = false;
  handleEditClick(event) {
    this.dispatchEvent(new CustomEvent("editevent", { bubbles: true, detail: this.detail }))
  }

  @wire(getAccessLevel) wiregetaccessLevel({ error, data }) {
    if (data) {
      if (data == "write") {
        this.showEditButton = true;
      }
    }
  }
}