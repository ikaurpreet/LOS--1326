import { LightningElement, api, track } from 'lwc';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';
import { getEmptyFormValues, housingStatusOptions, getInputValidation } from 'c/util';

/**
 * Participant Address - Edit Mode
 * @module c-mortgage-los-address-edit-mode
 * @property {module:c-mortgage-los-update-address.ParticipantAddresses} participant - The participant object
 * @property {module:c-mortgage-los-update-address.RoleOption} role - Role of Participant
 * @property {string} iconUrl - The icon to use in the title
*/
export default class MortgageLosAddressEditMode extends LightningElement {
    @api participant;
    @api iconUrl;
    @api role;
    @api extraAddress;
    @api withEmptyCurrentAddress;
    @api withCurrentAddress;

    @track currentLiveHereChecked;
    @track sameAsCurrentAddressChecked = false;

    @track showingModal = false;
    @track showingCurrentAddress = false;
    @track deletingAddress = null;
    @track _previousAddresses = [];

    closeModal = (event) => {
        const addressId = event.detail;
        if (addressId) {
            this.deleteAddress(addressId);
        }
        this.showingModal = false;
        this.deletingAddress = null;
    }

    dayjsInitialized = false;

    renderedCallback() {
        if (this.dayjsInitialized) {
            return;
        }
        loadScript(this, Dayjs + '/package/dayjs.min.js').then(() => {
            this.dayjsInitialized = true;
        });
    }

    openModal = (event) => {
        this.deletingAddress = parseFloat(event.target.getAttribute('data-address-id'));
        this.showingModal = true;
    }

    get showCurrentAddressForm() {
        return this.showingCurrentAddress;
    }

    calcTimeInAddress = (date) => {
        if (date && this.dayjsInitialized) {
            return dayjs().diff(dayjs(date), 'year', true);
        }
        return 0;
    }

    get metTimeRequirement() {
        let timeInPreviousAddresses = 0;
        this.previousAddresses.forEach(address => {
            timeInPreviousAddresses += this.calcTimeInAddress(address.startDate.value);
        });

        const timeInAddresses = timeInPreviousAddresses + this.calcTimeInAddress(this.participant.address.startDate.value);

        if (timeInAddresses === 0) {
            return null;
        }
        return timeInAddresses >= 2;
    }

    get showParticipantHelptext() {
        if (this.metTimeRequirement !== null) {
            return (this.withCurrentAddress && this.metTimeRequirement) || (!this.withCurrentAddress || !this.metTimeRequirement);
        }
        return false;
    }

    get currentAddressRequirementIcon() {
        if (this.metTimeRequirement) {
            return 'action:approval'
        }
        else return 'action:close';
    }

    get requirementText() {
        if (this.metTimeRequirement) {
            return this.role === 'borrower' ? 'Borrower reported 2 year history' : 'Co-Borrower reported 2 year history';
        }
        else return 'Does not meet 2 year requirement';
    }

    set showCurrentAddressForm(value) {
        this.showingCurrentAddress = value;
    }

    handleShowCurrentAddress = () => {
        this.showCurrentAddressForm = true;
    }

    get showAlert() {
        return (this.withCurrentAddress && !this.currentLiveHere);
    }

    set showMailingAddress(value) {
        this.sameAsCurrentAddressChecked = value;
    }

    get housingStatusOptions() {
        return housingStatusOptions();
    }

    @api
    get currentlyLiveHereChecked() {
        return this.currentLiveHere || !this.withCurrentAddress;
    }

    get currentlyLiveHereDisabled() {
        return !this.withCurrentAddress;
    }

    get currentLiveHere() {
        return this.currentLiveHereChecked;
    }

    set currentLiveHere(value) {
        this.currentLiveHereChecked = value;
    }

    get showMailingAddress() {
        return !this.sameAsCurrentAddressChecked;
    }

    @api
    get previousAddresses() {
        return this._previousAddresses;
    }

    set previousAddresses(value) {
        this._previousAddresses = value;
    }

    get showExtraFormerSubtitle() {
        return this.previousAddresses.length === 0;
    }

    get mailingAddress() {
        return this.participant.mailingAddress;
    }

    get currentAddressTitle() {
        return this.role === 'borrower' ? `Borrower's Current Address` : `Co-Borrower's Current Address`;
    }

    get formerAddressTitle() {
        return this.role === 'borrower' ? `Borrower's Former Address` : `Co-Borrower's Former Address`;
    }

    get mailingAddressTitle() {
        return this.role === 'borrower' ? `Borrower's Mailing Address` : `Co-Borrower's Mailing Address`;
    }

