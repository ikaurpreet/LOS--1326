import { LightningElement, api, wire,  } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import COSIGNER_FIRST_NAME from '@salesforce/schema/Opportunity.Cosigner_First_Name__c';

import ALIMONY_EXPLANATION from '@salesforce/schema/Opportunity.Declarations_Alimony_Explanation__c';
import HOW_DID_YOU_HOLD_TITLE from '@salesforce/schema/Opportunity.Declarations_How_Did_You_Hold_Title__c';
import BANKRUPTCY_EXPLANATION from '@salesforce/schema/Opportunity.Declarations_Bankruptcy_Explanation__c';
import INTENT_TO_OCCUPY from '@salesforce/schema/Opportunity.Declarations_Intent_To_Occupy__c';
import BACKRUPTCY_LAST_7_YEARS from '@salesforce/schema/Opportunity.Declarations_Bankruptcy_Last_7_Years__c';
import JUDGEMENT_EXPLANATION from '@salesforce/schema/Opportunity.Declarations_Judgment_Explanation__c';
import CO_MAKER_EXPLANATION from '@salesforce/schema/Opportunity.Declarations_Co_Maker_Explanation__c';
import LAWSUIT_EXPLANATION from '@salesforce/schema/Opportunity.Declarations_Lawsuit_Explanation__c';
import CO_MAKER_ON_NOTE from '@salesforce/schema/Opportunity.Declarations_Co_Maker_on_Note__c';
import OBLIGATED_ON_ANY_LOAN from '@salesforce/schema/Opportunity.Declarations_Obligated_on_Any_Loan__c';
import DELINQUENCY_EXPLANATION from '@salesforce/schema/Opportunity.Declarations_Delinquency_Explanation__c';
import OBLIGATED_TO_PAY_ALIMONY from '@salesforce/schema/Opportunity.Declarations_Obligated_to_Pay_Alimony__c';
import DELIQUENT_OR_DEFAULT from '@salesforce/schema/Opportunity.Declarations_Delinquent_or_Default__c';
import OBLIGATION_EXPLANATION from '@salesforce/schema/Opportunity.Declarations_Obligation_Explanation__c';
import DOWN_PAYMENT_BORROWED from '@salesforce/schema/Opportunity.Declarations_Down_Payment_Borrowed__c';
import OCCUPATION_EXPLANATION from '@salesforce/schema/Opportunity.Declarations_Occupation_Explanation__c';
import DOWN_PAYMENT_EXPLANATION from '@salesforce/schema/Opportunity.Declarations_Down_Payment_Explanation__c';
import OUTSTANDING_JUDGEMENTS from '@salesforce/schema/Opportunity.Declarations_Outstanding_Judgements__c';
import EXPLANATIONFOLLOWUP from '@salesforce/schema/Opportunity.Declarations_ExplanationFollowup__c';
import OWNERSHIP_INTEREST from '@salesforce/schema/Opportunity.Declarations_Ownership_Interest__c';
import FOLLOW_UP_NEEDED from '@salesforce/schema/Opportunity.Declarations_Follow_up_Needed__c';
import PARTY_TO_LAWSUIT from '@salesforce/schema/Opportunity.Declarations_Party_to_Lawsuit__c';
import FORECLOSED_EXPLANATION from '@salesforce/schema/Opportunity.Declarations_Foreclosed_Explanation__c';
import PERMANENT_RESIDENT_ALIEN from '@salesforce/schema/Opportunity.Declarations_Permanent_Resident_Alien__c';
import FORECLOSED_LAST_7_YEARS from '@salesforce/schema/Opportunity.Declarations_Foreclosed_Last_7_Years__c';
import TYPE_OF_PROPERTY from '@salesforce/schema/Opportunity.Declarations_Type_of_Property__c';
import US_CITIZEN from '@salesforce/schema/Opportunity.Declarations_US_Citizen__c';



