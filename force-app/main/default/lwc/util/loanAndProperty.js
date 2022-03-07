export const constructionMethod = [
    { value: "manufactured", label: "Manufactured" },
    { value: "siteBuilt", label: "Site Built" },
    { value: "other", label: "Other" }
]

export const loanPurpose = [
    { value: "cashOut", label: "Cash-Out Refinance", vertical: "refinance" },
    { value: "limitedCashOut", label: "Limited Cash-Out Refinance", vertical: "refinance" },
    { value: "purchase", label: "Purchase", vertical: "purchase" }
]

export const loanType = [
    { value: "conforming", label: "Conforming" },
    { value: "nonConforming", label: "Non-Conforming" },
    { value: "homePossible", label: "Home Possible" },
    { value: "homePossibleAdvantage", label: "Home Possible Advantage" },
    { value: "homeReady", label: "Home Ready" }
]

export const emptyLpCounty = {
    fipsCountyCode: "",
    name: ""
}

export const emptyProperty = {
    address: {
        addressLine1: "",
        unit: "",
        city: "",
        stateCode: "",
        zipCode: "",
        county: { ...emptyLpCounty },
    },
    numberOfUnits: null,
    propertyType: null,
    occupancyType: null,
    yearBuilt: "",
    mixedUseProperty: false,
    constructionMethod: null,
    appraisedValue: null,
    estimatedValue: null,
}

export const emptyLpSelectedProduct = {
    loanType: null,
    pmiMonthlyPayment: null,
    totalLoanAmount: null
}

export const emptyLoanAndProp = {
    property: { ...emptyProperty },
    selectedProduct: { ...emptyLpSelectedProduct },
    vertical: "",
    loanPurpose: null
}