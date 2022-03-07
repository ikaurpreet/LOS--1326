import { LightningElement } from 'lwc';
import { moneyMask } from 'c/inputMaskUtils';

export default class Util extends LightningElement { }

export function getUrlTable(data) {
    var returnData = data.map(
        record => Object.assign(
            { "nameUrl": '/' + record.Id },
            record
        )
    );
    return returnData;
}

//consts
export const isNotAbbleToEdit = "slds-form-element slds-form-element_horizontal slds-hint-parent slds-form-element_readonly";
export const isAbleToEdit = "slds-form-element slds-form-element_edit slds-form-element_readonly  slds-form-element_horizontal slds-hint-parent";

export function militaryServiceOptions() {
    return [
        { label: "Currently serving on active duty", value: "isCurrentlyServing" },
        { label: "Currently retired, discharged, or separated from service", value: "isRetired" },
        { label: "Only period of service was as a non-activated member of the Reserve or National Guard", value: "isReserve" },
        { label: "Surviving spouse", value: "isSurvivingSpouse" }
    ]
};

/**
 * A marital option
 * @typedef {Object} MaritalOption
 * @property {string} label - To display
 * @property {string} value - Option value
 */

/**
 * Available Marital Options
 * @returns {maritalOption[]} - A list of {@link MaritalOption} to pick
 */
export function maritalOptions() {
    return [
        { label: "Married", value: "married" },
        { label: "Separated", value: "separated" },
        { label: "Unmarried", value: "unmarried" },
        { label: "Married to same borrower", value: "marriedSameBorrower" }
    ]
}

export function getMaritalLabel(value) {
    const opts = maritalOptions();
    const currentOpt = opts.find(opt => opt.value === value);
    if (currentOpt) {
        return currentOpt.label;
    }
    return null;
}

export function housingStatusOptions() {
    return [
        { label: 'Own', value: 'own' },
        { label: 'Rent', value: 'rent' },
        { label: 'No Mortgage', value: 'noMortgage' },
        { label: 'Own with Mortgage', value: 'ownWithMortgage' },
        { label: 'Living Rent Free', value: 'livingRentFree' }
    ]
}

export function getHousingStatusLabel(value) {
    const opts = housingStatusOptions();
    const currentOpt = opts.find(opt => opt.value === value);
    if (currentOpt) {
        return currentOpt.label;
    }
    return null;
}

export function suffixOptions() {
    return [
        { label: "Jr", value: "junior" },
        { label: "Senior", value: "senior" },
        { label: "III", value: "third" },
        { label: "IV", value: "fourth" },
        { label: "V", value: "fifth" }
    ];
}

export function getSuffixLabel(value) {
    const opts = suffixOptions();
    const currentOpt = opts.find(opt => opt.value === value);
    if (currentOpt) {
        return currentOpt.label;
    }
    return null;
}

export function citizenOptions() {
    return [
        { label: "US citizenship", value: "usCitizen" },
        { label: "Permanent resident", value: "permanentResident" },
        { label: "Other", value: "other" }
    ];
}

export function getCitizenLabel(value) {
    const opts = citizenOptions();
    const currentOpt = opts.find(opt => opt.value === value);
    if (currentOpt) {
        return currentOpt.label;
    }
    return null;
}

/**
 * Available date format
 * @typedef {Object} AvailableDateFormat
 * @property {string} year - year format
 * @property {string} month - month format
 * @property {string} day - day format
 */

/**
 * @type {AvailableDateFormat}
 */
export const LONG_DATE_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' };
/**
 * @type {AvailableDateFormat}
 */
export const SHORT_DATE_FORMAT = { year: '2-digit', month: '2-digit', day: '2-digit' };

/**
 * @const {AvailableDateFormat[]} - Available date formats
 */
export const AVAILABLE_DATE_FORMATS = [LONG_DATE_FORMAT, SHORT_DATE_FORMAT];

function inAvailableDateFormats(format) {
    let isAvailable = false;
    AVAILABLE_DATE_FORMATS.forEach(availableFormat => {
        if (JSON.stringify(format) === JSON.stringify(availableFormat)) {
            isAvailable = true;
        }
    });
    return isAvailable;
}

/**
 * Date formatting function
 * @param {string} dateString - Date string
 * @param {AvailableDateFormat} format - One of available formats
 * @returns {string} - Formatted date
 *
 * @example
 *
 * formatDate("1998-01-17", LONG_DATE_FORMAT)
 */
export function formatDate(dateString, format) {
    if (dateString && inAvailableDateFormats(format)) {
        const date = Date.parse(`${dateString}T00:00:00`);
        return new Intl.DateTimeFormat('en-US', format).format(date);
    }
    return ''
}

/**
 * Form validation
 * @param {*} input - The input element to be validate
 * @param {function} validFunc - The validation function
 * @param {string} [errorMsg="invalid input"] - The error message
 * @returns {any} - False if validation doesn't pass otherwise returns true
 */
