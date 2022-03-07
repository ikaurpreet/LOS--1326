const REFINANCE_SUBMISSION_QUERY = `query mortgagesSalesforceRefinanceSubmission($submissionUuid: ID!) {
  mortgagesSalesforceRefinanceSubmission(submissionUuid: $submissionUuid) {
    uuid
    vertical
    selectedProduct {
      uuid
      rate
      apr
      loanTerm
      loanProductInfo {
        name
        lender{
          slug
          name
          nmls
        }
      }
    }
  }
}`,


PURCHASE_SUBMISSION_QUERY = `query mortgagesSalesforcePurchaseSubmission($submissionUuid: ID!) {
  mortgagesSalesforcePurchaseSubmission(submissionUuid: $submissionUuid) {
    uuid
    vertical
    selectedProduct {
      uuid
      rate
      apr
      loanTerm
      loanProductInfo {
        name
        lender{
          slug
          name
          nmls
        }
      }
    }
  }
}`

export {
  REFINANCE_SUBMISSION_QUERY,
  PURCHASE_SUBMISSION_QUERY
}