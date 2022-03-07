const participantData = `
    uuid
    declaration {
        permanentResidence
        ownershipInterest
        occupancyType
        ownershipType
        relationshipWithSeller
        borrowMoneyFromAnotherParty
        borrowMoneyFromAnotherPartyAmount
        mortgageLoanOnAnotherProperty
        applyNewCredit
        priorityOverFirstMortgageLien
        cosignerOrGuarantor
        outstandingJudgements
        delinquentLoansFederalDebt
        partyToLawsuitPersonalLiability
        conveyedPropertyInLieuForeclosure
        preForeclosureSale
        propertyForeclosedUpon7Years
        declaredBankruptcy
        bankruptcyChapters {
            declaredBankruptcyPast7YearsChapter7
            declaredBankruptcyPast7YearsChapter11
            declaredBankruptcyPast7YearsChapter12
            declaredBankruptcyPast7YearsChapter13
        }
    }`,
    submissionData = `
        borrower {
            ${participantData}
        }
        coBorrower {
            ${participantData}
        }`

const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateParticipantDeclarations($borrowerDeclaration: MortgageParticipantDeclarationInput, $coBorrowerDeclaration: MortgageParticipantDeclarationInput, $submissionUuid: ID!){
    mortgageLosRefiUpdateParticipantDeclarations(borrowerDeclaration: $borrowerDeclaration, coBorrowerDeclaration: $coBorrowerDeclaration, submissionUuid: $submissionUuid){
            ${submissionData}
        }
    }`,
    PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateParticipantDeclarations($borrowerDeclaration: MortgageParticipantDeclarationInput, $coBorrowerDeclaration: MortgageParticipantDeclarationInput, $submissionUuid: ID!){
    mortgageLosPurchaseUpdateParticipantDeclarations(borrowerDeclaration: $borrowerDeclaration, coBorrowerDeclaration: $coBorrowerDeclaration, submissionUuid: $submissionUuid){
            ${submissionData}
        }
    }`

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION
}