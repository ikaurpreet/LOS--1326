import { api, track } from 'lwc';
import { default as viewMode } from './templates/view.html';
import { default as editMode } from './templates/edit.html';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import CoBorrowerSR from '@salesforce/resourceUrl/CoBorrower';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import Employment2yrAlertChannel from '@salesforce/messageChannel/Employment2yrAlertChannel__c';
import { publish } from 'lightning/messageService';
import BaseComponent from 'c/baseComponent';
import { SectionId } from 'c/util'

const emptyEmployment = {
    uuid: null,
    address: { addressLine1: '' },
    key: null,
    fullAddress: '',
    employerName: '',
    position: '',
    startedOn: '',
    endDate: null,
    isEmployerPartyToTransaction: null,
    hasOwnershipShare: null,
    employerType: null,
    businessPhone: '',
    currentlyWorking: true,
    workExperience: {
        years: null,
        months: null
    },
    grossMonthlyIncomeSummary: {
        base: 0,
        bonuses: 0,
        commissions: 0,
        other: 0,
        overtime: 0,
        total: 0
    },
    delete: false
};

/**
 * @typedef {"lessThanQuarter" | "moreThanQuarter"} OwnershipShare
 */

/**
 * @typedef {"partTime" | "fullTime" | "selfEmployment"} EmployerType
 */

/**
 * Participant employment address
 * @typedef Address
 * @property {string} id - Id
 * @property {string} addressLine1 - Address Line 1
 * @property {string } addressLine2 - Address Line 2
 * @property {string } unit - Unit
 * @property {string} city - City
 * @property {string} stateCode - State Code
 * @property {string} zipCode - Zip Code
 */

/**
 * Participant employment
 * @typedef module:c-mortgage-los-previous-employment-and-income.Employment
 * @property {string} uuid - Id
 * @property {string} employerName - Employer Name
 * @property {string} businessPhone - Business Phone
 * @property {string} position - Position
 * @property {string} startedOn - Start Date
 * @property {string} endDate - End Date
 * @property {integer} workExperience - Work experience (years)
 * @property {boolean} isEmployerPartyToTransaction - Is Employer Party To Transaction
 * @property {OwnershipShare} ownershipShare - Ownership share
 * @property {boolean} hasOwnershipShare - Has Ownership Share
 * @property {EmployerType} employerType - Employer Type
 * @property {Address} address - Address object
 */

/**
 * Participant employment
 * @typedef ParticipantEmployments
 * @property {string} ssn - SSN
 * @property {string} uuid - UUID
 * @property {module:c-mortgage-los-previous-employment-and-income.Employment[]} employments - previous employments
 */

/**
 * Participant Form
 * @module c-mortgage-los-previous-employment-and-income
 * @property {string} recordId - Opportunity Id
 * @property {RoleOption} role - Role of Participant
 * @property {boolean} showBothParticipants - Used to show both forms
*/
export default class MortgageLosPreviousEmploymentAndIncome extends BaseComponent {
    @api role;
    @api showBothParticipants;
    @api isEditing = false;
    borrowerId;
    coBorrowerId;

    /**
     * @type {ParticipantEmployments}
     */
    @track borrowerEmployments;
    /**
     * @type {ParticipantEmployments}
     */
    @track coBorrowerEmployments;

    BorrowerIconURL = BorrowerSR;
    CoBorrowerIconURL = CoBorrowerSR;

    emptyFormValues = () => {
        return {
            employments: []
        }
    }

