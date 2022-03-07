import { moneyMask } from 'c/inputMaskUtils';

export const realEstateForm = {
  // property info
  ownership: 'Owned by',
  fullAddress: 'Street Address',
  addressLine1: 'Street Address',
  addressUnit: 'Unit #',
  addressCity: 'City',
  addressStateCode: 'State',
  addressZipCode: 'Zip',
  isSubject: 'Subject Property',
  occupancyType: 'Property is used as',
  numberOfUnits: 'Number of Units',
  status: 'Property Status',
  propertyType: 'Type of Property',
  purchasePrice: 'Purchase Price',
  dateAcquired: 'Date Acquired',
  yearBuilt: 'Year Built',
  // mortgage info
  tradelines: 'Tradelines',
  propertyValue: 'Property Value',
  mortgageBalance: 'Mortgage Balance',
  mortgagePayment: 'Mortgage Payment',
  insTaxesAssociationDues: 'Ins, Taxes, Association Dues',
  // rental info
  grossRentalIncome: 'Gross Rental Income',
  percentageOfRental: 'Percentage of Rental',
  participationPercent: 'Participation %',
  netIncomeLoss: 'Net Income / Loss',
};

export function getEmptyProperty() {
  return {
    // property info
    ownership: null,
    addressLine1: null,
    addressUnit: null,
    addressCity: null,
    addressStateCode: null,
    addressZipCode: null,
    isSubject: false,
    occupancyType: null,
    numberOfUnits: null,
    status: null,
    propertyType: null,
    purchasePrice: null,
    dateAcquired: null,
    yearBuilt: null,
    // mortgage info
    tradelines: [],
    insTaxesAssociationDues: null,
    // rental info
    grossRentalIncome: null,
    percentageOfRental: null,
    participationPercent: null,
  };
}

export function getMutationProperty() {
  return {
    isRealEstate: true,
    address: { addressLine1: null, unit: null, city: null, stateCode: null, zipCode: null },
    detail: { salePrice: null, saleDate: null, yearBuild: null, propertyValue: null },
    status: null,
    propertyType: null,
    numberOfUnits: null,
    occupancyType: null,
    monthlyTaxesInsuranceHoa: null,
    rentalIncome: { paymentTermType: 'perMonth', amount: null, rentalPercentage: null, participationPercentage: null },
  };
}

export const propertyNumericFields = ['purchasePrice', 'yearBuilt', 'propertyValue', 'mortgageBalance', 'mortgagePayment',
  'insTaxesAssociationDues', 'grossRentalIncome', 'percentageOfRental', 'participationPercent', 'netIncomeLoss'];

export const ownershipEnum = {
  BORROWER: 'borrower',
  COBORROWER: 'coBorrower',
  BOTH: 'both',
};

export const ownershipTypes = [
  { value: 'borrower', label: 'Borrower' },
  { value: 'coBorrower', label: 'Co-Borrower' },
  { value: 'both', label: 'Both' },
];

export const occupancyTypes = [
  { value: 'primaryResidence', label: 'Primary Residence' },
  { value: 'secondHome', label: 'Secondary Residence' },
  { value: 'investmentProperty', label: 'Investment Property' },
];

export const propertyTypes = [
  { value: 'singleFamily', label: 'Single Family' },
  { value: 'units', label: '2 - 4 Units' },
  { value: 'condo', label: 'Condominium' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'manufacturedHome', label: 'Manufactured Home' },
];

export const unitNumbers = [
  { value: 'oneUnit', label: 1 },
  { value: 'twoUnits', label: 2 },
  { value: 'threeUnits', label: 3 },
  { value: 'fourUnits', label: 4 },
];

export const statuses = [
  { value: 'sold', label: 'Sold' },
  { value: 'pendingSale', label: 'Pending Sale' },
  { value: 'retain', label: 'Retain' },
];

export function getTradelineText(tradeline = {}) {
  if (!tradeline.unpaidBalance || !(tradeline.monthlyPayment || tradeline.monthsLeft)) return null;

  const tradelineBalance = moneyMask(tradeline.unpaidBalance.toFixed(2));
  const tradelinePayment = tradeline.monthlyPayment
    ? moneyMask(tradeline.monthlyPayment.toFixed(2))
    : moneyMask((parseFloat(tradeline.unpaidBalance) / parseFloat(tradeline.monthsLeft)).toFixed(2));

  return `${tradeline.companyName} ($${tradelineBalance} Balance, $${tradelinePayment}/mo)`;
}