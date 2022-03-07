const participantData = `
  uuid
  militaryService {
    isServed
    isReserve
    isRetired
    isSurvivingSpouse
    isCurrentlyServing
    expirationDate
  }`,

  submissionData = `
  borrower {
    ${participantData}
  }
  coBorrower {
    ${participantData}
  }`

const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateParticipantMilitaryService($borrower: LosParticipantMilitaryServiceInput, $coBorrower: LosParticipantMilitaryServiceInput) {
  mortgageLosRefiUpdateParticipantMilitaryService(borrower: $borrower, coBorrower: $coBorrower){
    ${submissionData}
  }
}`,
  PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateParticipantMilitaryService($borrower: LosParticipantMilitaryServiceInput, $coBorrower: LosParticipantMilitaryServiceInput) {
    mortgageLosPurchaseUpdateParticipantMilitaryService(borrower: $borrower, coBorrower: $coBorrower){
      ${submissionData}
    }
}`

export {
  REFINANCE_SUBMISSION_MUTATION,
  PURCHASE_SUBMISSION_MUTATION
}