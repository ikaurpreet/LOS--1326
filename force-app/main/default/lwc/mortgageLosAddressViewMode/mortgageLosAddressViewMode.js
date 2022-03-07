import { LightningElement, api } from 'lwc';
import { isAbleToEdit } from 'c/util';

/**
 * Participant Address - View Mode
 * @module c-mortgage-los-address-view-mode
 * @property {string} iconUrl - The icon to use in the title
 * @property {string} sectionSubtitle - The title of the section
 * @property {any} handleEdit - The callback to handle click event on edit button
 * @property {module:c-mortgage-los-update-address.ParticipantAddresses} participant - The participant address object
 * 
*/
export default class MortgageLosAddressViewMode extends LightningElement {
    @api iconUrl;
    @api sectionSubtitle;
    @api participant;
    @api handleEdit;
    @api role;
    @api handleAddCurrentAddress;
    @api handleAddFormerAddress;
    @api withCurrentAddress;

    get fullMailingAddress() {
        if (this.participant && this.participant.mailingAddress.addressLine1.value) {
            return `${this.participant.mailingAddress.addressLine1.value || ''}${this.participant.mailingAddress.unit.value ? (', ' + this.participant.mailingAddress.unit.value + ',') : ''} ${this.participant.mailingAddress.city.value || ''}, ${this.participant.mailingAddress.stateCode.value || ''} ${this.participant.mailingAddress.zipCode.value || ''}`;
        }
    }

    get showExtraFormerSubtitle() {
        return this.previousAddresses.length === 0;
    }

    get showMailingAddress() {
        return !this.participant.mailingAddress.isSameAsCurrentAddress.value;
    }

    get previousAddresses() {
        return this.participant.previousAddresses;
    }

    get currentAddressTitle() {
        return this.sectionSubtitle && this.sectionSubtitle[0];
    }

    get formerAddressTitle() {
        return this.sectionSubtitle && this.sectionSubtitle[1];
    }

    get mailingAddressTitle() {
        return this.sectionSubtitle && this.sectionSubtitle[2];
    }

    get isSameAsCurrentAddress() {
        return this.participant.mailingAddress.isSameAsCurrentAddress.value;
    }

    addCurrentAddress = () => {
        this.handleAddCurrentAddress(this.role);
    }

    addFormerAddress = () => {
        this.handleAddFormerAddress(this.role);
    }

    editClass = isAbleToEdit;
}