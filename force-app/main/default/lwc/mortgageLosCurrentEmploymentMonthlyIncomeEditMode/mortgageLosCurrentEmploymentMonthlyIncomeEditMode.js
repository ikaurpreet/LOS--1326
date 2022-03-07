import { LightningElement, api, track } from 'lwc';
import { moneyMask, phoneMask } from 'c/inputMaskUtils';
import { states, employmentType, getInputValidation, LONG_DATE_FORMAT } from 'c/util';

export default class MortgageLosCurrentEmploymentMontlyIncomeEditMode extends LightningElement {
    @api employment;
    @api employments;
    @api role;
    @api getTitle;
    @api icon;
    @api handleInputChange;
    @api handleAddressInputChange;
    @api handleSummaryInputChange;
    @api deleteEmployment;
    @api deletingEmployment;
    @track showingModal;

    constructor() {
        super();
        this.getTitle = () => { return '' }
    }

    handleChange = (event) => {
        const inputName = event.target.getAttribute("data-name-input");
        const value = (event.target.type !== 'checkbox') ? event.target.value : event.target.checked;
        this.handleInputChange(value, inputName, this.role, this.employment.uuid);
    }

    handleCurrentlyWorkingChange = (event) => {
        if (event.target.checked) {
            this.handleInputChange(null, "endDate", this.role, this.employment.uuid);
        };
        this.handleChange(event);
    }

    handleAddressChange = (event) => {
        const inputName = event.target.getAttribute("data-name-input");
        const value = event.target.value;
        this.handleAddressInputChange(value, inputName, this.role, this.employment.uuid);
    }

    handleSummaryChange = (event) => {
        const inputName = event.target.getAttribute("data-name-input");
        const value = event.target.value;
        this.handleSummaryInputChange(value, inputName, this.role, this.employment.uuid);
    }

    handleZipChange = (event) => {
        event.target.value = event.target.value.replace('.', '').replace(',', '').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        this.handleAddressChange(event);
    }

    handlePhoneChange = (event) => {
        event.target.value = phoneMask(event.target.value);
        this.handleChange(event);
    }

    handleAmountChange = (event) => {
        const amount = moneyMask(event.target.value);
        if (event.target.value !== '' && parseFloat(amount) > 0) {
            event.target.value = amount;
        } else {
            event.target.value = null;
        }
        this.handleSummaryChange(event);
    }

    closeModal = (event) => {
        const employmentId = event.detail;
        if (employmentId) {
            this.deleteEmployment(employmentId, this.role);
        }
        this.showingModal = false;
        this.deletingEmployment = null;
    }

    openModal = (event) => {
        this.deletingEmployment = event.target.getAttribute('data-employment-key');
        this.showingModal = true;
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

    get endDateInputRequirement() {
        return !this.employment.currentlyWorking;
    }

    get endDateInputAccess() {
        return this.employment.currentlyWorking;
    }

    get showAlert() {
        return !this.employment.currentlyWorking;
    }

    get endDateValue() {
        return this.endDateInputAccess ? 'Present' : this.employment.endDate;
    }

    get maxStartDate() {
        return new Date().toString();
    }

    get minEndDate() {
        let day = new Date(this.employment.startedOn);
        day.setDate(day.getDate() + 1);
        return day.toString();
    }

    get messageWhenRangeOverflow() {
        return `Please enter a date before or equal ${new Intl.DateTimeFormat('en-US', LONG_DATE_FORMAT).format(new Date())}.`;
    }

    get grossMonthlyIncomeSummary() {
        return {
            base: `${moneyMask(this.employment.grossMonthlyIncomeSummary.base.toString())}`,
            bonuses: `${moneyMask(this.employment.grossMonthlyIncomeSummary.bonuses.toString())}`,
            commissions: `${moneyMask(this.employment.grossMonthlyIncomeSummary.commissions.toString())}`,
            other: `${moneyMask(this.employment.grossMonthlyIncomeSummary.other.toString())}`,
            overtime: `${moneyMask(this.employment.grossMonthlyIncomeSummary.overtime.toString())}`,
            total: `${moneyMask(this.employment.grossMonthlyIncomeSummary.total.toString())}`
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
        const otherFields = [...this.template.querySelectorAll(`lightning-input`)];
        isValid *= getInputValidation(stateInput, validFunc, "Complete this field.");
        isValid *= otherFields.reduce(reducer, isValid)
        return isValid;
    }

    get states() {
        return states;
    }

    get title() {
        return this.getTitle(this.role, this.employment, this.employments);
    }

    get employmentTypeOptions() {
        return employmentType;
    }
}