const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateLoanProperty($loanProperty: LosLoanPropertyInput!) {
    mortgageLosRefiUpdateLoanProperty(loanProperty: $loanProperty) {
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
    }
}`

const PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateLoanProperty($loanProperty: LosLoanPropertyInput!) {
    mortgageLosPurchaseUpdateLoanProperty(loanProperty: $loanProperty) {
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
    }
}`

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION
}