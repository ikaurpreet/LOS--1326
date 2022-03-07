const lenderRefiData = `
    uuid
    loanPurpose
    borrower {
        uuid
        profile {
            email
        }
    }
    coBorrower {
        uuid,
        profile {
            email
        }
    }
    property: refinanceProperty {
        appraisedValue
        attachmentType
        communityPropertyState
        dateOfPurchase
        estimatedLiensToBePaidOff
        estimatedValue
        occupancyType
        originalPurchasePrice
        propertyType
    }
    selectedProduct {
        loanType
    }
`
const lenderPurchaseData = `
    uuid
    loanPurpose
    borrower {
        uuid
        profile {
            email
        }
    }
    coBorrower {
        uuid,
        profile {
            email
        }
    }
    property: purchaseProperty {
        appraisedValue
        attachmentType
        communityPropertyState
        estimatedValue
        occupancyType
        propertyType
    }
    selectedProduct {
        loanType
    }
`

const REFINANCE_SUBMISSION_QUERY = `query mortgagesSalesforceRefinanceSubmission($submissionUuid: ID!) {
    mortgagesSalesforceRefinanceSubmission(submissionUuid: $submissionUuid) {
        ${lenderRefiData}
    }
}`,
    PURCHASE_SUBMISSION_QUERY = `query mortgagesSalesforcePurchaseSubmission($submissionUuid: ID!) {
    mortgagesSalesforcePurchaseSubmission(submissionUuid: $submissionUuid) {
        ${lenderPurchaseData}
    }
}`

export {
    REFINANCE_SUBMISSION_QUERY,
    PURCHASE_SUBMISSION_QUERY
}