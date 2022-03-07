import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';

import LOGGED_USER_ID from '@salesforce/user/Id';
import PROFILE_NAME_FIELD from '@salesforce/schema/User.Profile.Name';

import NAME from '@salesforce/schema/Opportunity.Name';
import ACCOUNTID from '@salesforce/schema/Opportunity.AccountId';
import OWNERID from '@salesforce/schema/Opportunity.OwnerId';
import COSIGNER from '@salesforce/schema/Opportunity.Cosigner__c';
import LOAN_OFFICER from '@salesforce/schema/Opportunity.Loan_Officer__c';
import SUBMISSION_STATUS from '@salesforce/schema/Opportunity.submission_status__c';
import LOAN_OFFICER_COORDINATOR from '@salesforce/schema/Opportunity.Loan_Officer_Coordinator__c';
import MORTGAGE_LINK_TO_DASHBOARD from '@salesforce/schema/Opportunity.mortgage_Link_to_Dashboard__c';
import LOAN_PROCESSOR_NEW from '@salesforce/schema/Opportunity.Loan_Processor_New__c';
import USER_ID from '@salesforce/schema/Opportunity.User_Id__c';
import CLOSING_COORDINATOR from '@salesforce/schema/Opportunity.Closing_Coordinator__c';
import MORTGAGE_SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import STAGENAME from '@salesforce/schema/Opportunity.StageName';
import TEST_OPPORTUNITY from '@salesforce/schema/Opportunity.Test_Opportunity__c';
import CONTACT_STATUS from '@salesforce/schema/Opportunity.Contact_Status__c';
import LAST_ACTIVITY_DATE from '@salesforce/schema/Opportunity.Last_Activity_Date__c';
import AMOUNT from '@salesforce/schema/Opportunity.Amount';
import MOST_RECENT_MEETING_SCHEDULED from '@salesforce/schema/Opportunity.Most_Recent_Meeting_Scheduled__c';
import ENCOMPASS_LOAN_NUMBER from '@salesforce/schema/Opportunity.Encompass_Loan_Number__c';
import NEXTSTEP from '@salesforce/schema/Opportunity.NextStep';
import LOCK_LOAN from '@salesforce/schema/Opportunity.Lock_Loan__c';
import ADMIN_NOTES from '@salesforce/schema/Opportunity.Admin_Notes__c';
import LOCK_EXPIRATION_DATE from '@salesforce/schema/Opportunity.Lock_Expiration_Date__c';
import LO_QUEUE_ID from '@salesforce/schema/Opportunity.LO_Queue_Id__c';
import NEXT_TEXT_TIME from '@salesforce/schema/Opportunity.Next_Text_Time__c';
import LO_TEAM_QUEUE from '@salesforce/schema/Opportunity.LO_Team_Queue__c';
import NEXT_TEXT from '@salesforce/schema/Opportunity.Next_Text__c';
import BORROWER_TO_DO from '@salesforce/schema/Opportunity.Borrower_To_Do__c';
import LOAN_OFFICER_ID from '@salesforce/schema/Opportunity.Loan_Officer_Id__c';
import CREATE_CLOSED_LOAN from '@salesforce/schema/Opportunity.Create_Closed_Loan__c';
import LOAN_COORDINATOR_ID from '@salesforce/schema/Opportunity.Loan_Coordinator_Id__c';
import CURRENT_MORTGAGE_RATE from '@salesforce/schema/Opportunity.Current_Mortgage_Rate__c';
import LOCK_EXPIRATION_WARNING from '@salesforce/schema/Opportunity.Lock_Expiration_Warning__c';
import TASK_SHEET from '@salesforce/schema/Opportunity.Task_Sheet__c';
import COMMENTS from '@salesforce/schema/Opportunity.Comments__c';
import APPRAISAL_WAIVED from '@salesforce/schema/Opportunity.Appraisal_Waived__c';
import PRELIM_CD_REVIEW_DATE from '@salesforce/schema/Opportunity.Prelim_CD_Review_Date__c';
import CREDIBLE_EMPLOYEE from '@salesforce/schema/Opportunity.Credible_Employee__c';
import PRELIM_CD_STATUS from '@salesforce/schema/Opportunity.Prelim_CD_Status__c';
import ESCALATED_DATE_TIME from '@salesforce/schema/Opportunity.Escalated_Date_Time__c';

