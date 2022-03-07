import { LightningElement, wire, api, track} from 'lwc';
import getRates from '@salesforce/apex/GetRelatedRecordsLOC.getRates';
import getPex from '@salesforce/apex/GetRelatedRecordsLOC.getPex';

import MORTGAGE_PRODUCT from '@salesforce/schema/Opportunity.mortgage_Product__c';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';
import LENDER_ACCOUNT from '@salesforce/schema/Opportunity.Lender_Account__c';
import MORTGAGE_CASH_OUT_REFINANCE from '@salesforce/schema/Opportunity.mortgage_Cash_Out_Refinance__c';
import RATE from '@salesforce/schema/Opportunity.Rate__c';
import FORM_COMPLETED_DATE from '@salesforce/schema/Opportunity.form_completed_date__c';
import TERM from '@salesforce/schema/Opportunity.Term__c';
import MONTHLY_PAYMENT from '@salesforce/schema/Opportunity.Monthly_Payment__c';
import REQUESTED_LOAN_AMOUNT from '@salesforce/schema/Opportunity.requested_loan_amount__c';
import TOTAL_REPAYMENT from '@salesforce/schema/Opportunity.Total_Repayment__c';
import LOCK_LOAN_DATE from '@salesforce/schema/Opportunity.Lock_Loan_Date__c';
import LOCK_EXPIRATION_DATE from '@salesforce/schema/Opportunity.Lock_Expiration_Date__c';
import TASK_SHEET from '@salesforce/schema/Opportunity.Task_Sheet__c';

const actions = [
    { label: 'View', name: 'view' },
];

export default class MortgageLosLoan extends LightningElement {
    @api idfromparent2;
    fields = [MORTGAGE_PRODUCT, SUBMISSION_TYPE, LENDER_ACCOUNT, MORTGAGE_CASH_OUT_REFINANCE, RATE, FORM_COMPLETED_DATE, TERM, MONTHLY_PAYMENT,
        REQUESTED_LOAN_AMOUNT, TOTAL_REPAYMENT, LOCK_LOAN_DATE, LOCK_EXPIRATION_DATE, TASK_SHEET];
    @track rateColumns = [
        {
            label: 'Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: 'Rate',
            fieldName: 'Rate__c',
            type: 'percent',
            sortable: true,
            typeAttributes: {
                minimumFractionDigits: 4
            }
        },
        {
            label: 'Term',
            fieldName: 'Term__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Lender',
            fieldName: 'Lender__c',
            type: 'text',
            sortable: true

        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];
    @track peColumns = [
        {
            label: 'Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: 'New Fee %',
            fieldName: 'New_Fee__c',
            type: 'percent',
            sortable: true,
            typeAttributes: {
                minimumFractionDigits: 3
            }
        },
        {
            label: 'New Fee Amount',
            fieldName: 'New_Fee_Amount__c',
            type: 'currency',
            sortable: true,
            typeAttributes: {
                minimumFractionDigits: 2
            }
        },
        {
            label: 'Approval Status',
            fieldName: 'Approval_Status__c',
            type: 'text',
            sortable: true

        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];

    @track showRateTable = false;
    @track showPETable = false;
    @track rateItems = [];
    @track peItems = [];

    @wire(getRates, {oppId:'$idfromparent2'})
    wiredRates({
        error,
        data
    }) {
        if (data) {
            data.forEach(rate => {
                const newRate = {
                    Id: rate.Id,
                    New_Fee__c: rate.New_Fee__c,
                    Name: rate.Name,
                    nameUrl: '/' + rate.Id,
                    Opportunity__c: rate.Opportunity__c,
                    Rate__c: rate.Rate__c/100.0,
                    Term__c: rate.Term__c
                }

                this.rateItems.push(newRate);
            });

            this.error = undefined;
            this.showRateTable = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    @wire(getPex, {oppId:'$idfromparent2'})
    wiredPex({
        error,
        data
    }) {
        if (data) {
            data.forEach(pe => {
                const newPe = {
                    Id: pe.Id,
                    Name: pe.Name,
                    nameUrl: '/' + pe.Id,
                    New_Fee__c: pe.New_Fee__c || 0.0,
                    New_Fee_Amount__c: pe.New_Fee_Amount__c || 0.0,
                    Approval_Status__c: pe.Approval_Status__c
                }

                this.peItems.push(newPe);
            });

            this.error = undefined;
            this.showPETable = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }


}