import { LightningElement, api } from 'lwc';

export default class MortgageLosYesNoInput extends LightningElement {
    @api value;
    @api label;
    @api handleEdit;
    @api disabled;

    @api
    get valueLabel() {
        return this.value === null ? '' : (this.value ? 'Yes' : 'No');
    }
}