import USER_INITIAL_DOCS_DISCLOSURES from '@salesforce/schema/Opportunity.User_Initial_Docs_Disclosures__c';
import CO_BORROWER_INITIAL_DOCS_DISCLOSURES from '@salesforce/schema/Opportunity.Co_Borrower_Initial_Docs_Disclosures__c';
import ASSET_VERIFICATION from '@salesforce/schema/Opportunity.Asset_Verification__c';
import COBORROWER_ASSET_VERIFICATION from '@salesforce/schema/Opportunity.CoBorrower_Asset_Verification__c';
import INCOME_VERIFICATION from '@salesforce/schema/Opportunity.Income_Verification__c';
import COBORROWER_INCOME_VERIFICATION from '@salesforce/schema/Opportunity.CoBorrower_Income_Verification__c';
import TAX_DOCUMENTS from '@salesforce/schema/Opportunity.Tax_Documents__c';
import COBORROWER_TAX_DOCUMENTS from '@salesforce/schema/Opportunity.CoBorrower_Tax_Documents__c';
import OTHER_DOCUMENTS from '@salesforce/schema/Opportunity.Other_Documents__c';
import COBORROWER_OTHER_DOCUMENTS from '@salesforce/schema/Opportunity.CoBorrower_Other_Documents__c';
import E_SIGN_DISCLOSURE from '@salesforce/schema/Opportunity.E_sign_disclosure__c';
import COBORROWER_E_SIGN_DISCLOSURE from '@salesforce/schema/Opportunity.CoBorrower_E_Sign_Disclosure__c';
import WET_SIGN_DISCLOSURE from '@salesforce/schema/Opportunity.Wet_sign_disclosure__c';
import COBORROWER_WET_SIGN_DISCLOSURE from '@salesforce/schema/Opportunity.CoBorrower_Wet_Sign_Disclosure__c';
import LENDER_DISCLOSURE_STATUS from '@salesforce/schema/Opportunity.Lender_Disclosure_Status__c';

import MORTGAGE_PRODUCT from '@salesforce/schema/Opportunity.mortgage_Product__c';
import SUBMISSION_ID from '@salesforce/schema/Opportunity.Submission_ID__c';
import LENDER_ACCOUNT from '@salesforce/schema/Opportunity.Lender_Account__c';
import REQUESTED_LOAN_AMOUNT from '@salesforce/schema/Opportunity.requested_loan_amount__c';
import RATE from '@salesforce/schema/Opportunity.Rate__c';
import PREPAID_INTEREST from '@salesforce/schema/Opportunity.Prepaid_Interest__c';
import TERM from '@salesforce/schema/Opportunity.Term__c';
import ROLL_ALL_COSTS_INTO_LOAN from '@salesforce/schema/Opportunity.Roll_all_costs_into_loan__c';
import MONTHLY_PAYMENT from '@salesforce/schema/Opportunity.Monthly_Payment__c';
import PAYOFF_AMOUNT from '@salesforce/schema/Opportunity.Payoff_Amount__c';
import TOTAL_REPAYMENT from '@salesforce/schema/Opportunity.Total_Repayment__c';
import ESCROW_DEPOSIT_FOR_TAXES_AND_INSURANCE from '@salesforce/schema/Opportunity.Escrow_Deposit_for_Taxes_and_Insurance__c';
import PAYOFF_INTEREST from '@salesforce/schema/Opportunity.Payoff_Interest__c';
import TOTAL_ESTIMATED_CASH_AT_CLOSE from '@salesforce/schema/Opportunity.Total_Estimated_Cash_at_Close__c';

