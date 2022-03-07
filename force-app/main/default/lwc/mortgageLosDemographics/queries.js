const participantData = `
    fairHousingAnswer {
        raceAnswer {
            name
            value
        }
        ethnicityAnswer {
            name
            value
        }
        sexAnswerType {
            name
            value
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