    /**
     * Implmentation of "virtual" method to retrieve initial data set
     */
    loadSubmissionData() {
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    connectedCallback() {
        this.borrowerEmployments = Object.assign({}, this.emptyFormValues());
        this.coBorrowerEmployments = Object.assign({}, this.emptyFormValues());
        this.registerSubscription(
            [SectionId.PREVIOUS_EMPLOYMENT],
            this.loadSubmissionData
        );
    }

    get showBorrower() {
        return this.role === "borrower" || this.showBothParticipants;
    }

    get showCoBorrower() {
        return this.role === "coBorrower" || this.showBothParticipants;
    }

    get sectionController() {
        return this.template.querySelector('c-mortgage-los-section-controller');
    }

    get showExtraBorrowerTitle() {
        return this.borrowerEmployments.employments.filter(employment => !employment.delete).length === 0;
    }

    get showExtraCoBorrowerTitle() {
        return this.coBorrowerEmployments.employments.filter(employment => !employment.delete).length === 0;
    }

    handleEdit = () => {
        this.isEditing = true;
    }

    handleInputChange = (value, inputName, role, employmentId) => {
        if (role === 'borrower') {
            this.borrowerEmployments.employments.forEach((employment, index) => {
                if (employment.uuid == employmentId) {
                    employment = { ...employment, [inputName]: value }
                    this.borrowerEmployments.employments[index] = employment;
                }
            });
        }
        if (role === 'coBorrower') {
            this.coBorrowerEmployments.employments.forEach((employment, index) => {
                if (employment.uuid == employmentId) {
                    employment = { ...employment, [inputName]: value }
                    this.coBorrowerEmployments.employments[index] = employment;
                }
            });
        }
        publish(this.messageContext, Employment2yrAlertChannel, { borrowerEmployments: this.borrowerEmployments.employments, coBorrowerEmployments: this.coBorrowerEmployments.employments });
    }

    handleAddressInputChange = (value, inputName, role, employmentId) => {
        if (role === 'borrower') {
            this.borrowerEmployments.employments.forEach((employment, index) => {
                if (employment.uuid === employmentId) {
                    const address = { ...employment.address, [inputName]: value };
                    employment = { ...employment, address };
                    this.borrowerEmployments.employments[index] = employment;
                }
            });
        }
        if (role === 'coBorrower') {
            this.coBorrowerEmployments.employments.forEach((employment, index) => {
                if (employment.uuid === employmentId) {
                    const address = { ...employment.address, [inputName]: value };
                    employment = { ...employment, address };
                    this.coBorrowerEmployments.employments[index] = employment;
                }
            });
        }
    }

    handleCancel = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    mutationCallback = (result) => {
        this.submissionCallback(result);
    }

    moneyToFloat(moneyString) {
        return moneyString ? parseFloat(moneyString.toString().replaceAll(',', '')) : 0;
    }

    addAditionalBorrowerCurrentEmployment = () => {
        this.handleEdit();
        this.borrowerEmployments.employments.push({ ...emptyEmployment, key: Math.random() });
    }

    addAditionalCoBorrowerCurrentEmployment = () => {
        this.handleEdit();
        this.coBorrowerEmployments.employments.push({ ...emptyEmployment, key: Math.random() });
    }

    deleteEmployment = (employmentKey, role) => {
        if (role === 'borrower') {
            this.borrowerEmployments.employments.find((employment, index) => {
                if (employment.key == employmentKey && employment.uuid) {
                    employment = { ...employment, delete: true };
                    this.borrowerEmployments.employments[index] = employment;
                } else if (employment.key == employmentKey && !employment.uuid) {
                    this.borrowerEmployments = {
                        ...this.borrowerEmployments, employments: this.borrowerEmployments.employments.filter(employment => {
                            return employment.key != employmentKey
                        })
                    };
                }
            });
        }
        if (role === 'coBorrower') {
            this.coBorrowerEmployments.employments.find((employment, index) => {
                if (employment.key == employmentKey && employment.uuid) {
                    employment = { ...employment, delete: true };
                    this.coBorrowerEmployments.employments[index] = employment;
                } else if (employment.key == employmentKey && !employment.uuid) {
                    this.coBorrowerEmployments = {
                        ...this.coBorrowerEmployments, employments: this.coBorrowerEmployments.employments.filter(employment => {
                            return employment.key != employmentKey
                        })
                    };
                }
            });
        }
        publish(this.messageContext, Employment2yrAlertChannel, {
            borrowerEmployments: this.borrowerEmployments.employments.filter(employment => !employment.delete),
            coBorrowerEmployments: this.coBorrowerEmployments.employments.filter(employment => !employment.delete)
        });
    }

    prepareEmployment(employments) {
        return employments.map(employment => {
            employment.address = employment.address ? {
                addressLine1: employment.address.addressLine1,
                city: employment.address.addressLine1 ? employment.address.city : '',
                unit: employment.address.addressLine1 ? employment.address.unit : '',
                stateCode: employment.address.addressLine1 ? employment.address.stateCode : '',
                zipCode: employment.address.addressLine1 ? employment.address.zipCode : '',
            } : null;
            return {
                uuid: employment.uuid,
                position: employment.position,
                employerName: employment.employerName,
                address: employment.address,
                incomes: [
                    { incomeType: "balanceEmploymentIncome", amount: this.moneyToFloat(employment.grossMonthlyIncomeSummary.base), paymentTermType: 'perMonth', delete: false },
                    { incomeType: "overtime", amount: this.moneyToFloat(employment.grossMonthlyIncomeSummary.overtime), paymentTermType: 'perMonth', delete: false },
                    { incomeType: "bonuses", amount: this.moneyToFloat(employment.grossMonthlyIncomeSummary.bonuses), paymentTermType: 'perMonth', delete: false },
                    { incomeType: "commissions", amount: this.moneyToFloat(employment.grossMonthlyIncomeSummary.commissions), paymentTermType: 'perMonth', delete: false },
                    { incomeType: "other", amount: this.moneyToFloat(employment.grossMonthlyIncomeSummary.other), paymentTermType: 'perMonth', delete: false }
                ],
                isEmployerPartyToTransaction: employment.isEmployerPartyToTransaction,
                hasOwnershipShare: employment.hasOwnershipShare,
                employerType: employment.employerType,
                businessPhone: employment.businessPhone,
                startedOn: employment.startedOn,
                endDate: employment.endDate,
                delete: employment.delete || false
            }
        })
    }

    handleSaveClick = () => {
        const sections = this.template.querySelectorAll('c-mortgage-los-employments-edit-mode');
        let validForm = true;
        sections.forEach(section => {
            validForm = validForm * section.validate;
        });

        if (validForm) {
            this.sectionController.hideContent();
            this.isEditing = false;
            let variables = {};
            if (this.showBorrower) {
                variables["borrower"] = {
                    "uuid": this.borrowerId,
                    "employments": this.prepareEmployment(this.borrowerEmployments.employments)
                };
            }
            if (this.showCoBorrower) {
                variables["coBorrower"] = {
                    "uuid": this.coBorrowerId,
                    "employments": this.prepareEmployment(this.coBorrowerEmployments.employments)
                };
            }
            this.updateParticipant(
                this.mutationCallback.bind(this),
                variables,
                { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION }
            );
        }
    }

    submissionCallback(result) {
        if (result) {
            if (this.showCoBorrower) {
                this.coBorrowerId = result.coBorrower.uuid;
                this.coBorrowerEmployments.employments = result.coBorrower.employments.map(employment => {
                    if (employment.endDate) {
                        return { ...employment, key: employment.uuid }
                    }
                }).filter(Boolean);
            }
            if (this.showBorrower) {
                this.borrowerId = result.borrower.uuid;
                this.borrowerEmployments.employments = result.borrower.employments.map(employment => {
                    if (employment.endDate) {
                        return { ...employment, key: employment.uuid }
                    }
                }).filter(Boolean);
            }
            publish(this.messageContext, Employment2yrAlertChannel, { borrowerEmployments: this.borrowerEmployments.employments, coBorrowerEmployments: this.coBorrowerEmployments.employments });
            this.sectionController.showContent();
        } else {
            this.sectionController.showError();
        }
    }

    render() {
        return this.isEditing ? editMode : viewMode;
    }
}