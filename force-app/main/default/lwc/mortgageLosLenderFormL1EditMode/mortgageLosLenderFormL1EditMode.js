import { LightningElement, api } from 'lwc';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { moneyMask } from 'c/inputMaskUtils';
import { loadScript } from 'lightning/platformResourceLoader';
import { occupancyTypes, propertyTypes, attachmentType, communityPropertyState, loanPurpose, loanType, applyMoneyMaskValue, moneyToFloat } from 'c/util';

export default class MortgageLosLenderFormL1EditMode extends LightningElement {
    @api handleEdit;
    @api lenderData;
    @api isPurchaseSubmission;
    @api isRefiSubmission;

    get communityPropertyState() {
        const state = this.lenderData?.property?.communityPropertyState;
        return [
            {
                ...communityPropertyState[0],
                checked: state === communityPropertyState[0].value || state === communityPropertyState[2].value,
            },
            {
                ...communityPropertyState[1],
                checked: state === communityPropertyState[1].value || state === communityPropertyState[2].value,
            },
        ];
    }

    get attachmentType() {
        return attachmentType;
    }

    get propertyType() {
        return propertyTypes;
    }

    get loanPurpose() {
        const currentVertical = this.isPurchaseSubmission ? 'purchase' : 'refinance';
        return loanPurpose.filter(purpose => purpose.vertical === currentVertical);
    }

    get occupancyType() {
        return occupancyTypes;
    }

    get loanType() {
        return loanType;
    }

    get moneyValues() {
        const data = {
            estimatedValue: applyMoneyMaskValue(this.lenderData.property.estimatedValue),
            appraisedValue: applyMoneyMaskValue(this.lenderData.property.appraisedValue),
        };

        if (!this.isPurchaseSubmission) {
            data.originalPurchasePrice = applyMoneyMaskValue(this.lenderData.property.originalPurchasePrice);
            data.estimatedLiensToBePaidOff = applyMoneyMaskValue(this.lenderData.property.estimatedLiensToBePaidOff);
        }

        return data;
    }

    get yearAcquired() {
        if (this.isRefiSubmission && this.lenderData.property.dateOfPurchase) {
            return dayjs(this.lenderData.property.dateOfPurchase).format('YYYY');
        }
        return '';
    }

    renderedCallback() {
        this.loadDayjs();
    }

    handleInputChange(event) {
        const input = {
            propertyName: event.target.getAttribute("data-name-input"),
            value: event.target.value,
        }
        this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }));
    }

    handleCommunityStateChange(event) {
        const borrowerOption = this.template.querySelector(`input[data-name-input="${communityPropertyState[0].key}"]`);
        const propertyOption = this.template.querySelector(`input[data-name-input="${communityPropertyState[1].key}"]`);

        const input = { propertyName: 'property.communityPropertyState' };

        if (!borrowerOption.checked && !propertyOption.checked) {
            input.value = null;
        }

        if (borrowerOption.checked) {
            if (propertyOption.checked) input.value = communityPropertyState[2].value;
            else input.value = communityPropertyState[0].value;
        }
        else if(propertyOption.checked){
            input.value = communityPropertyState[1].value;
        }

        this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }));
    }

    handleMoneyChange(event) {
        const newAmount = moneyToFloat(moneyMask(event.target.value));
        if (event.target.value !== '' && parseFloat(newAmount) > 0) {
            event.target.value = `$${moneyMask(newAmount.toFixed(2))}`;
        } else {
            event.target.value = null;
        }
        const input = {
            propertyName: event.target.getAttribute("data-name-input"),
            value: newAmount,
        }
        this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }));
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