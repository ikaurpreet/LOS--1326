import { LightningElement, api, track } from 'lwc';
import {
  realEstateForm, propertyNumericFields, getFullAddress,
  ownershipEnum, ownershipTypes, states, statuses, occupancyTypes, propertyTypes, unitNumbers, MODE,
  prettyFloatDisplay, getOptionLabelFromValues, getOptionValueFromLabels, getInputValidation,
} from 'c/util';
import { moneyMask } from 'c/inputMaskUtils';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';

import { default as viewMode } from './templates/view.html';
import { default as editMode } from './templates/edit.html';

export default class MortgageLosRealEstatePropertyCard extends LightningElement {
  @api index;
  @api mode;
  @api isBorrower;
  @api borrower;
  @api coBorrower;
  @api allTradelines;
  @api primaryResidenceUuids = [];
  @api
  get property() {
    return this.internalProperty;
  }
  set property(data) {
    this.internalProperty = { ...this.internalProperty, ...data };
    this.setAttribute('property', this.internalProperty);
  }

  @track showingModal = false;

  originalProperty;
  formFields = { ...realEstateForm };

  formOccupancyTypeEnum = occupancyTypes;
  formPropertyTypeEnum = propertyTypes;
  formUnitNumberEnum = unitNumbers;
  formStateCodeEnum = states;
  formStatusEnum = statuses;

  dayjsInitialized = false;

  renderedCallback() {
    if (this.dayjsInitialized) return;
    loadScript(this, Dayjs + '/package/dayjs.min.js').then(() => {
      this.dayjsInitialized = true;
    });
  }

  connectedCallback() {
    if (!this.property.ownership) {
      this.handleChange({
        target: {
          getAttribute: () => 'ownership',
          value: this.formOwnershipEnum[0].value,
        },
      });
    }
  }

  render() {
    return (this.mode === MODE.ADD || this.mode === MODE.EDIT) ? editMode : viewMode;
  }


  // ################
  // #              #
  // # Delete logic #
  // #              #
  // ################

  sendDeleteEvent() {
    this.dispatchEvent(new CustomEvent('deleteproperty', {
      detail: {
        index: this.index,
        mode: this.mode,
        uuid: this.property.uuid,
        id: this.property.id,
      }
    }));
  }

  get openDeleteModal() {
    return !this.property.isSubject
      ? () => { this.showingModal = true; }
      : null;
  }

  closeDeleteModal = (event) => {
    if (event.detail === 'deleteProperty') this.sendDeleteEvent();
    this.showingModal = false;
  }


  // ##################
  // #                #
  // # Add/edit logic #
  // #                #
  // ##################

  handleCancel() {
    if (this.mode === MODE.ADD) this.sendDeleteEvent();
    else this.dispatchEvent(new CustomEvent('restoreproperty'));
  }

  handleSave() {
    if (this.validate) {
      this.dispatchEvent(new CustomEvent('saveproperty', { detail: this.property }));
      if (this.mode === MODE.ADD) this.sendDeleteEvent();
    }
  }

  handleChange(event) {
    const field = event.target.getAttribute("data-name-input");
    let data = (event.target.type !== 'checkbox') ? event.target.value : event.target.checked;

    // even when input type is number, values typed in are of string type
    // https://salesforce.stackexchange.com/questions/241665/lightninginputtype-number-value-attribute-is-string-instead-of-number
    if (propertyNumericFields.includes(field)) data = parseFloat(data);

    this.property[field] = data;
  }

  toggleEditMode = () => {
    if (this.mode !== MODE.EDIT) {
      this.mode = MODE.EDIT;
      this.convertUiToValues(this.property);
    }
  }

