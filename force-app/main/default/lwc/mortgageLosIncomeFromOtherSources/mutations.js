const participantData = `
    ssn
    uuid
    incomes {
        amount
        incomeType
        paymentTermType
    }
`,
    submissionData = `
        borrower {
            ${participantData}
        }
        coBorrower {
            ${participantData}
        }`

const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateParticipantOtherIncome($borrower: LosParticipantOtherIncomeInput, $coBorrower: LosParticipantOtherIncomeInput) {
    mortgageLosRefiUpdateParticipantOtherIncome(borrower: $borrower, coBorrower: $coBorrower){
        ${submissionData}
    }
}`,
    PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateParticipantOtherIncome($borrower: LosParticipantOtherIncomeInput, $coBorrower: LosParticipantOtherIncomeInput) {
        mortgageLosPurchaseUpdateParticipantOtherIncome(borrower: $borrower, coBorrower: $coBorrower) {
        ${submissionData}
    }
}`

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION
}