const address = `
    id
    addressLine1
    unit
    city
    stateCode
    zipCode
    startDate
    housingStatusType
    county {
        fipsCountyCode
        name
    }`;

const participantData = `
    uuid
    sameMailingAddress
    address {
        ${address}
    }
    previousAddresses {
        address {
            ${address}
        }
    }
    mailingAddress {
        ${address}
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