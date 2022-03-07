import { LightningElement, api, track } from 'lwc';
import { isAbleToEdit } from 'c/util';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { getDateLabel, getFullAddress } from 'c/util';
import { loadScript } from 'lightning/platformResourceLoader';

/**
 * Participant Form - View Mode
 * @module c-mortgage-los-employments-view-mode
 * @property {module:c-mortgage-los-previous-employment-and-income.Employment} participantEmployments - The participant object
 * @property {string} role - Role of Participant
 * @property {string} iconUrl - The icon to use in the title
 * @property {function} handleEdit - The callback function to change to Edit mode
 */
export default class MortgageLosEmploymentsViewMode extends LightningElement {
    @api participantEmployments;
    @api role;
    @api iconUrl;
    @api handleEdit;
    @track _employments;

    editClass = isAbleToEdit;

    @track dayjsInitialized = false;

    renderedCallback() {
        if (this.dayjsInitialized) {
            return;
        }
        loadScript(this, Dayjs + '/package/dayjs.min.js').then(() => {
            this.dayjsInitialized = true;
        });
    }

    get employments() {
        let newEmployments = [];
        this.participantEmployments.forEach(employment => {
            newEmployments.push(Object.assign({ fullAddress: null, formattedStartDate: null, formattedEndDate: null, selfEmployment: null, timeInLineOfWork: null }, employment));
        });
        newEmployments.forEach((employment) => {
            if (employment.address) {
                employment['fullAddress'] = getFullAddress(employment.address);
            }
            if (employment.startedOn && this.dayjsInitialized) {
                employment['formattedStartDate'] = dayjs(employment.startedOn).format('MM/YYYY');
            }
            if (employment.endDate && this.dayjsInitialized) {
                employment['formattedEndDate'] = dayjs(employment.endDate).format('MM/YYYY');
            }
            if (employment.startedOn && employment.endDate && this.dayjsInitialized) {
                let months = dayjs(employment.endDate).diff(dayjs(employment.startedOn), 'month', true);
                let years = dayjs(employment.endDate).diff(dayjs(employment.startedOn), 'years');
                employment['timeInLineOfWork'] = getDateLabel(months, years);
            }
            employment['selfEmployment'] = employment.hasOwnershipShare || employment.employerType === 'selfEmployment';
        });
        return newEmployments;
    }

    set employments(value) {
        this._employments = value;
    }

    get sectionTitle() {
        return this.role === "borrower" ? "Previous Employment - Borrower" : "Previous Employment - Co-Borrower";
    }
}