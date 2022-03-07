import { api, track } from 'lwc';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import BaseComponent from 'c/baseComponent';
import { BORROWER, CO_BORROWER } from 'c/util';

import { default as editMode } from './templates/edit.html';
import { default as viewMode } from './templates/view.html';

/**
 * @typedef {"borrower" | "coBorrower"} RoleOption
 */

/**
 * Assets and Liabilities Summary section
 * @module c-mortgage-los-assets-and-liabilities-summary
 * @property {string} recordId - Opportunity Id
 * @property {RoleOption} role - Role of Participant
 * @property {variant} variant - Specifies a variant class to use
 */

export default class MortgageLosAssetsAndLiabilitiesSummary extends BaseComponent {

    @api recordId;
    @api role;
    @api variant;

    @track jointlyAssetsLiabilities;
    @track coBorrowerUuid;
    @track borrowerUuid;


    /**
    * Specifies if borrower information should be shown
    * @return {boolean} Returns true if borrower information should be shown
    */
    get showBorrower() {
        return this.role === BORROWER;
    }

    /**
    * Specifies if co-borrower information should be shown
    * @return {boolean} Returns true if co-borrower information should be shown
    */
    get showCoBorrower() {
        return this.role === CO_BORROWER;
    }

    /**
     * Boolean used to change view mode - See {@tutorial view-edit-modes}
     * @type {boolean}
     */
    @api isEditing = false;

    /**
     * Changes the visualization to Edit mode
     */
    handleEditClick = () => {
        this.isEditing = true;
    }

    /**
     * Changes the visualization to View mode
     */
    handleCancelClick = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    /**
     * Event handler for save button on click event
     */
    handleSaveClick = () => {
        if (this.jointlyAssetsLiabilities === null) {
            return this.handleCancelClick();
        }

        this.sectionController.hideContent();
        this.isEditing = false;
        let variables = {};
        if (this.showBorrower) {
            variables[BORROWER] = {
                uuid: this.borrowerUuid,
                jointly: this.jointlyAssetsLiabilities
            };
        }
        if (this.showCoBorrower) {
            variables[CO_BORROWER] = {
                uuid: this.coBorrowerUuid,
                jointly: this.jointlyAssetsLiabilities
            };
        }
        this.updateParticipant(
            this.mutationCallback.bind(this),
            variables,
            { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION }
        );
    }

    /**
     * Event handler for change event coming from edit mode child component.  Updates participant's demographic info.
     * @param {CustomEvent} event Event from child component containing data to update the participant's demographic info.
     */
    handleParticipantChange(event) {
        this.jointlyAssetsLiabilities = event.detail;
    }

    /**
    * Implmentation of "virtual" method to retrieve initial data set
    */
    loadSubmissionData() {
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    /**
     * Callback for query callout
     * @param {Object} result The results from the query callout 
     */
    submissionCallback(result) {
        if (result) {
            if (this.showCoBorrower) {
                if (result.coBorrower) {
                    this.jointlyAssetsLiabilities = result.coBorrower.jointlyAssetsLiabilities;
                    this.coBorrowerUuid = result.coBorrower.uuid;
                }
            }
            if (this.showBorrower) {
                this.jointlyAssetsLiabilities = result.borrower.jointlyAssetsLiabilities;
                this.borrowerUuid = result.borrower.uuid;
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
    }

    /**
     * Returns page based on whether in edit mode or not
     * @returns {Object} Page to be rendered
     */
    render() {
        return this.isEditing ? editMode : viewMode;
    }
}