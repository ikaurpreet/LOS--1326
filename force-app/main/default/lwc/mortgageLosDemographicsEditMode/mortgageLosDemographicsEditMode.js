import { LightningElement, api } from 'lwc';
import {
    DemographicConstants as Constants, demoLabelMap, otherTextBoxes, allEthnicities,
    allRaces, allSexes, VALUE, DATA_NAME_INPUT, EDIT_PARTICIPANT_EVENT_NAME,
    ELEMENT_TYPE_CHECKBOX, EVENT_TYPE_CHANGE
} from 'c/util';

/**
 * Participant Demographics Section - Edit Mode
 * @module c-mortgage-los-demographics-edit-mode
 * @property {Object} participant - The participant object
 * @property {string} sectionSubtitle - The title of the section
 * @property {string} iconUrl - The icon to use in the title
 * @property {RoleOption} role - Role of Participant
 */

export default class MortgageLosDemographicsEditMode extends LightningElement {
    @api participant;
    @api sectionSubtitle;
    @api iconUrl;
    @api role;

    /**
     * List of hispanic sub ethnicities
     * @type {Array}
     */
     hispanicSubEthnicities = [
        Constants.CUBAN,
        Constants.MEXICAN,
        Constants.PUERTO_RICAN,
        Constants.OTHER_ETHNICITY
    ];

    /**
     * List of asian sub races
     * @type {Array}
     */
     asianSubRaces = [
        Constants.ASIAN_INDIAN,
        Constants.CHINESE,
        Constants.FILIPINO,
        Constants.JAPANESE,
        Constants.KOREAN,
        Constants.VIETNAMESE,
        Constants.OTHER_ASIAN
    ];

    /**
     * List of pacific islander sub races
     * @type {Array}
     */
     pacificIslanderRaces = [
        Constants.GUAMANIAN,
        Constants.NATIVE_HAWAIIAN,
        Constants.SAMOAN,
        Constants.OTHER_HAWAIIAN
    ];

    /**
     * Used to get all ethnicity information for bulding the edit page
     * @return {Array} A list of all ethnicity information needed to build the edit page.
     */
     get ethnicities() {
        return allEthnicities.map(key => {
            return {
                // because DO_NOT_WISH_TO_PROVIDE exists in each of the sections we have to specify which section it's from
                key: key === Constants.DO_NOT_WISH_TO_PROVIDE ? key + '-' + Constants.ETHNICITY : key,
                value: this.participant.ethnicity[key],
                label: demoLabelMap[key],
                indentClass: this.hispanicSubEthnicities.includes(key) ? Constants.INDENT_CHECKBOX_CLASS : null,
                dataParent: this.hispanicSubEthnicities.includes(key) ? Constants.HISPANIC_OR_LATINO : null,
                disabled: this.hispanicSubEthnicities.includes(key) && this.participant.ethnicity[Constants.HISPANIC_OR_LATINO] === false,
                hasOtherTextBox: otherTextBoxes.includes(key),
                otherTextBoxKey: key + VALUE,
                otherTextBoxValue: this.participant.ethnicity[key + VALUE],
                otherTextBoxDisabled: !this.participant.ethnicity[key],
                otherTextBoxClass: Constants.OTHER_TEXT_BOX_CLASS
            };
        });
    }

    /**
     * Used to get all race information for bulding the edit page
     * @return {Array} A list of all race information needed to build the edit page.
     */
     get races() {
        return allRaces.map(key => {
            return {
                // because DO_NOT_WISH_TO_PROVIDE exists in each of the sections we have to specify which section it's from
                key: key === Constants.DO_NOT_WISH_TO_PROVIDE ? key + '-' + Constants.RACE : key,
                value: this.participant.race[key],
                label: demoLabelMap[key],
                indentClass: (this.asianSubRaces.includes(key) || this.pacificIslanderRaces.includes(key)) ? Constants.INDENT_CHECKBOX_CLASS : null,
                dataParent: this.asianSubRaces.includes(key) ? Constants.ASIAN
                    : this.pacificIslanderRaces.includes(key) ? Constants.PACIFIC_ISLANDER : null,
                disabled: (this.asianSubRaces.includes(key) && this.participant.race[Constants.ASIAN] === false)
                    || (this.pacificIslanderRaces.includes(key) && this.participant.race[Constants.PACIFIC_ISLANDER] === false),
                hasOtherTextBox: otherTextBoxes.includes(key),
                otherTextBoxKey: key + VALUE,
                otherTextBoxValue: this.participant.race[key + VALUE],
                otherTextBoxDisabled: !this.participant.race[key],
                otherTextBoxClass: key === Constants.AMERICAN_INDIAN ? Constants.INDENT_CHECKBOX_CLASS : Constants.OTHER_TEXT_BOX_CLASS
            };
        });
    }

    /**
     * Used to get all sex information for bulding the edit page
     * @return {Array} A list of all sex information needed to build the edit page.
     */
    get sexes() {
        return allSexes.map(key => {
            return {
                // because DO_NOT_WISH_TO_PROVIDE exists in each of the sections we have to specify which section it's from
                key: key === Constants.DO_NOT_WISH_TO_PROVIDE ? key + '-' + Constants.SEX : key,
                value: this.participant.sex[key],
                label: demoLabelMap[key]
            };
        });
    }

    /**
     * Clears and disables sub checkboxes when parent checkbox is unchecked.
     * @param {String} property Parent element.
     */
     updateElements(property) {
        const childElements = this.template.querySelectorAll('lightning-input[data-parent=' + property + ']');
        childElements.forEach(element => {
            if (element.type === ELEMENT_TYPE_CHECKBOX) {
                element.checked = false;
            }
            else {
                element.value = null;
            }
            // fire on change event to update participant info in parent component (mortgageLosDemographics)
            const event = new Event(EVENT_TYPE_CHANGE);
            element.dispatchEvent(event);
        });
    }

    /**
     * Event handler for onChange event.
     * @param {Event} event OnChange event.
     */
     handleInputChange(event) {
        const input = {
            propertyName: event.target.getAttribute(DATA_NAME_INPUT),
            value: null,
            role: this.role
        }
        if (event.target.type === ELEMENT_TYPE_CHECKBOX) {
            input.value = event.target.checked;
            if (!input.value) {
                this.updateElements(input.propertyName);
            }
        }
        else {
            input.value = event.target.value;
        }
        this.dispatchEvent(new CustomEvent(EDIT_PARTICIPANT_EVENT_NAME, { bubbles: true, detail: input }))
    }
}