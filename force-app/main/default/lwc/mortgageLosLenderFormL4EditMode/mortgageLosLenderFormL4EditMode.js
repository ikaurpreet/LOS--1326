import { LightningElement, api, track } from 'lwc';
import { moneyMask } from 'c/inputMaskUtils';
import { moneyToFloat, MAX_AMOUNT_VALUE, addlCreditRecord, addlCreditType, getOptionLabelFromValues } from 'c/util';

export default class MortgageLosLenderFormL4EditMode extends LightningElement {
    @api handleEdit;
    @api isPurchase;
    @track currentAddlCred;
    @track data;
    @track modal;

    @api
    set lenderData(value) {
        let addlCreditCounter = 2;
        this.data = {
            ...value,
            creditCardsAndOtherDebts: value.creditCardsAndOtherDebts ? `$${moneyMask(value.creditCardsAndOtherDebts.toFixed(2))}` : '',
            property: {
                estimatedLiensToBePaidOff: (value.property && value.property.estimatedLiensToBePaidOff && !this.isPurchase) ? `$${moneyMask(value.property.estimatedLiensToBePaidOff.toFixed(2))}` : '',
                estimatedValue: (value.property && value.property.estimatedValue && this.isPurchase) ? `$${moneyMask(value.property.estimatedValue.toFixed(2))}` : '',
            },
            feeManagement: {
                totalClosingCosts: (value.feeManagement && value.feeManagement.totalClosingCosts) ? `$${moneyMask(value.feeManagement.totalClosingCosts.toFixed(2))}` : '',
                discount: (value.feeManagement && value.feeManagement.discount) ? `$${moneyMask(value.feeManagement.discount.toFixed(2))}` : '',
                sellerCredits: (value.feeManagement && value.feeManagement.sellerCredits) ? `$${moneyMask(value.feeManagement.sellerCredits.toFixed(2))}` : '',
                totalPaidClosingCosts: (value.feeManagement && value.feeManagement.totalPaidClosingCosts) ? `$${moneyMask(value.feeManagement.totalPaidClosingCosts.toFixed(2))}` : '',
                totalOtherAssets: (value.feeManagement && value.feeManagement.totalOtherAssets) ? `$${moneyMask(value.feeManagement.totalOtherAssets.toFixed(2))}` : '',
                additionalCredits: (value.feeManagement && value.feeManagement.additionalCredits) ? value.feeManagement.additionalCredits.map(credit => {
                    addlCreditCounter += 1;
                    return {
                        amount: credit.amount ? `$${moneyMask(credit.amount.toFixed(2))}` : '',
                        creditType: credit.creditType,
                        label: `${addlCreditCounter}. ${getOptionLabelFromValues(addlCreditType, credit.creditType)}`
                    }
                }) : []
            },
            selectedProduct: {
                totalLoanAmount: (value.selectedProduct && value.selectedProduct.totalLoanAmount) ? `$${moneyMask(value.selectedProduct.totalLoanAmount.toFixed(2))}` : '',
            }
        }
    };

    get lenderData() {
        return this.data;
    }

