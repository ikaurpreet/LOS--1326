import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ACCOUNTID from '@salesforce/schema/Opportunity.AccountId';
import LONAME from '@salesforce/schema/Opportunity.Loan_Officer__c';
import COSIGNER from '@salesforce/schema/Opportunity.Cosigner__c';
import STATUS from '@salesforce/schema/Opportunity.Status__c';
import LENDER from '@salesforce/schema/Opportunity.Lender__c';
import TITLE_COMPANY from '@salesforce/schema/Opportunity.Title_Company_Account__c';
import FULL_PROPERTY_ADDRESS from '@salesforce/schema/Opportunity.Full_Property_Address__c';
import LOACK_EXPIRATION_DATE from '@salesforce/schema/Opportunity.Lock_Expiration_Date__c';
import LOAN_OFFICE_COORDINATOR from '@salesforce/schema/Opportunity.Loan_Officer_Coordinator__c';
import BORROWER_TO_DO from '@salesforce/schema/Opportunity.Borrower_To_Do__c';
import LOAN_PROCESSOR_NEW from '@salesforce/schema/Opportunity.Loan_Processor_New__c';
import CLOSING_COORDINATOR from '@salesforce/schema/Opportunity.Closing_Coordinator__c';
import CREDIBLE_EMPLOYEE from '@salesforce/schema/Opportunity.Credible_Employee__c';
import RE_KEY from '@salesforce/schema/Opportunity.Re_key__c';
import APPRAISAL_WAIVER from '@salesforce/schema/Opportunity.Appraisal_Waived__c';
import TO_DO from '@salesforce/schema/Opportunity.To_Do__c';
import COMPLEXITY_LEVEL from '@salesforce/schema/Opportunity.Complexity_Level__c';
import OWNERID from '@salesforce/schema/Opportunity.OwnerId';


export default class MortgageLosSummary extends LightningElement {
    @api idfromparent2;
    @track isLoading = false;
    @track buttonEnabled = true;

    fields = [ACCOUNTID, LONAME, COSIGNER, STATUS, LENDER, TITLE_COMPANY, FULL_PROPERTY_ADDRESS, LOAN_OFFICE_COORDINATOR, LOACK_EXPIRATION_DATE, LOAN_PROCESSOR_NEW, BORROWER_TO_DO,
        CLOSING_COORDINATOR, RE_KEY, APPRAISAL_WAIVER, TO_DO, COMPLEXITY_LEVEL, CREDIBLE_EMPLOYEE];

}