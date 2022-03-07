import { getFieldValue, getRecord } from 'lightning/uiRecordApi';
import { LightningElement, api, track, wire } from 'lwc';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import CoBorrowerSR from '@salesforce/resourceUrl/CoBorrower';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import mutateWithMap from '@salesforce/apex/GraphQLProxyController.mutateWithMap';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';
import { default as viewMode } from './templates/view.html';
import { default as editMode } from './templates/edit.html';
import { getEmptyFormValues } from 'c/util';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';

/**
 * @typedef {"borrower" | "coBorrower"} RoleOption
 */

/**
 * Participant Field Info
 * @typedef {Object} ParticipantFieldInfo
 * @property {any} value - The field value
 * @property {string=} label - The field title
 */

/**
 * Participant Form Info
 * @typedef ParticipantField
 * @property {ParticipantFieldInfo} id - Address id
 * @property {ParticipantFieldInfo} addressLine1 - Address Line 1
 * @property {ParticipantFieldInfo} unit - Unit
 * @property {ParticipantFieldInfo} city - City
 * @property {ParticipantFieldInfo} stateCode - State Code
 * @property {ParticipantFieldInfo} zipCode - Zip Code
 * @property {ParticipantFieldInfo} startDate - Start date
 * @property {ParticipantFieldInfo} housingStatusType - Ownership
 */

/**
 * Participant Current Address
 * @typedef {ParticipantField} CurrentAddress
 */

/**
 * Previous Address
 * @typedef {ParticipantField} PreviousAddress
 */

/**
 * @typedef SameAsCurrentAddress
 * @property {boolean} value
 */

/**
 * Participant Mailing Address
 * @typedef {ParticipantField} MailingAddress
 * @property {SameAsCurrentAddress} isSameAsCurrentAddress
 */

/**
 * @typedef {PreviousAddress[]}  PreviousAddresses
 */

/**
 * @typedef module:c-mortgage-los-update-address.ParticipantAddresses
 * @property {boolean} twoYearMet
 * @property {CurrentAddress} address
 * @property {MailingAddress} mailingAddress
 * @property {PreviousAddresses} previousAddresses
 */

/**
 * Participant Form
 * @module c-mortgage-los-update-address
 * @property {string} recordId - Opportunity Id
 * @property {RoleOption} role - Role of Participant
 * @property {boolean} showBothParticipants - Used for show both forms
*/
export default class MortgageLosUpdateAddress extends LightningElement {
    @api recordId;
    @api role;
    @api showBothParticipants;
    @api isEditing = false;
    @track withExtraFormerAddress;
    @track withExtraCurrentAddress;

    _borrowerWithCurrentAddress = null;
    _coBorrowerWithCurrentAddress = null;

    @wire(getRecord, {
        recordId: '$recordId', fields: [
            SUBMISSION_UUID,
            SUBMISSION_TYPE
        ]
    })
    initialize({ data }) {
        if (data) {
            this.opportunity = data;
            getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
        }
    };

    BorrowerIconURL = BorrowerSR;
    CoBorrowerIconURL = CoBorrowerSR;
    borrowerUuid = null;
    coBorrowerUuid = null;

    /**
     * Construct an empty ParticipantAddresses Object
     * @function
     * @return {ParticipantAddresses} emptyFormValues
     */
    emptyFormValues = () => {
        const mailingAddress = getEmptyFormValues();
        const currentAddress = getEmptyFormValues();
        return {
            twoYearMet: false,
            address: {
                ...currentAddress,
            },
            mailingAddress: {
                ...mailingAddress,
                isSameAsCurrentAddress: {
                    value: false
                }
            },
            previousAddresses: []
        }
    };

    @track _coBorrowerAddress = Object.assign({}, this.emptyFormValues());
    @track _borrowerAddress = Object.assign({}, this.emptyFormValues());

    get borrowerAddress() {
        return this._borrowerAddress;
    }

    set borrowerAddress(newAddress) {
        this._borrowerAddress = newAddress;
    }

    get coBorrowerAddress() {
        return this._coBorrowerAddress;
    }

