import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue, getFieldDisplayValue } from 'lightning/uiRecordApi';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';

import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js'



export default class MortgagesRegistrationFlow extends LightningElement {
    @api recordId; //0062C00000Gj9niQAB

    @track submission;

    @wire(getRecord, {recordId: '$recordId', fields: [
        SUBMISSION_UUID,
        SUBMISSION_TYPE
    ]})
    wiredRecord({data}) {
        if (data) {
            const opportunity = data

            const submissionUuid = getFieldValue(opportunity, SUBMISSION_UUID);
            const submissionType = getFieldValue(opportunity, SUBMISSION_TYPE);
            let gqlQuery = null;


            if (submissionType === 'MortgageRefi') {
                gqlQuery = REFINANCE_SUBMISSION_QUERY;
            } else if (submissionType === 'HomePurchase') {
                gqlQuery = PURCHASE_SUBMISSION_QUERY;
            } else {
                console.error('Submission is not Mortgages Refinance nor Home Purchase.');
                return;
            }

            const promise = queryWithMap({identifier: this.recordId, query: gqlQuery, variables: {submissionUuid}});
            promise.then(data => {
                const result = JSON.parse(data);
                this.submission = result
                console.log(this.submission)
            }).catch(error => {
                console.log(error);
            })
        }
    };
}