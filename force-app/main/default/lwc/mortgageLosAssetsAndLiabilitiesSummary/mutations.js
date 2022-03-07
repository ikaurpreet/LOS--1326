const participantData = `
uuid
jointlyAssetsLiabilities`,

    submissionData = `
      borrower {
        ${participantData}
      }
      coBorrower {
        ${participantData}
      }`

const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateParticipantJointly($borrower: LosParticipantJointlyInput, 
    $coBorrower: LosParticipantJointlyInput) {
    mortgageLosRefiUpdateParticipantJointly(borrower: $borrower, coBorrower: $coBorrower) {
    ${submissionData}
  }
}`,

    PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateParticipantJointly($borrower: LosParticipantJointlyInput, 
    $coBorrower: LosParticipantJointlyInput) {
    mortgageLosPurchaseUpdateParticipantJointly(borrower: $borrower, coBorrower: $coBorrower) {
    ${submissionData}
  }
}`

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION
}