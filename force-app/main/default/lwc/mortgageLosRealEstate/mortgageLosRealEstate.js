import { api, track, wire } from 'lwc';
import BaseComponent from 'c/baseComponent';
import { isAbbleToEdit, ownershipEnum, occupancyTypes, propertyTypes,
  propertyNumericFields, unitNumbers, statuses, getOptionLabelFromValues,
  getEmptyProperty, MODE, deepCopy, SectionId, getMutationProperty } from 'c/util'
import SubmissionChannel from '@salesforce/messageChannel/SubmissionChannel__c';
import { publish, subscribe, MessageContext } from 'lightning/messageService';

import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, REFINANCE_SUBMISSION_SUBJECT_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';

export default class MortgageLosRealEstate extends BaseComponent {
  @api recordId;
  @api role;

  @track properties;
  @track refiProperty;
  @track borrower;
  @track coBorrower;
  @track tradelines;
  @track originalTradelines;
  @track hasLoaded = false;
  @track hasError = false;
  @track propertiesToAdd = [];

  @wire(MessageContext)
  messageContext;

  editClass = isAbbleToEdit;
  deprecatedSubmissionSubscription;
  componentId; // used to identify messages as component is both sender and receiver of Submission messages
  shouldPublishLiabilities = false;
  shouldPublishRefiProperty = false;


  // ########################
  // #                      #
  // # Lifecycle & Messages #
  // #                      #
  // ########################

  mutationCallback(result) {
    publish(this.messageContext, SubmissionChannel, {
      id: this.opportunity.id,
      componentId: this.componentId,
      result,
    });

    if (this.shouldPublishLiabilities) {
      this.publishMessage(SectionId.LIABILITIES);
      this.shouldPublishLiabilities = false;
    }
    if (this.shouldPublishRefiProperty) {
      this.publishMessage(SectionId.REFI_PROPERTY, result.refinanceProperty);
      this.shouldPublishRefiProperty = false;
    }

    this.submissionCallback(result);
  }

  loadSubmissionData = () => {
    this.hasLoaded = false;
    this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
  }

  submissionCallback(result) {
    if (result) {
      const additionalProperties = result.realEstate?.properties || [];

      this.refiProperty = result.refinanceProperty;
      this.borrower = result.borrower;
      this.coBorrower = result.coBorrower;
      this.tradelines = deepCopy(result.realEstate?.tradelines);
      this.originalTradelines = deepCopy(result.realEstate?.tradelines);
      this.propertiesToAdd = [];
      this.properties = [
        this.parsePropertyData(this.refiProperty, true),
        ...additionalProperties.map(property => this.parsePropertyData(property)),
      ].filter(property => !!property);
    } else {
      this.hasError = true;
    }

    this.hasLoaded = true;
  }

  connectedCallback() {
    this.componentId = new Date().getTime();
    this.subscribeToSubmissionChannel();
    this.registerSubscription(
      [SectionId.REFI_PROPERTY],
      this.loadSubmissionData
    );
  }

  subscribeToSubmissionChannel = () => {
    if (this.deprecatedSubmissionSubscription) return;

    this.deprecatedSubmissionSubscription = subscribe(this.messageContext, SubmissionChannel, (message) => {
      if (message.id === this.opportunity.id && message.componentId !== this.componentId) {
        if (message.result) {
          this.hasLoaded = false;
          this.submissionCallback(message.result);
        }
        else this.loadSubmissionData();
      }
    });
  }


  // ############
  // #          #
  // # UI logic #
  // #          #
  // ############

  get roleFilteredProperties() { // filter properties according to ownership + selected tab
    if (!this.hasLoaded) return [];
    if (!this.coBorrower) return this.properties;
    return this.properties.filter(property => this.shouldDisplayProperty(this.getOwnershipStatus(property)));
  }

  shouldDisplayProperty(ownership) {
    if (ownership === ownershipEnum.BOTH) return true;

    if (this.isBorrower) {
      if (!this.coBorrower || ownership === ownershipEnum.BORROWER) return true;
      if (!!this.coBorrower && ownership === ownershipEnum.COBORROWER) return this.coBorrower.profile?.maritalType === 'marriedSameBorrower';
    }
    else {
      if (ownership === ownershipEnum.COBORROWER) return true;
      else return this.borrower.profile?.maritalType === 'marriedSameBorrower';
    }

    return false;
  }

  get refiPropertyOwnership() {
    return !!this.coBorrower ? ownershipEnum.BOTH : ownershipEnum.BORROWER;
  }

