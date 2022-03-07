import { api, track } from 'lwc';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import { default as viewMode } from './templates/view.html';
import BaseComponent from 'c/baseComponent';
import { SectionId } from 'c/util'

/**
 * @typedef module:c-mortgage-los-income-from-other-sources.Income
 * @property {float} amount - Amount
 * @property {string} incomeType - Income type
 */

/**
 * Participant employment
 * @typedef ParticipantIncome
 * @property {string} ssn - SSN
 * @property {string} uuid - UUID
 * @property {module:c-mortgage-los-income-from-other-sources.Income[]} incomes - Incomes
 */

/**
 * @typedef module:c-mortgage-los-income-from-other-sources.IncomeSources
 * @property {ParticipantIncome} borrower - Borrower Incomes
 * @property {ParticipantIncome} coBorrower - Co-Borrower Incomes
 */

/**
 * Participant Form
 * @module c-mortgage-los-income-from-other-sources
 * @property {string} recordId - Opportunity Id
 * @property {RoleOption} role - Role of Participant
 * @property {boolean} showBothParticipants - Used to show both forms
*/
export default class MortgageLosIncomeFromOtherSources extends BaseComponent {
    @api role;
    @api showBothParticipants;

    /**
     * @type {module:c-mortgage-los-income-from-other-sources.IncomeSources}
     */
    @track incomeSources;

    get showBorrower() {
        return this.role === "borrower" || this.showBothParticipants;
    }

    get showCoBorrower() {
        return this.role === "coBorrower" || this.showBothParticipants;
    }

    /**
     * Implmentation of "virtual" method to retrieve initial data set
     */
    loadSubmissionData() {
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    submissionCallback(result) {
        if (result) {
            this.incomeSources = result;
            this.sectionController.showContent();
        } else {
            this.sectionController.showError();
        }
    }

    mutationCallback = (result) => {
        this.submissionCallback(result);
        this.publishMessage(SectionId.OTHER_INCOME, result);
    }

    handleSaveClick = (income, load = true) => {
        const section = this.template.querySelector('c-mortgage-los-income-from-other-sources-view-mode');
        if (section && section.validate) {
            if (load) {
                this.sectionController.hideContent();
            }
            const variables = {
                [income.ownerValue]: {
                    uuid: income.uuid,
                    otherIncome: {
                        incomeType: income.incomeValue,
                        amount: income.amount ? parseFloat(income.amount.toString().replaceAll(',', '')) : null,
                        paymentTermType: 'perMonth',
                        delete: income.delete
                    }
                }
            };
            const callback = load ? this.mutationCallback.bind(this) : () => { };
            this.updateParticipant(
                this.mutationCallback.bind(this),
                variables,
                { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION }
            );
            return true;
        }
        return false;
    }

    render() {
        return viewMode;
    }
}