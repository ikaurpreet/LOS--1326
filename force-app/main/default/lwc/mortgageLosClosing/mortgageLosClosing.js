import { LightningElement, wire, api, track} from 'lwc';
import getClosedLoans from '@salesforce/apex/GetRelatedRecordsLOC.getClosedLoans';
import { getUrlTable } from 'c/util';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import ESCROWS from '@salesforce/schema/Opportunity.Escrows__c';
import CLOSING_COST from '@salesforce/schema/Opportunity.Closing_Cost__c';
import PREPAIDS from '@salesforce/schema/Opportunity.Prepaids__c';
import TOTAL_CASE_AT_CLOSE from '@salesforce/schema/Opportunity.Total_Cash_at_Close__c';
import CLOSING_DATE from '@salesforce/schema/Opportunity.Closing_Date__c';
import CLOSING_LOCATION from '@salesforce/schema/Opportunity.Closing_Location__c';
import CLOSING_TIME from '@salesforce/schema/Opportunity.Closing_Time_Picklist__c';
import LOCK_EXPIRATION_DATE from '@salesforce/schema/Opportunity.Lock_Expiration_Date__c';
import CLOSING_TIME_ZONE from '@salesforce/schema/Opportunity.Closing_Time_Zone__c';
import LOCK_EXPIRATION_WARNING from '@salesforce/schema/Opportunity.Lock_Expiration_Warning__c';
import DISBURSMENT_DATE from '@salesforce/schema/Opportunity.Disbursement_Date__c';
import EXCEPTION_REASON from '@salesforce/schema/Opportunity.Exception_Reason__c';
import AMOUNT from '@salesforce/schema/Opportunity.Amount';
import CREDIBLE_FEE from '@salesforce/schema/Opportunity.Credible_Fee__c';
import CLOSING_PAYMENT_METHOD from '@salesforce/schema/Opportunity.Closing_Payment_Method__c';
import CREDIBLE_FEE_AMOUNT from '@salesforce/schema/Opportunity.Credible_Fee_Amount__c';
import REVENUE from '@salesforce/schema/Opportunity.Revenue__c';
import BORROWER_PAID_AMOUNT from '@salesforce/schema/Opportunity.Borrower_Paid_Amount__c';
import TITLE_COMPANY_ACCOUNT from '@salesforce/schema/Opportunity.Title_Company_Account__c';
import LENDER_PAID_AMOUNT from '@salesforce/schema/Opportunity.Lender_Paid_Amount__c';
import ESCROW_EMAIL from '@salesforce/schema/Opportunity.Escrow_Email__c';
import CLOSED_OUT_FILE from '@salesforce/schema/Opportunity.Closed_Out_File__c';

import WITHDRAW_DATE from '@salesforce/schema/Opportunity.Withdrawn_Date__c';
import DECLINED_DATE from '@salesforce/schema/Opportunity.Declined_Date__c';
import WITHDRAW_REASON from '@salesforce/schema/Opportunity.Withdraw_Reason__c';
import REASON_FOR_DECLINE from '@salesforce/schema/Opportunity.Reason_for_Decline__c';
import WITHDRAW_BORROWWER_CONSENT from '@salesforce/schema/Opportunity.Withdraw_Borrower_Consent__c';
import NOTES_ON_DECLINE from '@salesforce/schema/Opportunity.Notes_on_Decline_Loan_Ops__c';
import WITHDRAW_REQUEST_SOURCE from '@salesforce/schema/Opportunity.Withdraw_Request_Source__c';
import CLOSED_OUT_FILE_2 from '@salesforce/schema/Opportunity.Closed_Out_File__c';
import REKEY_STATUS from '@salesforce/schema/Opportunity.Re_key_Status__c';
import REKEY_REASON_DESC from '@salesforce/schema/Opportunity.Rekey_Reason_Description__c';
import REKEY_REASON from '@salesforce/schema/Opportunity.Rekey_Reason__c';

const actions = [
    { label: 'View', name: 'view' },
];

export default class MortgageLosClosing extends LightningElement {
    @api idfromparent2;
    @track isLoading = false;
    @track buttonEnabled = true;

    fields_1 =[ESCROWS, CLOSING_COST, PREPAIDS, TOTAL_CASE_AT_CLOSE, CLOSING_DATE, CLOSING_LOCATION, CLOSING_TIME, LOCK_EXPIRATION_DATE,
        CLOSING_TIME_ZONE, LOCK_EXPIRATION_WARNING, DISBURSMENT_DATE, EXCEPTION_REASON, AMOUNT, CREDIBLE_FEE, CLOSING_PAYMENT_METHOD, CREDIBLE_FEE_AMOUNT,
        REVENUE, BORROWER_PAID_AMOUNT, TITLE_COMPANY_ACCOUNT, LENDER_PAID_AMOUNT, ESCROW_EMAIL, CLOSED_OUT_FILE];

    fields_2 = [WITHDRAW_DATE, DECLINED_DATE, WITHDRAW_REASON, REASON_FOR_DECLINE, WITHDRAW_BORROWWER_CONSENT,
        NOTES_ON_DECLINE, WITHDRAW_REQUEST_SOURCE, CLOSED_OUT_FILE_2,REKEY_REASON , REKEY_STATUS, REKEY_REASON_DESC];
    @track columns = [
        {
            label: 'Closed Loan Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: 'Offer Accepted Date',
            fieldName: 'Offer_Accepted_Date__c',
            type: 'date-local',
            typeAttributes: {
                month: "2-digit",
                day: "2-digit",
                year: 'numeric'
            },
            sortable: true
        },
        {
            label: 'Estimated Wire Amount',
            fieldName: 'Wire_Amount__c',
            type: 'currency',
            sortable: true
        },
        {
            label: 'Finance Payment',
            fieldName: 'Finance_Payment__c',
            type: 'text',
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];

    @track items = [];
    @track showTable = false;
    @wire(getClosedLoans, {oppId:'$idfromparent2'})
    wiredClosedLoans({
        error,
        data
    }) {
        if (data) {
            data.forEach(closedLoan => {
                const newClosedLoan = {
                    Id: closedLoan.Id,
                    Offer_Accepted_Date__c: closedLoan.Offer_Accepted_Date__c,
                    Name: closedLoan.Name,
                    nameUrl: '/' + closedLoan.Id,
                    Wire_Amount__c: closedLoan.Wire_Amount__c,
                    Finance_Payment__c: closedLoan.Finance_Payment__c?closedLoan.Finance_Payment__r.Name:undefined,
                }

                this.items.push(newClosedLoan);
            });
            this.items = getUrlTable(data);
            this.error = undefined;
            this.showTable = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }
}