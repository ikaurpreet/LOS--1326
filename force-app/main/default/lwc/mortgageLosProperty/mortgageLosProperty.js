import { LightningElement, wire, api, track} from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import getLoans from '@salesforce/apex/GetRelatedRecordsLOC.getLoans';
import { NavigationMixin } from 'lightning/navigation';
import {getUrlTable } from 'c/util';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import MORTGAGE_PROPERTY_ADDRESS from '@salesforce/schema/Opportunity.mortgage_Property_Address__c';
import WAIVE_ESCROWS from '@salesforce/schema/Opportunity.Waive_Escrows__c';
import MORTGAGE_UNIT from '@salesforce/schema/Opportunity.mortgage_Unit__c';
import ESCROWS from '@salesforce/schema/Opportunity.Escrows__c';
import MORTGAGE_CITY from '@salesforce/schema/Opportunity.mortgage_City__c';
import PROPERTY_USAGE from '@salesforce/schema/Opportunity.Property_Usage__c';
import MORTGAGE_STATE from '@salesforce/schema/Opportunity.mortgage_State__c';
import PRIMARY_ADDRESS_MONTHLY_PAYMENT from '@salesforce/schema/Opportunity.Primary_Address_Monthly_Payment__c';
import MORTGAGE_PROPERTY_TYPE from '@salesforce/schema/Opportunity.mortgage_Property_Type__c';
import MORTGAGE_NUMBER_OF_UNITS from '@salesforce/schema/Opportunity.mortgage_Number_of_Units__c';
import MORTGAGE_BALANCE_ON_MORTGAGE from '@salesforce/schema/Opportunity.mortgage_Balance_on_Mortgage__c';
import MORTGAGE_ESTIMATED_PROPERTY_VALUE from '@salesforce/schema/Opportunity.mortgage_Estimated_Property_Value__c';
import MORTGAGE_MONTHLY_MORTGAGE_PAYMENT from '@salesforce/schema/Opportunity.mortgage_Monthly_Mortgage_Payment__c';
import PREPAIDS from '@salesforce/schema/Opportunity.Prepaids__c';
import USPS_ADDRESS_VERIFIED from '@salesforce/schema/Opportunity.USPS_Address_Verified__c';
import USPS_LAST_VERIFIED_ADDRESS from '@salesforce/schema/Opportunity.USPS_Last_Verified_Address__c';
import USPS_VERIFIED_ADDRESS from '@salesforce/schema/Opportunity.USPS_Verified_Address__c';
import MORTGAGE_SECOND_MORTGAGE_PROPERTY from '@salesforce/schema/Opportunity.mortgage_Second_Mortgage_Property__c';

import HC_PROPERTY_TYPE from '@salesforce/schema/Opportunity.HC_property_type__c';
import PROPERTY_DOES_NOT_HAVE_AN_HOA from '@salesforce/schema/Opportunity.Property_does_not_have_an_HOA__c';
import HOA_NAME from '@salesforce/schema/Opportunity.HOA_Name__c';
import HOA_CONTACT_NAME from '@salesforce/schema/Opportunity.HOA_Contact_Name__c';
import HOA_CONTACT_EMAIL from '@salesforce/schema/Opportunity.HOA_Contact_Email__c';
import HOA_CONTACT_PHONE_NUMBER from '@salesforce/schema/Opportunity.HOA_Contact_Phone_Number__c';

import SECOND_MORTGAGE_MORTGAGE_BALANCE from '@salesforce/schema/Opportunity.Second_Mortgage_Mortgage_Balance__c';
import SECOND_MORTGAGE_MONTHLY_PAYMENT from '@salesforce/schema/Opportunity.Second_Mortgage_Monthly_Payment__c';
import SECOND_MORTGAGE_REFI_WITH_FIRST_MORT from '@salesforce/schema/Opportunity.Second_Mortgage_Refi_with_first_mort__c';
import SECOND_MORTGAGE_HELOC_CREDIT_LIMIT from '@salesforce/schema/Opportunity.Second_Mortgage_HELOC_credit_limit__c';
import SECOND_MORTGAGE_USED_TO_PURCHASE_HOME from '@salesforce/schema/Opportunity.Second_Mortgage_Used_to_purchase_home__c';



const actions = [
    { label: 'View', name: 'view' },
];

export default class MortgageLosProperty extends NavigationMixin( LightningElement )  {
    @api idfromparent2;
    fields = [MORTGAGE_PROPERTY_ADDRESS, WAIVE_ESCROWS, MORTGAGE_UNIT, ESCROWS, MORTGAGE_CITY, PROPERTY_USAGE, MORTGAGE_STATE, PRIMARY_ADDRESS_MONTHLY_PAYMENT,
        MORTGAGE_PROPERTY_TYPE, MORTGAGE_NUMBER_OF_UNITS, MORTGAGE_BALANCE_ON_MORTGAGE, MORTGAGE_ESTIMATED_PROPERTY_VALUE, MORTGAGE_MONTHLY_MORTGAGE_PAYMENT,
        PREPAIDS, USPS_ADDRESS_VERIFIED, USPS_LAST_VERIFIED_ADDRESS,USPS_VERIFIED_ADDRESS,  MORTGAGE_SECOND_MORTGAGE_PROPERTY, HC_PROPERTY_TYPE];
    fields_second_property = [SECOND_MORTGAGE_MORTGAGE_BALANCE, MORTGAGE_SECOND_MORTGAGE_PROPERTY, SECOND_MORTGAGE_MONTHLY_PAYMENT, SECOND_MORTGAGE_REFI_WITH_FIRST_MORT,
        SECOND_MORTGAGE_HELOC_CREDIT_LIMIT, SECOND_MORTGAGE_USED_TO_PURCHASE_HOME];
    fields_hoa = [PROPERTY_DOES_NOT_HAVE_AN_HOA, HOA_NAME, HOA_CONTACT_NAME, HOA_CONTACT_EMAIL, HOA_CONTACT_PHONE_NUMBER];
    @track columns = [
        {
            label: 'Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: 'Lender Name',
            fieldName: 'Lender_Name__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Account Number',
            fieldName: 'Account_Number__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Loan Type',
            fieldName: 'Loan_Type__c',
            type: 'text',
            sortable: true

        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];
    @track error;
    @track items = [];
    @track showTable = false;
    @wire(getLoans, {oppId:'$idfromparent2'})
    wiredLoans({
        error,
        data
    }) {
        if (data) {
            this.items = getUrlTable(data);
            this.error = undefined;
            this.showTable = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    @wire(getRecord, {recordId: '$idfromparent2', fields: [
        MORTGAGE_SECOND_MORTGAGE_PROPERTY
    ]})
    opportunity;

    get secondMortgage() {
        return getFieldValue(this.opportunity.data, MORTGAGE_SECOND_MORTGAGE_PROPERTY);
    };

}