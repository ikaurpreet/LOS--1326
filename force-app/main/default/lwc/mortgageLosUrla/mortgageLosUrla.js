import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js'
import BorrowerMaritalChannel from '@salesforce/messageChannel/BorrowerMaritalStatus__c';
import { subscribe, MessageContext } from 'lightning/messageService';

class MortgageLosUrla extends LightningElement {
    @api recordId;

    @track marriedCoBorrower;
    @track separatedTab;
    @track coBorrowed;
    @track submissionReady;
    @track borrower;
    @track coBorrower;

    subscription = null;

    connectedCallback() {
        this.marriedCoBorrower = false;
        this.separatedTab = false;
        this.coBorrowed = false;
        this.submissionReady = false;
        this.handleSubscribe();
    }

    @wire(MessageContext)
    messageContext;

    handleSubscribe() {
        if (this.subscription) {
            return;
        }
        this.subscription = subscribe(this.messageContext, BorrowerMaritalChannel, (message) => {
            this.handleBorrowerMaritalStatusChanged(message.maritalType);
        });
    }

    @wire(getRecord, {
        recordId: '$recordId', fields: [
            SUBMISSION_UUID,
            SUBMISSION_TYPE,
        ]
    })
    loadSubmissionData({ data }) {
        if (data) {
            this.opportunity = data;
            this.submissionReady = false;
            getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
        }
    };

    handleBorrowerMaritalStatusChanged(maritalStatus) {
        if (maritalStatus && maritalStatus === 'marriedSameBorrower') {
            this.separatedTab = false;
            this.marriedCoBorrower = !!this.coBorrowed;
            return;
        }
        this.marriedCoBorrower = false;
        this.separatedTab = this.coBorrowed;
    }

    submissionCallback({ borrower, coBorrower }) {
        this.coBorrowed = coBorrower && coBorrower.uuid;
        if (borrower) {
            const maritalType = borrower.profile.maritalType;
            this.borrower = borrower;
            this.handleBorrowerMaritalStatusChanged(maritalType);
        }
        if (this.coBorrowed) {
            this.coBorrower = coBorrower;
        }
        this.submissionReady = true;
    }
}

const getSubmission = (opportunity, recordId, submissionCallback) => {
    const submissionUuid = getFieldValue(opportunity, SUBMISSION_UUID);
    const submissionType = getFieldValue(opportunity, SUBMISSION_TYPE);
    let gqlQuery = null;

    if (submissionType === 'MortgageRefi') {
        gqlQuery = REFINANCE_SUBMISSION_QUERY;
    } else if (submissionType === 'HomePurchase') {
        gqlQuery = PURCHASE_SUBMISSION_QUERY;
    } else {
        submissionCallback({});
        console.error('Submission is not Mortgages Refinance nor Home Purchase.');
        return;
    }

    const promise = queryWithMap({ identifier: recordId, query: gqlQuery, variables: { submissionUuid } });
    promise.then(data => {
        const result = JSON.parse(data);

        submissionCallback({
            ...result
        })
    }).catch(error => {
        console.log(error);
        submissionCallback({});
    })
}

export default MortgageLosUrla;
export {
    MortgageLosUrla,
    getSubmission,
}