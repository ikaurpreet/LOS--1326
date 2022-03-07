import { LightningElement, api } from 'lwc';

/**
 * Military Service Form - Edit Mode
 * @module c-mortgage-los-military-service-edit-mode
 * @property {string} iconUrl - The icon to use in the title
 * @property {string} sectionSubtitle - The title of the section
 * @property {string} statusLabel - The label for the status question Yes/No
 * @property {string} descriptionLabel - The label for the description question
 * @property {any} handleServiceStateChange - The callback for service state changes
 * @property {any} handleServiceDescriptionChange - The callback for service description changes
 * @property {boolean} serviceState - Current service state
 * @property {string[]} serviceDescription - The description of de current state
 * @property {string} [expirationDate] - Expiration date of service/tour
 */

export default class MortgageLosMilitaryServiceEditMode extends LightningElement {
  @api iconUrl;
  @api sectionSubtitle;
  @api statusLabel;
  @api descriptionLabel;
  @api handleServiceStateChange;
  @api handleServiceDescriptionChange;
  @api handleExpirationDateChange;
  @api serviceState;
  @api serviceDescription;
  @api expirationDate;

  get isCurrentlyServing() {
    return this.serviceDescription && this.serviceDescription.includes("isCurrentlyServing");
  }

  get isRetired() {
    return this.serviceDescription && this.serviceDescription.includes("isRetired");
  }

  get isReserve() {
    return this.serviceDescription && this.serviceDescription.includes("isReserve");
  }

  get isSurvivingSpouse() {
    return this.serviceDescription && this.serviceDescription.includes("isSurvivingSpouse");
  }

  get today(){
    return new Date().toString();
  }

  @api
  get validate() {
    const expirationDateElem = this.template.querySelector(`lightning-input[data-name-input="expirationDate"]`);
    const isCurrentlyServingValidation = expirationDateElem ? expirationDateElem.reportValidity() : true;
    return isCurrentlyServingValidation;
  }

  handleStateChange = (event) => {
    let newState = event.target.value === "true";
    this.handleServiceStateChange(newState);
  }

  handleDateChange = (event) => {
    this.handleExpirationDateChange(event.target.value);
  }

  handleDescriptionChange = (event) => {
    let newDescription = [...this.serviceDescription];
    if (event.target.checked && !this.serviceDescription.includes(event.target.value)) {
      newDescription.push(event.target.value);
    } else if (!event.target.checked && this.serviceDescription.includes(event.target.value)) {
      var index = this.serviceDescription.indexOf(event.target.value);
      if (index !== -1) {
        newDescription.splice(index, 1);
      }
    }
    this.handleServiceDescriptionChange(newDescription);
  }

  get serviceStateValue() {
    return this.serviceState ? "true" : "false";
  };

  get showOptions() {
    return this.serviceState;
  }

  get showDatePicker() {
    return this.serviceDescription && this.serviceDescription.includes("isCurrentlyServing"); //Currently serving on active duty
  }

  /**
   * Values false/true represent the serve status
   * true: did serve
   * false: didn't serve
   */
  get options() {
    return [
      { label: 'No', value: "false" },
      { label: 'Yes', value: "true" },
    ];
  };

}