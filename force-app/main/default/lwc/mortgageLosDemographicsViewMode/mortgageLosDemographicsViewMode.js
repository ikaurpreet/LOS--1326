import { LightningElement, api } from 'lwc';
import { DemographicConstants as Constants, demoLabelMap, VALUE } from 'c/util';

/**
 * Participant Demographics Section - View Mode
 * @module c-mortgage-los-demographics-view-mode
 * @property {Object} participant - The participant object
 * @property {string} sectionSubtitle - The title of the section
 * @property {string} iconUrl - The icon to use in the title
 * @property {function} handleEdit - The callback function to change to Edit mode
 */

export default class MortgageLosDemographicsViewMode extends LightningElement {
    @api participant;
    @api sectionSubtitle;
    @api iconUrl;
    @api handleEdit;

    /**
     * List of hispanic ethnicities (including parent)
     * @type {Array}
     */
    hispanicEthnicities = [
        Constants.HISPANIC_OR_LATINO,
        Constants.CUBAN,
        Constants.MEXICAN,
        Constants.PUERTO_RICAN,
        Constants.OTHER_ETHNICITY
    ];

    /**
     * List of asian races (including parent)
     * @type {Array}
     */
    asianRaces = [
        Constants.ASIAN,
        Constants.ASIAN_INDIAN,
        Constants.CHINESE,
        Constants.FILIPINO,
        Constants.JAPANESE,
        Constants.KOREAN,
        Constants.VIETNAMESE,
        Constants.OTHER_ASIAN
    ];

    /**
     * List of pacific islander races (including parent)
     * @type {Array}
     */
    pacificIslanderRaces = [
        Constants.PACIFIC_ISLANDER,
        Constants.GUAMANIAN,
        Constants.NATIVE_HAWAIIAN,
        Constants.SAMOAN,
        Constants.OTHER_HAWAIIAN
    ];

    /**
     * Concatenate hispanic ethnicities with a comma delimiter if they are checked
     * @param {EthnicityInfo} ethnicities All ethnicity info
     * @return {String} A comma delimited list of all checked hispanic ethnicities.
     */
    getHispanicEthnicities = (ethnicities) => {
        return this.hispanicEthnicities
            .filter((hispanicEthnicity) => ethnicities[hispanicEthnicity] === true)
            .map(hispanicEthnicity => {
                let ethnicityString = demoLabelMap[hispanicEthnicity];
                if (hispanicEthnicity === Constants.OTHER_ETHNICITY) {
                    ethnicityString += ': ' + ethnicities[hispanicEthnicity + VALUE];
                }
                return ethnicityString;
            }).join(', ');
    }

    /**
     * Concatenate asian races with a comma delimiter if they are checked
     * @param {RaceInfo} races All race info
     * @return {String} A comma delimited list of all checked asian races.
     */
    getAsianRaces = (races) => {
        return this.asianRaces
            .filter((asianRace) => races[asianRace] === true)
            .map(asianRace => {
                let raceString = demoLabelMap[asianRace];
                if (asianRace === Constants.OTHER_ASIAN) {
                    raceString += ': ' + races[asianRace + VALUE];
                }
                return raceString;
            }).join(', ');
    }

    /**
     * Concatenate pacific islander races with a comma delimiter if they are checked
     * @param {RaceInfo} races All race info
     * @return {String} A comma delimited list of all checked pacific islander races.
     */
    getIslanderRaces = (races) => {
        return this.pacificIslanderRaces
            .filter((pacificIslanderRace) => races[pacificIslanderRace] === true)
            .map(pacificIslanderRace => {
                let raceString = demoLabelMap[pacificIslanderRace];
                if (pacificIslanderRace === Constants.OTHER_HAWAIIAN) {
                    raceString += ': ' + races[pacificIslanderRace + VALUE];
                }
                return raceString;
            }).join(', ');
    }

    /**
     * List of top level ethnicities (this includes the comma delimited lists of sub ethnicities).
     * @type {Map}
     */
    topEthnicityOptions = new Map([
        [Constants.HISPANIC_OR_LATINO, this.getHispanicEthnicities],
        [Constants.NOT_HISPANIC_OR_LATINO, () => demoLabelMap[Constants.NOT_HISPANIC_OR_LATINO]],
        [Constants.DO_NOT_WISH_TO_PROVIDE, () => demoLabelMap[Constants.DO_NOT_WISH_TO_PROVIDE]]
    ]);

    /**
     * List of top level races (this includes the comma delimited lists of sub races).
     * @type {Map}
     */
    topRaceOptions = new Map([
        [Constants.AMERICAN_INDIAN, () => demoLabelMap[Constants.AMERICAN_INDIAN] + ': ' + this.participant.race[Constants.AMERICAN_INDIAN + VALUE]],
        [Constants.ASIAN, this.getAsianRaces],
        [Constants.AFRICAN_AMERICAN, () => demoLabelMap[Constants.AFRICAN_AMERICAN]],
        [Constants.PACIFIC_ISLANDER, this.getIslanderRaces],
        [Constants.WHITE, () => demoLabelMap[Constants.WHITE]],
        [Constants.DO_NOT_WISH_TO_PROVIDE, () => demoLabelMap[Constants.DO_NOT_WISH_TO_PROVIDE]]
    ]);

    /**
     * List of top level sexes.
     * @type {Map}
     */
    topSexOptions = new Map([
        [Constants.FEMALE, () => demoLabelMap[Constants.FEMALE]],
        [Constants.MALE, () => demoLabelMap[Constants.MALE]],
        [Constants.DO_NOT_WISH_TO_PROVIDE, () => demoLabelMap[Constants.DO_NOT_WISH_TO_PROVIDE]]
    ]);

    /**
     * Concatenates all top level demographic info using a semi-colon delimiter.
     * @param {Map} optionsMap Parent element.
     * @param {Object} demoSection Parent element.
     * @return {String} Semi-colon delimited string of all top level values for a specific demographic section (ie ethnicity, race, sex).
     */
    getList(optionsMap, demoSection) {
        return Array.from(optionsMap.keys())
            .filter(option => demoSection[option] === true)
            .map(option => optionsMap.get(option)(demoSection))
            .join('; ');
    }

    /**
    * Used to get all ethnicity information for bulding the view page
    * @return {String} A list of all ethnicity information needed to build the view page.
    */
    get ethnicityList() {
        return this.getList(this.topEthnicityOptions, this.participant.ethnicity);
    }

    /**
    * Used to get all race information for bulding the view page
    * @return {String} A list of all race information needed to build the view page.
    */
    get raceList() {
        return this.getList(this.topRaceOptions, this.participant.race);
    }

    /**
    * Used to get all sex information for bulding the view page
    * @return {String} A list of all sex information needed to build the view page.
    */
    get sexList() {
        return this.getList(this.topSexOptions, this.participant.sex);
    }
}