import { LightningElement, api } from 'lwc';


import MORTGAGE_TOTAL_INCOME from '@salesforce/schema/Opportunity.mortgage_Total_Income__c';
import TOTAL_ASSETS from '@salesforce/schema/Opportunity.Total_Assets__c';
import MORTGAGE_BASE_EMPLOYMENT_INCOME from '@salesforce/schema/Opportunity.mortgage_Base_employment_income__c';
import MORTGAGE_INTEREST_INCOME from '@salesforce/schema/Opportunity.mortgage_Interest_Income__c';
import MORTGAGE_BONUS_AND_COMMISSION_INCOME from '@salesforce/schema/Opportunity.mortgage_Bonus_and_commission_income__c';
import MORTGAGE_DIVIDENDS_INCOME from '@salesforce/schema/Opportunity.mortgage_Dividends_Income__c';
import MORTGAGE_SELF_EMPLOYMENT_INCOME from '@salesforce/schema/Opportunity.mortgage_Self_employment_income__c';
import MORTGAGE_CAPITAL_GAINS_INCOME from '@salesforce/schema/Opportunity.mortgage_Capital_Gains_Income__c';
import MORTGAGE_RETIREMENT_INCOME from '@salesforce/schema/Opportunity.mortgage_Retirement_Income__c';
import MORTGAGE_RENTAL_INCOME from '@salesforce/schema/Opportunity.mortgage_Rental_Income__c';
import MORTGAGE_PENSION_INCOME from '@salesforce/schema/Opportunity.mortgage_Pension_Income__c';
import MORTGAGE_CHILD_SUPPORT_INCOME from '@salesforce/schema/Opportunity.mortgage_Child_Support_Income__c';
import MORTGAGE_SOCIAL_SECURITY_INCOME from '@salesforce/schema/Opportunity.mortgage_Social_Security_Income__c';
import MORTGAGE_ALIMONY_INCOME from '@salesforce/schema/Opportunity.mortgage_Alimony_Income__c';
import MORTGAGE_PERMANENT_DISABILITY_INCOME from '@salesforce/schema/Opportunity.mortgage_Permanent_Disability_Income__c';
import MORTGAGE_OTHER_INCOME from '@salesforce/schema/Opportunity.mortgage_Other_Income__c';

export default class MortgageLosIncome extends LightningElement {
    @api idfromparent2;
    fields =[MORTGAGE_TOTAL_INCOME, TOTAL_ASSETS, MORTGAGE_BASE_EMPLOYMENT_INCOME, MORTGAGE_INTEREST_INCOME, MORTGAGE_BONUS_AND_COMMISSION_INCOME,
         MORTGAGE_DIVIDENDS_INCOME, MORTGAGE_SELF_EMPLOYMENT_INCOME, MORTGAGE_CAPITAL_GAINS_INCOME, MORTGAGE_RETIREMENT_INCOME, MORTGAGE_RENTAL_INCOME, MORTGAGE_PENSION_INCOME,
         MORTGAGE_CHILD_SUPPORT_INCOME, MORTGAGE_SOCIAL_SECURITY_INCOME, MORTGAGE_ALIMONY_INCOME, MORTGAGE_PERMANENT_DISABILITY_INCOME, MORTGAGE_OTHER_INCOME];
}