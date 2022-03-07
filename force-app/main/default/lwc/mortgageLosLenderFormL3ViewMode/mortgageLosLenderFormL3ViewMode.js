import { LightningElement, api, track } from 'lwc';
import { moneyMask } from 'c/inputMaskUtils';
import { moneyToFloat, loanType, getOptionLabelFromValues, amortizationType } from 'c/util';

export default class MortgageLosLenderFormL3ViewMode extends LightningElement {
    @api handleEdit;
    @api isPurchase;
    @track data;

    @api
    set lenderData(value) {
        this.data = {
            ...value,
            property: {
                ...value.property,
                estimatedValueWithMask: (value.property.estimatedValue && this.isPurchase) ? `$${moneyMask(value.property.estimatedValue.toFixed(2))}` : '',
                monthlyHomeownersFeeWithMask: value.property.monthlyHomeownersFee ? `$${moneyMask(value.property.monthlyHomeownersFee.toFixed(2))}` : '',
                monthlyTaxesWithMask: value.property.monthlyTaxes ? `$${moneyMask(value.property.monthlyTaxes.toFixed(2))}` : '',
                monthlyInsuranceFeeWithMask: value.property.monthlyInsuranceFee ? `$${moneyMask(value.property.monthlyInsuranceFee.toFixed(2))}` : '',
                otherMonthlyCostsWithMask: value.property.otherMonthlyCosts ? `$${moneyMask(value.property.otherMonthlyCosts.toFixed(2))}` : '',
                resubordinatedLiensWithMask: value.property.resubordinatedLiens ? `$${moneyMask(value.property.resubordinatedLiens.toFixed(2))}` : ''
            },
            selectedProduct: {
                ...value.selectedProduct,
                loanType: getOptionLabelFromValues(loanType, value.selectedProduct.loanType),
                amortizationType: getOptionLabelFromValues(amortizationType, value.selectedProduct.amortizationType),
                armFixedTermWithMask: value.selectedProduct.armFixedTerm ? `${value.selectedProduct.armFixedTerm} years` : '',
                loanTermWithMask: value.selectedProduct.loanTerm ? `${value.selectedProduct.loanTerm} years` : '',
                pmiMonthlyPaymentWithMask: value.selectedProduct.pmiMonthlyPayment ? `$${moneyMask(value.selectedProduct.pmiMonthlyPayment.toFixed(2))}` : '',
                qualifyingInterestRateWithMask: value.selectedProduct.qualifyingInterestRate
                    ? `${parseFloat(parseFloat(value.selectedProduct.qualifyingInterestRate).toFixed(3))}%`
                    : '',
                rateWithMask: value.selectedProduct.rate
                    ? `${parseFloat(parseFloat(value.selectedProduct.rate).toFixed(3))}%`
                    : '',
                totalLoanAmountWithMask: value.selectedProduct.totalLoanAmount ? `$${moneyMask(value.selectedProduct.totalLoanAmount.toFixed(2))}` : '',
                principalInterestWithMask: value.selectedProduct.principalInterest ? `$${moneyMask(value.selectedProduct.principalInterest.toFixed(2))}` : ''
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

    removeMoneyMask = (value) => {
        return moneyToFloat(value.replace(/\D/g, ''));
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
}