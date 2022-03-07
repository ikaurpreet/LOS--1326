import { getFieldValue } from 'lightning/uiRecordApi';
import {
    DemographicConstants as Constants, VALUE, BORROWER, CO_BORROWER, TRUE, otherTextBoxes,
    SUBMISSION_UUID as SUBMISSION_UUID_TEXT
} from 'c/util';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import CoBorrowerSR from '@salesforce/resourceUrl/CoBorrower';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import { api, track } from 'lwc';
import BaseComponent from 'c/baseComponent';

import { default as editMode } from './template/edit.html';
import { default as viewMode } from './template/view.html';


/**
 * @typedef {"borrower" | "coBorrower"} RoleOption
 */

/**
 * Demographics Information section
 * @module c-mortgage-los-demographics
 * @property {string} recordId - Opportunity Id
 * @property {RoleOption} role - Role of Participant
 * @property {boolean} showBothParticipants - Used for show both forms
 */

export default class MortgageLosDemographics extends BaseComponent {
    BorrowerIconURL = BorrowerSR;
    CoBorrowerIconURL = CoBorrowerSR;

    /**
     * Ethnicity Info
     * @typedef {Object} EthnicityInfo
     * @property {boolean} [Constants.HISPANIC_OR_LATINO] - Participant is Hispanic or Latino
     * @property {boolean} [Constants.NOT_HISPANIC_OR_LATINO] - Participant is Not Hispanic or Latino
     * @property {boolean} [Constants.MEXICAN] - Participant is Mexican
     * @property {boolean} [Constants.PUERTO_RICAN] - Participant is Puerto Rican
     * @property {boolean} [Constants.CUBAN] - Participant is Cuban
     * @property {boolean} [Constants.OTHER_ETHNICITY] - Participant is Other Ethnicity
     * @property {string} [Constants.OTHER_ETHNICITY + VALUE] - Other Ethnicity value entered by user
     * @property {boolean} [Constants.DO_NOT_WISH_TO_PROVIDE] - Participant doesn't wish to provide this information
     */

    /**
     * Default Ethnicity Object
     * @type {EthnicityInfo}
     */
    emptyEthnicity = {
        [Constants.HISPANIC_OR_LATINO]: false,
        [Constants.NOT_HISPANIC_OR_LATINO]: false,
        [Constants.MEXICAN]: false,
        [Constants.PUERTO_RICAN]: false,
        [Constants.CUBAN]: false,
        [Constants.OTHER_ETHNICITY]: false,
        [Constants.OTHER_ETHNICITY + VALUE]: null,
        [Constants.DO_NOT_WISH_TO_PROVIDE]: false
    };

    /**
     * Race Info
     * @typedef {Object} RaceInfo
     * @property {boolean} [Constants.AMERICAN_INDIAN] - Participant is American Indian
     * @property {string} [Constants.AMERICAN_INDIAN + VALUE] - American Indian race entered by user
     * @property {boolean} [Constants.ASIAN_INDIAN] - Participant is Asian Indian
     * @property {boolean} [Constants.CHINESE] - Participant is Chinese
     * @property {boolean} [Constants.FILIPINO] - Participant is Filipino
     * @property {boolean} [Constants.JAPANESE] - Participant is Japanese
     * @property {boolean} [Constants.KOREAN] - Participant is Korean
     * @property {boolean} [Constants.VIETNAMESE] - Participant is Vietnamese
     * @property {boolean} [Constants.ASIAN] - Participant is Asian
     * @property {boolean} [Constants.AFRICAN_AMERICAN] - Participant is African American
     * @property {boolean} [Constants.NATIVE_HAWAIIAN] - Participant is Native Hawaiian
     * @property {boolean} [Constants.GUAMANIAN] - Participant is Guamian
     * @property {boolean} [Constants.SAMOAN] - Participant is Samoan
     * @property {boolean} [Constants.PACIFIC_ISLANDER] - Participant is Pacific Islander
     * @property {boolean} [Constants.WHITE] - Participant is White
     * @property {boolean} [Constants.OTHER_ASIAN] - Participant is Other Asian
     * @property {string} [Constants.OTHER_ASIAN + VALUE] - Other Asian race entered by user
     * @property {boolean} [Constants.OTHER_HAWAIIAN] - Participant is Other Pacific Islander
     * @property {string} [Constants.OTHER_HAWAIIAN + VALUE] - Other Pacific Islander race entered by user
     * @property {boolean} [Constants.DO_NOT_WISH_TO_PROVIDE] - Participant doesn't wish to provide this information
     */

