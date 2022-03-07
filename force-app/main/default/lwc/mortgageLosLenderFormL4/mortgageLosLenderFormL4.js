import { api, track } from 'lwc';
import BaseComponent from 'c/baseComponent';
import { default as viewMode } from './templates/view.html';
import { default as editMode } from './templates/edit.html';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import { lenderFormL4, emptyL4SelectedProduct, SectionId, emptyFeeManagement } from 'c/util';

export default class MortgageLosLenderFormL4 extends BaseComponent {
    @api role;
    @api showBothParticipants;

    @api isEditing = false;
    @track lenderData = { ...lenderFormL4 };

    connectedCallback() {
        this.registerSubscription([SectionId.LIABILITIES, SectionId.LOAN_INFORMATION], this.loadSubmissionData);
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
            this.lenderData = { ...result };
            if (this.lenderData.selectedProduct === null) {
                this.lenderData.selectedProduct = Object.assign({}, emptyL4SelectedProduct);
            }
            if (this.lenderData.feeManagement === null) {
                this.lenderData.feeManagement = { ...emptyFeeManagement }
            }

            const creditCardsAndOtherDebts = (result.borrower?.creditCardsAndOtherDebts || 0) + (result.coBorrower?.creditCardsAndOtherDebts || 0);
            if (creditCardsAndOtherDebts) this.lenderData.creditCardsAndOtherDebts = creditCardsAndOtherDebts;

            this.sectionController.showContent();
        } else {
            this.sectionController.showError();
        }
    }

    loadSubmissionData() {
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    prepareChangeObject = () => {
        var lenDat = {
            args: {
                submissionUuid: this.submissionUuid,
                estimatedValue: this.lenderData.property.estimatedValue,
                feeManagement: { ...this.lenderData.feeManagement },
                ...this.lenderData.selectedProduct
            }
        }

        if (this.isRefiSubmission) {
            delete lenDat.args.estimatedValue;
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

    mutationCallback(result) {
        this.submissionCallback(result);
        this.publishMessage(SectionId.LOAN_INFORMATION, result);
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

    render() {
        return this.isEditing ? editMode : viewMode;
    }
}