    @api
    get validate() {
        const reducer = (isValid, currentField) => {
            currentField.reportValidity();
            return isValid && currentField.checkValidity();
        }

        const validFunc = (value) => {
            if (!value) { return false; }
            return true;
        }

        let validCommomForms = true;
        const currentAddressHousingStatusType = this.template.querySelector('[data-section-type="current-address-section"] lightning-combobox');
        const currentAddressCommomForm = this.template.querySelector('[data-section-type="current-address-section"] c-mortgage-los-commom-form-address');
        if (currentAddressCommomForm) {
            validCommomForms *= currentAddressCommomForm.validate;
        }

        const formerAddressesHousingStatusType = this.template.querySelectorAll('[data-section-type="former-address-section"] lightning-combobox');
        const formerAddressesCommomForm = this.template.querySelectorAll('[data-section-type="former-address-section"] c-mortgage-los-commom-form-address');
        formerAddressesCommomForm.forEach(section => {
            validCommomForms *= section.validate;
        });

        const mailingAddressCommomForm = this.template.querySelector('[data-section-type="mailing-address-section"] c-mortgage-los-commom-form-address');
        if (mailingAddressCommomForm) {
            validCommomForms *= mailingAddressCommomForm.validate;
        }

        validCommomForms *= getInputValidation(currentAddressHousingStatusType, validFunc, "Complete this field.");
        formerAddressesHousingStatusType.forEach(combobox => {
            validCommomForms *= getInputValidation(combobox, validFunc, "Complete this field.");
        });

        const otherFields = [...this.template.querySelectorAll(`lightning-input`)];
        const allValid = otherFields.reduce(reducer, validCommomForms);

        return allValid;
    }

    deleteAddress = (addressId) => {
        this.previousAddresses = this.previousAddresses.filter(address => {
            return address.id.value != addressId
        });
    }

    connectedCallback() {
        this.previousAddresses = [...this.participant.previousAddresses];
        if (this.extraAddress) {
            this.addNewEmptyPreviousAddress();
        }
        if (this.participant.mailingAddress && (this.sameAsCurrentAddressChecked !== this.participant.mailingAddress.isSameAsCurrentAddress.value)) {
            this.showMailingAddress = this.participant.mailingAddress.isSameAsCurrentAddress.value;
        }
        this.currentLiveHere = this.withEmptyCurrentAddress || this.withCurrentAddress;
        this.showCurrentAddressForm = this.withEmptyCurrentAddress || this.withCurrentAddress;
    }

    handleCurrentlyLiveHereChange = (event) => {
        this.currentLiveHere = event.target.checked;
    }

    handleSameAsCurrentAddressChange = (event) => {
        this.showMailingAddress = event.target.checked;
        const propertyName = event.target.getAttribute("data-name-input");
        this.handleMailingAddressInputChange(propertyName, event.target.checked);
    }

    addNewEmptyPreviousAddress = () => {
        let updatedPreviousAddresses = [...this.previousAddresses];
        updatedPreviousAddresses.push({ ...getEmptyFormValues(), id: { value: Math.random() } });
        this.previousAddresses = updatedPreviousAddresses;
    }

    handleCurrentOwnershipChange = (event) => {
        const propertyName = event.target.getAttribute("data-name-input");
        const value = event.target.value;

        this.handleCurrentAddressInputChange(propertyName, value);
    }

    handleFormerOwnershipChange = (event) => {
        const propertyName = event.target.getAttribute("data-name-input");
        const addressId = event.target.getAttribute("data-address-id");
        const value = event.target.value;

        this.handleFormerAddressInputChange(propertyName, value, addressId);
    }

    handleInputChange = (property, value, addressType) => {
        const input = {
            propertyName: property,
            value: value,
            role: this.role,
            addressType: addressType
        }
        this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }))
    }

    handleCurrentAddressInputChange = (property, value, addressId) => {
        this.handleInputChange(property, value, 'currentAddress');
    }

    handleMailingAddressInputChange = (property, value, addressId) => {
        this.handleInputChange(property, value, 'mailingAddress');
    }

    handleFormerAddressInputChange = (property, value, addressId) => {
        let position = null;
        let address = this.previousAddresses.find((address, index) => {
            position = index;
            return parseFloat(address.id.value) === parseFloat(addressId)
        });
        if (address) {
            let p = address[property];
            const updatedProperty = { ...p, value: value }
            const updatedAddress = { ...address, [property]: updatedProperty };
            let updatedPreviousAddresses = [...this.previousAddresses];
            updatedPreviousAddresses[position] = updatedAddress;
            this.previousAddresses = updatedPreviousAddresses;
        }
    }
}