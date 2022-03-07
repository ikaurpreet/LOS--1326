import { LightningElement, api, track } from 'lwc';
import { moneyMask } from 'c/inputMaskUtils';
import { moneyToFloat, addlCreditType, getOptionLabelFromValues } from 'c/util';

export default class MortgageLosLenderFormL4ViewMode extends LightningElement {
    @api handleEdit;
    @api isPurchase;
    @track data;

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

    removeMoneyMask = (value) => {
        return moneyToFloat(value.replace(/\D/g, ''));
    }

    get totalDueFromBorrower() {
        const total = (this.removeMoneyMask(this.lenderData.property.estimatedValue) +
            this.removeMoneyMask(this.lenderData.property.estimatedLiensToBePaidOff) +
            this.removeMoneyMask(this.lenderData.creditCardsAndOtherDebts) +
            this.removeMoneyMask(this.lenderData.feeManagement.totalClosingCosts) +
            this.removeMoneyMask(this.lenderData.feeManagement.discount));
        return total ? `$${moneyMask(total)}` : '';
    }

    get sumAdditionalCredits() {
        return this.lenderData.feeManagement.additionalCredits.length > 0 ? `$${moneyMask(this.lenderData.feeManagement.additionalCredits.reduce((a, b) => a + this.removeMoneyMask(b.amount), 0))}` : '';
    }

    get totalOfOtherCredits() {
        const total = (this.removeMoneyMask(this.lenderData.feeManagement.totalPaidClosingCosts) +
            this.removeMoneyMask(this.lenderData.feeManagement.totalOtherAssets) +
            (this.removeMoneyMask(this.sumAdditionalCredits)));
        return total ? `$${moneyMask(total)}` : '';
    }

    get totalCredits() {
        const total = (this.removeMoneyMask(this.totalOfOtherCredits) +
            this.removeMoneyMask(this.lenderData.feeManagement.sellerCredits));
        return total ? `$${moneyMask(total)}` : '';
    }

    get lessTotalAndTotalCredits() {
        const total = (this.removeMoneyMask(this.lenderData.selectedProduct.totalLoanAmount) +
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

    get cashClassName() {
        const commom = "slds-form-element__static";
        return this.isNegativeCash ? commom : `${commom} slds-text-color_error`;
    }

    get cash() {
        const sign = this.isNegativeCash ? '-' : '';
        return this.cashAmount ? `${sign}$${moneyMask(this.cashAmount)}` : '$0.00';
    }

    get cashLabel() {
        return this.isNegativeCash ? "Cash to the Borrower" : "Cash from the Borrower";
    }
}