    /**
     * Default Race Object
     * @type {RaceInfo}
     */
    emptyRace = {
        [Constants.AMERICAN_INDIAN]: false,
        [Constants.AMERICAN_INDIAN + VALUE]: null,
        [Constants.ASIAN_INDIAN]: false,
        [Constants.CHINESE]: false,
        [Constants.FILIPINO]: false,
        [Constants.JAPANESE]: false,
        [Constants.KOREAN]: false,
        [Constants.VIETNAMESE]: false,
        [Constants.ASIAN]: false,
        [Constants.AFRICAN_AMERICAN]: false,
        [Constants.NATIVE_HAWAIIAN]: false,
        [Constants.GUAMANIAN]: false,
        [Constants.SAMOAN]: false,
        [Constants.PACIFIC_ISLANDER]: false,
        [Constants.WHITE]: false,
        [Constants.OTHER_ASIAN]: false,
        [Constants.OTHER_ASIAN + VALUE]: null,
        [Constants.OTHER_HAWAIIAN]: false,
        [Constants.OTHER_HAWAIIAN + VALUE]: null,
        [Constants.DO_NOT_WISH_TO_PROVIDE]: false
    };

    /**
     * Sex Info
     * @typedef {Object} SexInfo
     * @property {boolean} [Constants.FEMALE] - Participant is Female
     * @property {boolean} [Constants.MALE] - Participant is Male
     * @property {boolean} [Constants.DO_NOT_WISH_TO_PROVIDE] - Participant doesn't wish to provide this information
     */

    /**
     * Default Sex Object
     * @type {SexInfo}
     */
    emptySex = {
        [Constants.MALE]: false,
        [Constants.FEMALE]: false,
        [Constants.DO_NOT_WISH_TO_PROVIDE]: false
    };

    /**
     * Demographic Info
     * @typedef {Object} DemographicInfo
     * @property {EthnicityInfo} ethnicity - Participant's ethnicity
     * @property {RaceInfo} race - Participant's race
     * @property {SexInfo} sex - Participant's sex
     */

    /**
     * Default Demographic Info Object
     * @type {DemographicInfo}
     */
    emptyFormValues = {
        ethnicity: this.emptyEthnicity,
        race: this.emptyRace,
        sex: this.emptySex
    };

    /**
     * Borrower's Demographic Info Object
     * @type {DemographicInfo}
     */
    @track borrowerInfo = Object.assign({}, this.emptyFormValues);
    /**
     * Co-Borrower's Demographic Info Object
     * @type {DemographicInfo}
     */
    @track coBorrowerInfo = Object.assign({}, this.emptyFormValues);

    @api showBothParticipants;
    @api role;
    borrowerUuid = null;
    coBorrowerUuid = null;
    /**
     * Boolean used to change view mode - See {@tutorial view-edit-modes}
     * @type {boolean}
     */
    @api isEditing = false;

    /**
     * Changes the visualization to Edit mode
     */
    handleEditClick = () => {
        this.isEditing = true;
    }

