import { LightningElement, api } from 'lwc';
import { moneyMask } from 'c/inputMaskUtils';
import { ownerOptions, assetsTypeOptions } from 'c/util';

export default class MortgageLosAssetsViewMode extends LightningElement {
    @api assets;

    @api totalAssets;
    @api role;
    @api handleEdit;
    @api showAddModal;

    get ownerOptions() {
        return ownerOptions;
    }

    get assetsTypeOptions() {
        return assetsTypeOptions;
    }

    get showTable() {
        return this.assets && this.assets.length > 0;
    }

    get participant() {
        return this.role == 'borrower' ? 'Borrower' : 'Co-Borrower';
    }

    handleAdd = () => {
        this.addAsset = true;
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
}