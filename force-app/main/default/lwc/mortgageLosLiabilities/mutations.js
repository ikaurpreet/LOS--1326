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

const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateParticipantLiability($borrower: LosParticipantLiabilityInput, $coBorrower: LosParticipantLiabilityInput) {
    mortgageLosRefiUpdateParticipantLiability(borrower: $borrower, coBorrower: $coBorrower){
        ${submissionData}
    }
}`,
    PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateParticipantLiability($borrower: LosParticipantLiabilityInput, $coBorrower: LosParticipantLiabilityInput) {
    mortgageLosPurchaseUpdateParticipantLiability(borrower: $borrower, coBorrower: $coBorrower) {
        ${submissionData}
    }
}`

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION
}