    /**
     * Changes the visualization to View mode
     */
    handleCancelClick = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }

    /**
     * Prepares each section of participant object
     * @param {Array} properties Array of strings that are the list of properties in a section
     * @param {EthnicityInfo|RaceInfo|SexInfo} sectionData Contains data for a section.  Can be EthnicityInfo, RaceInfo, or SexInfo types.
     * @returns {Object} to be sent for mutation
     */
    getSectionValues(sectionData) {
        return Object.keys(sectionData).filter(property => sectionData[property] === true).map(property => {
            return {
                name: property,
                value: otherTextBoxes.includes(property) ? sectionData[property + VALUE] : TRUE
            };
        });
    }

    /**
     * Prepare participant object
     * @param {DemographicInfo} participant 
     * @returns {Object} to be sent for mutation
     */
    prepareParticipantObject(participant) {
        return {
            ethnicityAnswer: this.getSectionValues(participant.ethnicity),
            raceAnswer: this.getSectionValues(participant.race),
            sexAnswerType: this.getSectionValues(participant.sex)
        };
    }

    /**
     * Event handler for save button on click event
     */
    handleSaveClick = () => {
        this.sectionController.hideContent();
        this.isEditing = false;
        let variables = {};
        if (this.showBorrower) {
            variables[BORROWER] = this.prepareParticipantObject(this.borrowerInfo);
        }
        if (this.showCoBorrower) {
            variables[CO_BORROWER] = this.prepareParticipantObject(this.coBorrowerInfo);
        }
        const submissionUuid = getFieldValue(this.opportunity, SUBMISSION_UUID);
        this.updateParticipant(
            this.mutationCallback.bind(this),
            { ...variables, [SUBMISSION_UUID_TEXT]: submissionUuid },
            { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION }
        );
    }

    /**
     * Implmentation of "virtual" method to retrieve initial data set
     */
    loadSubmissionData() {
        this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
    }


    /**
     * Specifies if borrower data should be shown
     * @return {boolean} Returns true if borrower data should be shown
     */
     get showBorrower() {
        return this.role === BORROWER || this.showBothParticipants;
    }

    /**
     * Specifies if co-borrower data should be shown
     * @return {boolean} Returns true if borrower data should be shown
     */
     get showCoBorrower() {
        return this.role === CO_BORROWER || this.showBothParticipants;
    }

    /**
     * @property {Function} setParticipantProfile Takes the profile from BE and update participant object values
     * @param {Array} fairHousingAnswer Participant demographic object from query result
     * @returns {DemographicInfo} Current participant with updated values
     */
    setParticipantProfile(fairHousingAnswer) {
        let race = Object.assign({}, this.emptyRace);
        fairHousingAnswer.raceAnswer.map(raceAnswer => {
            if (raceAnswer.name === Constants.AMERICAN_INDIAN
                || raceAnswer.name === Constants.OTHER_ASIAN
                || raceAnswer.name === Constants.OTHER_HAWAIIAN) {

                race[raceAnswer.name] = true;
                race[raceAnswer.name + VALUE] = raceAnswer.value;
            }
            else {
                race[raceAnswer.name] = (raceAnswer.value === TRUE);
            }
        });
        let ethnicity = Object.assign({}, this.emptyEthnicity);
        fairHousingAnswer.ethnicityAnswer.map(ethnicityAnswer => {
            if (ethnicityAnswer.name === Constants.OTHER_ETHNICITY) {
                ethnicity[ethnicityAnswer.name] = true;
                ethnicity[ethnicityAnswer.name + VALUE] = ethnicityAnswer.value;
            }
            else {
                ethnicity[ethnicityAnswer.name] = (ethnicityAnswer.value === TRUE);
            }
        });
        let sex = Object.assign({}, this.emptySex);
        fairHousingAnswer.sexAnswerType.map(sexAnswer => {
            sex[sexAnswer.name] = (sexAnswer.value === TRUE);
        });
        return {
            race: race,
            ethnicity: ethnicity,
            sex: sex
        }
    }

    /**
     * Event handler for change event coming from edit mode child component.  Updates participant's demographic info.
     * @param {CustomEvent} event Event from child component containing data to update the participant's demographic info.
     */
    handleParticipantChange(event) {
        let participant;
        let section;
        let propertyName = event.detail.propertyName;
        if (event.detail.role === BORROWER) {
            participant = this.borrowerInfo;
        }
        else if (event.detail.role === CO_BORROWER) {
            participant = this.coBorrowerInfo;
        }
        if (propertyName in this.emptyEthnicity) {
            section = Constants.ETHNICITY;
        }
        else if (propertyName in this.emptyRace) {
            section = Constants.RACE;
        }
        else if (propertyName in this.emptySex) {
            section = Constants.SEX;
        }
        else if (propertyName.startsWith(Constants.DO_NOT_WISH_TO_PROVIDE)) {
            section = propertyName.split('-')[1]
            propertyName = propertyName.split('-')[0];
        }
        participant[section][propertyName] = event.detail.value;
    }

    /**
     * Callback for query callout
     * @param {Object} result The results from the query callout 
     */
    submissionCallback(result) {
        if (result) {
            if (this.showCoBorrower) {
                const fairHousingAnswer = result.coBorrower.fairHousingAnswer;
                this.coBorrowerUuid = result.coBorrower.uuid;
                this.coBorrowerInfo = this.setParticipantProfile(fairHousingAnswer);
            }
            if (this.showBorrower) {
                const fairHousingAnswer = result.borrower.fairHousingAnswer;
                this.borrowerUuid = result.borrower.uuid;
                this.borrowerInfo = this.setParticipantProfile(fairHousingAnswer);
            }
            this.sectionController.showContent();
        } else {
            this.sectionController.showError();
        }
    }

    /**
    * Callback for mutation callout
    * @param {Object} result The results from the mutation callout 
    */
    mutationCallback(result) {
        this.submissionCallback(result);
    }

    /**
     * Returns page based on whether in edit mode or not
     * @returns {Object} Page to be rendered
     */
    render() {
        return this.isEditing ? editMode : viewMode;
    }
}