import { api, wire, track } from 'lwc';
import { getFieldValue } from 'lightning/uiRecordApi';
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';
import mutateWithMap from '@salesforce/apex/GraphQLProxyController.mutateWithMap';
import HardCreditPullChannel from '@salesforce/messageChannel/HardCreditPullChannel__c';
import SubmissionChannel from '@salesforce/messageChannel/SubmissionChannel__c';
import BaseComponent from 'c/baseComponent';
import { moneyMask } from 'c/inputMaskUtils';
import { liabilityOwner, accountType, SectionId } from 'c/util';

import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import { REFINANCE_IMPORT_LIABILITIES_MUTATION, PURCHASE_IMPORT_LIABILITIES_MUTATION } from './importLiabilities.js';

import { default as viewMode } from './templates/view.html';

export default class MortgageLosLiabilities extends BaseComponent {
    @api role;
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
                const _accountType = accountType.find(type => type.value === liability.accountType);
                return {
                    ...liability,
                    whoseLabel: ownerLabel,
                    unpaidBalanceWithMask: liability.unpaidBalance === null ? '' : `$${moneyMask(liability.unpaidBalance.toFixed(2))}`,
                    monthlyPaymentWithMask: liability.monthlyPayment === null ? '' : `$${moneyMask(liability.monthlyPayment.toFixed(2))}`,
                    paidOffAmountWithMask: liability.paidOffAmount === null ? '' : `$${moneyMask(liability.paidOffAmount.toFixed(2))}`,
                    accountTypeLabel: _accountType ? _accountType.label : liability.accountType
                };
            });
            const otherAccountTypes = ['alimony', 'childSupport', 'jobRelatedExpenses', 'other', 'separateMaintenanceExpense'];
            const _liabilities = this.liabilities.filter(liability => !otherAccountTypes.includes(liability.accountType));
            this.liabilities = _liabilities.sort((a, b) => b.unpaidBalance - a.unpaidBalance);
            this.sectionController.showContent();
            return;
        }
        this.sectionController.showError();
    }

    connectedCallback() {
        this.subscribeToHardCreditPullChannel();
    }

    loadSubmissionData() {
        this.getSubmission(this.submissionCallback, { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
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

    runImportLiabilities = () => {
        this.sectionController.hideContent();
        this.importLiabilities(this.submissionCallback, { borrowerUuid: this.borrowerUuid, coBorrowerUuid: this.coBorrowerUuid }, { REFINANCE_IMPORT_LIABILITIES_MUTATION, PURCHASE_IMPORT_LIABILITIES_MUTATION });
    }

    importLiabilities(mutationCallback, variables, mutations) {
        const submissionType = getFieldValue(this.opportunity, SUBMISSION_TYPE);
        let gqlQuery = null;

        if (!mutations || (!mutations.REFINANCE_IMPORT_LIABILITIES_MUTATION && !mutations.PURCHASE_IMPORT_LIABILITIES_MUTATION)) {
            console.error('No query provided');
            return;
        }
        if (submissionType === 'MortgageRefi') {
            gqlQuery = mutations.REFINANCE_IMPORT_LIABILITIES_MUTATION;
        } else if (submissionType === 'HomePurchase') {
            gqlQuery = mutations.PURCHASE_IMPORT_LIABILITIES_MUTATION;
        } else {
            mutationCallback({});
            console.error('Submission is not Mortgages Refinance nor Home Purchase.');
            return;
        }

        const promise = mutateWithMap({ identifier: this.recordId, query: gqlQuery, variables: variables });
        promise.then(data => {
            const result = JSON.parse(data);
            mutationCallback(result)
        }).catch(error => {
            console.log(error);
            mutationCallback(null);
        })
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
                    this.getSubmission(this.submissionCallback, { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
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