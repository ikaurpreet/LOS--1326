import { refiPropertyFields, coreRealEstateQuery } from "./queries";


const REFINANCE_SUBMISSION_MUTATION = `
mutation mortgageLosRefiUpdateParticipantProperty($borrower: LosParticipantPropertyInput, $coBorrower: LosParticipantPropertyInput) {
  mortgageLosRefiUpdateParticipantProperty(borrower: $borrower, coBorrower: $coBorrower) {
    refinanceProperty {
      ${refiPropertyFields}
    }

    ${coreRealEstateQuery}
  }
}
`;


const PURCHASE_SUBMISSION_MUTATION = `
mutation mortgageLosPurchaseUpdateParticipantProperty($borrower: LosParticipantPropertyInput, $coBorrower: LosParticipantPropertyInput) {
  mortgageLosPurchaseUpdateParticipantProperty(borrower: $borrower, coBorrower: $coBorrower) {
    ${coreRealEstateQuery}
  }
}
`;


const REFINANCE_SUBMISSION_SUBJECT_MUTATION = `
mutation mortgageLosRefiUpdateParticipantRefiProperty($borrower: LosParticipantRefinancePropertyInput) {
  mortgageLosRefiUpdateParticipantRefiProperty(borrower: $borrower) {
    refinanceProperty {
      ${refiPropertyFields}
    }

    ${coreRealEstateQuery}
  }
}
`;


export {
  REFINANCE_SUBMISSION_MUTATION,
  REFINANCE_SUBMISSION_SUBJECT_MUTATION,
  PURCHASE_SUBMISSION_MUTATION,
}