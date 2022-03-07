import { LightningElement, api } from 'lwc';

export default class MortgageFormElementControl extends LightningElement {
  @api label;
  @api helpText;
  @api variant;

  get labelClass() {
    return `slds-form-element__label ${this.variant === 'bold' ? 'elem-control--bold' : ''}`
  }
}