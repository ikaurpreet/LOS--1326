import { api, wire, track } from 'lwc';
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import HardCreditPullChannel from '@salesforce/messageChannel/HardCreditPullChannel__c';
import SubmissionChannel from '@salesforce/messageChannel/SubmissionChannel__c';
import { moneyMask } from 'c/inputMaskUtils';
import BaseComponent from 'c/baseComponent';
import { liabilityOwner, otherAccountType, SectionId } from 'c/util';

import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';

import { default as viewMode } from './templates/view.html';

/**
 * @typedef {"borrower" | "coBorrower"} RoleOption
 */

/**
 * Assets and Liabilities Summary section
 * @module c-mortgage-los-other-liabilities
 * @property {string} recordId - Opportunity Id
 * @property {RoleOption} role - Role of Participant
 * @property {variant} variant - Specifies a variant class to use
 */


export default class MortgageLosOtherLiabilities extends BaseComponent {
    @api showBothParticipants;
    @api participantUuid;

    @track liabilities = [];
    @track borrowerUuid;
    @track coBorrowerUuid;
    get showBorrower() {
        return this.role === "borrower";
    }

    get showCoBorrower() {
        return this.role === "coBorrower";
    }

    submissionCallback = (result) => {
        if (result) {
            let allLiabilities = [];
            if (this.showCoBorrower || this.showBothParticipants) {
                allLiabilities = [...result.coBorrower.liabilities];
                this.coBorrowerUuid = result.coBorrower.uuid;
            }
            if (this.showBorrower || this.showBothParticipants) {
                allLiabilities = [...allLiabilities, ...result.borrower.liabilities];
                this.borrowerUuid = result.borrower.uuid;
            }
            this.liabilities = allLiabilities.map((liability, index) => {
                const owner = liabilityOwner.find(owner => owner.value === liability.whose);
                const ownerLabel = owner ? owner.label : '';
                const _otherAccountType = otherAccountType.find(type => type.value === liability.accountType);
                return {
                    ...liability,
                    whoseLabel: ownerLabel,
                    unpaidBalanceWithMask: liability.unpaidBalance === null ? '' : `$${moneyMask(liability.unpaidBalance.toFixed(2))}`,
                    monthlyPaymentWithMask: liability.monthlyPayment === null ? '' : `$${moneyMask(liability.monthlyPayment.toFixed(2))}`,
                    paidOffAmountWithMask: liability.paidOffAmount === null ? '' : `$${moneyMask(liability.paidOffAmount.toFixed(2))}`,
                    creditLimitWithMask: liability.creditLimit === null ? '' : `$${moneyMask(liability.creditLimit.toFixed(2))}`,
                    accountTypeLabel: _otherAccountType ? _otherAccountType.label : liability.accountType
                };
            });
            const otherAccountTypes = ['alimony', 'childSupport', 'jobRelatedExpenses', 'other', 'separateMaintenanceExpense'];
            this.liabilities = this.liabilities.filter(liability => otherAccountTypes.includes(liability.accountType));
            this.liabilities = this.liabilities.sort((a, b) => b.unpaidBalance - a.unpaidBalance);
            this.sectionController.showContent();
            return;
        }
        this.sectionController.showError();
    }

    /**
    * Implmentation of "virtual" method to retrieve initial data set
    */
    loadSubmissionData() {
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    connectedCallback() {
        this.subscribeToHardCreditPullChannel();
    }

    mutationCallback(result) {
        publish(this.messageContext, SubmissionChannel, { id: this.opportunity.id });
        this.publishMessage(SectionId.LIABILITIES);
        this.submissionCallback(result);
    }

    handleSaveClick = (variables) => {
        this.sectionController.hideContent();
        const owner = variables.whose !== 'both' ? (variables.whose === 'co_borrower' ? "coBorrower" : "borrower") : 'borrower';
        this.updateParticipant(this.mutationCallback.bind(this), { [owner]: { ...variables } }, { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION });
    }

    @wire(MessageContext)
    messageContext;

    subscribeToHardCreditPullChannel = () => {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.messageContext, HardCreditPullChannel, (message) => {
            switch (message.requestStatus) {
                case 'STARTED':
                    this.sectionController.hideContent();
                    break;
                case 'COMPLETED':
                    this.loadSubmissionData();
                    break;
                default:
                    console.log('Unknown request status: ' + message.requestStatus);
                    this.sectionController.showError();
            }
        });
    }

    render() {
        return viewMode;
    }
}