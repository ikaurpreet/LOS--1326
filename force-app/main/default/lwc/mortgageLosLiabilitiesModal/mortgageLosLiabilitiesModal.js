import { LightningElement, api } from 'lwc';
import { accountType, liabilityOwner, moneyToFloat, otherAccountType } from 'c/util';
import { moneyMask } from 'c/inputMaskUtils';

const MAX_AMOUNT_VALUE = 999999999.99;

export default class MortgageLosLiabilitiesModal extends LightningElement {
    @api liability;
    @api handleClose;
    @api handleLiabilityChange;
    @api role;
    @api borrowerUuid;
    @api coborrowerUuid;
    @api otherLiability;
    testedOnce = false;

    proposedLienPositionValidate = true;

    get debtInfo() {
        return [this.liability.paidOff ? 'paidOff' : null, this.liability.excludeDti ? "excludeDti" : null, this.liability.resubordinated ? "resubordinated" : null].filter(Boolean);
    }

    get title() {
        if(this.otherLiability) {
            return "Other Liability";
        }else {
            return (this.liability && this.liability.companyName) ? this.liability.companyName : "Add Liability";
        }
    }

    get options() {
        return [
            { label: 'Will be paid off', value: 'paidOff' },
            { label: 'Exclude from DTI/AUS findings', value: 'excludeDti' },
            { label: 'Resubordinated Indicator', value: 'resubordinated' }
        ];
    }

    renderedCallback() {
        if (!this.liability.whose && this.liabilityOwnerOptions.length === 1) {
            this.handleLiabilityChange("whose", this.liabilityOwnerOptions[0].value);
        }
    }

    get otherAccountType() {
        return this.liability.accountType === 'other' ? true : false;
    }

    @api
    get validate() {
        const reducer = (isValid, currentField) => {
            if (currentField) {
                currentField.reportValidity();
                return isValid && currentField.checkValidity();
            }
            return isValid;
        }

        this.testedOnce = true;
        let isValid = true;

        isValid = this.validateProposedLienPosition;
        isValid *= this.validateCurrentLienPosition;
        const comboboxes = [...this.template.querySelectorAll(`lightning-combobox`)];
        const inputs = [...this.template.querySelectorAll(`lightning-input`)];
        return [...comboboxes, ...inputs].reduce(reducer, isValid);
    }

    get validateProposedLienPosition() {
        if (this.liability.resubordinated && !this.liability.proposedLienPosition && this.testedOnce) {
            return false;
        }
        return true;
    }

    get validateCurrentLienPosition() {
        if (this.liability.resubordinated && !this.liability.currentLienPosition && this.testedOnce) {
            return false;
        }
        return true;
    }

    get proposedLienPositionClassName() {
        if (this.validateProposedLienPosition) {
            return 'slds-form-element';
        }
        return 'slds-form-element slds-has-error';
    }

    get currentLienPositionClassName() {
        if (this.validateCurrentLienPosition) {
            return 'slds-form-element';
        }
        return 'slds-form-element slds-has-error';
    }

    handleAccountTypeChange = (event) => {
        this.handleInputChange(event);
    }

    handleMonthsLeftChange = (event) => {
        const months = event.target.value;
        if (months <= MAX_AMOUNT_VALUE && months > 0) {
            this.handleInputChange(event);
        } else if (months > MAX_AMOUNT_VALUE) {
            event.target.value = this.liability[event.target.getAttribute("data-name-input")];
        } else {
            event.target.value = null;
            this.handleInputChange(event);
        }
    }

    handleAmountChange = (event) => {
        const _unpaidBalance = moneyToFloat(moneyMask(event.target.value));
        if (event.target.value !== '' && _unpaidBalance > 0 && _unpaidBalance <= MAX_AMOUNT_VALUE) {
            event.target.value = moneyMask(_unpaidBalance.toFixed(2));
            this.handleInputChange(event);
        } else if (_unpaidBalance > MAX_AMOUNT_VALUE) {
            event.target.value = this.liability[event.target.getAttribute("data-name-input")];
        }
        else {
            event.target.value = null;
            this.handleInputChange(event);
        }
    }

    get accountTypeOptions() {
        if (this.otherLiability) {
            return otherAccountType;
        } else {
            return accountType;
        }
    }

    get liabilityOwnerOptions() {
        if (this.borrowerUuid && !this.coborrowerUuid) return [liabilityOwner[0]];
        else if(!this.borrowerUuid && this.coborrowerUuid) return [liabilityOwner[1]];
        else return liabilityOwner;
    }

    handleCurrentLienPositionChange(e) {
        this.handleLiabilityChange("currentLienPosition", e.target.value);
    }

    handleProposedLienPositionChange(e) {
        this.handleLiabilityChange("proposedLienPosition", e.target.value);
    }

    get paidOffChecked() {
        return this.debtInfo.includes("paidOff");
    }

    get excludeDtiChecked() {
        return this.debtInfo.includes("excludeDti");
    }

    get resubordinatedChecked() {
        return this.debtInfo.includes("resubordinated");
    }

    handleChange(e) {
        this.handleLiabilityChange(e.target.value, e.target.checked);
    }

    handleInputChange(event) {
        this.handleLiabilityChange(event.target.getAttribute("data-name-input"), event.target.value);
    }

    get currentLienPosition1() {
        return parseInt(this.liability.currentLienPosition) === 1;
    }

    get currentLienPosition2() {
        return parseInt(this.liability.currentLienPosition) === 2;
    }

    get currentLienPosition3() {
        return parseInt(this.liability.currentLienPosition) === 3;
    }

    get currentLienPosition4() {
        return parseInt(this.liability.currentLienPosition) === 4;
    }

    get proposedLienPosition1() {
        return parseInt(this.liability.proposedLienPosition) === 1;
    }

    get proposedLienPosition2() {
        return parseInt(this.liability.proposedLienPosition) === 2;
    }

    get proposedLienPosition3() {
        return parseInt(this.liability.proposedLienPosition) === 3;
    }

    get proposedLienPosition4() {
        return parseInt(this.liability.proposedLienPosition) === 4;
    }
}