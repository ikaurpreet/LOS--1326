import { LightningElement, api, track } from 'lwc';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import CoBorrowerSR from '@salesforce/resourceUrl/CoBorrower';
import { incomeTypes, getInputValidation } from 'c/util';
import { moneyMask } from 'c/inputMaskUtils';

const AllowedTypes = ["pension", "socialSecurity", "dividends", "capitalGains", "childSupport",
    "permanentDisability", "alimony", "trust", "separateMaintenance"];
    
const EmptyIncome = {
    amount: null,
    incomeType: "",
    incomeValue: null,
    owner: "",
    ownerValue: "",
    uuid: null
}

export default class MortgageLosIncomeFromOtherSourcesViewMode extends LightningElement {
    @track borrowerIncomeSources = [];
    @track coBorrowerIncomeSources = [];
    borrower;
    coBorrower;
    coBorrowerUuid;
    borrowerUuid;
    @track allIncomes = [];
    @track isEditing;
    @track isDeleting;
    @track isAdding;
    @track updatingIncome = null;
    @track updatingIncomeType = null;
    @track deletingIncome = null;
    @track addingIncome = { ...EmptyIncome };
    @api showBorrower;
    @api showCoborrower;
    @api save;

    OwnerOptions = [
        { value: "borrower", label: "Borrower" },
        { value: "coBorrower", label: "Co-Borrower" }
    ];

    sortByIncomeType(income1, income2) {
        if (income1.label < income2.label)
            return -1;
        if (income1.label > income2.label)
            return 1;
        return 0;
    }

    get addParticipantIncomeTypes() {
        return incomeTypes.map(income => {
            const isAllowed = AllowedTypes.includes(income.value);
            const selectedByBorrower = this.addIncome.ownerValue === 'borrower' ? this.borrowerIncomeSources.find(borrowerIncome => income.value === borrowerIncome.incomeValue) : false;
            const selectedByCoBorrower = this.addIncome.ownerValue === 'coBorrower' ? this.coBorrowerIncomeSources.find(coBorrowerIncome => income.value === coBorrowerIncome.incomeValue) : false;
            return (isAllowed && !selectedByBorrower && !selectedByCoBorrower) ? income : null;
        }).filter(Boolean).sort(this.sortByIncomeType);
    }

    get editParticipantIncomeTypes() {
        return incomeTypes.map(income => {
            const isAllowed = AllowedTypes.includes(income.value);
            const selectedByBorrower = this.updateIncome.ownerValue === 'borrower' ? this.borrowerIncomeSources.find(borrowerIncome => income.value === borrowerIncome.incomeValue) : false;
            const selectedByCoBorrower = this.updateIncome.ownerValue === 'coBorrower' ? this.coBorrowerIncomeSources.find(coBorrowerIncome => income.value === coBorrowerIncome.incomeValue) : false;
            return (isAllowed &&
                (!selectedByBorrower || (selectedByBorrower && selectedByBorrower.incomeValue === this.updatingIncomeType)) &&
                (!selectedByCoBorrower || (selectedByBorrower && selectedByBorrower.incomeValue === this.updatingIncomeType))) ? income : null;
        }).filter(Boolean).sort(this.sortByIncomeType);
    }

    get allowedIncomeTypes() {
        return incomeTypes.map(income => {
            return AllowedTypes.includes(income.value) ? income : null;
        }).filter(Boolean).sort(this.sortByIncomeType);
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

        const ownerInput = this.template.querySelector(`[data-field="ownerValue"]`);
        const incomeInput = this.template.querySelector(`[data-field="incomeValue"]`);

        let isValid = getInputValidation(ownerInput, validFunc, "Complete this field.");
        isValid *= getInputValidation(incomeInput, validFunc, "Complete this field.");

        const otherFields = [...this.template.querySelectorAll(`lightning-input`)];
        return otherFields.reduce(reducer, isValid);
    }

    set showBorrowerOption(value) {
        this.withBorrowerOption = value;
    }

    get showBorrowerOption() {
        return this.withBorrowerOption;
    }

