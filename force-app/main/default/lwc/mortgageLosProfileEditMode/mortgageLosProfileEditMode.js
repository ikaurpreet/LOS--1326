import { LightningElement, api } from 'lwc';
import { maritalOptions, suffixOptions, citizenOptions, getInputValidation, getMaritalLabel, LONG_DATE_FORMAT } from 'c/util';
import { SSNMask, phoneMask } from 'c/inputMaskUtils';

/**
 * Participant Form - Edit Mode
 * @module c-mortgage-los-profile-edit-mode
 * @property {Object} participant - The participant object
 * @property {string} sectionSubtitle - The title of the section
 * @property {string} iconUrl - The icon to use in the title
 */

export default class MortgageLosProfileEditMode extends LightningElement {
  @api participant;
  @api sectionSubtitle;
  @api coBorrowed;
  @api iconUrl;
  @api validateMaritalStatus;
  @api role;

  get maritalOptions() {
    let options = maritalOptions();
    if (!this.coBorrowed) {
      options = options.map(option => {
        if (option.value !== 'marriedSameBorrower') {
          return option;
        }
      }).filter(Boolean);
    }
    return options;
  }

  get suffixOptions() {
    return suffixOptions();
  }

  get citizenOptions() {
    return citizenOptions();
  }

  get maritalCurrentLabel() {
    return getMaritalLabel(this.participant.maritalType.value)
  }

  get today() {
    return new Date().toString();
  }

  get minDate() {
    const startDate = new Date();
    const startDateYearsRange = 120;
    startDate.setFullYear(startDate.getFullYear() - startDateYearsRange);
    return new Intl.DateTimeFormat('en-US', LONG_DATE_FORMAT).format(startDate);
  }

  get maxDate() {
    const endDate = new Date();
    const endDateYearsRange = 13;
    endDate.setFullYear(endDate.getFullYear() - endDateYearsRange);
    return new Intl.DateTimeFormat('en-US', LONG_DATE_FORMAT).format(endDate);
  }

  get DOBMessageWhenPatternMismatch() {
    return `Please enter a date between ${this.minDate} and ${this.maxDate}.`
  }

  handleSSNChange(event) {
    event.target.value = SSNMask(event.target.value);
    this.handleInputChange(event);
  }

  handlePhoneChange(event) {
    event.target.value = phoneMask(event.target.value);
    this.handleInputChange(event);
  }

  handleInputChange(event) {
    const input = {
      propertyName: event.target.getAttribute("data-name-input"),
      value: event.target.value,
      role: this.role
    }

    this.dispatchEvent(new CustomEvent("editparticipant", { bubbles: true, detail: input }))
  }

  @api
  get validate() {
    const dependentsNumberElem = this.template.querySelector(`lightning-input[data-name-input="dependentsNumber"]`);
    const dependentsAgeElem = this.template.querySelector(`lightning-input[data-name-input="dependentsAges"]`);

    const validFunc = (value) => {
      const ages = dependentsAgeElem.value.split(/[,]+/).filter(Boolean); //by comma OR space
      if (ages.length !== parseInt(dependentsNumberElem.value)) {
        return false;
      }
      return true;
    }

    const reducer = (isValid, currentField) => {
      currentField.reportValidity();
      return isValid && currentField.checkValidity();
    }

    let isValid = getInputValidation(dependentsAgeElem, validFunc, "Must contain the same specified amount of dependents");

    const maritalStatusElem = this.template.querySelector(`lightning-combobox[data-name-input="maritalType"]`);
    isValid = isValid * getInputValidation(maritalStatusElem, this.validateMaritalStatus, "inconsistent field.");

    const otherFields = [...this.template.querySelectorAll(`lightning-input`)];
    const allValid = otherFields.reduce(reducer, isValid);

    return allValid;
  }
}