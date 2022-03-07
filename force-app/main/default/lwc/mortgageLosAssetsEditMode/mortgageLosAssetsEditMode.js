import { LightningElement, api, track } from 'lwc';
import { ownerOptions, assetsTypeOptions, moneyToFloat } from 'c/util';
import { moneyMask } from 'c/inputMaskUtils';

export default class MortgageLosAssetsEditMode extends LightningElement {
    EmptyAsset = {
        accountNumber: "",
        amount: "",
        assetType: "",
        owner: "",
        ownerValue: "",
        ownerLabel: "",
        institutionName: "",
        jointAccount: [],
        delete: false
    }
    _role;

    @api assets;
    @api totalAssets;
    @api handleChange;
    @api bothParticipants;
    @api deleteAsset;
    @api undoDeleted;
    @api addAsset;
    @api handleCancel;
    @api initializeWithModal;
    @track showingModal;
    @track addingAsset = { ...this.EmptyAsset }

    get ownerOptions() {
        return ownerOptions;
    }

    get assetsTypeOptions() {
        return assetsTypeOptions;
    }

    get disabledOwner() {
        return !this.bothParticipants;
    }

    @api
    get role() {
        return this._role;
    }

    setAssetOwner = (role, asset) => {
        if (role === "borrower") {
            return { ...asset, owner: "Borrower", ownerLabel: "Borrower’s", ownerValue: "borrower" };
        } else if (role === "coBorrower") {
            return { ...asset, owner: "Co-Borrower", ownerLabel: "Co-Borrower’s", ownerValue: "coBorrower" };
        } else {
            return { ...asset, owner: "Both", ownerLabel: "Both", ownerValue: "both" };
        }
    }

    set role(value) {
        if (this._role !== value) {
            this._role = value;
            this.EmptyAsset = this.setAssetOwner(value, this.EmptyAsset);
            this.addingAsset = { ...this.EmptyAsset };
        }
    }

    connectedCallback() {
        if (this.initializeWithModal) {
            this.showAddModal();
        }
    }

    highlight(element) {
        element.classList.add('animation');
        window.setTimeout(() => element.classList.remove('animation'), 50);
    }

    showAddModal = () => {
        this.showingModal = true;
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
        const inputs = [...this.template.querySelectorAll(`lightning-input`)];
        return [...comboboxes, ...inputs].reduce(reducer, isValid);
    }

    closeModal = (event) => {
        if (event.detail && this.validate) {
            this.addAsset(event.detail);
            this.showingModal = false;
            this.addingAsset = { ...this.EmptyAsset };
            const totals = this.template.querySelector('.total-assets__value');
            this.highlight(totals);
        } else if (!event.detail) {
            this.showingModal = false;
            this.addingAsset = { ...this.EmptyAsset };
            this.handleCancel();
        }
    }

    handleNewAssetChange = (event) => {
        const inputName = event.target.getAttribute("data-name-input");
        this.addingAsset[inputName] = event.target.value;
    }

    applyMoneyMask = (event) => {
        const newAmount = moneyToFloat(moneyMask(event.target.value));
        if (event.target.value !== '' && parseFloat(newAmount) > 0) {
            event.target.value = `$${moneyMask(newAmount.toFixed(2))}`;
        } else {
            event.target.value = null;
        }
        return newAmount;
    }

    handleNewAssetAmountChange = (event) => {
        this.addingAsset.amount = this.applyMoneyMask(event);
    }

    handleDeleteAsset = (event) => {
        const assetKey = event.target.getAttribute('data-details');
        const groupLabel = event.target.getAttribute('data-asset-group');
        const totals = this.template.querySelector('.total-assets__value');
        const groups = this.template.querySelectorAll(`[data-group="${groupLabel}"]`);
        this.deleteAsset(assetKey);
        this.highlight(totals);
        groups.forEach(group => {
            this.highlight(group);
        });
    }

    handleInputChange = (event) => {
        const inputName = event.target.getAttribute("data-name-input");
        this.handleChange(event.target.dataset.assetKey, inputName, event.target.value);
    }

    handleUndoClicked = (event) => {
        const assetKey = event.target.getAttribute('data-details');
        this.undoDeleted(assetKey);
    }

    handleAmountChange = (event) => {
        const amount = this.applyMoneyMask(event);
        this.handleChange(event.target.dataset.assetKey, 'amount', amount);
        this.handleChange(event.target.dataset.assetKey, 'amountWithMask', event.target.value)
    }
}