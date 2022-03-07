import { LightningElement, api, wire, track } from 'lwc';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import CoBorrowerSR from '@salesforce/resourceUrl/CoBorrower';
import { getFieldValue, getRecord } from 'lightning/uiRecordApi';
import { moneyMask } from 'c/inputMaskUtils';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import mutateWithMap from '@salesforce/apex/GraphQLProxyController.mutateWithMap';
import { default as viewMode } from './templates/view.html';
import { default as editMode } from './templates/edit.html';

/**
 * @typedef {"primaryResidence" | "secondHome" | "investmentProperty"} OccupancyTypeEnum
 */

/**
 * @typedef {"sole" | "jointWithSpouse" | "jointWithOtherThanSpouse"} OwnershipTypeEnum
 */

/**
 * @typedef BankruptcyChapters
 * @property {Boolean} declaredBankruptcyPast7YearsChapter7
 * @property {Boolean} declaredBankruptcyPast7YearsChapter11
 * @property {Boolean} declaredBankruptcyPast7YearsChapter12
 * @property {Boolean} declaredBankruptcyPast7YearsChapter13
 */

/**
 * Participant declarations
 * @typedef module:c-mortgage-los-property-and-money.Declarations
 * @property {boolean} ownershipInteres
 * @property {OccupancyTypeEnum} occupancyType
 * @property {OwnershipTypeEnum} ownershipType
 * @property {boolean} relationshipWithSeller
 * @property {boolean} borrowMoneyFromAnotherParty
 * @property {boolean} borrowMoneyFromAnotherPartyAmount
 * @property {boolean} mortgageLoanOnAnotherProperty
 * @property {boolean} applyNewCredit
 * @property {boolean} priorityOverFirstMortgageLien
 * @property {boolean} cosignerOrGuarantor
 * @property {boolean} outstandingJudgements
 * @property {boolean} delinquentLoansFederalDebt
 * @property {boolean} partyToLawsuitPersonalLiability
 * @property {boolean} conveyedPropertyInLieuForeclosure
 * @property {boolean} preForeclosureSale
 * @property {boolean} propertyForeclosedUpon7Years
 * @property {boolean} declaredBankruptcy
 * @property {BankruptcyChapters} bankruptcyChapters
 */

export default class MortgageLosPropertyAndMoney extends LightningElement {
    @api recordId;
    @api showBothParticipants;
    @api role;
    @api isEditing = false;

    /**
     * @type {module:c-mortgage-los-property-and-money.Declarations}
     */
    @track borrowerDeclarations;
    /**
     * @type {module:c-mortgage-los-property-and-money.Declarations}
     */
    @track coBorrowerDeclarations;

    BorrowerIcon = BorrowerSR;
    CoBorrowerIcon = CoBorrowerSR;
    submissionType = null;

    get sectionController() {
        return this.template.querySelector('c-mortgage-los-section-controller');
    }

    get showBorrower() {
        return this.role === "borrower" || this.showBothParticipants;
    }

    get showCoBorrower() {
        return this.role === "coBorrower" || this.showBothParticipants;
    }

    emptyFormValues = () => {
        return {
            declarations: []
        }
    };

    handleEdit = () => {
        this.isEditing = true;
    }

    handleCancel = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
    }

    moneyToFloat(moneyString) {
        return moneyString ? parseFloat(moneyString.toString().replaceAll(',', '')) : 0;
    }

    prepareParticipantDeclaration = (declarations) => {
        if (!declarations.permanentResidence) {
            declarations.ownershipInterest = null;
        }
        if (!declarations.ownershipInterest) {
            declarations.occupancyType = null;
            declarations.ownershipType = null;
        }
        if (!declarations.declaredBankruptcy) {
            declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter7 = null;
            declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter11 = null;
            declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter12 = null;
            declarations.bankruptcyChapters.declaredBankruptcyPast7YearsChapter13 = null;
        }
        if (!declarations.borrowMoneyFromAnotherParty) {
            declarations.borrowMoneyFromAnotherPartyAmount = 0;
        }
        if (declarations.borrowMoneyFromAnotherPartyAmount) {
            declarations.borrowMoneyFromAnotherPartyAmount = this.moneyToFloat(declarations.borrowMoneyFromAnotherPartyAmount);
        }
        return declarations;
    }

    handleSaveClick = () => {
        const sections = this.template.querySelectorAll('c-mortgage-los-property-and-money-edit-mode');
        let validForm = true;
        sections.forEach(section => {
            validForm = validForm * section.validate;
        });

        if (validForm) {
            this.sectionController.hideContent();
            this.isEditing = false;
            let variables = { submissionUuid: getFieldValue(this.opportunity, SUBMISSION_UUID) };
            if (this.showBorrower) {
                variables["borrowerDeclaration"] = {
                    ...this.prepareParticipantDeclaration(this.borrowerDeclarations.declarations)
                };
            }
            if (this.showCoBorrower) {
                variables["coBorrowerDeclaration"] = {
                    ...this.prepareParticipantDeclaration(this.coBorrowerDeclarations.declarations)
                };
            }
            updateParticipant(this.opportunity, this.recordId, this.mutationCallback.bind(this), variables);
        }
    }

    connectedCallback() {
        this.borrowerDeclarations = Object.assign({}, this.emptyFormValues());
        this.coBorrowerDeclarations = Object.assign({}, this.emptyFormValues());
    }

    handleChange = (value, details, role) => {
        if (role === 'borrower') {
            this.borrowerDeclarations.declarations = { ...this.borrowerDeclarations.declarations, [details]: value }
        }
        if (role === 'coBorrower') {
            this.coBorrowerDeclarations.declarations = { ...this.coBorrowerDeclarations.declarations, [details]: value }
        }
    }

    mutationCallback(result) {
        this.submissionCallback(result);
    }

    submissionCallback(result) {
        if (result) {
            if (this.showBorrower) {
                const amount = result.borrower.declaration.borrowMoneyFromAnotherPartyAmount || 0;
                this.borrowerDeclarations.declarations = { ...result.borrower.declaration, borrowMoneyFromAnotherPartyAmount: moneyMask(amount.toFixed(2).toString()) };
            }
            if (this.showCoBorrower) {
                const amount = result.coBorrower.declaration.borrowMoneyFromAnotherPartyAmount || 0;
                this.coBorrowerDeclarations.declarations = { ...result.coBorrower.declaration, borrowMoneyFromAnotherPartyAmount: moneyMask(amount.toFixed(2).toString()) };
            }
            this.sectionController.showContent();
        } else {
            this.sectionController.showError();
        }
    }

    @wire(getRecord, {
        recordId: '$recordId', fields: [
            SUBMISSION_UUID,
            SUBMISSION_TYPE
        ]
    })
    initialize({ data }) {
        if (data) {
            this.opportunity = data;
            this.submissionType = getFieldValue(data, SUBMISSION_TYPE);
            getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
        }
    };

    render() {
        return this.isEditing ? editMode : viewMode;
    }
}

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