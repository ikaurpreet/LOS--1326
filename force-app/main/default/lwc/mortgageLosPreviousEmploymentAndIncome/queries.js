const participantData = `
    ssn
    uuid
    employments {
      uuid
      address {
        addressLine1
        addressLine2
        unit
        city
        stateCode
        zipCode
      }
      employerName
      businessPhone
      position
      startedOn
      endDate
      workExperience
      isEmployerPartyToTransaction
      ownershipShare
      hasOwnershipShare
      employerType
      grossMonthlyIncomeSummary {
        base
        bonuses
        commissions
        other
        overtime
        total
      }
    }`,

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