import MORTGAGE_PROPERTY_ADDRESS from '@salesforce/schema/Opportunity.mortgage_Property_Address__c';
import ESCROWS from '@salesforce/schema/Opportunity.Escrows__c';
import MORTGAGE_UNIT from '@salesforce/schema/Opportunity.mortgage_Unit__c';
import WAIVE_ESCROWS from '@salesforce/schema/Opportunity.Waive_Escrows__c';
import MORTGAGE_CITY from '@salesforce/schema/Opportunity.mortgage_City__c';
import PROPERTY_USAGE from '@salesforce/schema/Opportunity.Property_Usage__c';
import MORTGAGE_STATE from '@salesforce/schema/Opportunity.mortgage_State__c';
import PRIMARY_ADDRESS_MONTHLY_PAYMENT from '@salesforce/schema/Opportunity.Primary_Address_Monthly_Payment__c';
import MORTGAGE_ZIP_CODE from '@salesforce/schema/Opportunity.mortgage_Zip_Code__c';
import MORTGAGE_NUMBER_OF_UNITS from '@salesforce/schema/Opportunity.mortgage_Number_of_Units__c';
import MORTGAGE_PROPERTY_TYPE from '@salesforce/schema/Opportunity.mortgage_Property_Type__c';
import MORTGAGE_ESTIMATED_PROPERTY_VALUE from '@salesforce/schema/Opportunity.mortgage_Estimated_Property_Value__c';
import MORTGAGE_BALANCE_ON_MORTGAGE from '@salesforce/schema/Opportunity.mortgage_Balance_on_Mortgage__c';
import MORTGAGE_CASH_OUT_REFINANCE_FORMULA from '@salesforce/schema/Opportunity.Mortgage_Cash_Out_Refinance_Formula__c';
import MORTGAGE_MONTHLY_MORTGAGE_PAYMENT from '@salesforce/schema/Opportunity.mortgage_Monthly_Mortgage_Payment__c';
import MORTGAGE_CASH_OUT_REASON from '@salesforce/schema/Opportunity.mortgage_Cash_Out_Reason__c';
import MORTGAGE_SECOND_MORTGAGE_PROPERTY from '@salesforce/schema/Opportunity.mortgage_Second_Mortgage_Property__c';
import MORTGAGE_CASH_OUT_AMOUNT from '@salesforce/schema/Opportunity.mortgage_Cash_Out_Amount__c';
import SECOND_MORTGAGE_MONTHLY_PAYMENT from '@salesforce/schema/Opportunity.Second_Mortgage_Monthly_Payment__c';
import CLOSING_COST from '@salesforce/schema/Opportunity.Closing_Cost__c';
import SECOND_MORTGAGE_MORTGAGE_BALANCE from '@salesforce/schema/Opportunity.Second_Mortgage_Mortgage_Balance__c';
import PREPAIDS from '@salesforce/schema/Opportunity.Prepaids__c';
import MORTGAGE_ADDITIONAL_PROPERTIES from '@salesforce/schema/Opportunity.mortgage_Additional_Properties__c';
import TOTAL_CASH_AT_CLOSE from '@salesforce/schema/Opportunity.Total_Cash_at_Close__c';
import ADDITIONAL_PROPERTIES_MONTHLY_PAYMENT from '@salesforce/schema/Opportunity.Additional_Properties_Monthly_Payment__c';
import SECOND_MORTGAGE_REFI_WITH_FIRST_MORT from '@salesforce/schema/Opportunity.Second_Mortgage_Refi_with_first_mort__c';
import USPS_ADDRESS_VERIFIED from '@salesforce/schema/Opportunity.USPS_Address_Verified__c';
import SECOND_MORTGAGE_USED_TO_PURCHASE_HOME from '@salesforce/schema/Opportunity.Second_Mortgage_Used_to_purchase_home__c';
import USPS_VERIFIED_ADDRESS from '@salesforce/schema/Opportunity.USPS_Verified_Address__c';
import SECOND_MORTGAGE_HELOC_CREDIT_LIMIT from '@salesforce/schema/Opportunity.Second_Mortgage_HELOC_credit_limit__c';
import PQ_FEES_TITLE_COMPANY from '@salesforce/schema/Opportunity.PQ_Fees_Title_Company__c';

