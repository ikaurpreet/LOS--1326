import { LightningElement, api } from 'lwc';
import { isAbbleToEdit, isNotAbbleToEdit } from 'c/util';

export default class MortgageLosCheckboxViewMode extends LightningElement {
  @api editable;
  @api label;
  @api status;
  @api handleEdit;

  get checkboxElementId() {
    return `checkbox-${this.label}`;
  }

  get editClass() {
    return !!this.editable ? isAbbleToEdit : isNotAbbleToEdit;
  }
}