    set coBorrowerAddress(newAddress) {
        this._coBorrowerAddress = newAddress;
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

    get withEmptyFormerAddress() {
        return this.withExtraFormerAddress;
    }

    set withEmptyFormerAddress(value) {
        this.withExtraFormerAddress = value;
    }

    get withEmptyCurrentAddress() {
        return this.withExtraCurrentAddress;
    }

    set withEmptyCurrentAddress(value) {
        this.withExtraCurrentAddress = value;
    }

    get showBorrower() {
        return this.role === "borrower" || this.showBothParticipants;
    }

    get showCoBorrower() {
        return this.role === "coBorrower" || this.showBothParticipants;
    }

    get borrowerSectionSubtitles() {
        return ['Borrower’s Current Address', 'Borrower’s Former Address', 'Borrower’s Mailing Address'];
    }

    get coBorrowerSectionSubtitles() {
        return ['Co-Borrower’s Current Address', 'Co-Borrower’s Former Address', 'Co-Borrower’s Mailing Address'];
    }

    get sectionController() {
        return this.template.querySelector('c-mortgage-los-section-controller');
    }

    get borrowerCurrentAddressRequirementIcon() {
        if (this.borrowerAddress.twoYearMet) {
            return 'action:approval'
        }
        else return 'action:close';
    }

    get coBorrowerCurrentAddressRequirementIcon() {
        if (this.coBorrowerAddress.twoYearMet) {
            return 'action:approval'
        }
        else return 'action:close';
    }

    get borrowerCurrentAddressRequirementText() {
        if (this.borrowerAddress.twoYearMet) {
            return 'Borrower reported 2 year history';
        }
        else return 'Does not meet 2 year requirement';
    }

    get coBorrowerCurrentAddressRequirementText() {
        if (this.coBorrowerAddress.twoYearMet) {
            return 'Co-Borrower reported 2 year history';
        }
        else return 'Does not meet 2 year requirement';
    }

    get showCoBorrowerHelptext() {
        if (this.coBorrowerAddress.twoYearMet !== null) {
            return (this._coBorrowerWithCurrentAddress && this.coBorrowerAddress.twoYearMet) || (!this._coBorrowerWithCurrentAddress || !this.coBorrowerAddress.twoYearMet);
        }
        return false;
    }

    get showBorrowerHelptext() {
        if (this.borrowerAddress.twoYearMet !== null) {
            return (this.borrowerWithCurrentAddress && this.borrowerAddress.twoYearMet) || (!this.borrowerWithCurrentAddress || !this.borrowerAddress.twoYearMet);
        }
        return false;
    }

    get borrowerWithExtraFormerAddress() {
        return this.withEmptyFormerAddress && this.withEmptyFormerAddress === "borrower";
    }

    get coBorrowerWithExtraFormerAddress() {
        return this.withEmptyFormerAddress && this.withEmptyFormerAddress === "coBorrower";
    }

    get borrowerWithEmptyCurrentAddress() {
        return this.withEmptyCurrentAddress && this.withEmptyCurrentAddress === "borrower";
    }

    get coBorrowerWithEmptyCurrentAddress() {
        return this.withEmptyCurrentAddress && this.withEmptyCurrentAddress === "coBorrower";
    }

    handleEditClick = () => {
        this.isEditing = true;
    }

    handleEditWithExtraFormerAddress = (role) => {
        this.withEmptyFormerAddress = role;
        this.isEditing = true;
    }

    handleEditWithExtraCurrentAddress = (role) => {
        this.withEmptyCurrentAddress = role;
        this.isEditing = true;
    }

    handleCancelClick = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        this.withEmptyFormerAddress = null;
        this.withEmptyCurrentAddress = null;
        getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
    }

    prepareParticipantAddresses = (participant, uuid, currentLiveHere) => {
        let objectResult = {
            currentAddress: {},
            mailingAddress: {},
            previousAddresses: [],
            mailingAddressSameAsCurrent: false
        };

        if (participant.address && currentLiveHere) {
            Object.keys(participant.address).forEach(property => {
                if (property !== 'twoYearMet') {
                    objectResult["currentAddress"][property] = participant.address[property].value;
                }
            });
        } else {
            objectResult["currentAddress"] = null;
        }

        if (participant.mailingAddress) {
            Object.keys(participant.mailingAddress).forEach(property => {
                if (property !== 'isSameAsCurrentAddress' && property !== 'twoYearMet') {
                    objectResult["mailingAddress"][property] = participant.mailingAddress[property].value;
                }
            });
        }
        if (participant.previousAddresses.length > 0) {
            participant.previousAddresses.forEach((address, index) => {
                let newAddress = {};
                Object.keys(address).forEach(property => {
                    if (!(property === 'id' && !Number.isInteger(address[property].value))) {
                        newAddress[property] = address[property].value;
                    }
                });
                objectResult["previousAddresses"].push(newAddress);
            });
        }
        return { ...objectResult, uuid: uuid, mailingAddressSameAsCurrent: participant.mailingAddress.isSameAsCurrentAddress.value || false };
    }

    handleCurrentLiveHereUnchecked = (participantAddresses, updatedPreviousAddresses) => {
        updatedPreviousAddresses.unshift({ ...participantAddresses.address });
        participantAddresses.previousAddresses = [...updatedPreviousAddresses];
        participantAddresses.address = { ...getEmptyFormValues() };
    }