import UTM_SOURCE from '@salesforce/schema/Opportunity.utm_source__c';
import UTM_CAMPAIGN from '@salesforce/schema/Opportunity.utm_campaign__c';
import UTM_MEDIUM from '@salesforce/schema/Opportunity.utm_medium__c';
import UTM_INTERNAL from '@salesforce/schema/Opportunity.UTM_Internal__c';

import MORTGAGE_NO_CURRENT_INCOME from '@salesforce/schema/Opportunity.mortgage_No_Current_Income__c';
import TOTAL_ASSETS from '@salesforce/schema/Opportunity.Total_Assets__c';
import MORTGAGE_TOTAL_INCOME from '@salesforce/schema/Opportunity.mortgage_Total_Income__c';
import MORTGAGE_INTEREST_INCOME from '@salesforce/schema/Opportunity.mortgage_Interest_Income__c';
import MORTGAGE_TOTAL_SALARY from '@salesforce/schema/Opportunity.mortgage_Total_Salary__c';
import MORTGAGE_DIVIDENDS_INCOME from '@salesforce/schema/Opportunity.mortgage_Dividends_Income__c';
import MORTGAGE_BASE_EMPLOYMENT_INCOME from '@salesforce/schema/Opportunity.mortgage_Base_employment_income__c';
import MORTGAGE_CAPITAL_GAINS_INCOME from '@salesforce/schema/Opportunity.mortgage_Capital_Gains_Income__c';
import MORTGAGE_BONUS_AND_COMMISSION_INCOME from '@salesforce/schema/Opportunity.mortgage_Bonus_and_commission_income__c';
import MORTGAGE_RENTAL_INCOME from '@salesforce/schema/Opportunity.mortgage_Rental_Income__c';
import MORTGAGE_SELF_EMPLOYMENT_INCOME from '@salesforce/schema/Opportunity.mortgage_Self_employment_income__c';
import MORTGAGE_CHILD_SUPPORT_INCOME from '@salesforce/schema/Opportunity.mortgage_Child_Support_Income__c';
import MORTGAGE_RETIREMENT_INCOME from '@salesforce/schema/Opportunity.mortgage_Retirement_Income__c';
import MORTGAGE_PERMANENT_DISABILITY_INCOME from '@salesforce/schema/Opportunity.mortgage_Permanent_Disability_Income__c';
import MORTGAGE_PENSION_INCOME from '@salesforce/schema/Opportunity.mortgage_Pension_Income__c';
import MORTGAGE_ALIMONY_INCOME from '@salesforce/schema/Opportunity.mortgage_Alimony_Income__c';
import MORTGAGE_SOCIAL_SECURITY_INCOME from '@salesforce/schema/Opportunity.mortgage_Social_Security_Income__c';
import MORTGAGE_OTHER_INCOME from '@salesforce/schema/Opportunity.mortgage_Other_Income__c';

import TITLE_COMPANY_ACCOUNT from '@salesforce/schema/Opportunity.Title_Company_Account__c';
import REAL_ESTATE_AGENCY from '@salesforce/schema/Opportunity.Real_Estate_Agency__c';
import INSURANCE_COMPANY_ACCOUNT from '@salesforce/schema/Opportunity.Insurance_Company_Account__c';
import SETTLEMENT_COMPANY_ACCOUNT from '@salesforce/schema/Opportunity.Settlement_Company_Account__c';
import TITLE_COMPANY from '@salesforce/schema/Opportunity.Title_Company__c';
import TITLE_HOLDERS from '@salesforce/schema/Opportunity.TItle_Holders__c';
import TITLE_PHONE_NUMBER from '@salesforce/schema/Opportunity.Title_Phone_Number__c';
import TITLE_AGENT_EMAIL from '@salesforce/schema/Opportunity.Title_Agent_Email__c';
import TITLE_NAME_OF_LEGAL_ENTITY from '@salesforce/schema/Opportunity.Title_Name_Of_Legal_Entity__c';

