import { LightningElement, api, track } from 'lwc';
import { moneyMask } from 'c/inputMaskUtils';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import { COUNTY_CODES_QUERY } from './queries.js';
import {
    constructionMethod,
    occupancyTypes,
    unitNumbers,
    loanPurpose,
    moneyToFloat,
    loanType,
    propertyTypes,
    DATA_NAME_INPUT,
    ELEMENT_TYPE_CHECKBOX,
    EDIT_PARTICIPANT_EVENT_NAME,
    applyMoneyMaskValue,
    states
} from 'c/util';

/**
 * Loan and Property View Mode
 * @module c-mortgage-los-loan-and-property-edit-mode
 * @property {Object} loanAndProperty - Loan and Property data
 */
export default class MortgageLosLoanAndPropertyEditMode extends LightningElement {
    @api loanAndProperty;
    @api recordId;

    @track countyCodes;


    BorrowerIconURL = BorrowerSR;

    /**
     * Callback for query callout to get counties based on state
     * @param {Object} result The results from the query callout 
     */
    countyCodeCallback(result) {
        this.countyCodes = null;
        if (result !== null) {
            this.countyCodes = result.map((item) => {
                return { label: item.name, value: item.fipsCountyCode }
            });
        }
    }

    /**
     * Retrieves county codes from the backend based on selected state
     * @param {Queries} stateCode - state to retrieve counties for
     * @param {function} countyCodeCallback - callback function
     */
    getCountyCodes(stateCode, countyCodeCallback) {
        const promise = queryWithMap({ identifier: this.recordId, query: COUNTY_CODES_QUERY, variables: { args: { stateCode: stateCode } } });
        promise.then(data => {
            const result = JSON.parse(data);
            countyCodeCallback(result);
        }).catch(error => {
            countyCodeCallback(null);
        })
    }

    connectedCallback() {
        this.getCountyCodes(this.loanAndProperty.property.address.stateCode, this.countyCodeCallback.bind(this));
    }

    /**
     * Returns whether loan purpose is editable or not
     * @returns {Boolean} loan purpose is disabled if vertical is purchase
     */
    get loanPurposeDisabled() {
        return this.loanAndProperty.vertical === 'purchase';
    }

    /**
     * Returns options for combo boxes
     * @returns {Object} Options for combo boxes
     */
    get options() {
        return {
            states,
            constructionMethod,
            unitNumbers,
            occupancyTypes,
            loanType,
            propertyTypes,
            loanPurpose: loanPurpose.filter(lp => lp.vertical === this.loanAndProperty.vertical)
        };
    }

    /**
     * Returns formatted monetary values
     * @returns {Object} Formatted monetary values
     */
    get moneyValues() {
        return {
            totalLoanAmount: applyMoneyMaskValue(this.loanAndProperty.selectedProduct.totalLoanAmount),
            pmiMonthlyPayment: applyMoneyMaskValue(this.loanAndProperty.selectedProduct.pmiMonthlyPayment),
            estimatedValue: applyMoneyMaskValue(this.loanAndProperty.property.estimatedValue),
            appraisedValue: applyMoneyMaskValue(this.loanAndProperty.property.appraisedValue)
        };
    }

    /**
     * Dispatches change event to parent component.
     * @param {String, Boolean, Float} value The new value.
     * @param {String} propertyName The property to assign the value to.
     */
    sendEventToParent = (value, propertyName) => {
        this.dispatchEvent(
            new CustomEvent(
                EDIT_PARTICIPANT_EVENT_NAME,
                {
                    bubbles: true,
                    detail: {
                        propertyName: propertyName,
                        value: value
                    }
                }
            )
        );
    }

    /**
     * Event handler for non-monetary onChange event.
     * @param {Event} event OnChange event.
     */
    handleInputChange(event) {
        let value = event.target.value;
        if (event.target.type === ELEMENT_TYPE_CHECKBOX) {
            value = event.target.checked;
        }
        let propertyName = event.target.getAttribute(DATA_NAME_INPUT);
        this.sendEventToParent(value, propertyName);
        if (propertyName.includes('stateCode')) {
            this.getCountyCodes(this.loanAndProperty.property.address.stateCode, this.countyCodeCallback.bind(this));
        }
    }

    /**
     * Event handler for monetary onChange event.
     * @param {Event} event OnChange event.
     */
    handleMoneyChange(event) {
        const newAmount = moneyToFloat(moneyMask(event.target.value));
        if (event.target.value !== '' && parseFloat(newAmount) > 0) {
            event.target.value = `$${moneyMask(newAmount.toFixed(2))}`;
        } else {
            event.target.value = null;
        }
        this.sendEventToParent(newAmount, event.target.getAttribute(DATA_NAME_INPUT));
    }
}