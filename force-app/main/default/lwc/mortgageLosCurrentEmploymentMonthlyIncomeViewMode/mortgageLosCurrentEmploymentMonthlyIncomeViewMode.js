import { LightningElement, api, track } from 'lwc';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';
import { getDateLabel, isAbleToEdit } from 'c/util';
import { moneyMask } from 'c/inputMaskUtils';

export default class MortgageLosCurrentEmploymentMonthlyIncomeViewMode extends LightningElement {
    @api employment;
    @api employments;
    @api handleEdit;
    @api getTitle;
    @api icon;
    @api role;
    @api metTimeRequirement
    @track dayjsInitialized = false;
    editClass = isAbleToEdit

    constructor() {
        super();
        this.getTitle = () => { return '' }
    }

    renderedCallback() {
        if (this.dayjsInitialized) {
            return;
        }
        loadScript(this, Dayjs + '/package/dayjs.min.js').then(() => {
            this.dayjsInitialized = true;
        });
    }

    get title() {
        return this.getTitle(this.role, this.employment, this.employments);
    }

    get checkboxIsPartyToTransactionId() {
        return `checkbox-is-party-to-transaction-${this.employment.uuid}`
    }

    get checkboxIsOwnerId() {
        return `checkbox-is-owner-${this.employment.uuid}`
    }

    get startedOnFormatted() {
        if (this.dayjsInitialized) {
            return dayjs(this.employment.startedOn).format('MM/YYYY')
        } else {
            return ''
        }
    }

    get workExperienceTime() {
        if (this.dayjsInitialized && this.employment.startedOn) {
            let years = dayjs().diff(dayjs(this.employment.startedOn), 'year');
            let months = dayjs().diff(dayjs(this.employment.startedOn), 'month', true);
            return getDateLabel(months, years);
        } else {
            return '';
        }
    }

    get subtitleString() {
        return this.role ? `Current Employment- ${this.role[0].toUpperCase() + this.role.slice(1)} ` : ''
    }

    get sectionTitle() {
        if (this.metTimeRequirement) {
            return this.role ? `${this.role[0].toUpperCase() + this.role.slice(1)} reported 2 year history with current and/or previous employment` : ''
        } else {
            return this.role ? `${this.role[0].toUpperCase() + this.role.slice(1)} has not reported 2 year history with current and/or previous employment` : ''
        }
    }

    get employmentFormatted() {
        return {
            ...this.employment,
            hasOwnershipShare: this.employment.hasOwnershipShare || this.employment.employerType === 'selfEmployment',
            workExperience: this.workExperienceTime,
            base: `$${moneyMask(parseFloat(this.employment.grossMonthlyIncomeSummary.base).toFixed(2))}/mo`,
            bonuses: `$${moneyMask(parseFloat(this.employment.grossMonthlyIncomeSummary.bonuses).toFixed(2))}/mo`,
            commissions: `$${moneyMask(parseFloat(this.employment.grossMonthlyIncomeSummary.commissions).toFixed(2))}/mo`,
            other: `$${moneyMask(parseFloat(this.employment.grossMonthlyIncomeSummary.other).toFixed(2))}/mo`,
            overtime: `$${moneyMask(parseFloat(this.employment.grossMonthlyIncomeSummary.overtime).toFixed(2))}/mo`,
            total: `$${moneyMask(parseFloat(this.employment.grossMonthlyIncomeSummary.total).toFixed(2))}/mo`
        }
    }
}