import ACTIVE_SUBMISSION from '@salesforce/schema/Opportunity.Active_Submission__c';
import PIW_REQUIRED from '@salesforce/schema/Opportunity.PIW_Required__c';
import DESCRIPTION from '@salesforce/schema/Opportunity.Description';
import REGISTERED_WITH_LENDER_DATE from '@salesforce/schema/Opportunity.Registered_with_Lender_Date__c';
import MORTGAGE_SUBMITTED_TO_LENDER from '@salesforce/schema/Opportunity.Mortgage_Submitted_to_Lender__c';
import REGISTERED_WITH_LENDER from '@salesforce/schema/Opportunity.Registered_with_Lender__c';
import SEND_DISCLOSURE_TO_QA from '@salesforce/schema/Opportunity.Send_Disclosure_to_QA__c';

import SETTLEMENT_FILE_NUMBER from '@salesforce/schema/Opportunity.Settlement_File_Number__c';
import EXCEPTION_REASON from '@salesforce/schema/Opportunity.Exception_Reason__c';
import CLOSING_PAYMENT_METHOD from '@salesforce/schema/Opportunity.Closing_Payment_Method__c';
import BORROWER_PAID_AMOUNT from '@salesforce/schema/Opportunity.Borrower_Paid_Amount__c';
import LENDER_PAID_AMOUNT from '@salesforce/schema/Opportunity.Lender_Paid_Amount__c';
import WIRE_AMOUNT from '@salesforce/schema/Opportunity.Wire_Amount__c';

import FILE_ESCALATED from '@salesforce/schema/Opportunity.File_Escalated__c';
import FILE_ESCALATED_DATE from '@salesforce/schema/Opportunity.File_Escalated_Date__c';
import FILE_ESCALATED_BY from '@salesforce/schema/Opportunity.File_Escalated_By__c';
import STAGE_WHEN_ESCALATED from '@salesforce/schema/Opportunity.Stage_when_Escalated__c';
import ESCALATION_REASON from '@salesforce/schema/Opportunity.Escalation_Reason__c';

import PQRR_DATE_TIME from '@salesforce/schema/Opportunity.PQRR_Date_Time__c';
import LOCK_LOAN_DATE from '@salesforce/schema/Opportunity.Lock_Loan_Date__c';
import FORM_IN_PROGRESS_TIMESTAMP from '@salesforce/schema/Opportunity.Form_In_Progress_Timestamp__c';
import MORTGAGE_SUBMITTED_TO_LENDER_DATE from '@salesforce/schema/Opportunity.mortgage_Submitted_to_Lender_Date__c';
import FORM_COMPLETED_DATE from '@salesforce/schema/Opportunity.form_completed_date__c';
import INITIAL_APPROVAL_TIMESTAMP from '@salesforce/schema/Opportunity.Initial_Approval_Timestamp__c';
import DISCLOSURE_GENERATED_DATE from '@salesforce/schema/Opportunity.Disclosure_Generated_Date__c';
import FULL_APPROVAL_TIMESTAMP from '@salesforce/schema/Opportunity.Full_Approval_Timestamp__c';
import DISCLOSURE_UPLOAD_DATE from '@salesforce/schema/Opportunity.Disclosure_Upload_Date__c';
import CD_SENT_DATE from '@salesforce/schema/Opportunity.CD_Sent_Date__c';
import LENDER_DISCLOSURE_SIGNED_DATE from '@salesforce/schema/Opportunity.Lender_Disclosure_Signed_Date__c';
import OFFER_ACCEPTED_TIMESTAMP from '@salesforce/schema/Opportunity.Offer_Accepted_Timestamp__c';
import ADVERSE_ACTION_SENT_DATE from '@salesforce/schema/Opportunity.Adverse_Action_Sent_Date__c';
import CLOSING_DATE from '@salesforce/schema/Opportunity.Closing_Date__c';
import READY_TO_SUBMIT_TO_LENDER_DATE from '@salesforce/schema/Opportunity.Ready_to_Submit_to_Lender_Date__c';
import EST_DISBURSEMENT_DATE from '@salesforce/schema/Opportunity.Est_Disbursement_Date__c';
import READY_FOR_FINAL_SUBMISSION_DATE from '@salesforce/schema/Opportunity.Ready_for_Final_Submission_Date__c';
import DISBURSEMENT_DATE from '@salesforce/schema/Opportunity.Disbursement_Date__c';

