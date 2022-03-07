const REFINANCE_SUBMISSION_QUERY = `query mortgagesSalesforceRefinanceSubmission($submissionUuid: ID!) {
    mortgagesSalesforceRefinanceSubmission(submissionUuid: $submissionUuid) {
      property: refinanceProperty {
        address {
          addressLine1
          unit
          city
          stateCode
          zipCode
          county {
            fipsCountyCode
            name
          }
        }
        yearBuilt
        mixedUseProperty
        constructionMethod
        numberOfUnits
        propertyType
        occupancyType
        estimatedValue
        appraisedValue
      }
      selectedProduct {
        loanType
        pmiMonthlyPayment
        totalLoanAmount
      }
      vertical
      loanPurpose
    }
  }`,

  PURCHASE_SUBMISSION_QUERY = `query mortgagesSalesforcePurchaseSubmission($submissionUuid: ID!) {
    mortgagesSalesforcePurchaseSubmission(submissionUuid: $submissionUuid) {
      property: purchaseProperty {
        address {
          addressLine1
          unit
          city
          stateCode
          zipCode
          county {
            fipsCountyCode
            name
          }
        }
        yearBuilt
        mixedUseProperty
        constructionMethod
        numberOfUnits
        propertyType
        occupancyType
        estimatedValue
        appraisedValue
      }
      selectedProduct {
        loanType
        pmiMonthlyPayment
        totalLoanAmount
      }
      vertical
      loanPurpose
    }
  }`

export {
  REFINANCE_SUBMISSION_QUERY,
  PURCHASE_SUBMISSION_QUERY
}