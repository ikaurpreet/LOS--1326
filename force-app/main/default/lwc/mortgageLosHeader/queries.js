const REFINANCE_SUBMISSION_QUERY = `query mortgagesSalesforceRefinanceSubmission($submissionUuid: ID!) {
  mortgagesSalesforceRefinanceSubmission(submissionUuid: $submissionUuid) {
    borrower {
      ssnLast4Digits
      profile {
        dob
      }
    }
    selectedProduct {
      totalLoanAmount
    }
  }
}`;


const PURCHASE_SUBMISSION_QUERY = `query mortgagesSalesforcePurchaseSubmission($submissionUuid: ID!) {
  mortgagesSalesforcePurchaseSubmission(submissionUuid: $submissionUuid) {
    borrower {
      ssnLast4Digits
      profile {
        dob
      }
    }
    selectedProduct {
      totalLoanAmount
    }
  }
}`;


const ELIGIBILITY_STATUS_QUERY = `query mortgagesLosLastEligibility($submissionUuid: ID!) {
  mortgagesLosLastEligibility(submissionUuid: $submissionUuid) {
    uuid
    status
    outcome
    createdAt
    endTime
  }
}`;


const ELIGIBILITY_RESULT_QUERY = `query mortgagesLosSelectedProductEligibility($submissionUuid: ID!) {
  mortgagesLosSelectedProductEligibility(submissionUuid: $submissionUuid) {
    dti
    borrowerLtv
    rate
    borrowerCreditScore
  }
}`;


export {
  REFINANCE_SUBMISSION_QUERY,
  PURCHASE_SUBMISSION_QUERY, 
  ELIGIBILITY_STATUS_QUERY,
  ELIGIBILITY_RESULT_QUERY,
}