import CREATEDBYID from '@salesforce/schema/Opportunity.CreatedById';
import CLOSEDATE from '@salesforce/schema/Opportunity.CloseDate';
import DO_NOT_SMS from '@salesforce/schema/Opportunity.Do_Not_SMS__c';
import PROBABILITY from '@salesforce/schema/Opportunity.Probability';
import CREATED_OUTBOUND_TASK from '@salesforce/schema/Opportunity.Created_Outbound_Task__c';
import LASTMODIFIEDBYID from '@salesforce/schema/Opportunity.LastModifiedById';
import PRIMARY_OUTBOUND_TASK from '@salesforce/schema/Opportunity.Primary_Outbound_Task__c';
import LP_REQUEST_TYPE from '@salesforce/schema/Opportunity.LP_Request_Type__c';
import BORROWER_EMAIL from '@salesforce/schema/Opportunity.Borrower_Email__c';
import COSIGNER_EMAIL from '@salesforce/schema/Opportunity.Cosigner_Email__c';
import BORROWER_PHONE1 from '@salesforce/schema/Opportunity.Borrower_Phone1__c';
import RECORDTYPEID from '@salesforce/schema/Opportunity.RecordTypeId';
import ADVERSE_ACTION_SENT from '@salesforce/schema/Opportunity.Adverse_Action_Sent__c';

import EXTERNAL_ID from '@salesforce/schema/Opportunity.External_ID__c';
import INSURANCE_POLICY_NUMBER from '@salesforce/schema/Opportunity.Insurance_Policy_Number__c';
import APPRAISAL_ID from '@salesforce/schema/Opportunity.Appraisal_Id__c';
import TITLE_ID from '@salesforce/schema/Opportunity.Title_Id__c';

import REAL_ESTATE_AGENT from '@salesforce/schema/Opportunity.Real_Estate_Agent__c';
import REALESTATEAGENT_EMAIL from '@salesforce/schema/Opportunity.RealEstateAgent_Email__c';
import REALESTATEAGENT_FIRSTNAME from '@salesforce/schema/Opportunity.RealEstateAgent_FirstName__c';
import REALESTATEAGENT_LASTNAME from '@salesforce/schema/Opportunity.RealEstateAgent_LastName__c';
import REALESTATEAGENT_PHONE from '@salesforce/schema/Opportunity.RealEstateAgent_Phone__c';
import REAL_ESTATE_AGENT_PERMISSION from '@salesforce/schema/Opportunity.Real_Estate_Agent_Permission__c';


export default class MortgageLosFullDetails extends LightningElement {
    @api idfromparent2;
    @track isLoading = false;
    @track buttonEnabled = true;
    @track prfname;
    @track mode = "readonly";
    activeSections = ['general-info', 'documents', 'real-estate-agent', 'selected-product-information', 'mortgage-property-info',
        'income', 'title', 'timestamps', 'system-information', 'external-ids', 'closing-info', 'additional-information', 'thirdparties', 'escalation-info'];

    fields_general_info = [NAME, ACCOUNTID, OWNERID, COSIGNER, LOAN_OFFICER, SUBMISSION_STATUS, LOAN_OFFICER_COORDINATOR, MORTGAGE_LINK_TO_DASHBOARD, LOAN_PROCESSOR_NEW,
        USER_ID, CLOSING_COORDINATOR, MORTGAGE_SUBMISSION_UUID, STAGENAME, TEST_OPPORTUNITY, CONTACT_STATUS, LAST_ACTIVITY_DATE, AMOUNT, MOST_RECENT_MEETING_SCHEDULED,
        ENCOMPASS_LOAN_NUMBER, NEXTSTEP, LOCK_LOAN, ADMIN_NOTES, LOCK_EXPIRATION_DATE, LO_QUEUE_ID, NEXT_TEXT_TIME, LO_TEAM_QUEUE, NEXT_TEXT, BORROWER_TO_DO, LOAN_OFFICER_ID,
        CREATE_CLOSED_LOAN, LOAN_COORDINATOR_ID, CURRENT_MORTGAGE_RATE, LOCK_EXPIRATION_WARNING, TASK_SHEET, COMMENTS, APPRAISAL_WAIVED, PRELIM_CD_REVIEW_DATE, CREDIBLE_EMPLOYEE, PRELIM_CD_STATUS, ESCALATED_DATE_TIME];

