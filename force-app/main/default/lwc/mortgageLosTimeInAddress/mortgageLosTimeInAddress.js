import { LightningElement, track, api } from 'lwc';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';

export default class MortgageLosTimeInCurrentAddress extends LightningElement {
    @track months;
    @track years;
    @api startDate;
    @api isCurrentAddress;
    @api handleInputChange;

    dayjsInitialized = false;

    connectedCallback() {
        this.months = 0;
        this.years = 0;
    }

    renderedCallback() {
        if (this.dayjsInitialized) {
            return;
        }
        loadScript(this, Dayjs + '/package/dayjs.min.js').then(() => {
            this.dayjsInitialized = true;
            this.initialize();
        });
    }

    initialize = () => {
        if (this.startDate && this.startDate.value) {
            this.months = dayjs().diff(dayjs(this.startDate.value), 'month') % 12;
            this.years = dayjs().diff(dayjs(this.startDate.value), 'years');
        }
    }

    get currentMonths() {
        return this.months;
    }

    set currentMonths(value) {
        this.months = value;
    }

    get currentYears() {
        return this.years;
    }

    set currentYears(value) {
        this.years = value;
    }

    handleYearChange = (event) => {
        const years = event.target.value;
        this.currentYears = years;
        let startDate = dayjs().subtract(years, 'year');
        startDate = this.currentMonths ? dayjs(startDate).subtract(this.currentMonths, 'month') : startDate;
        const propertyName = event.target.getAttribute("data-name-input");
        this.handleInputChange(propertyName, startDate.format());
    }

    handleMonthChange = (event) => {
        const months = event.target.value;
        this.currentMonths = months;
        let startDate = dayjs().subtract(months, 'month');
        startDate = this.currentYears ? dayjs(startDate).subtract(this.currentYears, 'year') : startDate;
        const propertyName = event.target.getAttribute("data-name-input");
        this.handleInputChange(propertyName, startDate.format());
    }

    @api
    get startDateLabel() {
        return this.isCurrentAddress ? 'How Long at Current Address' : 'How Long at Former Address';
    }
}