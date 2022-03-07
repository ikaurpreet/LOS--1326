import { LightningElement, api } from 'lwc';

const commomClass = 'slds-form-element slds-form-element_edit slds-form-element_horizontal slds-hint-parent';

export default class MortgageLosYesNoRadio extends LightningElement {
    @api handleChange;
    @api label;
    @api variant;
    @api value;
    @api details;
    @api required;
    @api disabled;

    handleStateChange = (event) => {
        let newState = event.target.value === "yes";
        this.handleChange(newState, this.details);
    }

    get className() {
        let className = commomClass;
        if (this.variant && this.variant === 'split-60') {
            className = `${className} slds-form-element_split-60`;
        }
        if (this.disabled) {
            className = `${className} slds-disabled-input`;
        }
        return className;
    }

    @api
    get validate() {
        const radioGroup = this.template.querySelector(`lightning-radio-group`);
        radioGroup.reportValidity();
        return radioGroup.checkValidity();
    }

    get yesOrNo() {
        return this.value === null ? '' : (this.value ? 'yes' : 'no');
    }

    get options() {
        return [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
        ]
    }
}