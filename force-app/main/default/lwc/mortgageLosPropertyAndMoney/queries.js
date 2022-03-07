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