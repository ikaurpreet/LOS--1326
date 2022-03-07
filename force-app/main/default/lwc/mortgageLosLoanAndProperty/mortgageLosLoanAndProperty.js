import { track, api } from 'lwc';
import BaseComponent from 'c/baseComponent';
import { emptyLoanAndProp, emptyLpSelectedProduct, emptyLpCounty, SectionId } from 'c/util';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';

import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION, RERUN_ELIGIBILITY } from './mutations.js';
import { default as editMode } from './templates/edit.html';
import { default as viewMode } from './templates/view.html';

const fieldsThatAffectEligibility = ['totalLoanAmount', 'estimatedValue', 'appraisedValue'];

/**
 * Loan and Property section
 * @module c-mortgage-los-loan-and-property
 */

export default class MortgageLosLoanAndProperty extends BaseComponent {

    @track loanAndProperty = { ...emptyLoanAndProp }

    /**
     * Boolean used to change view mode - See {@tutorial view-edit-modes}
     * @type {boolean}
     */
    @api isEditing = false;

    triggerEligibility = false; // field is reset to false when entering or exiting edit mode and after saving

    /**
    * Implmentation of "virtual" method to retrieve initial data set
    */
    loadSubmissionData() {
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    };

    /**
    * Callback function for when the element is added to the DOM
    */
    connectedCallback() {
        this.registerSubscription(
            [SectionId.LOAN_INFORMATION],
            this.loadSubmissionData
        );
    }

    /**
     * Changes the visualization to Edit mode
     */
    handleEdit = () => {
        this.isEditing = true;
        this.triggerEligibility = false;
    }

    /**
     * Changes the visualization to View mode
     */
    handleCancelClick = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        this.triggerEligibility = false;
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    /**
     * Prepares data for the mutation call to the backend
     */
    prepareChangeObject() {
        // Massage data because mutation data structure doesn't match query data structure
        return {
            loanProperty: {
                submissionUuid: this.submissionUuid,
                loanPurpose: this.loanAndProperty.loanPurpose,
                property: {
                    address: {
                        addressLine1: this.loanAndProperty.property.address.addressLine1,
                        unit: this.loanAndProperty.property.address.unit,
                        city: this.loanAndProperty.property.address.city,
                        stateCode: this.loanAndProperty.property.address.stateCode,
                        zipCode: this.loanAndProperty.property.address.zipCode,
                        fipsCountyCode: this.loanAndProperty.property.address.county.fipsCountyCode
                    },
                    yearBuilt: this.loanAndProperty.property.yearBuilt,
                    mixedUseProperty: this.loanAndProperty.property.mixedUseProperty,
                    constructionMethod: this.loanAndProperty.property.constructionMethod,
                    numberOfUnits: this.loanAndProperty.property.numberOfUnits,
                    propertyType: this.loanAndProperty.property.propertyType,
                    occupancyType: this.loanAndProperty.property.occupancyType,
                    estimatedValue: this.loanAndProperty.property.estimatedValue,
                    appraisedValue: this.loanAndProperty.property.appraisedValue
                },
                loanReview: { ...this.loanAndProperty.selectedProduct }
            }
        };
    }

    /**
     * Event handler for save button on click event
     */
    handleSaveClick = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        this.updateParticipant(
            this.mutationCallback.bind(this),
            this.prepareChangeObject(),
            { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION }
        );
    }

    /**
     * Event handler for change event coming from edit mode child component.  Updates participant's demographic info.
     * @param {CustomEvent} event Event from child component containing data to update the participant's demographic info.
     */
    handleParticipantChange(event) {
        const propertyNameArray = event.detail.propertyName.split('.');

        // if any field that affect eligibility was changed, set up the eligibility re-run message flag
        fieldsThatAffectEligibility.forEach(triggerField => {
            if (propertyNameArray.includes(triggerField)) this.triggerEligibility = true;
        });

        const lastProperty = propertyNameArray.pop();
        let changeObj = this.loanAndProperty;
        if (propertyNameArray.length > 0) {
            changeObj = propertyNameArray.reduce((o, i) => o[i], this.loanAndProperty);
        }
        changeObj[lastProperty] = event.detail.value;
        if (lastProperty === 'stateCode') {
            this.loanAndProperty.property.address.county.fipsCountyCode = null;
        }
    }

    triggerRerunEligibility() {
        queryWithMap({
            identifier: this.recordId,
            query: RERUN_ELIGIBILITY,
            variables: {
                uuid: this.submissionUuid,
                reuseData: true,
                newCreditReport: false,
                newProducts: false,
                newClosingCosts: false,
            },
        })
            .then(() => {
                this.triggerEligibility = false;
                this.publishMessage(SectionId.ELIGIBILITY_TRIGGER);
            })
            .catch(error => console.error(error));
    }

    /**
     * Callback for query callout
     * @param {Object} result The results from the query callout 
     */
    submissionCallback(result) {
        if (result) {
            this.loanAndProperty = result;
            if (this.loanAndProperty.selectedProduct === null) {
                this.loanAndProperty.selectedProduct = Object.assign({}, emptyLpSelectedProduct);
            }
            if (this.loanAndProperty.property.address.county === null) {
                this.loanAndProperty.property.address.county = Object.assign({}, emptyLpCounty);
            }
            this.sectionController.showContent();
        } else {
            this.sectionController.showError();
        }
    }

    /**
    * Callback for mutation callout
    * @param {Object} result The results from the mutation callout 
    */
    mutationCallback(result) {
        this.submissionCallback(result);
        this.publishMessage(SectionId.LOAN_INFORMATION, result);
        if (this.triggerEligibility) this.triggerRerunEligibility();
    }

    /**
     * Returns page based on whether in edit mode or not
     * @returns {Object} Page to be rendered
     */
    render() {
        return this.isEditing ? editMode : viewMode;
    }
}