import CO_DECLARATIONS_OBLIGATED_ON_ANY_LOAN from '@salesforce/schema/Opportunity.Co_Declarations_Obligated_on_Any_Loan__c';
import CO_DECLARATIONS_INTENT_TO_OCCUPY from '@salesforce/schema/Opportunity.Co_Declarations_Intent_to_Occupy__c';
import CO_DECLARATIONS_ALIMONY_EXPLANATION from '@salesforce/schema/Opportunity.Co_Declarations_Alimony_Explanation__c';
import CO_DECLARATIONS_JUDGMENT_EXPLANATION from '@salesforce/schema/Opportunity.Co_Declarations_Judgment_Explanation__c';
import CO_DECLARATIONS_BANKRUPTCY_EXPLANATION from '@salesforce/schema/Opportunity.Co_Declarations_Bankruptcy_Explanation__c';
import CO_DECLARATIONS_LAWSUIT_EXPLANATION from '@salesforce/schema/Opportunity.Co_Declarations_Lawsuit_Explanation__c';
import CO_DECLARATIONS_BANKRUPTCY_LAST_7_YEARS from '@salesforce/schema/Opportunity.Co_Declarations_Bankruptcy_Last_7_Years__c';
import CO_DECLARATIONS_OBLIGATED_TO_PAY_ALIMONY from '@salesforce/schema/Opportunity.Co_Declarations_Obligated_to_Pay_Alimony__c';
import CO_DECLARATIONS_CO_MAKER_EXPLANATION from '@salesforce/schema/Opportunity.Co_Declarations_Co_Maker_Explanation__c';
import CO_DECLARATIONS_OBLIGATION_EXPLANATION from '@salesforce/schema/Opportunity.Co_Declarations_Obligation_Explanation__c';
import CO_DECLARATIONS_CO_MAKER_ON_NOTE from '@salesforce/schema/Opportunity.Co_Declarations_Co_Maker_on_Note__c';
import CO_DECLARATIONS_OCCUPATION_EXPLANATION from '@salesforce/schema/Opportunity.Co_Declarations_Occupation_Explanation__c';
import CO_DECLARATIONS_DELINQUENCY_EXPLANATION from '@salesforce/schema/Opportunity.Co_Declarations_Delinquency_Explanation__c';
import CO_DECLARATIONS_OUTSTANDING_JUDGEMENTS from '@salesforce/schema/Opportunity.Co_Declarations_Outstanding_Judgements__c';
import CO_DECLARATIONS_DELINQUENT_OR_DEFAULT from '@salesforce/schema/Opportunity.Co_Declarations_Delinquent_or_Default__c';
import CO_DECLARATIONS_OWNERSHIP_INTEREST from '@salesforce/schema/Opportunity.Co_Declarations_Ownership_Interest__c';
import CO_DECLARATIONS_DOWN_PAYMENT_BORROWED from '@salesforce/schema/Opportunity.Co_Declarations_Down_Payment_Borrowed__c';
import CO_DECLARATIONS_PARTY_TO_LAWSUIT from '@salesforce/schema/Opportunity.Co_Declarations_Party_to_Lawsuit__c';
import CO_DECLARATIONS_DOWN_PAYMENT_EXPLANATION from '@salesforce/schema/Opportunity.Co_Declarations_Down_Payment_Explanation__c';
import CO_DECLARATIONS_PERMANENT_RESIDENT_ALIEN from '@salesforce/schema/Opportunity.Co_Declarations_Permanent_Resident_Alien__c';
import CO_DECLARATIONS_FORECLOSED_EXPLANATION from '@salesforce/schema/Opportunity.Co_Declarations_Foreclosed_Explanation__c';
import CO_DECLARATIONS_PROPERTY_PRIMARY_RES from '@salesforce/schema/Opportunity.Co_Declarations_Property_Primary_Res__c';
import CO_DECLARATIONS_FORECLOSED_LAST_7_YEARS from '@salesforce/schema/Opportunity.Co_Declarations_Foreclosed_Last_7_Years__c';
import CO_DECLARATIONS_TYPE_OF_PROPERTY from '@salesforce/schema/Opportunity.Co_Declarations_Type_of_Property__c';
import CO_DECLARATIONS_HOW_DID_YOU_HOLD_TITLE from '@salesforce/schema/Opportunity.Co_Declarations_How_Did_You_Hold_Title__c';
import CO_DECLARATIONS_US_CITIZEN from '@salesforce/schema/Opportunity.Co_Declarations_US_Citizen__c';