    handleSaveClick = () => {
        const sections = this.template.querySelectorAll('c-mortgage-los-address-edit-mode');
        let validForm = true;
        sections.forEach(section => {
            validForm = validForm * section.validate;
        });

        if (validForm) {
            this.sectionController.hideContent();
            this.isEditing = false;
            let variables = {};
            if (this.showBorrower) {
                const editModeComp = this.template.querySelector('[data-participant-type="borrower"] c-mortgage-los-address-edit-mode');
                const currentLiveHere = editModeComp.currentlyLiveHereChecked;
                const updatedPreviousAddresses = editModeComp.previousAddresses;
                if (!currentLiveHere) {
                    this.handleCurrentLiveHereUnchecked(this.borrowerAddress, updatedPreviousAddresses);
                } else {
                    this.borrowerAddress.previousAddresses = [...updatedPreviousAddresses];
                }
                variables["borrower"] = {
                    ...this.prepareParticipantAddresses(this.borrowerAddress, this.borrowerUuid, currentLiveHere)
                };
            }
            if (this.showCoBorrower) {
                const editModeComp = this.template.querySelector('[data-participant-type="coBorrower"] c-mortgage-los-address-edit-mode');
                const currentLiveHere = editModeComp.currentlyLiveHereChecked;
                const updatedPreviousAddresses = editModeComp.previousAddresses;
                if (!currentLiveHere) {
                    this.handleCurrentLiveHereUnchecked(this.coBorrowerAddress, updatedPreviousAddresses);
                } else {
                    this.coBorrowerAddress.previousAddresses = [...updatedPreviousAddresses];
                }
                variables["coBorrower"] = {
                    ...this.prepareParticipantAddresses(this.coBorrowerAddress, this.coBorrowerUuid, currentLiveHere)
                };
            }
            updateParticipant(this.opportunity, this.recordId, this.mutationCallback.bind(this), variables);
        }
    }

    setParticipantAddress = (address, toUpdate) => {
        return {
            id: { ...toUpdate.id, value: address.id },
            addressLine1: { ...toUpdate.addressLine1, value: address.addressLine1 },
            unit: { ...toUpdate.unit, value: address.unit },
            city: { ...toUpdate.city, value: address.city },
            stateCode: { ...toUpdate.stateCode, value: address.stateCode },
            zipCode: { ...toUpdate.zipCode, value: address.zipCode },
            startDate: { ...toUpdate.startDate, value: address.startDate },
            housingStatusType: { ...toUpdate.housingStatusType, value: address.housingStatusType }
        }
    }

    calcTimeInAddress = (date) => {
        if (date && this.dayjsInitialized) {
            return dayjs().diff(dayjs(date), 'year', true);
        }
        return 0;
    }

    calcTimeInPreviousAddresses = (previousAddresses) => {
        let timeInPreviousAddresses = 0;
        previousAddresses.forEach(address => {
            timeInPreviousAddresses += this.calcTimeInAddress(address.startDate.value);
        });
        return timeInPreviousAddresses;
    }

    metTimeRequirement(timeInCurrentAddress, timeInPreviousAddresses) {
        if (timeInCurrentAddress + timeInPreviousAddresses === 0) {
            return null;
        }
        return (timeInCurrentAddress + timeInPreviousAddresses) >= 2;
    }

    setParticipantPreviousAddresses(addresses) {
        return addresses.map(previous => {
            return { ...this.setParticipantAddress(previous.address, getEmptyFormValues()), rentAmount: {} };
        });
    }

    changeParticipantCurrentAddress = (event) => {
        if (event.detail.role === "borrower") {
            this.borrowerAddress.address[event.detail.propertyName].value = event.detail.value;
        }
        if (event.detail.role === "coBorrower") {
            this.coBorrowerAddress.address[event.detail.propertyName].value = event.detail.value;
        }
    }

    changeParticipantMailingAddress = (event) => {
        if (event.detail.role === "borrower") {
            this.borrowerAddress.mailingAddress[event.detail.propertyName].value = event.detail.value;
        }
        if (event.detail.role === "coBorrower") {
            this.coBorrowerAddress.mailingAddress[event.detail.propertyName].value = event.detail.value;
        }
    }

    updateParticipantAddress = (event) => {
        if (event.detail.addressType === 'currentAddress') {
            this.changeParticipantCurrentAddress(event);
        }
        else if (event.detail.addressType === 'mailingAddress') {
            this.changeParticipantMailingAddress(event);
        }
    }

    handleParticipantChange = (event) => {
        this.updateParticipantAddress(event);
    }

    mutationCallback = (result) => {
        this.submissionCallback(result);
    }

