import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import ENCOMPASS_LOAN_NUMBER from '@salesforce/schema/Opportunity.Encompass_Loan_Number__c';
import ESCROW from '@salesforce/schema/Opportunity.Escrow__c';
import EXTERNAL_ID from '@salesforce/schema/Opportunity.External_ID__c';
import SHORTENED_LENDER_ID from '@salesforce/schema/Opportunity.Shortened_Lender_Id__c';
import APPRAISAL_ID from '@salesforce/schema/Opportunity.Appraisal_Id__c';
import TITLE_ID from '@salesforce/schema/Opportunity.Title_Id__c';
import SETTLEMENT_FILE_NUMBER from '@salesforce/schema/Opportunity.Settlement_File_Number__c';
import INSURANCE_POLICY_NUMBER from '@salesforce/schema/Opportunity.Insurance_Policy_Number__c';
import SUBMISSION_HUMAN_ID from '@salesforce/schema/Opportunity.Submission_Human_Id__c';

export default class MortgageLosExternalIds extends LightningElement {
    @api idfromparent2;
    @track isLoading = false;
    @track buttonEnabled = true;
    fields = [ENCOMPASS_LOAN_NUMBER, ESCROW, EXTERNAL_ID, SHORTENED_LENDER_ID, APPRAISAL_ID, TITLE_ID,
        SETTLEMENT_FILE_NUMBER, INSURANCE_POLICY_NUMBER, SUBMISSION_HUMAN_ID];
}