    set showCoBorrowerOption(value) {
        this.withCoBorrowerOption = value;
    }

    get showCoBorrowerOption() {
        return this.withCoBorrowerOption;
    }

    get showBothOwnerOptions() {
        return this.showBorrowerOption && this.showCoBorrowerOption;
    }

    get disabledOwnerOptions() {
        return (this.showBorrowerOption && !this.showCoBorrowerOption) || (!this.showBorrowerOption && this.showCoBorrowerOption);
    }

    @api
    get incomeSources() {
        return this.allIncomes;
    }

    /**
     * Setter function to filter income sources with allowed types
     * @param {module:c-mortgage-los-income-from-other-sources.IncomeSources} value - Income Sources
     */
    set incomeSources(value) {
        this.borrowerIncomeSources = [];
        this.coBorrowerIncomeSources = [];
        if (value && value.borrower && this.showBorrower) {
            this.showBorrowerOption = true;
            this.borrower = value.borrower.uuid;
            if (value.borrower.incomes.length > 0) {
                this.borrowerIncomeSources = value.borrower.incomes.map(income => {
                    if (AllowedTypes.includes(income.incomeType) || !income.incomeType) {
                        let type = incomeTypes.find(type => type.value === income.incomeType);
                        const typeLabel = type ? type.label : '';
                        const typeValue = type ? type.value : null;
                        return { amount: this.getAmountPerMonth(income), incomeType: typeLabel, incomeValue: typeValue, owner: "Borrower", ownerValue: "borrower", uuid: value.borrower.uuid, key: `borrower-${typeValue}` };
                    }
                }).filter(Boolean);
            }
        }
        if (value && value.coBorrower && this.showCoborrower) {
            this.showCoBorrowerOption = true;
            this.coBorrower = value.coBorrower.uuid;
            if (value.coBorrower.incomes.length > 0) {
                this.coBorrowerIncomeSources = value.coBorrower.incomes.map(income => {
                    if (AllowedTypes.includes(income.incomeType) || !income.incomeType) {
                        let type = incomeTypes.find(type => type.value === income.incomeType);
                        const typeLabel = type ? type.label : '';
                        const typeValue = type ? type.value : null;
                        return { amount: this.getAmountPerMonth(income), incomeType: typeLabel, incomeValue: typeValue, owner: "Co-Borrower", ownerValue: "coBorrower", uuid: value.coBorrower.uuid, key: `co-borrower-${typeValue}` };
                    }
                }).filter(Boolean);
            }
        }

        const participantIncome = this.showBorrowerOption ? value.borrower : value.coBorrower;
        this.applyDefaultOptions(participantIncome);

        this.allIncomes = this.borrowerIncomeSources.concat(this.coBorrowerIncomeSources);
    }

    applyDefaultOptions(participantIncome) {
        const defaultOption = !this.showBothOwnerOptions ? (this.showBorrowerOption ?
            { owner: "Borrower", ownerValue: "borrower", uuid: participantIncome.uuid, key: `borrower-${participantIncome.uuid}` } :
            { owner: "Co-Borrower", ownerValue: "coBorrower", uuid: participantIncome.uuid, key: `co-borrower-${participantIncome.uuid}` }) : {};
        this.addIncome = { ...EmptyIncome, ...defaultOption };
    }

    getAmountPerMonth(income) {
        if (income.amount) {
            if (income.paymentTermType === 'perMonth')
                return `$${moneyMask(income.amount.toFixed(2))}/mo`;
            else {
                return `$${moneyMask((income.amount / 12).toFixed(2))}/mo`;
            }
        } else {
            return '';
        }
    }

    get showIncomeTable() {
        return this.allIncomes.length > 0;
    }

    get showingModal() {
        return this.isEditing;
    }

    set showingModal(value) {
        this.isEditing = value;
    }

    borrowerIcon = BorrowerSR;
    coBorrowerIcon = CoBorrowerSR;

    handleEdit = (event) => {
        this.updateIncome = { ...event.detail };
        this.updatingIncomeType = event.detail.incomeValue;
        this.showingModal = true;
    }