    submissionCallback(result) {
        if (result) {
            if (this.showCoBorrower) {
                this.coBorrowerUuid = result.coBorrower.uuid;
                const address = result.coBorrower.address;
                this._coBorrowerWithCurrentAddress = !!address;
                const mailingAddress = result.coBorrower.mailingAddress;
                const previousAddresses = result.coBorrower.previousAddresses;
                const coBorrowerPreviousAddresses = this.setParticipantPreviousAddresses(previousAddresses);
                const coBorrowerAddress = address ? this.setParticipantAddress(address, this.coBorrowerAddress.address) : getEmptyFormValues();
                const coBorrowerAddressRequirement = this.metTimeRequirement(this.calcTimeInAddress(coBorrowerAddress.startDate.value), this.calcTimeInPreviousAddresses(coBorrowerPreviousAddresses));
                const coBorrowerMailingAddress = mailingAddress ? this.setParticipantAddress(mailingAddress, this.coBorrowerAddress.mailingAddress) : this.coBorrowerAddress.mailingAddress;
                const sameMailingAddress = result.coBorrower.sameMailingAddress;
                this.coBorrowerAddress.twoYearMet = coBorrowerAddressRequirement;
                this.coBorrowerAddress.address = { ...coBorrowerAddress };
                this.coBorrowerAddress.mailingAddress = { ...coBorrowerMailingAddress, isSameAsCurrentAddress: { value: sameMailingAddress } };
                this.coBorrowerAddress.previousAddresses = coBorrowerPreviousAddresses;
            }
            if (this.showBorrower) {
                this.borrowerUuid = result.borrower.uuid;
                const address = result.borrower.address;
                this._borrowerWithCurrentAddress = !!address;
                const mailingAddress = result.borrower.mailingAddress;
                const previousAddresses = result.borrower.previousAddresses;
                const borrowerPreviousAddresses = this.setParticipantPreviousAddresses(previousAddresses);
                const borrowerAddress = address ? this.setParticipantAddress(address, this.borrowerAddress.address) : getEmptyFormValues();
                const borrowerAddressRequirement = this.metTimeRequirement(this.calcTimeInAddress(borrowerAddress.startDate.value), this.calcTimeInPreviousAddresses(borrowerPreviousAddresses));
                const borrowerMailingAddress = mailingAddress ? this.setParticipantAddress(mailingAddress, this.borrowerAddress.mailingAddress) : this.borrowerAddress.mailingAddress;
                const sameMailingAddress = result.borrower.sameMailingAddress;
                this.borrowerAddress.twoYearMet = borrowerAddressRequirement;
                this.borrowerAddress.address = { ...borrowerAddress };
                this.borrowerAddress.mailingAddress = { ...borrowerMailingAddress, isSameAsCurrentAddress: { value: sameMailingAddress } };
                this.borrowerAddress.previousAddresses = borrowerPreviousAddresses;
            }
            this.sectionController.showContent();
        } else {
            this.sectionController.showError();
        }
    }

    render() {
        return this.isEditing ? editMode : viewMode;
    }
}

/**
 * Gets the data from database based on queries described in queries.js
 * @param {*} opportunity
 * @param {*} recordId
 * @param {*} submissionCallback
 * @returns {void}
 */
const getSubmission = (opportunity, recordId, submissionCallback) => {
    const submissionUuid = getFieldValue(opportunity, SUBMISSION_UUID);
    const submissionType = getFieldValue(opportunity, SUBMISSION_TYPE);
    let gqlQuery = null;

    if (submissionType === 'MortgageRefi') {
        gqlQuery = REFINANCE_SUBMISSION_QUERY;
    } else if (submissionType === 'HomePurchase') {
        gqlQuery = PURCHASE_SUBMISSION_QUERY;
    } else {
        submissionCallback({});
        console.error('Submission is not Mortgages Refinance nor Home Purchase.');
        return;
    }

    const promise = queryWithMap({ identifier: recordId, query: gqlQuery, variables: { submissionUuid } });
    promise.then(data => {
        const result = JSON.parse(data);
        submissionCallback(result)
    }).catch(error => {
        console.log(error);
        submissionCallback(null);
    })
}

const updateParticipant = (opportunity, recordId, mutationCallback, variables) => {
    const submissionType = getFieldValue(opportunity, SUBMISSION_TYPE);
    let gqlQuery = null;

    if (submissionType === 'MortgageRefi') {
        gqlQuery = REFINANCE_SUBMISSION_MUTATION;
    } else if (submissionType === 'HomePurchase') {
        gqlQuery = PURCHASE_SUBMISSION_MUTATION;
    } else {
        mutationCallback({});
        console.error('Submission is not Mortgages Refinance nor Home Purchase.');
        return;
    }

    const promise = mutateWithMap({ identifier: recordId, query: gqlQuery, variables: variables });
    promise.then(data => {
        const result = JSON.parse(data);
        mutationCallback(result)
    }).catch(error => {
        console.log(error);
        mutationCallback(null);
    })
}