  get validate() {
    const formOccupancyType = this.template.querySelector('lightning-combobox[data-name-input="occupancyType"]');
    const formYearBuilt = this.template.querySelector('lightning-input[data-name-input="yearBuilt"]');
    const formPropertyValue = this.template.querySelector('lightning-input[data-name-input="propertyValue"]');
    const formInsTaxesAssociationDues = this.template.querySelector('lightning-input[data-name-input="insTaxesAssociationDues"]');
    const formGrossRentalIncome = this.template.querySelector('lightning-input[data-name-input="grossRentalIncome"]');
    const formPercentageOfRental = this.template.querySelector('lightning-input[data-name-input="percentageOfRental"]');
    const formParticipationPercent = this.template.querySelector('lightning-input[data-name-input="participationPercent"]');

    const validateOccupancyType = (occupancy) => {
      if (occupancy !== occupancyTypes[0].value) return true;
      return this.canPropertyBePrimaryResidence;
    }

    return (
      formYearBuilt.checkValidity()
      && formPropertyValue.checkValidity()
      && (this.property.isSubject ? true : formInsTaxesAssociationDues.checkValidity())
      && formGrossRentalIncome.checkValidity()
      && formPercentageOfRental.checkValidity()
      && formParticipationPercent.checkValidity()
      && getInputValidation(formOccupancyType, validateOccupancyType, 'Another property has been selected as a Primary Residence.')
    );
  }


  // #################
  // #               #
  // # Card UI logic #
  // #               #
  // #################

  currencyFormatter(number) {
    if (number) {
      return (number < 0)
        ? `-$${moneyMask(number.toFixed(2))}`
        : `$${moneyMask(number.toFixed(2))}`;
    }
    return '';
  }

  percentageFormatter(number) {
    const numericResult = prettyFloatDisplay(number);
    return numericResult ? `${numericResult}%` : '';
  }

  get sectionSubtitle() {
    return `Property Information - ${getOptionLabelFromValues(ownershipTypes, this.property.ownership) || getOptionLabelFromValues(ownershipTypes, ownershipEnum.BORROWER)}`;
  }

  get propertyCardTitle() {
    if (this.mode === MODE.ADD) return 'Additional Property';
    return this.index === 0
      ? 'Property You Own'
      : 'Additional Property';
  }

  get propertyCardIcon() {
    if (this.mode === MODE.ADD) return 'standard:household';
    return this.index === 0
      ? 'standard:home'
      : 'standard:household';
  }

  get formOwnershipEnum() {
    if (!this.coBorrower) return [ownershipTypes[0]];
    if (this.isBorrower && this.coBorrower?.profile?.maritalType !== 'marriedSameBorrower') return [ownershipTypes[0], ownershipTypes[2]];
    if (!this.isBorrower && this.borrower?.profile?.maritalType !== 'marriedSameBorrower') return [ownershipTypes[1], ownershipTypes[2]];
    return ownershipTypes;
  }

  get subjectPropertyToggleEdit() {
    return this.property.isSubject
      ? null
      : this.toggleEditMode;
  }

  get canPropertyBePrimaryResidence() {
    if (this.primaryResidenceUuids.length > 0 && !this.primaryResidenceUuids.includes(this.property.uuid)) return false;
    return true;
  }

  // #######################
  // #                     #
  // # Card data treatment #
  // #                     #
  // #######################

  get fullAddress() {
    return getFullAddress({
      addressLine1: this.property.addressLine1,
      unit: this.property.addressUnit,
      city: this.property.addressCity,
      stateCode: this.property.addressStateCode,
      zipCode: this.property.addressZipCode,
    });
  }

  get parsedOwnership() {
    return getOptionLabelFromValues(ownershipTypes, this.property.ownership);
  }

  get parsedDateOfPurchase() {
    return this.property.dateAcquired
      ? dayjs(this.property.dateAcquired).format("MM/DD/YYYY")
      : null;
  }

  convertUiToValues(source) { // used to prepare the UI form fields when going from view to edit mode
    if (source.occupancyType) this.property.occupancyType = getOptionValueFromLabels(occupancyTypes, source.occupancyType);
    if (source.numberOfUnits) this.property.numberOfUnits = getOptionValueFromLabels(unitNumbers, source.numberOfUnits);
    if (source.status) this.property.status = getOptionValueFromLabels(statuses, source.status);
    if (source.propertyType) this.property.propertyType = getOptionValueFromLabels(propertyTypes, source.propertyType);
  }
}