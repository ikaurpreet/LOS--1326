const addressFields = `addressLine1 unit city stateCode zipCode`;


const incomes = `amount incomeType paymentTermType incomeDetail { rentalPercentage participationPercentage }`;


export const refiPropertyFields = `
uuid
address { ${addressFields} }
status
dateOfPurchase
estimatedValue
monthlyHomeownersFee
monthlyInsuranceFee
monthlyTaxes
numberOfUnits
occupancyType
originalPurchasePrice
propertyType
yearBuilt
incomes { ${incomes} }
rentalIncomeDetail { netIncomeLoss }
`;


export const coreRealEstateQuery = `
borrower { uuid, profile { maritalType } }
coBorrower { uuid, profile { maritalType } }
realEstate {
  tradelines {
    uuid
    propertyUuid
    companyName
    monthlyPayment
    monthsLeft
    unpaidBalance
    type
  }
  properties {
    uuid
    status
    numberOfUnits
    occupancyType
    propertyType
    owners { uuid }
    address { ${addressFields} }
    details { saleDate salePrice yearBuild propertyValue }
    costs { amount costType }
    incomes { ${incomes} }
    rentalIncomeDetail { netIncomeLoss }
  }
}
`;


const PURCHASE_SUBMISSION_QUERY = `
query mortgagesSalesforcePurchaseSubmission($submissionUuid: ID!) {
  mortgagesSalesforcePurchaseSubmission(submissionUuid: $submissionUuid) {
    ${coreRealEstateQuery}
  }
}
`;


const REFINANCE_SUBMISSION_QUERY = `
query mortgagesSalesforceRefinanceSubmission($submissionUuid: ID!) {
  mortgagesSalesforceRefinanceSubmission(submissionUuid: $submissionUuid) {
    refinanceProperty {
      ${refiPropertyFields}
    }

    ${coreRealEstateQuery}
  }
}
`;


export {
  REFINANCE_SUBMISSION_QUERY,
  PURCHASE_SUBMISSION_QUERY,
}