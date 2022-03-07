import { api, track } from 'lwc';
import BaseComponent from 'c/baseComponent';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import { default as viewMode } from './templates/view.html';
import { default as editMode } from './templates/edit.html';
import { lenderFormL1, emptyL1SelectedProduct, SectionId } from 'c/util';

export default class MortgageLosLenderFormL1 extends BaseComponent {
    @api role;
    @api showBothParticipants;
    @track lenderData = { ...lenderFormL1 };

    @api isEditing = false;

    /**
    * Callback function for when the element is added to the DOM
    */
    connectedCallback() {
        this.registerSubscription(
            [SectionId.LOAN_INFORMATION, SectionId.LIABILITIES, SectionId.REFI_PROPERTY],
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

    submissionCallback(result) {
        if (result) {
            this.lenderData = result;
            if (this.lenderData.selectedProduct === null) {
                this.lenderData.selectedProduct = Object.assign({}, emptyL1SelectedProduct);
            }
            this.sectionController.showContent();
        } else {
            this.sectionController.showError();
        }
    }

    prepareChangeObject() {
        var lenDat = {
            loanProperty: {
                submissionUuid: this.submissionUuid,
                loanPurpose: this.lenderData.loanPurpose,
                property: { ...this.lenderData.property },
                loanReview: { ...this.lenderData.selectedProduct }
            }
        };
        if (this.isRefiSubmission) {
            delete lenDat.loanProperty.property.dateOfPurchase;
            delete lenDat.loanProperty.property.originalPurchasePrice;
            delete lenDat.loanProperty.property.estimatedLiensToBePaidOff;
            lenDat.loanProperty.property.saleDate = this.lenderData.property.dateOfPurchase;
            lenDat.loanProperty.property.salePrice = this.lenderData.property.originalPurchasePrice;
        }
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

    handleParticipantChange(event) {
        const propertyNameArray = event.detail.propertyName.split('.');
        const lastProperty = propertyNameArray.pop();
        let changeObj = this.lenderData;
        if (propertyNameArray.length > 0) {
            changeObj = propertyNameArray.reduce((o, i) => o[i], this.lenderData);
        }
        changeObj[lastProperty] = event.detail.value;
    }

    mutationCallback(result) {
        this.submissionCallback(result);
        this.publishMessage(SectionId.LOAN_INFORMATION, result);
        this.publishMessage(SectionId.REFI_PROPERTY);
    }

    loadSubmissionData() {
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    render() {
        return this.isEditing ? editMode : viewMode;
    }

}