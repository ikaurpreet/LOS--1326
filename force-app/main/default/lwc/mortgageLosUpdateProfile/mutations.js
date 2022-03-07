const participantData = `
      ssn
      uuid
      profile {
        dob
        firstName
        lastName
        middleNameInitial
        citizenship
        suffixType
        maritalType
        dependentsAges
        phone
        homePhone
        workPhone
        email
      }`,

  submissionData = `
      borrower {
        ${participantData}
      }
      coBorrower {
        ${participantData}
      }`

const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateParticipantProfile($borrower: LosParticipantProfileInput, $coBorrower: LosParticipantProfileInput) {
  mortgageLosRefiUpdateParticipantProfile(borrower: $borrower, coBorrower: $coBorrower){
    ${submissionData}
  }
}`,
  PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateParticipantProfile($borrower: LosParticipantProfileInput, $coBorrower: LosParticipantProfileInput) {
    mortgageLosPurchaseUpdateParticipantProfile(borrower: $borrower, coBorrower: $coBorrower) {
      ${submissionData}
    }
}`

export {
  REFINANCE_SUBMISSION_MUTATION,
  PURCHASE_SUBMISSION_MUTATION
}