export function getInputValidation(input, validFunc, errorMsg = "invalid input") {
    let returnvalue = true;
    if (input) {
        const value = input.value;
        if (!validFunc(value)) {
            input.setCustomValidity(errorMsg);
            returnvalue = false;
        } else {
            input.setCustomValidity("");
            returnvalue = true;
        }
        input.reportValidity();
    }

    return returnvalue;
}

export const addressFormValues = {
    id: {
        value: null
    },
    addressLine1: {
        value: null,
        label: 'Street Address'
    },
    unit: {
        value: null
    },
    city: {
        value: null,
        label: 'City'
    },
    stateCode: {
        value: null,
        label: 'State'
    },
    zipCode: {
        value: null,
        label: 'Zip'
    },
    startDate: {
        value: null
    },
    housingStatusType: {
        value: null,
        label: 'Ownership'
    }
}

export function getEmptyFormValues() {
    const result = {};
    Object.keys(addressFormValues).forEach(key => {
        result[key] = { ...addressFormValues[key] };
    });

    return result;
}

export function cloneObjectFrom(obj) {
    const result = {};

    Object.keys(obj).forEach(key => {
        if (obj[key] != null && (typeof obj[key]) == 'object') {
            result[key] = cloneObjectFrom(obj[key]);
            return;
        }
        result[key] = obj[key];
    });

    return result;
}

/**
 * deepCopy - makes a deep copy of arrays and/or objects and their nested properties
 * @param {object|Array} inObject - object/array to be deeply copied
 * @returns {object|Array} - copied object/array
 */
export function deepCopy(inObject) {
    let outObject, value, key;

    if (typeof inObject !== "object" || inObject === null) return inObject;
    outObject = Array.isArray(inObject) ? [] : {};

    for (key in inObject) {
        value = inObject[key];
        outObject[key] = deepCopy(value)
    }

    return outObject;
}

export const states = [
    { value: 'AL', label: 'Alabama' },
    { value: 'AK', label: 'Alaska' },
    { value: 'AZ', label: 'Arizona' },
    { value: 'AR', label: 'Arkansas' },
    { value: 'CA', label: 'California' },
    { value: 'CO', label: 'Colorado' },
    { value: 'CT', label: 'Connecticut' },
    { value: 'DE', label: 'Delaware' },
    { value: 'DC', label: 'District of Columbia' },
    { value: 'FL', label: 'Florida' },
    { value: 'GA', label: 'Georgia' },
    { value: 'HI', label: 'Hawaii' },
    { value: 'ID', label: 'Idaho' },
    { value: 'IL', label: 'Illinois' },
    { value: 'IN', label: 'Indiana' },
    { value: 'IA', label: 'Iowa' },
    { value: 'KS', label: 'Kansas' },
    { value: 'KY', label: 'Kentucky' },
    { value: 'LA', label: 'Louisiana' },
    { value: 'ME', label: 'Maine' },
    { value: 'MD', label: 'Maryland' },
    { value: 'MA', label: 'Massachusetts' },
    { value: 'MI', label: 'Michigan' },
    { value: 'MN', label: 'Minnesota' },
    { value: 'MS', label: 'Mississippi' },
    { value: 'MO', label: 'Missouri' },
    { value: 'MT', label: 'Montana' },
    { value: 'NE', label: 'Nebraska' },
    { value: 'NV', label: 'Nevada' },
    { value: 'NH', label: 'New Hampshire' },
    { value: 'NJ', label: 'New Jersey' },
    { value: 'NM', label: 'New Mexico' },
    { value: 'NY', label: 'New York' },
    { value: 'NC', label: 'North Carolina' },
    { value: 'ND', label: 'North Dakota' },
    { value: 'OH', label: 'Ohio' },
    { value: 'OK', label: 'Oklahoma' },
    { value: 'OR', label: 'Oregon' },
    { value: 'PA', label: 'Pennsylvania' },
    { value: 'RI', label: 'Rhode Island' },
    { value: 'SC', label: 'South Carolina' },
    { value: 'SD', label: 'South Dakota' },
    { value: 'TN', label: 'Tennessee' },
    { value: 'TX', label: 'Texas' },
    { value: 'UT', label: 'Utah' },
    { value: 'VT', label: 'Vermont' },
    { value: 'VA', label: 'Virginia' },
    { value: 'WA', label: 'Washington' },
    { value: 'WV', label: 'West Virginia' },
    { value: 'WI', label: 'Wisconsin' },
    { value: 'WY', label: 'Wyoming' },
]

