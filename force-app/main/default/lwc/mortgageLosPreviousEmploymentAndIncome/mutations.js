const participantData = `
    uuid
    employments {
        uuid
        address {
            addressLine1
            addressLine2
            city
            unit
            stateCode
            zipCode
        }
        employerName
        position
        startedOn
        endDate
        isEmployerPartyToTransaction
        employerType
        hasOwnershipShare
        grossMonthlyIncomeSummary {
            base
            bonuses
            commissions
            other
            overtime
            total
        }
        businessPhone
        workExperience
    }`,
    submissionData = `
        borrower {
            ${participantData}
        }
        coBorrower {
            ${participantData}
        }`;

const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateParticipantEmploymentIncome($borrower: LosParticipantEmploymentIncomeInput, $coBorrower: LosParticipantEmploymentIncomeInput) {
    mortgageLosRefiUpdateParticipantEmploymentIncome(borrower: $borrower, coBorrower: $coBorrower){
            ${submissionData}
        }
    }`,
    PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateParticipantEmploymentIncome($borrower: LosParticipantEmploymentIncomeInput, $coBorrower: LosParticipantEmploymentIncomeInput) {
        mortgageLosPurchaseUpdateParticipantEmploymentIncome(borrower: $borrower, coBorrower: $coBorrower) {
            ${submissionData}
        }
    }`

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION
}