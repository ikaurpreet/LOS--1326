import { LightningElement, api } from 'lwc';

/**
 * @typedef {"error" | "warning"} variantOption
 */

/**
 * Alert Component
 * @see {@link https://www.lightningdesignsystem.com/components/alert/|Lightning Design System}
 * @module c-mortgage-los-alert
 * @property {string} message - The alert message
 * @property {variantOption} variant - The alert variant
*/

export default class MortgageLosAlert extends LightningElement {
    @api message;
    @api variant;

    get icon(){
        if(this.variant === 'error'){
            return 'utility:error';
        } else {
            return 'utility:warning';
        }
    }

    get alertTypeClass(){
        const commomClass = 'slds-notify slds-notify_alert';
        if(this.variant === 'error'){
            return `${commomClass} slds-alert_error`;
        } else {
            return `${commomClass} slds-alert_warning`;
        }
    }

    handleHideAlert() {
        this.dispatchEvent(new CustomEvent("hidealert"));
    }
}