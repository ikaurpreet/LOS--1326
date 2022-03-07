import { LightningElement, api } from 'lwc';

export default class MortgageLosModal extends LightningElement {
    @api title;
    @api actionLabel;
    @api details;
    @api variant;

    handleCloseModal() {
        this.dispatchEvent(new CustomEvent("closemodal"));
    }

    handleAction() {
        this.dispatchEvent(new CustomEvent("closemodal", { detail: this.details }))
    }

    get className() {
        if (this.variant === 'noOverflow') {
            return 'slds-modal__content--no-overflow slds-p-around_medium';
        }
        return 'slds-modal__content slds-p-around_medium';
    }

    get action() {
        return this.actionLabel || "Save";
    }
}