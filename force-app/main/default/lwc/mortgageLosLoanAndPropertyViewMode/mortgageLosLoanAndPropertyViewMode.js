import { LightningElement, api } from 'lwc';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import {
    isAbleToEdit,
    getFullAddress,
    constructionMethod,
    occupancyTypes,
    unitNumbers,
    loanPurpose,
    loanType,
    propertyTypes,
    getOptionLabelFromValues,
    applyMoneyMaskValue
} from 'c/util';

/**
 * Loan and Property View Mode
 * @module c-mortgage-los-loan-and-property-view-mode
 * @property {Object} loanAndProperty - Loan and Property data
 * @property {function} handleEdit - The callback function to change to Edit mode
 */

export default class MortgageLosLoanAndPropertyViewMode extends LightningElement {
    @api loanAndProperty;
    @api handleEdit;

    BorrowerIconURL = BorrowerSR;
    editClass = isAbleToEdit

    get loanPurposeHandleEdit() {
        if(this.loanAndProperty.vertical === 'purchase') {
            return null;
        }
        return this.handleEdit;
    }

    /**
     * Returns data formatted for display
     * @returns {Object} Page to be rendered
     */
    get labels() {
        return {
            numberOfUnits: getOptionLabelFromValues(unitNumbers, this.loanAndProperty.property.numberOfUnits),
            constructionMethod: getOptionLabelFromValues(constructionMethod, this.loanAndProperty.property.constructionMethod),
            propertyType: getOptionLabelFromValues(propertyTypes, this.loanAndProperty.property.propertyType),
            occupancyType: getOptionLabelFromValues(occupancyTypes, this.loanAndProperty.property.occupancyType),
            loanPurpose: getOptionLabelFromValues(loanPurpose, this.loanAndProperty.loanPurpose),
            loanType: getOptionLabelFromValues(loanType, this.loanAndProperty.selectedProduct.loanType),

            totalLoanAmount: applyMoneyMaskValue(this.loanAndProperty.selectedProduct.totalLoanAmount),
            pmiMonthlyPayment: applyMoneyMaskValue(this.loanAndProperty.selectedProduct.pmiMonthlyPayment),
            estimatedValue: applyMoneyMaskValue(this.loanAndProperty.property.estimatedValue),
            appraisedValue: applyMoneyMaskValue(this.loanAndProperty.property.appraisedValue)
        }
    }

    /**
     * Returns formatted address
     * @returns {String} Formatted address
     */
    get fullAddress() {
        if (this.loanAndProperty.property.address) {
            return getFullAddress(this.loanAndProperty.property.address);
        } else {
            return "";
        }
    }

}