export default class MortgageLosDeclarations extends LightningElement {
    @api idfromparent2;

    fields_borrower = [ALIMONY_EXPLANATION, HOW_DID_YOU_HOLD_TITLE, BANKRUPTCY_EXPLANATION, INTENT_TO_OCCUPY, BACKRUPTCY_LAST_7_YEARS, JUDGEMENT_EXPLANATION, CO_MAKER_EXPLANATION, LAWSUIT_EXPLANATION,
        CO_MAKER_ON_NOTE, OBLIGATED_ON_ANY_LOAN, DELINQUENCY_EXPLANATION, OBLIGATED_TO_PAY_ALIMONY, DELIQUENT_OR_DEFAULT, OBLIGATION_EXPLANATION, DOWN_PAYMENT_BORROWED,
        OCCUPATION_EXPLANATION, DOWN_PAYMENT_EXPLANATION, OUTSTANDING_JUDGEMENTS, EXPLANATIONFOLLOWUP, OWNERSHIP_INTEREST, FOLLOW_UP_NEEDED, PARTY_TO_LAWSUIT, FORECLOSED_EXPLANATION,
        PERMANENT_RESIDENT_ALIEN, FORECLOSED_LAST_7_YEARS, TYPE_OF_PROPERTY, US_CITIZEN];

    fields_co_borrower = [CO_DECLARATIONS_OBLIGATED_ON_ANY_LOAN, CO_DECLARATIONS_INTENT_TO_OCCUPY, CO_DECLARATIONS_ALIMONY_EXPLANATION, CO_DECLARATIONS_JUDGMENT_EXPLANATION, CO_DECLARATIONS_BANKRUPTCY_EXPLANATION,
        CO_DECLARATIONS_LAWSUIT_EXPLANATION, CO_DECLARATIONS_BANKRUPTCY_LAST_7_YEARS, CO_DECLARATIONS_OBLIGATED_TO_PAY_ALIMONY, CO_DECLARATIONS_CO_MAKER_EXPLANATION, CO_DECLARATIONS_OBLIGATION_EXPLANATION,
        CO_DECLARATIONS_CO_MAKER_ON_NOTE, CO_DECLARATIONS_OCCUPATION_EXPLANATION, CO_DECLARATIONS_DELINQUENCY_EXPLANATION, CO_DECLARATIONS_OUTSTANDING_JUDGEMENTS, CO_DECLARATIONS_DELINQUENT_OR_DEFAULT,
        CO_DECLARATIONS_OWNERSHIP_INTEREST, CO_DECLARATIONS_DOWN_PAYMENT_BORROWED, CO_DECLARATIONS_PARTY_TO_LAWSUIT, CO_DECLARATIONS_DOWN_PAYMENT_EXPLANATION, CO_DECLARATIONS_PERMANENT_RESIDENT_ALIEN,
        CO_DECLARATIONS_FORECLOSED_EXPLANATION, CO_DECLARATIONS_PROPERTY_PRIMARY_RES, CO_DECLARATIONS_FORECLOSED_LAST_7_YEARS, CO_DECLARATIONS_TYPE_OF_PROPERTY, CO_DECLARATIONS_HOW_DID_YOU_HOLD_TITLE,
        CO_DECLARATIONS_US_CITIZEN];

    @wire(getRecord, {recordId: '$idfromparent2', fields: [
        COSIGNER_FIRST_NAME
    ]})
    opportunity;

    get cosigned() {
        return !!getFieldValue(this.opportunity.data, COSIGNER_FIRST_NAME);
    };
}