  get isBorrower() {
    return this.role === 'borrower';
  }

  get hasSavedProperties() {
    return Array.isArray(this.roleFilteredProperties) && this.roleFilteredProperties.length > 0;
  }

  get hasProperties() {
    const hasExistingProperties = Array.isArray(this.roleFilteredProperties) && this.roleFilteredProperties.length > 0;
    const isAddingProperties = Array.isArray(this.propertiesToAdd) && this.propertiesToAdd.length > 0;
    return (hasExistingProperties || isAddingProperties);
  }

  getOwnershipStatus(property) {
    if (!Array.isArray(property.owners) || property.owners.length === 0) return ownershipEnum.BORROWER;

    if (property.owners.length === 1) {
      if (property.owners[0].uuid === this.borrower.uuid) return ownershipEnum.BORROWER;
      return ownershipEnum.COBORROWER;
    }

    return ownershipEnum.BOTH;
  }

  // returns an array to account for the Full Form creating multiple primary residences
  get primaryResidenceUuids() {
    return this.roleFilteredProperties
      .filter(property => property.occupancyType === occupancyTypes[0].label)
      .map(property => property.uuid);
  }


  // #########################
  // #                       #
  // # Add/edit/delete logic #
  // #                       #
  // #########################

  addNewProperty() {
    this.propertiesToAdd.push({
      ...getEmptyProperty(),
      id: new Date().getTime(),
    });
  }

  handleDeleteProperty = (event) => {
    const { index, mode, uuid, id } = event.detail;

    // cancel add
    if (mode === MODE.ADD) {
      this.tradelines.forEach(tradeline => {
        if ((uuid && uuid === tradeline.propertyUuid) || (id && id === tradeline.propertyId)) {
          tradeline.propertyUuid = null;
          tradeline.propertyId = null;
        }
      });

      this.propertiesToAdd.splice(index, 1);
    }
    // delete existing
    else {
      const propertyToDelete = this.roleFilteredProperties[index];

      this.hasLoaded = false;
      this.updateParticipant(
        this.mutationCallback.bind(this),
        this.prepareMutation({ uuid: propertyToDelete.uuid, delete: true }),
        { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION },
      );
    }
  }

  handleTradelineToggle(event) {
    event.stopPropagation();

    const { tradelineUuid, checked, propertyUuid, propertyId } = event.detail;

    const tradeline = this.tradelines.find(tradeline => tradeline.uuid === tradelineUuid);
    const property = (propertyUuid && this.properties.find(property => property.uuid === propertyUuid))
      || (propertyId && this.propertiesToAdd.find(propertyToAdd => propertyToAdd.id === propertyId));

    if (checked) {
      if (propertyUuid) tradeline.propertyUuid = propertyUuid;
      if (propertyId) tradeline.propertyId = propertyId;
    }
    else {
      tradeline.propertyUuid = null;
      tradeline.propertyId = null;
    }

    const filteredTradelines = this.getFilteredTradelines(property);
    property.tradelines = filteredTradelines;
    property.mortgageBalance = this.getMortgageBalance(filteredTradelines);
    property.mortgagePayment = this.getMortgagePayment(filteredTradelines);
  }


  // ######################################
  // #                                    #
  // # Property data treatment for saving #
  // #                                    #
  // ######################################

  getPropertyTradelineDiff(property) {
    const startTradelines = Array.isArray(this.originalTradelines)
      ? this.originalTradelines
        .filter(tradeline => (property.uuid && property.uuid === tradeline.propertyUuid) || (property.id && property.id === tradeline.propertyId))
        .map(tradeline => tradeline.uuid)
      : [];

    const endTradelines = Array.isArray(this.tradelines)
      ? this.tradelines
        .filter(tradeline => (property.uuid && property.uuid === tradeline.propertyUuid) || (property.id && property.id === tradeline.propertyId))
        .map(tradeline => tradeline.uuid)
      : [];

    const tradelinesToAdd = endTradelines.filter(tradeline => !startTradelines.includes(tradeline));
    const tradelinesToDel = startTradelines.filter(tradeline => !endTradelines.includes(tradeline));

    return [
      ...tradelinesToAdd.map(tradeline => ({ tradelineUuid: tradeline })),
      ...tradelinesToDel.map(tradeline => ({ tradelineUuid: tradeline, delete: true })),
    ];
  }

