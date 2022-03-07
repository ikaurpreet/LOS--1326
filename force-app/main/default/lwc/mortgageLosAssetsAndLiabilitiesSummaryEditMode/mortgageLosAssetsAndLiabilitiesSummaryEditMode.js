import { LightningElement, api } from 'lwc';
import {
    EDIT_PARTICIPANT_EVENT_NAME, ASSETS_SUMMARY_COMMON_CLASS, TRUE, FALSE,
    ASSETS_SUMMARY_JOINTLY, ASSETS_SUMMARY_NOT_JOINTLY
} from 'c/util';

/**
 * Assets Summary section
 * @module c-mortgage-los-demographics-edit-mode
 * @property {boolean} jointlyAssetsLiabilities - Participants Jointly Value
 * @property {variant} variant - Specifies a variant class to use
 */
export default class MortgageLosAssetsAndLiabilitiesSummaryEditMode extends LightningElement {
    @api jointlyAssetsLiabilities;
    @api variant;

    value;

    /**
     * Values false/true represent the jointly assets and liabilities status
     * true: jointly
     * false: not jointly
     */
    get options() {
        return [
            { label: ASSETS_SUMMARY_JOINTLY, value: TRUE },
            { label: ASSETS_SUMMARY_NOT_JOINTLY, value: FALSE },
        ];
    };

    /**
     * Specifies jointly value as string
     * @return {String} Returns jointly value as string
     */
    get jointlyAssetsLiabilitiesValue() {
        if (this.jointlyAssetsLiabilities == null)
            return null;
        return this.jointlyAssetsLiabilities.toString();
    }

    /**
     * Takes string and sets jointly value as boolean
     * @param {String} value - 'true' or 'false'
     */
    set jointlyAssetsLiabilitiesValue(value) {
        this.jointlyAssetsLiabilities = value === TRUE;
    }

    /**
    * Specifies class based on variant input
    * @return {String} Returns class name
    */
    get className() {
        if (this.variant && this.variant === 'split-60') {
            return `${ASSETS_SUMMARY_COMMON_CLASS} slds-form-element_split-60`;
        }
        return ASSETS_SUMMARY_COMMON_CLASS;
    }

    /**
     * Event handler for onChange event.
     * @param {Event} event OnChange event.
     */
    handleInputChange(event) {
        this.dispatchEvent(new CustomEvent(EDIT_PARTICIPANT_EVENT_NAME, { bubbles: true, detail: (event.target.value === TRUE) }))
    }
}