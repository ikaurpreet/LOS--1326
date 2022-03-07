import { LightningElement, api } from 'lwc';

const commomClass = 'slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent';

/**
 * Input for view mode
 * @module c-mortgage-los-input-view-mode
 * @property {string} label - The label for the input
 * @property {any} value - The current value for the input
 * @property {function} handleEdit - The callback to change to Edit Mode
 * 
*/
export default class MortgageLosInputViewMode extends LightningElement {
    @api label;
    @api value;
    @api handleEdit;
    @api variant;
    @api disabled;
    @api formatter;

    get formattedValue() {
      if (this.formatter) return this.formatter(this.value);
      return this.value;
    }

    get className() {
        let className = commomClass;
        if (this.variant) {
          if (this.variant === 'split-60') className = `${className} slds-form-element_split-60`;
          if (this.variant === 'no-border') className = `${className} slds-form-element_no-border`;
        }
        if (this.disabled) {
            className = `${className} slds-disabled-input`;
        }
        return className;
    }
}