    handleAdd = () => {
        this.addIncome = true;
    }

    set updateIncome(value) {
        this.updatingIncome = value;
    }

    get ableToAddIncomeTypeInput() {
        return !this.addIncome.ownerValue;
    }

    get ableToEditIncomeTypeInput() {
        return !this.updateIncome.ownerValue;
    }

    get updateIncome() {
        return this.updatingIncome;
    }

    set addIncome(value) {
        this.addingIncome = value;
    }

    get addIncome() {
        return this.addingIncome;
    }

    get adding() {
        return this.isAdding;
    }

    set adding(value) {
        this.isAdding = value;
    }

    applyMoneyMask = (event) => {
        const newAmount = moneyMask(event.target.value);
        if (event.target.value !== '' && parseFloat(newAmount) > 0) {
            event.target.value = newAmount;
        } else {
            event.target.value = null;
        }
        return event;
    }

    handleNewIncomeAmountChange = (event) => {
        const updatedEvent = this.applyMoneyMask(event);
        this.handleNewIncomeChange(updatedEvent);
    }

    handleNewIncomeChange = (event) => {
        const field = event.target.getAttribute('data-field');
        this.addIncome = { ...this.addIncome, [field]: event.target.value };
    }

    handleNewOwnerChange = (event) => {
        if (event.target.value === 'borrower') {
            this.addIncome = { ...this.addIncome, uuid: this.borrower };
        }
        else {
            this.addIncome = { ...this.addIncome, uuid: this.coBorrower };
        }
        this.handleNewIncomeChange(event);
    }

    handleEditOwnerChange = (event) => {
        if (event.target.value === 'borrower') {
            this.updateIncome = { ...this.updateIncome, uuid: this.borrower };
        }
        else {
            this.updateIncome = { ...this.updateIncome, uuid: this.coBorrower };
        }
        this.handleChange(event);
    }

    handleAmountChange = (event) => {
        const updatedEvent = this.applyMoneyMask(event);
        this.handleChange(updatedEvent);
    }

    handleChange = (event) => {
        const field = event.target.getAttribute('data-field');
        this.updateIncome = { ...this.updateIncome, [field]: event.target.value };
    }

    handleCloseEditModal = (event) => {
        if (event.detail) {
            if (event.detail.incomeValue !== this.updatingIncomeType) {
                const deleted = this.save({ ...event.detail, incomeValue: this.updatingIncomeType, amount: moneyMask(event.detail.amount), delete: true }, false);
                if (deleted) {
                    const added = this.save({ ...event.detail, amount: moneyMask(event.detail.amount), delete: false });
                    if (added) {
                        this.isEditing = false;
                    }
                }
            }
            else {
                if (this.save({ ...event.detail, amount: moneyMask(event.detail.amount), delete: false })) {
                    this.isEditing = false;
                }
            }
        } else {
            this.isEditing = false;
            this.updateIncome = null;
            this.updatingIncomeType = null;
        }
    }

    handleCloseAddModal = (event) => {
        if (event.detail) {
            if (this.save({ ...event.detail, delete: false })) {
                this.adding = false;
                this.applyDefaultOptions(event.detail);
            }
        } else {
            this.adding = false;
            this.applyDefaultOptions(this.addIncome);
        }
    }

    handleCloseDeleteModal = (event) => {
        const income = event.detail;
        if (income) {
            this.save(income);
        }
        this.isDeleting = false;
        this.deletingIncome = null;
    }

    showAddIncomeModal = () => {
        this.adding = true
    }

    handleDelete = (event) => {
        const incomeType = event.target.getAttribute('data-details');
        const incomeOwner = event.target.getAttribute('data-owner');
        let income = null;
        if (incomeOwner === "borrower") {
            income = this.borrowerIncomeSources.find(income => income.incomeType === incomeType);
        } else {
            income = this.coBorrowerIncomeSources.find(income => income.incomeType === incomeType);
        }
        income = { ...income, amount: moneyMask(income.amount), delete: true };
        this.isDeleting = true;
        this.deletingIncome = income;
    }
}