    fields_info = [ACCOUNTID, OWNERID, COSIGNER, LOAN_OFFICER_COORDINATOR, ENCOMPASS_LOAN_NUMBER, LOAN_PROCESSOR_NEW, USER_ID, CLOSING_COORDINATOR, MORTGAGE_SUBMISSION_UUID
        , NEXTSTEP, ADMIN_NOTES, LOCK_EXPIRATION_DATE, LO_QUEUE_ID, NEXT_TEXT_TIME, LO_TEAM_QUEUE, NEXT_TEXT, BORROWER_TO_DO, LOAN_OFFICER_ID,
        AMOUNT, LAST_ACTIVITY_DATE, LOCK_LOAN, MOST_RECENT_MEETING_SCHEDULED, ADMIN_NOTES, CURRENT_MORTGAGE_RATE, APPRAISAL_WAIVED];

    fields_documents = [ASSET_VERIFICATION, COBORROWER_ASSET_VERIFICATION,
        INCOME_VERIFICATION, COBORROWER_INCOME_VERIFICATION, TAX_DOCUMENTS, COBORROWER_TAX_DOCUMENTS, OTHER_DOCUMENTS, COBORROWER_OTHER_DOCUMENTS, E_SIGN_DISCLOSURE,
        COBORROWER_E_SIGN_DISCLOSURE, WET_SIGN_DISCLOSURE, COBORROWER_WET_SIGN_DISCLOSURE, LENDER_DISCLOSURE_STATUS];

    fields_real_info = [REAL_ESTATE_AGENT, REALESTATEAGENT_EMAIL,  REALESTATEAGENT_FIRSTNAME, REALESTATEAGENT_LASTNAME, REALESTATEAGENT_PHONE, REAL_ESTATE_AGENT_PERMISSION];

    fields_sel_pro_info = [MORTGAGE_PRODUCT, SUBMISSION_ID, LENDER_ACCOUNT, REQUESTED_LOAN_AMOUNT, RATE, PREPAID_INTEREST, TERM, ROLL_ALL_COSTS_INTO_LOAN,
        MONTHLY_PAYMENT, PAYOFF_AMOUNT, TOTAL_REPAYMENT, PAYOFF_INTEREST, ESCROW_DEPOSIT_FOR_TAXES_AND_INSURANCE, TOTAL_ESTIMATED_CASH_AT_CLOSE];

    fields_propery_info = [MORTGAGE_PROPERTY_ADDRESS, ESCROWS, MORTGAGE_UNIT, WAIVE_ESCROWS, MORTGAGE_CITY, PROPERTY_USAGE, MORTGAGE_STATE, PRIMARY_ADDRESS_MONTHLY_PAYMENT, MORTGAGE_ZIP_CODE, MORTGAGE_NUMBER_OF_UNITS,
        MORTGAGE_PROPERTY_TYPE, MORTGAGE_ESTIMATED_PROPERTY_VALUE, MORTGAGE_BALANCE_ON_MORTGAGE, MORTGAGE_CASH_OUT_REFINANCE_FORMULA, MORTGAGE_MONTHLY_MORTGAGE_PAYMENT, MORTGAGE_CASH_OUT_REASON,MORTGAGE_CASH_OUT_AMOUNT, MORTGAGE_CASH_OUT_AMOUNT,
        MORTGAGE_SECOND_MORTGAGE_PROPERTY, CLOSING_COST, SECOND_MORTGAGE_MONTHLY_PAYMENT, PREPAIDS, SECOND_MORTGAGE_MORTGAGE_BALANCE, TOTAL_CASH_AT_CLOSE,
        MORTGAGE_ADDITIONAL_PROPERTIES, SECOND_MORTGAGE_REFI_WITH_FIRST_MORT, ADDITIONAL_PROPERTIES_MONTHLY_PAYMENT, SECOND_MORTGAGE_USED_TO_PURCHASE_HOME, PQ_FEES_TITLE_COMPANY, SECOND_MORTGAGE_HELOC_CREDIT_LIMIT,
        USPS_ADDRESS_VERIFIED, USPS_VERIFIED_ADDRESS];

