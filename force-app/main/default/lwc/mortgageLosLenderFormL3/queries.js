const refinanceData = `
    uuid
    property: refinanceProperty {		
        monthlyHomeownersFee
        monthlyInsuranceFee
        monthlyTaxes
        otherMonthlyCosts
        resubordinatedLiens
    }
    selectedProduct {
        amortizationType
        armFixedTerm
        loanTerm
        loanType
        pmiMonthlyPayment
        qualifyingInterestRate
        rate
        totalLoanAmount
        principalInterest
    }
`

const purchaseData = `
    uuid
    property: purchaseProperty {
        estimatedValue
        monthlyHomeownersFee
        monthlyInsuranceFee: monthlyInsurance
        monthlyTaxes
        otherMonthlyCosts
        resubordinatedLiens
    }
    selectedProduct {
        amortizationType
        armFixedTerm
        loanTerm
        loanType
        pmiMonthlyPayment
        qualifyingInterestRate  
        rate
        totalLoanAmount
        principalInterest
    }
`

const REFINANCE_SUBMISSION_QUERY = `query mortgagesSalesforceRefinanceSubmission($submissionUuid: ID!) {
    mortgagesSalesforceRefinanceSubmission(submissionUuid: $submissionUuid) {
        ${refinanceData}
    }
}`,
    PURCHASE_SUBMISSION_QUERY = `query mortgagesSalesforcePurchaseSubmission($submissionUuid: ID!) {
        mortgagesSalesforcePurchaseSubmission(submissionUuid: $submissionUuid) {
        ${purchaseData}
    }
}`

export {
    REFINANCE_SUBMISSION_QUERY,
    PURCHASE_SUBMISSION_QUERY
}