import { LightningElement, track, api } from 'lwc';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';
import { getHousingStatusLabel, getDateLabel } from 'c/util';

/**
 * @typedef {module:c-mortgage-los-update-address.PreviousAddress | module:c-mortgage-los-update-address.CurrentAddress} Address
 */

/**
 * Participant Address Form - View Mode
 * @module c-mortgage-los-address-view-form
 * @property {Address} address - The participant address object
 * @property {function} handleEdit - The callback to change to Edit Mode
 * @property {string} iconUrl - The icon to use in the title
 * @property {string} title - The title for the section
*/
export default class MortgageLosAddressForm extends LightningElement {
    @api address;
    @api title;
    @api type;
    @api iconUrl;
    @api handleEdit;

    @track timeInCurrentAddress;

    dayjsInitialized = false;

    renderedCallback() {
        if (this.dayjsInitialized) {
            return;
        }
        this.dayjsInitialized = true;
        loadScript(this, Dayjs + '/package/dayjs.min.js').then(() => {
            this.calculateTimeInCurrentAddress();
        });
    }

    get fullCurrentAddress() {
        if (this.address && this.address.addressLine1.value) {
            return `${this.address.addressLine1.value || ''}${this.address.unit.value ? (', ' + this.address.unit.value + ',') : ''} ${this.address.city.value || ''}, ${this.address.stateCode.value || ''} ${this.address.zipCode.value || ''}`;
        }
        return '';
    }

    get getHousingStatusLabel() {
        return this.address.housingStatusType ? getHousingStatusLabel(this.address.housingStatusType.value) : '';
    }

    get howLongAtAddressLabel() {
        return this.type === 'current' ? 'How Long at Current Address' : 'How Long at Former Address';
    }

    getMonthLabel = (month, year) => {
        if (month === 0) {
            return '';
        }
        if (month > 0 && month < 1 && year === 0) {
            return 'Less than a month';
        }
        if (month >= 1 && month < 2) {
            return 'month';
        }
        if (month >= 2) {
            return 'months';
        }
        return '';
    }

    calculateTimeInCurrentAddress = () => {
        if (this.address && this.address.startDate && this.address.startDate.value) {
            let years = dayjs().diff(dayjs(this.address.startDate.value), 'year');
            let months = dayjs().diff(dayjs(this.address.startDate.value), 'month', true);
            this.timeInCurrentAddress = getDateLabel(months, years);
        } else {
            this.timeInCurrentAddress = '';
        }
    }
}