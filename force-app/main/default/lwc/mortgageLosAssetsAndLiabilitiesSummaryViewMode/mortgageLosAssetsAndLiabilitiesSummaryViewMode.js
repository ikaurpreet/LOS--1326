import { LightningElement, api } from 'lwc';
import {
    ASSETS_SUMMARY_COMMON_CLASS, TRUE, FALSE,
    ASSETS_SUMMARY_JOINTLY, ASSETS_SUMMARY_NOT_JOINTLY
} from 'c/util';

/**
 * Assets Summary section
 * @module c-mortgage-los-demographics-view-mode
 * @property {boolean} jointlyAssetsLiabilities - Participants Jointly Value
 * @property {function} handleEdit - The callback function to change to Edit mode
 * @property {variant} variant - Specifies a variant class to use
 */
export default class MortgageLosAssetsAndLiabilitiesSummaryViewMode extends LightningElement {
    @api jointlyAssetsLiabilities;
    @api handleEdit;
    @api variant;

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
    * Specifies class based on variant input
    * @return {String} Returns class name
    */
    get className() {
        if (this.variant && this.variant === 'split-60') {
            return `${ASSETS_SUMMARY_COMMON_CLASS} slds-form-element_split-60`;
        }
        return ASSETS_SUMMARY_COMMON_CLASS;
    }
}