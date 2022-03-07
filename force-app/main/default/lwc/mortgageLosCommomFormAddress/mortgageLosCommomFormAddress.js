import { LightningElement, api } from 'lwc';
import { states, getInputValidation } from 'c/util';

/**
 * Participant Commom Form - Edit Mode [addressLine1, city, stateCode, zipCode, startDate]
 * @module c-mortgage-los-commom-form-address
 * @property {Object} address - Address
 * @property {boolean} isCurrentAddress - Is the participant current address
 * @property {boolean} isMailingAddress - Is the participant mailing address
 * @property {function} handleInputChange - The callback to handle input changes
 * 
*/
export default class MortgageCommomFormAddress extends LightningElement {
    @api address;
    @api isCurrentAddress;
    @api isMailingAddress;
    @api handleInputChange;

    handleChange = (event) => {
        const propertyName = event.target.getAttribute("data-name-input");
        const value = event.target.value;

        this.handleInputChange(propertyName, value, this.address.id.value);
    }

    handleStartDateChange = (propertyName, value) => {
        this.handleInputChange(propertyName, value, this.address.id.value);
    }

    @api
    get validate() {
        const reducer = (isValid, currentField) => {
            currentField.reportValidity();
            return isValid && currentField.checkValidity();
        }

        const validFunc = (value) => {
            if (!value) { return false; }
            return true;
        }

        const stateCodeComp = this.template.querySelector(`lightning-combobox`);
        let isValid = getInputValidation(stateCodeComp, validFunc, "Complete this field.");

        const otherFields = [...this.template.querySelectorAll(`lightning-input`)];
        const allValid = otherFields.reduce(reducer, isValid);

        return allValid;
    }

    get states() {
        return states;
    }
}