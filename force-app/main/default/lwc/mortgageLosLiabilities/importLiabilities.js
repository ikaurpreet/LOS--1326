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

const REFINANCE_IMPORT_LIABILITIES_MUTATION = `mutation mortgageLosRefiImportParticipantLiabilities($borrowerUuid: String, $coBorrowerUuid: String) {
    mortgageLosRefiImportParticipantLiabilities(borrowerUuid: $borrowerUuid, coBorrowerUuid: $coBorrowerUuid){
        ${submissionData}
    }
}`,
    PURCHASE_IMPORT_LIABILITIES_MUTATION = `mutation mortgageLosPurchaseImportParticipantLiabilities($borrowerUuid: String, $coBorrowerUuid: String) {
        mortgageLosPurchaseImportParticipantLiabilities(borrowerUuid: $borrowerUuid, coBorrowerUuid: $coBorrowerUuid) {
        ${submissionData}
    }
}`

export {
    REFINANCE_IMPORT_LIABILITIES_MUTATION,
    PURCHASE_IMPORT_LIABILITIES_MUTATION
}