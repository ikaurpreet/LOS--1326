import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import getAccessLevel from '@salesforce/apex/GetRelatedRecordsLOC.getAccessLevel';
import getEligbilityTabAccessLevel from '@salesforce/apex/GetRelatedRecordsLOC.getEligbilityTabAccessLevel';

import LOGGED_USER_ID from '@salesforce/user/Id';
import PROFILE_NAME_FIELD from '@salesforce/schema/User.Profile.Name';

export default class MortgageLOSOpportunityHome extends LightningElement {
    @api recordId;

    showUrlaTab = false;
    showEligibilityTab = false;

    @wire(getAccessLevel) wireGetAccessLevel({error,data}){
        if (data) {
            if(data == "write" || data == "read"){
                this.showUrlaTab = true;
            }
        }
    }

    @wire(getEligbilityTabAccessLevel) wireGetEligbilityTabAccessLevel({error,data}){
        if (data) {
            if(data == "write" || data == "read"){
                this.showEligibilityTab = true;
            }
            return;
        }
        if(error)
            console.log(error)
    }
}