import { LightningElement, api } from 'lwc';
import { moneyToFloat, MAX_AMOUNT_VALUE } from 'c/util';
import { moneyMask } from 'c/inputMaskUtils';


export default class MortgageLosLenderFormL4AddlModal extends LightningElement {
    @api additionalCredits;
    @api handleClose;
    @api handleCreditChange;
    @api addlCreditType;

    handleMoneyChange(event) {
        const newAmount = moneyToFloat(moneyMask(event.target.value));
        if (event.target.value !== '' && parseFloat(newAmount) > 0 && newAmount <= MAX_AMOUNT_VALUE) {
            event.target.value = `$${moneyMask(newAmount.toFixed(2))}`
            this.handleCreditChange(event.target.getAttribute("data-name-input"), newAmount.toFixed(2));
        }
        else if (newAmount > MAX_AMOUNT_VALUE) {
            event.target.value = `$${moneyMask(this.additionalCredits.amount)}`
        } else {
            this.handleCreditChange(event.target.getAttribute("data-name-input"), null);
            event.target.value = null;
        }
    }

    handleChange(e) {
        this.handleCreditChange(e.target.value, e.target.checked);
    }

    handleInputChange(event) {
        this.handleCreditChange(event.target.getAttribute("data-name-input"), event.target.value);
    }
}