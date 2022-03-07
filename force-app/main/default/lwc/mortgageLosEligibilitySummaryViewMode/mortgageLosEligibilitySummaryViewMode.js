import { LightningElement, api } from 'lwc';
export default class MortgageLosEligibilityViewMode extends LightningElement {
  @api eligibility;
  @api handleEdit;
}