  handleSaveProperty(event) {
    const property = event.detail;
    if (!property) return;

    const propertyDataToSave = property.isSubject
      ? this.parseRefiPropertyFieldsForMutation(this.preparePropertyForMutation(property))
      : this.preparePropertyForMutation(property);

    const REFINANCE_MUTATION = property.isSubject
      ? REFINANCE_SUBMISSION_SUBJECT_MUTATION
      : REFINANCE_SUBMISSION_MUTATION;

    this.shouldPublishRefiProperty = property.isSubject;
    this.hasLoaded = false;
    this.updateParticipant(
      this.mutationCallback.bind(this),
      this.prepareMutation(propertyDataToSave),
      { REFINANCE_SUBMISSION_MUTATION: REFINANCE_MUTATION, PURCHASE_SUBMISSION_MUTATION },
    );
  }

  prepareMutation(propertyData = {}) {
    return {
      borrower: {
        participantUuid: this.borrower.uuid,
        ...propertyData,
      },
    };
  }

  preparePropertyForMutation(property) {
    const propertyData = getMutationProperty();
    if (property.uuid) propertyData.uuid = property.uuid;

    // existing numeric field treatment
    propertyNumericFields.forEach(field => {
      if (property[field]) property[field] = parseFloat(property[field]);
    });

    // property info
    if (property.addressLine1) propertyData.address.addressLine1 = property.addressLine1;
    if (property.addressUnit) propertyData.address.unit = property.addressUnit;
    if (property.addressCity) propertyData.address.city = property.addressCity;
    if (property.addressStateCode) propertyData.address.stateCode = property.addressStateCode;
    if (property.addressZipCode) propertyData.address.zipCode = property.addressZipCode;

    if (property.purchasePrice) propertyData.detail.salePrice = property.purchasePrice;
    if (property.dateAcquired) propertyData.detail.saleDate = property.dateAcquired;
    if (property.yearBuilt) propertyData.detail.yearBuild = property.yearBuilt;
    if (property.propertyValue) propertyData.detail.propertyValue = property.propertyValue;

    if (property.status) propertyData.status = property.status;
    if (property.propertyType) propertyData.propertyType = property.propertyType;
    if (property.numberOfUnits) propertyData.numberOfUnits = property.numberOfUnits;
    if (property.ownership) {
      propertyData.owners = [];
      if (property.ownership === ownershipEnum.BORROWER || property.ownership === ownershipEnum.BOTH) propertyData.owners.push({ uuid: this.borrower.uuid });
      if (property.ownership === ownershipEnum.COBORROWER || property.ownership === ownershipEnum.BOTH) propertyData.owners.push({ uuid: this.coBorrower.uuid });
    }
    else if (property.owners) propertyData.owners = property.owners;
    if (property.occupancyType) propertyData.occupancyType = property.occupancyType;

    // mortgage info
    const modifiedTradelines = this.getPropertyTradelineDiff(property);
    if (modifiedTradelines.length > 0) {
      propertyData.tradelines = modifiedTradelines;
      this.shouldPublishLiabilities = true;
    }
    else this.shouldPublishLiabilities = false;
    if (property.insTaxesAssociationDues) propertyData.monthlyTaxesInsuranceHoa = property.insTaxesAssociationDues;

    // rental info
    if (property.grossRentalIncome) propertyData.rentalIncome.amount = property.grossRentalIncome;
    if (property.percentageOfRental) propertyData.rentalIncome.rentalPercentage = property.percentageOfRental;
    if (property.participationPercent) propertyData.rentalIncome.participationPercentage = property.participationPercent;

    return propertyData;
  }

  parseRefiPropertyFieldsForMutation(propertyData) {
    delete propertyData.isRealEstate;
    if (propertyData.uuid) delete propertyData.uuid;
    if (propertyData.owners) delete propertyData.owners;

    propertyData.salePrice = propertyData.detail.salePrice;
    propertyData.saleDate = propertyData.detail.saleDate;
    propertyData.yearBuild = propertyData.detail.yearBuild;
    propertyData.estimatedValue = propertyData.detail.propertyValue;
    delete propertyData.detail; // not nested on refi mutation

    delete propertyData.monthlyTaxesInsuranceHoa; // read only on refi property

    return propertyData;
  }


  // #######################################
  // #                                     #
  // # Property data treatment for viewing #
  // #                                     #
  // #######################################

  getFilteredTradelines(property) {
    return (Array.isArray(this.tradelines) && this.tradelines.length > 0)
      ? this.tradelines.filter(tradeline =>
        (property.uuid && tradeline.propertyUuid === property.uuid) || (property.id && tradeline.propertyId === property.id)
      )
      : [];
  }

