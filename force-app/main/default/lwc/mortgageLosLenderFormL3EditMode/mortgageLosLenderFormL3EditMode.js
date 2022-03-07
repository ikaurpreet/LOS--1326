import { LightningElement, api, track } from 'lwc';
import { moneyToFloat, MAX_AMOUNT_VALUE } from 'c/util';
import { moneyMask } from 'c/inputMaskUtils';
import { loanType, amortizationType } from 'c/util';

export default class MortgageLosLenderFormL3EditMode extends LightningElement {
    @track data;
    @api isPurchase;

    @api
    set lenderData(value) {
        this.data = {
            ...value,
            property: {
                ...value.property,
                estimatedValueWithMask: (value.property.estimatedValue) ? `$${moneyMask(value.property.estimatedValue.toFixed(2))}` : '',
                monthlyHomeownersFeeWithMask: value.property.monthlyHomeownersFee ? `$${moneyMask(value.property.monthlyHomeownersFee.toFixed(2))}` : '',
                monthlyTaxesWithMask: value.property.monthlyTaxes ? `$${moneyMask(value.property.monthlyTaxes.toFixed(2))}` : '',
                monthlyInsuranceFeeWithMask: value.property.monthlyInsuranceFee ? `$${moneyMask(value.property.monthlyInsuranceFee.toFixed(2))}` : '',
                otherMonthlyCostsWithMask: value.property.otherMonthlyCosts ? `$${moneyMask(value.property.otherMonthlyCosts.toFixed(2))}` : '',
                resubordinatedLiensWithMask: value.property.resubordinatedLiens ? `$${moneyMask(value.property.resubordinatedLiens.toFixed(2))}` : ''
            },
            selectedProduct: {
                ...value.selectedProduct,
                pmiMonthlyPaymentWithMask: value.selectedProduct.pmiMonthlyPayment ? `$${moneyMask(value.selectedProduct.pmiMonthlyPayment.toFixed(2))}` : '',
                totalLoanAmountWithMask: value.selectedProduct.totalLoanAmount ? `$${moneyMask(value.selectedProduct.totalLoanAmount.toFixed(2))}` : '',
                principalInterestWithMask: value.selectedProduct.principalInterest ? `$${moneyMask(value.selectedProduct.principalInterest.toFixed(2))}` : '',
                qualifyingInterestRate: value.selectedProduct.qualifyingInterestRate ? parseFloat(parseFloat(value.selectedProduct.qualifyingInterestRate).toFixed(3)) : null,
                rate: value.selectedProduct.rate ? parseFloat(parseFloat(value.selectedProduct.rate).toFixed(3)) : null
            }
        }
    };

    get lenderData() {
        return this.data;
    }

    get showQualRate() {
        return this.lenderData.selectedProduct.amortizationType === "ARM";
    }

    get showDueIn() {
        return this.lenderData.selectedProduct.amortizationType === "ARM";
    }

    get loanTypeOptions() {
        return loanType;
    }

    get amortizationTypeOptions() {
        return amortizationType;
    }

    removeMoneyMask = (value) => {
        return moneyToFloat(value.replace(/\D/g, ''));
    }

    handleChange = (event) => {
        const input = {
            propertyName: event.target.getAttribute("data-name-input"),
            value: event.target.value,
        }
        this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }));
    }

    get total() {
        const total = (this.removeMoneyMask(this.lenderData.selectedProduct.principalInterestWithMask) +
            this.removeMoneyMask(this.lenderData.property.resubordinatedLiensWithMask) +
            this.removeMoneyMask(this.lenderData.property.monthlyInsuranceFeeWithMask) +
            this.removeMoneyMask(this.lenderData.property.monthlyTaxesWithMask) +
            this.removeMoneyMask(this.lenderData.selectedProduct.pmiMonthlyPaymentWithMask) +
            this.removeMoneyMask(this.lenderData.property.monthlyHomeownersFeeWithMask) +
            this.removeMoneyMask(this.lenderData.property.otherMonthlyCostsWithMask));
        return total ? `$${moneyMask(total)}` : '';
    }

    getValue = (fieldName) => {
        const propertyNameArray = fieldName.split('.');
        const lastProperty = propertyNameArray.pop();
        let changeObj = this.lenderData;
        if (propertyNameArray.length > 0) {
            changeObj = propertyNameArray.reduce((o, i) => o[i], this.lenderData);
        }
        return changeObj[lastProperty];
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
}