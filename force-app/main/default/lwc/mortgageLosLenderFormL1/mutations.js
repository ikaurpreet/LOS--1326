const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateLoanProperty($loanProperty: LosLoanPropertyInput!) {
	mortgageLosRefiUpdateLoanProperty(loanProperty: $loanProperty) {
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
            totalLoanAmount
            loanType
        }
        loanPurpose
    }
}`

const PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateLoanProperty($loanProperty: LosLoanPropertyInput!) {
    mortgageLosPurchaseUpdateLoanProperty(loanProperty: $loanProperty) {
        property: purchaseProperty {
            appraisedValue
            attachmentType
            communityPropertyState
            estimatedValue
            occupancyType
            propertyType
        }
        selectedProduct {
            totalLoanAmount
            loanType
        }
        loanPurpose
    }
}`

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION
}