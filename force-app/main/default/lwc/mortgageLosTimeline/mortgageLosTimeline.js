import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import MORTGAGE_APPLICATION_DATE from '@salesforce/schema/Opportunity.Mortgage_Application_Date__c';
import MORTGAGE_SUBMITTED_TO_LENDER_DATE from '@salesforce/schema/Opportunity.mortgage_Submitted_to_Lender_Date__c';
import FORM_COMPLETED_DATE from '@salesforce/schema/Opportunity.form_completed_date__c';
import INITIAL_APPROVAL_TIMESTAMP from '@salesforce/schema/Opportunity.Initial_Approval_Timestamp__c';
import LOCK_LOAN_DATE from '@salesforce/schema/Opportunity.Lock_Loan_Date__c';
import SUBMITTED_FINAL_CONDITIONS_DATE from '@salesforce/schema/Opportunity.Submitted_Final_Conditions_Date__c';
import LOCK_EXPIRATION_DATE from '@salesforce/schema/Opportunity.Lock_Expiration_Date__c';
import PRELIM_CD_REVIEW_DATE from '@salesforce/schema/Opportunity.Prelim_CD_Review_Date__c';
import CLOSING_DATE_FORMULA from '@salesforce/schema/Opportunity.Closing_Date_Formula__c';
import CTC_DATE from '@salesforce/schema/Opportunity.CTC_Date__c';
import REGISTERED_WITH_LENDER_DATE from '@salesforce/schema/Opportunity.Registered_with_Lender_Date__c';
import CD_SENT_DATE from '@salesforce/schema/Opportunity.CD_Sent_Date__c';
import LE_DATE from '@salesforce/schema/Opportunity.LE_Date__c';
import CLOSING_DATE from '@salesforce/schema/Opportunity.Closing_Date__c';
import DISCLOSURE_GENERATED_DATE from '@salesforce/schema/Opportunity.Disclosure_Generated_Date__c';
import EST_DISBURSEMENT_DATE from '@salesforce/schema/Opportunity.Est_Disbursement_Date__c';
import DISCLOSURE_UPLOAD_DATE from '@salesforce/schema/Opportunity.Disclosure_Upload_Date__c';
import DISBURSEMENT_DATE_FORMULA from '@salesforce/schema/Opportunity.Disbursement_Date_Formula__c';
import ITP_DATE from '@salesforce/schema/Opportunity.ITP_Date__c';
import DISBURSEMENT_DATE from '@salesforce/schema/Opportunity.Disbursement_Date__c';
import DECLINED_DATE from '@salesforce/schema/Opportunity.Declined_Date__c';
import WITHDRAWN_DATE from '@salesforce/schema/Opportunity.Withdrawn_Date__c';

export default class MortgageLosTimeline extends LightningElement {
    @api idfromparent2;
    @track isLoading = false;
    @track buttonEnabled = true;

    fields = [MORTGAGE_APPLICATION_DATE, MORTGAGE_SUBMITTED_TO_LENDER_DATE, FORM_COMPLETED_DATE, INITIAL_APPROVAL_TIMESTAMP, LOCK_LOAN_DATE, SUBMITTED_FINAL_CONDITIONS_DATE,
        LOCK_EXPIRATION_DATE, PRELIM_CD_REVIEW_DATE, CLOSING_DATE_FORMULA, CTC_DATE, REGISTERED_WITH_LENDER_DATE, CD_SENT_DATE, LE_DATE, CLOSING_DATE, DISCLOSURE_GENERATED_DATE,
        EST_DISBURSEMENT_DATE, DISCLOSURE_UPLOAD_DATE, DISBURSEMENT_DATE_FORMULA, ITP_DATE, DISBURSEMENT_DATE, DECLINED_DATE, WITHDRAWN_DATE];


}