    fields_src = [UTM_SOURCE, UTM_CAMPAIGN, UTM_MEDIUM, UTM_INTERNAL];

    fields_income = [MORTGAGE_NO_CURRENT_INCOME, TOTAL_ASSETS, MORTGAGE_TOTAL_INCOME, MORTGAGE_INTEREST_INCOME, MORTGAGE_TOTAL_SALARY, MORTGAGE_DIVIDENDS_INCOME, MORTGAGE_BASE_EMPLOYMENT_INCOME, MORTGAGE_CAPITAL_GAINS_INCOME,
        MORTGAGE_BONUS_AND_COMMISSION_INCOME, MORTGAGE_RENTAL_INCOME, MORTGAGE_SELF_EMPLOYMENT_INCOME, MORTGAGE_CHILD_SUPPORT_INCOME, MORTGAGE_RETIREMENT_INCOME, MORTGAGE_PERMANENT_DISABILITY_INCOME,
        MORTGAGE_PENSION_INCOME, MORTGAGE_ALIMONY_INCOME, MORTGAGE_SOCIAL_SECURITY_INCOME, MORTGAGE_OTHER_INCOME];

    fields_thirdparties = [TITLE_COMPANY_ACCOUNT, TITLE_HOLDERS, TITLE_COMPANY, TITLE_NAME_OF_LEGAL_ENTITY, TITLE_PHONE_NUMBER, TITLE_AGENT_EMAIL];

    fields_addlinfo = [ACTIVE_SUBMISSION, PIW_REQUIRED, MORTGAGE_SUBMITTED_TO_LENDER, REGISTERED_WITH_LENDER, REGISTERED_WITH_LENDER_DATE];

    fields_close_info = [SETTLEMENT_FILE_NUMBER, EXCEPTION_REASON, CLOSING_PAYMENT_METHOD, BORROWER_PAID_AMOUNT, LENDER_PAID_AMOUNT, WIRE_AMOUNT];

    fields_escalation_info = [FILE_ESCALATED, FILE_ESCALATED_DATE, FILE_ESCALATED_BY, STAGE_WHEN_ESCALATED, ESCALATION_REASON];

    fields_timestamps = [PQRR_DATE_TIME, LOCK_LOAN_DATE, FORM_IN_PROGRESS_TIMESTAMP, MORTGAGE_SUBMITTED_TO_LENDER_DATE, FORM_COMPLETED_DATE, INITIAL_APPROVAL_TIMESTAMP, DISCLOSURE_GENERATED_DATE, FULL_APPROVAL_TIMESTAMP,
        DISCLOSURE_UPLOAD_DATE, CD_SENT_DATE, LENDER_DISCLOSURE_SIGNED_DATE, EST_DISBURSEMENT_DATE, DISBURSEMENT_DATE];

    fields_system_information = [NAME, CLOSEDATE, TEST_OPPORTUNITY, STAGENAME, CREATEDBYID, PROBABILITY, DO_NOT_SMS, LASTMODIFIEDBYID, PRIMARY_OUTBOUND_TASK];

    fields_externalids = [EXTERNAL_ID, INSURANCE_POLICY_NUMBER, APPRAISAL_ID, TITLE_ID];

    @wire(getRecord, {
        recordId: LOGGED_USER_ID,
        fields: [PROFILE_NAME_FIELD]
    }) wireuser({
        error,
        data
    }) {
        if (error) {
           this.error = error ;
        } else if (data) {
            this.prfName = data.fields.Profile.value.fields.Name.value;
            if(this.prfName == "System Administrator PNE" || this.prfName == "Mortgage Manager" || this.prfName == "Systems Ops User"){
                this.mode = 'view';
            }
        }
    }


}