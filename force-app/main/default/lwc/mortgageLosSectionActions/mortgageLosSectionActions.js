import { LightningElement, api } from 'lwc';

/**
 * @callback canceleventcb
 */

/**
 * @callback saveeventcb
 */

/**
 * Save/Cancel buttons to use in the bottom of sections
 * @module c-mortgage-los-section-actions
 * @property {canceleventcb} oncancelevent - callback to the cancel button
 * @property {saveeventcb} onsaveevent - callback to the save button
 */

export default class MortgageLosSectionActions extends LightningElement {
  @api cancelLabel;
  @api saveLabel;

  handleCancelClick(event) {
    this.dispatchEvent(new CustomEvent("cancelevent", { bubbles: true }))
  }

  handleSaveClick(event) {
    this.dispatchEvent(new CustomEvent("saveevent", { bubbles: true }))
  }

  get _cancelLabel() {
    return this.cancelLabel || 'Cancel';
  }

  get _saveLabel() {
    return this.saveLabel || 'Save';
  }
}