  getMortgageBalance(tradelines = []) {
    const mortgageBalance = tradelines.reduce((total, tradeline) => {
      return tradeline.unpaidBalance
        ? total + parseFloat(tradeline.unpaidBalance)
        : total;
    }, 0.0);

    return mortgageBalance ? mortgageBalance : null;
  }

  getMortgagePayment(tradelines = []) {
    const mortgagePayment = tradelines.reduce((total, tradeline) => {
      let tradelinePayment = tradeline.monthlyPayment && parseFloat(tradeline.monthlyPayment);
      if (!tradelinePayment) tradelinePayment = (tradeline.unpaidBalance && tradeline.monthsLeft) && parseFloat(tradeline.unpaidBalance)/parseFloat(tradeline.monthsLeft);

      return tradelinePayment
        ? total + tradelinePayment
        : total;
    }, 0.0);

    return mortgagePayment ? mortgagePayment : null;
  }

  getMonthlyCostInsuranceTaxesAssociationDues(property = {}, isRefiProperty = false) {
    let insTaxesAssociationDues;

    if (isRefiProperty) {
      insTaxesAssociationDues = (property.monthlyInsuranceFee || property.monthlyHomeownersFee || property.monthlyTaxes) &&
        parseFloat(property.monthlyInsuranceFee || 0) + parseFloat(property.monthlyHomeownersFee || 0) + parseFloat(property.monthlyTaxes || 0);
    }
    else {
      const costs = property.costs || [];

      insTaxesAssociationDues = costs.reduce((sum, cost) => {
        if (cost.costType !== 'taxesInsuranceHoa') return sum;
        return cost.amount
          ? parseFloat(cost.amount) + sum
          : sum;
      }, 0.0);
    }

    return insTaxesAssociationDues ? insTaxesAssociationDues : null;
  }

  getGrossRentalIncome(rentIncome = {}) {
    if (!rentIncome.amount) return null;
    if (rentIncome.paymentTermType === 'perMonth') return rentIncome.amount;
    return parseFloat(rentIncome.amount)/12;
  }

  parsePropertyData(property, isRefiProperty = false) {
    if (!property) return null;

    let owners = property.owners;
    if (isRefiProperty) {
      owners = [{ uuid: this.borrower.uuid }];
      if (this.coBorrower?.uuid) owners.push({ uuid: this.coBorrower.uuid });
    }

    const filteredTradelines = this.getFilteredTradelines(property);

    const rentIncome = (Array.isArray(property.incomes) && property.incomes.find(income => income.incomeType === 'rental')) || {};

    return ({
      uuid: property.uuid,
      owners,
      // property info
      ownership: isRefiProperty ? this.refiPropertyOwnership : this.getOwnershipStatus(property),
      addressLine1: property.address?.addressLine1,
      addressUnit: property.address?.unit,
      addressCity: property.address?.city,
      addressStateCode: property.address?.stateCode,
      addressZipCode: property.address?.zipCode,
      isSubject: isRefiProperty,
      occupancyType: getOptionLabelFromValues(occupancyTypes, property.occupancyType),
      numberOfUnits: isNaN(property.numberOfUnits) ? getOptionLabelFromValues(unitNumbers, property.numberOfUnits) : property.numberOfUnits,
      status: getOptionLabelFromValues(statuses, property.status),
      propertyType: getOptionLabelFromValues(propertyTypes, property.propertyType),
      purchasePrice: isRefiProperty
        ? property.originalPurchasePrice
        : property.details?.salePrice,
      dateAcquired: isRefiProperty
        ? property.dateOfPurchase
        : property.details?.saleDate,
      yearBuilt: isRefiProperty ? property.yearBuilt : property.details?.yearBuild,
      // mortgage info
      tradelines: filteredTradelines,
      propertyValue: isRefiProperty
        ? property.estimatedValue
        : property.details?.propertyValue,
      mortgageBalance: this.getMortgageBalance(filteredTradelines),
      mortgagePayment: this.getMortgagePayment(filteredTradelines),
      insTaxesAssociationDues: this.getMonthlyCostInsuranceTaxesAssociationDues(property, isRefiProperty),
      // rental info
      grossRentalIncome: this.getGrossRentalIncome(rentIncome),
      percentageOfRental: rentIncome?.incomeDetail?.rentalPercentage,
      participationPercent: rentIncome?.incomeDetail?.participationPercentage,
      netIncomeLoss: property.rentalIncomeDetail?.netIncomeLoss,
    });
  }
}