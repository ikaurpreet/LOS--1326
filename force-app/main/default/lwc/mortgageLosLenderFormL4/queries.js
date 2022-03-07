const refinanceData = `
    uuid
    borrower {
      creditCardsAndOtherDebts
    }
    coBorrower {
        creditCardsAndOtherDebts
    }
    property: refinanceProperty {
        estimatedLiensToBePaidOff
    }
    feeManagement {
        totalClosingCosts
        discount
        sellerCredits
        totalPaidClosingCosts
        totalOtherAssets
        additionalCredits {
            amount
            creditType
        }
    }
    selectedProduct {
        totalLoanAmount
    }
`;

const purchaseData = `
    uuid
    borrower {
        creditCardsAndOtherDebts
      }
    coBorrower {
        creditCardsAndOtherDebts
      }
    property: purchaseProperty {
        estimatedValue
    }
    feeManagement {
        totalClosingCosts
        discount
        sellerCredits
        totalPaidClosingCosts
        totalOtherAssets
        additionalCredits {
            amount
            creditType
        }
    }
    selectedProduct {
        totalLoanAmount
    }
`;

const REFINANCE_SUBMISSION_QUERY = `query mortgagesSalesforceRefinanceSubmission($submissionUuid: ID!) {
    mortgagesSalesforceRefinanceSubmission(submissionUuid: $submissionUuid) {
        ${refinanceData}
    }
}`,
    PURCHASE_SUBMISSION_QUERY = `query mortgagesSalesforcePurchaseSubmission($submissionUuid: ID!) {
        mortgagesSalesforcePurchaseSubmission(submissionUuid: $submissionUuid) {
        ${purchaseData}
    }
}`;

export {
    REFINANCE_SUBMISSION_QUERY,
    PURCHASE_SUBMISSION_QUERY
}