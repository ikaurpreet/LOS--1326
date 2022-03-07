import { LightningElement, api } from 'lwc';
import { isAbleToEdit, militaryServiceOptions, SHORT_DATE_FORMAT, formatDate } from 'c/util';

/**
 * Military Service Form - View Mode
 * @module c-mortgage-los-military-service-view-mode
 * @property {string} iconUrl - The icon to use in the title
 * @property {string} sectionSubtitle - The title of the section
 * @property {string} statusLabel - The label for the status question Yes/No
 * @property {string} descriptionLabel - The label for the description question
 * @property {any} handleEdit - The callback to handle click event on edit button
 * @property {boolean} serviceState - Current service state
 * @property {string[]} serviceDescription - The description of de current state
 * @property {string} [expirationDate] - Expiration date of service/tour
 */

export default class MortgageLosMilitaryServiceViewMode extends LightningElement {
  @api iconUrl;
  @api sectionSubtitle;
  @api statusLabel;
  @api descriptionLabel;
  @api handleEdit;
  @api serviceState;
  @api serviceDescription;
  @api expirationDate;

  /**
   * If there is an expiration date of service, concatenate it with "isCurrentlyServing" label
   */
  get descriptionOptions() {
    let options = militaryServiceOptions();
    if (this.serviceDescription && this.expirationDate && this.serviceDescription.includes("isCurrentlyServing")) {
      let found = options.find(option => option.value === "isCurrentlyServing");
      found.label = found.label + "." + `\n(Expiration date of service/tour: ${this.expirationDateFormatted})`;
    }
    return options.filter(option => this.serviceDescription.includes(option.value));
  }

  get showDescriptionSection() {
    return this.serviceDescription && this.serviceDescription.length > 0 && this.serviceState;
  }

  get expirationDateFormatted() {
    return formatDate(this.expirationDate, SHORT_DATE_FORMAT)
  }

  get serviceLabel() {
    return this.serviceState ? "Yes" : "No";
  }

  editClass = isAbleToEdit;
}