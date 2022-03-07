const participantData = `
  uuid
  liabilities {
    accountType
    companyName
    creditLimit
    accountNumber
    currentLienPosition
    excludeDti
    monthlyPayment
    monthsLeft
    paidOff
    paidOffAmount
    proposedLienPosition
    resubordinated
    unpaidBalance
    uuid
    whose
    createdAt
  }
`,
  submissionData = `
  borrower {
      ${participantData}
  }
  coBorrower {
      ${participantData}
  }`

const REFINANCE_SUBMISSION_QUERY = `query mortgagesSalesforceRefinanceSubmission($submissionUuid: ID!) {
    mortgagesSalesforceRefinanceSubmission(submissionUuid: $submissionUuid) {
      ${submissionData}
    }
  }`,

  PURCHASE_SUBMISSION_QUERY = `query mortgagesSalesforcePurchaseSubmission($submissionUuid: ID!) {
    mortgagesSalesforcePurchaseSubmission(submissionUuid: $submissionUuid) {
      ${submissionData}
    }
  }`

export {
  REFINANCE_SUBMISSION_QUERY,
  PURCHASE_SUBMISSION_QUERY
}