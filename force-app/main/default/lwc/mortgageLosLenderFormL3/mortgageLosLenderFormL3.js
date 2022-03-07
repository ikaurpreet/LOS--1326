import { api, track } from 'lwc';
import BaseComponent from 'c/baseComponent';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import { default as viewMode } from './templates/view.html';
import { default as editMode } from './templates/edit.html';
import { lenderFormL3, getOptionLabelFromValues, SectionId } from 'c/util';

const amortizationType = [
    { value: "ARM", label: "arm" },
    { value: "Fixed", label: "fixed" }
]

export default class MortgageLosLenderFormL3 extends BaseComponent {
    @api role;
    @api showBothParticipants;

    @api isEditing = false;
    @track lenderData = { ...lenderFormL3 };

    /**
    * Callback function for when the element is added to the DOM
    */
    connectedCallback() {
        this.registerSubscription(
            [SectionId.LOAN_INFORMATION, SectionId.LIABILITIES],
            this.loadSubmissionData
        );
    }

    handleEdit = () => {
        this.isEditing = true;
    }

    handleCancelClick = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    prepareChangeObject = () => {
        var lenDat = {
            loanProperty: {
                submissionUuid: this.submissionUuid,
                property: { ...this.lenderData.property },
                loanReview: { ...this.lenderData.selectedProduct }
            }
        }
        delete lenDat.loanProperty.property.resubordinatedLiens;
        delete lenDat.loanProperty.loanReview.principalInterest;
        lenDat.loanProperty.loanReview.qualifyingInterestRate = lenDat.loanProperty.loanReview.qualifyingInterestRate
            ? parseFloat(parseFloat(lenDat.loanProperty.loanReview.qualifyingInterestRate).toFixed(3))
            : null;
        lenDat.loanProperty.loanReview.rate = lenDat.loanProperty.loanReview.rate
            ? parseFloat(parseFloat(lenDat.loanProperty.loanReview.rate).toFixed(3))
            : null;
        lenDat.loanProperty.loanReview.loanTerm = parseInt(lenDat.loanProperty.loanReview.loanTerm);
        lenDat.loanProperty.loanReview.armFixedTerm = parseInt(lenDat.loanProperty.loanReview.armFixedTerm);
        if (lenDat.loanProperty.loanReview.amortizationType !== "ARM") {
            lenDat.loanProperty.loanReview.qualifyingInterestRate = null;
            lenDat.loanProperty.loanReview.armFixedTerm = null;
        }
        lenDat.loanProperty.loanReview.amortizationType = getOptionLabelFromValues(amortizationType, lenDat.loanProperty.loanReview.amortizationType)
        return lenDat;
    }

    handleSaveClick = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        this.updateParticipant(
            this.mutationCallback.bind(this),
            this.prepareChangeObject(),
            { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION }
        );
    }

    mutationCallback(result) {
        this.submissionCallback(result);
        this.publishMessage(SectionId.LOAN_INFORMATION, result);
    }

    submissionCallback(result) {
        if (result) {
            this.lenderData = { ...result };
            this.sectionController.showContent();
        } else {
            this.sectionController.showError();
        }
    }

    handleParticipantChange(event) {
        const propertyNameArray = event.detail.propertyName.split('.');
        const lastProperty = propertyNameArray.pop();
        let changeObj = this.lenderData;
        if (propertyNameArray.length > 0) {
            changeObj = propertyNameArray.reduce((o, i) => o[i], this.lenderData);
        }
        changeObj[lastProperty] = event.detail.value;
        this.lenderData = { ...this.lenderData };
    }

    loadSubmissionData() {
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    render() {
        return this.isEditing ? editMode : viewMode;
    }
}