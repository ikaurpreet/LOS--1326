import { LightningElement, api } from 'lwc';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';
import {occupancyTypes, propertyTypes, attachmentType, communityPropertyState, loanPurpose, loanType, getOptionLabelFromValues, applyMoneyMaskValue } from 'c/util';


export default class MortgageLosLenderFormL1ViewMode extends LightningElement {
    @api handleEdit;
    @api lenderData;
    @api isPurchaseSubmission;
    @api isRefiSubmission;

    get yearAcquired() {
        if(this.isRefiSubmission && this.lenderData.property.dateOfPurchase){
            return dayjs(this.lenderData.property.dateOfPurchase).format('MM/DD/YYYY');
        }
        return '';
    }

    get labels() {
        var lenData = {
            communityPropertyState: getOptionLabelFromValues(communityPropertyState, this.lenderData.property.communityPropertyState),
            attachmentType: getOptionLabelFromValues(attachmentType, this.lenderData.property.attachmentType),
            propertyType: getOptionLabelFromValues(propertyTypes, this.lenderData.property.propertyType),
            occupancyType: getOptionLabelFromValues(occupancyTypes, this.lenderData.property.occupancyType),
            loanPurpose: getOptionLabelFromValues(loanPurpose, this.lenderData.loanPurpose),
            loanType: getOptionLabelFromValues(loanType, this.lenderData.selectedProduct.loanType),
            estimatedValue: applyMoneyMaskValue(this.lenderData.property.estimatedValue),
            appraisedValue: applyMoneyMaskValue(this.lenderData.property.appraisedValue)
        };
        if(this.isRefiSubmission){
            lenData.originalPurchasePrice= applyMoneyMaskValue(this.lenderData.property.originalPurchasePrice);
            lenData.estimatedLiensToBePaidOff= applyMoneyMaskValue(this.lenderData.property.estimatedLiensToBePaidOff);
        }
        return lenData;
    }


    renderedCallback() {
        this.loadDayjs();
    }

    loadDayjs = () => {
        if (this.dayjsInitialized) {
            return;
        }
        Promise.all([
            loadScript(this, Dayjs + '/package/dayjs.min.js'),
            loadScript(this, Dayjs + '/package/plugin/utc.js'),
            loadScript(this, Dayjs + '/package/plugin/timezone.js'),
            loadScript(this, Dayjs + '/package/plugin/advancedFormat.js'),
        ]).then(() => {
            this.dayjsInitialized = true;
            dayjs.extend(dayjs_plugin_utc);
            dayjs.extend(dayjs_plugin_timezone);
            dayjs.extend(dayjs_plugin_advancedFormat);
        });
    }
}