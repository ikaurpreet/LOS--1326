import { LightningElement, api, track } from 'lwc';
import { states, employmentType, getInputValidation, LONG_DATE_FORMAT } from 'c/util';
import { phoneMask } from 'c/inputMaskUtils';

export default class MortgageLosEmploymentsEditMode extends LightningElement {
    @api role;
    @api iconUrl;
    @api participantEmployments;
    @api employment;
    @api title;
    @api icon;
    @api handleInputChange;
    @api handleAddressInputChange;
    @api deleteEmployment;
    @api deletingEmployment;
    @track showingModal;
    employmentTypeOptions = employmentType;

    get states() {
        return states;
    }

    handleChange = (event) => {
        const inputName = event.target.getAttribute("data-name-input");
        const value = (event.target.type !== 'checkbox') ? event.target.value : event.target.checked;
        this.handleInputChange(value, inputName, this.role, this.employment.uuid);
    }

    handleAddressChange = (event) => {
        const inputName = event.target.getAttribute("data-name-input");
        const value = event.target.value;
        this.handleAddressInputChange(value, inputName, this.role, this.employment.uuid);
    }

    handlePhoneChange = (event) => {
        event.target.value = phoneMask(event.target.value);
        this.handleChange(event);
    }

    handleZipChange = (event) => {
        event.target.value = event.target.value.replace('.', '').replace(',', '').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        this.handleAddressChange(event);
    }

    closeModal = (event) => {
        const employmentId = event.detail;
        if (employmentId) {
            this.deleteEmployment(employmentId, this.role);
        }
        this.showingModal = false;
        this.deletingEmployment = null;
    }

    get maxStartDate() {
        return new Date().toString();
    }

    get minEndDate() {
        let day = new Date(this.employment.startedOn);
        day.setDate(day.getDate() + 1);
        return day.toString();
    }

    openModal = (event) => {
        this.deletingEmployment = event.target.getAttribute('data-employment-key');
        this.showingModal = true;
    }

    get messageWhenRangeOverflow() {
        return `Please enter a date before or equal ${new Intl.DateTimeFormat('en-US', LONG_DATE_FORMAT).format(new Date())}.`;
    }

    get addressInputRequirement() {
        return !!(this.employment.address && this.employment.address.addressLine1);
    }

    get address() {
        return this.employment.address || {
            addressLine1: '',
            addressLine2: '',
            city: '',
            unit: '',
            stateCode: '',
            zipCode: ''
        }
    }

    @api
    get validate() {
        const validFunc = (value) => {
            if (!value) { return false; }
            return true;
        }

        const reducer = (isValid, currentField) => {
            currentField.reportValidity();
            return isValid && currentField.checkValidity();
        }

        const employerInput = this.template.querySelector(`[data-name-input="employerType"]`);
        const stateInput = this.template.querySelector(`[data-name-input="stateCode"]`);

        let isValid = getInputValidation(employerInput, validFunc, "Complete this field.");
        isValid *= getInputValidation(stateInput, validFunc, "Complete this field.");
        const otherFields = [...this.template.querySelectorAll(`lightning-input`)];
        isValid *= otherFields.reduce(reducer, isValid)
        return isValid;
    }
}