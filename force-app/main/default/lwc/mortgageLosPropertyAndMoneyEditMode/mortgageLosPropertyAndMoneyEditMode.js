import { LightningElement, api } from 'lwc';
import { moneyMask } from 'c/inputMaskUtils';

export default class MortgageLosPropertyAndMoneyEditMode extends LightningElement {
    @api handleChange;
    @api icon;
    @api role;
    @api declarations;
    @api submissionType;

    occupancyOptions = [
        { value: 'primaryResidence', label: 'Primary Residence' },
        { value: 'secondHome', label: 'Second Home' },
        { value: 'investmentProperty', label: 'Investment Property' }
    ]

    ownershipOption = [
        { value: 'sole', label: 'By Yourself' },
        { value: 'jointWithSpouse', label: 'Jointly with your spouse' },
        { value: 'jointWithOtherThanSpouse', label: 'Jointly with another person' }
    ]

    bankruptcyOptions = [
        { value: 'declaredBankruptcyPast7YearsChapter7', label: 'Chapter 7' },
        { value: 'declaredBankruptcyPast7YearsChapter11', label: 'Chapter 11' },
        { value: 'declaredBankruptcyPast7YearsChapter12', label: 'Chapter 12' },
        { value: 'declaredBankruptcyPast7YearsChapter13', label: 'Chapter 13' }
    ]

    get isRefi() {
        return this.submissionType === 'MortgageRefi';
    }

    get propertyTitle() {
        return `About this Property and Your Money for this Loan - ${this.role === 'borrower' ? 'Borrower' : 'Co-Borrower'}`
    }

    get financesTitle() {
        return `About Your Finances - Borrower - ${this.role === 'borrower' ? 'Borrower' : 'Co-Borrower'}`
    }

    get showASuboptions() {
        return this.declarations.permanentResidence && this.declarations.ownershipInterest;
    }

    get bankruptcyValue() {
        return [
            this.declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter7 ? 'declaredBankruptcyPast7YearsChapter7' : null,
            this.declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter11 ? 'declaredBankruptcyPast7YearsChapter11' : null,
            this.declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter12 ? 'declaredBankruptcyPast7YearsChapter12' : null,
            this.declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter13 ? 'declaredBankruptcyPast7YearsChapter13' : null,
        ].filter(Boolean);
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

        let isValid = true;
        const comboboxes = [...this.template.querySelectorAll(`lightning-combobox`)];
        const radioBtns = [...this.template.querySelectorAll(`c-mortgage-los-yes-no-radio`)];
        const inputs = [...this.template.querySelectorAll(`lightning-input`)];
        const checkboxGroup = this.template.querySelector(`lightning-checkbox-group`);
        radioBtns.forEach(radioBtn => isValid *= radioBtn.validate);
        return [...comboboxes, ...inputs, checkboxGroup].reduce(reducer, isValid);
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

    handleInputChange = (value, details) => {
        this.handleChange(value, details, this.role);
    }

    handleOwnershipChange = (event) => {
        this.handleChange(event.target.value, 'ownershipType', this.role);
    }

    handleOccupancyChange = (event) => {
        this.handleChange(event.target.value, 'occupancyType', this.role);
    }

    handleAmountChange = (event) => {
        const amount = moneyMask(event.target.value);
        if (event.target.value !== '' && parseFloat(amount) > 0) {
            event.target.value = amount;
        } else {
            event.target.value = null;
        }
        this.handleChange(event.target.value, 'borrowMoneyFromAnotherPartyAmount', this.role);
    }

    handleBankruptcyChaptersChange = (event) => {
        const bankruptcyChapters = {
            'declaredBankruptcyPast7YearsChapter7': event.target.value.includes('declaredBankruptcyPast7YearsChapter7') || null,
            'declaredBankruptcyPast7YearsChapter11': event.target.value.includes('declaredBankruptcyPast7YearsChapter11') || null,
            'declaredBankruptcyPast7YearsChapter12': event.target.value.includes('declaredBankruptcyPast7YearsChapter12') || null,
            'declaredBankruptcyPast7YearsChapter13': event.target.value.includes('declaredBankruptcyPast7YearsChapter13') || null
        }
        this.handleChange(bankruptcyChapters, 'bankruptcyChapters', this.role);
    }
}