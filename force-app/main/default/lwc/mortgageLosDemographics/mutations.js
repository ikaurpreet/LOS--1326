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

const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateParticipantDemographics(
        $submissionUuid: ID!, $borrower: MortgageFairHousingAnswerInput, $coBorrower: MortgageFairHousingAnswerInput) {
        mortgageLosRefiUpdateParticipantDemographics(submissionUuid: $submissionUuid, 
        borrowerFairHousingAnswer: $borrower, coBorrowerFairHousingAnswer: $coBorrower) {
    ${submissionData}
  }
}`,
    PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateParticipantDemographics(
    $submissionUuid: ID!, $borrower: MortgageFairHousingAnswerInput, $coBorrower: MortgageFairHousingAnswerInput) {
    mortgageLosPurchaseUpdateParticipantDemographics(submissionUuid: $submissionUuid, 
    borrowerFairHousingAnswer: $borrower, coBorrowerFairHousingAnswer: $coBorrower) {
      ${submissionData}
    }
}`

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION
}