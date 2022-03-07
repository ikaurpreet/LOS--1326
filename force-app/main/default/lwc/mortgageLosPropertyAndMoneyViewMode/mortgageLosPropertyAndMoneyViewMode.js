import { LightningElement, api } from 'lwc';
import { moneyMask } from 'c/inputMaskUtils';

const OccupancyTypes = {
    'primaryResidence': 'Primary Residence',
    'secondHome': 'Second Home',
    'investmentProperty': 'Investment Property'
}

const OwnershipTypes = {
    'sole': 'By Yourself',
    'jointWithSpouse': 'Jointly with your spouse',
    'jointWithOtherThanSpouse': 'Jointly with another person'
}

/**
 * Participant Form - View Mode
 * @module c-mortgage-los-property-and-money-view-mode
 * @property {module:c-mortgage-los-property-and-money.Declarations} declarations - The participant object
 * @property {string} role - Role of Participant
 * @property {string} iconUrl - The icon to use in the title
 */
export default class MortgageLosPropertyAndMoneyViewMode extends LightningElement {
    @api iconUrl;
    @api role;
    @api declarations;
    @api handleEdit;
    @api submissionType;

    get sectionPropertyTitle() {
        return `About this Property and Your Money for this Loan - ${this.role === 'borrower' ? 'Borrower' : 'Co-Borrower'}`;
    }

    get sectionFinancesTitle() {
        return `About Your Finances - ${this.role === 'borrower' ? 'Borrower' : 'Co-Borrower'}`;
    }

    get occupancy() {
        return OccupancyTypes[this.declarations.occupancyType];
    }

    get ownership() {
        return OwnershipTypes[this.declarations.ownershipType];
    }

    get amount() {
        return `$${moneyMask(this.declarations.borrowMoneyFromAnotherPartyAmount)}`;
    }

    get isRefi() {
        return this.submissionType === 'MortgageRefi';
    }

    get typesOfBankruptcy() {
        return [
            this.declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter7 ? 'Chapter 7' : null,
            this.declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter11 ? 'Chapter 11' : null,
            this.declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter12 ? 'Chapter 12' : null,
            this.declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter13 ? 'Chapter 13' : null,
        ].filter(Boolean).join(', ');
    }

}