    updateAdditionalCredits = (newAddlCredit) => {
        const newAdditionalCredits = [...this.lenderData.feeManagement.additionalCredits.map(addlCredit => {
            if (newAddlCredit.creditType !== addlCredit.creditType) {
                return { creditType: addlCredit.creditType, amount: moneyToFloat(moneyMask(addlCredit.amount)) }
            } else return newAddlCredit;
        })];
        const input = {
            propertyName: `feeManagement.additionalCredits`,
            value: newAdditionalCredits
        }
        this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }));
    }

    handleAddlCreditChange = (event) => {
        const newAmount = moneyToFloat(moneyMask(event.target.value));
        const creditType = event.target.getAttribute("data-name-input");
        let addlCredit = this.lenderData.feeManagement.additionalCredits.find(addlCredit => addlCredit.creditType === creditType);
        if (event.target.value !== '' && parseFloat(newAmount) > 0 && newAmount <= MAX_AMOUNT_VALUE && addlCredit) {
            event.target.value = `$${moneyMask(newAmount.toFixed(2))}`;
            const newAddlCredit = { creditType: addlCredit.creditType, amount: moneyToFloat(moneyMask(newAmount.toFixed(2))) };
            this.updateAdditionalCredits(newAddlCredit);
        }
        else if (newAmount > MAX_AMOUNT_VALUE && addlCredit) {
            event.target.value = `$${moneyMask(addlCredit.amount)}`;
        } else {
            event.target.value = null;
            this.updateAdditionalCredits({ creditType: addlCredit.creditType, amount: null });
        }
    }

    removeMoneyMask = (value) => {
        return moneyToFloat(value.replace(/\D/g, ''));
    }

    get totalDueFromBorrower() {
        const total = (this.removeMoneyMask(this.data.property.estimatedValue) +
            this.removeMoneyMask(this.data.property.estimatedLiensToBePaidOff) +
            this.removeMoneyMask(this.data.creditCardsAndOtherDebts) +
            this.removeMoneyMask(this.data.feeManagement.totalClosingCosts) +
            this.removeMoneyMask(this.data.feeManagement.discount));
        return total ? `$${moneyMask(total)}` : '';
    }

    get sumAdditionalCredits() {
        return this.data.feeManagement.additionalCredits.length > 0 ? `$${moneyMask(this.data.feeManagement.additionalCredits.reduce((a, b) => a + this.removeMoneyMask(b.amount), 0))}` : '';
    }

    get totalOfOtherCredits() {
        const total = (this.removeMoneyMask(this.data.feeManagement.totalPaidClosingCosts) +
            this.removeMoneyMask(this.data.feeManagement.totalOtherAssets) +
            (this.removeMoneyMask(this.sumAdditionalCredits)));
        return total ? `$${moneyMask(total)}` : '';
    }

    get totalCredits() {
        const total = (this.removeMoneyMask(this.totalOfOtherCredits) +
            this.removeMoneyMask(this.data.feeManagement.sellerCredits));
        return total ? `$${moneyMask(total)}` : '';
    }

    get lessTotalAndTotalCredits() {
        const total = (this.removeMoneyMask(this.data.selectedProduct.totalLoanAmount) +
            this.removeMoneyMask(this.totalCredits));
        return total ? `$${moneyMask(total)}` : '';
    }

    get cashAmount() {
        return (this.removeMoneyMask(this.totalDueFromBorrower) -
            this.removeMoneyMask(this.lessTotalAndTotalCredits));
    }

    get isNegativeCash() {
        return this.cashAmount < 0;
    }

    get cash() {
        const sign = this.isNegativeCash ? '-' : '';
        return this.cashAmount ? `${sign}$${moneyMask(this.cashAmount)}` : '$0.00';
    }

    get cashLabel() {
        return this.isNegativeCash ? "Cash to the Borrower" : "Cash from the Borrower";
    }

    get addlTypes() {
        const toRemove = this.lenderData.feeManagement.additionalCredits;
        return addlCreditType.filter(ar => !toRemove.find(rm => (rm.creditType === ar.value)));
    }

    handleChange = (event) => {
        const input = {
            propertyName: event.target.getAttribute("data-name-input"),
            value: event.target.value,
        }
        this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }));
    }

    getValue = (fieldName) => {
        const propertyNameArray = fieldName.split('.');
        const lastProperty = propertyNameArray.pop();
        let changeObj = this.lenderData;
        if (propertyNameArray.length > 0) {
            changeObj = propertyNameArray.reduce((o, i) => o[i], this.lenderData);
        }
        return this.removeMoneyMask(changeObj[lastProperty]);
    }

    handleMoneyChange(event) {
        const newAmount = moneyToFloat(moneyMask(event.target.value));
        if (event.target.value !== '' && parseFloat(newAmount) > 0 && newAmount <= MAX_AMOUNT_VALUE) {
            event.target.value = `$${moneyMask(newAmount)}`;
            const input = {
                propertyName: event.target.getAttribute("data-name-input"),
                value: newAmount,
            }
            this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }));
        }
        else if (newAmount > MAX_AMOUNT_VALUE) {
            event.target.value = `$${moneyMask(this.getValue(event.target.getAttribute("data-name-input")).toFixed(2))}`;
        } else {
            event.target.value = null;
            const input = {
                propertyName: event.target.getAttribute("data-name-input"),
                value: newAmount,
            }
            this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }));
        }

    }

    get ableToAddAdditionalCredits() {
        return this.addlTypes.length > 0;
    }

    handleAddModalClicked = () => {
        if (this.ableToAddAdditionalCredits) {
            this.currentAddlCred = { ...addlCreditRecord };
            this.modal = true;
        }
    }

    handleCloseModalCliked = (addlCredit) => {
        if (addlCredit.detail) {
            this.handleSaveAddlCredit();
        }
        this.currentAddlCred = null;
        this.modal = false;
    }

    handleSaveAddlCredit = () => {
        const form = this.template.querySelector('c-mortgage-los-lender-form-l4-addl-modal');
        this.currentAddlCred = { ...this.currentAddlCred, amount: parseFloat(this.currentAddlCred.amount) };
        const input = {
            propertyName: `feeManagement.additionalCredits`,
            value: [...this.lenderData.feeManagement.additionalCredits.map(cred => { return { creditType: cred.creditType, amount: moneyToFloat(moneyMask(cred.amount)) } }), this.currentAddlCred]
        }
        this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }));

    }


    handleAddlCredit = (key, value) => {
        this.currentAddlCred[key] = value;
    }

}