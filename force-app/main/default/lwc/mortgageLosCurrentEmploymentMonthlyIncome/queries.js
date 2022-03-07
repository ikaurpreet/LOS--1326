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