export const incomeTypes = [
    { value: 'pension', label: "Pension" },
    { value: 'interest', label: 'Interest' },
    { value: 'dividends', label: 'Dividends Interest' },
    { value: 'rental', label: 'Rental' },
    { value: 'alimony', label: 'Alimony' },
    { value: 'other', label: 'Other' },
    { value: 'balanceEmploymentIncome', label: 'Balance Employment Income' },
    { value: 'bonusAndCommission', label: 'Bonus And Commissions' },
    { value: 'selfEmploymentIncome', label: 'Self Employment Income' },
    { value: 'socialSecurity', label: 'Social Security' },
    { value: 'capitalGains', label: 'Capital Gains' },
    { value: 'childSupport', label: 'Child Support' },
    { value: 'permanentDisability', label: 'Disability' },
    { value: 'militaryEntitlements', label: 'Military Entitlements' },
    { value: 'totalIncome', label: 'Total Income' },
    { value: 'trust', label: 'Trust' },
    { value: 'separateMaintenance', label: 'Separate Maintenance' }
];

export const employmentType = [
    { value: "partTime", label: 'Part Time' },
    { value: "fullTime", label: 'Full Time' },
    { value: "selfEmployment", label: 'Self Employment' }
];

export function getMonthLabel(month, year) {
    if (month === 0) {
        return '';
    }
    if (month > 0 && month < 1 && year === 0) {
        return 'Less than a month';
    }
    if (month >= 1 && month < 2) {
        return 'month';
    }
    if (month >= 2) {
        return 'months';
    }
    return '';
}

export function applyMoneyMaskValue(value) {
    return value ? `$${moneyMask(parseFloat(value).toFixed(2))}` : "";
}

/**
 * prettyFloatDisplay - displays numbers with up to 2 decimal points of precision and removes decimals when it is an integer
 * @param {number|string} number - numeric input, can be a parseable string as well
 * @returns {string} - parsed number
 */
export function prettyFloatDisplay(number) {
  const numericResult = parseFloat(number);

  return isNaN(numericResult)
    ? null
    : parseFloat(numericResult.toFixed(2).replace(/\.00$/, '').replace(/,00$/, ''));
}

export function getDateLabel(months, years) {
    const calculatedMonths = months % 12;
    const yearsLabel = years > 0 ? (years > 1 ? 'years' : 'year') : '';
    const monthsLabel = getMonthLabel(calculatedMonths, years);
    const yearsValue = years > 0 ? years : '';
    const monthsValue = calculatedMonths >= 1 ? Math.floor(calculatedMonths) : '';
    return `${yearsValue} ${yearsLabel} ${monthsValue} ${monthsLabel}`.trim();
}

export function getFullAddress(address) {
    return `${address.addressLine1 || ''}${address.unit ? (', ' + address.unit) : ''}${address.city ? (", " + address.city) : ''}${address.stateCode ? (", " + address.stateCode) : ''}${address.zipCode ? (", " + address.zipCode) : ''}`.replace(/^,|,$/g, '');
}

export function moneyToFloat(moneyString) {
    return moneyString ? parseFloat(moneyString.toString().replace(/,/g, '')) : 0;
}

export function getOptionLabelFromValues(optionsArray, value) {
    return (optionsArray.find(option => option.value === value) || {}).label;
}

export function getOptionValueFromLabels(optionsArray, label) {
    return (optionsArray.find(option => option.label === label) || {}).value;
}

export const MODE = {
    EDIT: 'editMode',
    ADD: 'addMode',
    VIEW: 'viewMode',
};

export {
    AssetsGroups, ownerOptions, assetsTypeOptions, ASSETS_SUMMARY_COMMON_CLASS,
    ASSETS_SUMMARY_JOINTLY, ASSETS_SUMMARY_NOT_JOINTLY
} from './assetsUtils';

export { emptyLoanAndProp, constructionMethod, loanType, loanPurpose, emptyLpSelectedProduct, emptyLpCounty } from './loanAndProperty';

export { DemographicConstants, demoLabelMap, otherTextBoxes, allEthnicities, allRaces, allSexes } from './demographicUtils';

export { accountType, liabilityOwner, liability, otherAccountType } from './liabilitiesUtils';

export {
    getEmptyProperty, realEstateForm, getMutationProperty, propertyNumericFields, ownershipEnum,
    ownershipTypes, occupancyTypes, propertyTypes, unitNumbers, statuses, getTradelineText,
} from './realEstateUtils';

export {
    lenderFormL1, lenderFormL3, lenderFormL4, attachmentType, communityPropertyState, emptyL1SelectedProduct, amortizationType, emptyL4SelectedProduct,
    addlCreditType, addlCreditRecord, emptyFeeManagement
} from './lenderFormUtils';

export {
    VALUE, BORROWER, CO_BORROWER, TRUE, FALSE, MORTGAGE_REFI, HOME_PURCHASE, DATA_NAME_INPUT,
    EDIT_PARTICIPANT_EVENT_NAME, ELEMENT_TYPE_CHECKBOX, EVENT_TYPE_CHANGE, SUBMISSION_UUID, MAX_AMOUNT_VALUE
} from './losConstants';


export { SectionId } from './submissionUpdateChannel.js';