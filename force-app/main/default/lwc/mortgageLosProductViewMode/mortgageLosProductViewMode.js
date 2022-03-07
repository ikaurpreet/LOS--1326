import { LightningElement, api } from 'lwc';

export default class MortgageLosProductViewMode extends LightningElement {
  @api product;
  @api handleEdit;
}