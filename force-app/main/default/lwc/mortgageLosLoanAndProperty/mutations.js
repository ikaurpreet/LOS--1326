const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateLoanProperty($loanProperty: LosLoanPropertyInput!) {
	mortgageLosRefiUpdateLoanProperty(loanProperty: $loanProperty) {
        property: refinanceProperty {
            address {
                addressLine1
                unit
                city
                stateCode
                zipCode
                county {
                    fipsCountyCode
                    name
                }
            }
            yearBuilt
            mixedUseProperty
            constructionMethod
            numberOfUnits
            propertyType
            occupancyType
            estimatedValue
            appraisedValue
        }
        selectedProduct {
            loanType
            pmiMonthlyPayment
            totalLoanAmount
        }
        vertical
        loanPurpose
    }
}`;

const PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateLoanProperty($loanProperty: LosLoanPropertyInput!) {
    mortgageLosPurchaseUpdateLoanProperty(loanProperty: $loanProperty) {
        property: purchaseProperty {
            address {
                addressLine1
                unit
                city
                stateCode
                zipCode
                county {
                    fipsCountyCode
                    name
                }
            }
            yearBuilt
            mixedUseProperty
            constructionMethod
            numberOfUnits
            propertyType
            occupancyType
            estimatedValue
            appraisedValue
        }
        selectedProduct {
            loanType
            pmiMonthlyPayment
            totalLoanAmount
        }
        vertical
        loanPurpose
    }
}`

const RERUN_ELIGIBILITY = `mutation ($uuid: ID!,
    $reuseData: Boolean,
    $newCreditReport: Boolean,
    $newProducts: Boolean,
    $newClosingCosts: Boolean
) {
mortgageSalesforceRerunEligibility(
    submissionUuid: $uuid,
    reuseData: $reuseData,
    newCreditReport: $newCreditReport,
    newProducts: $newProducts,
    newClosingCosts: $newClosingCosts
)
}`;

export {
    REFINANCE_SUBMISSION_MUTATION,
    PURCHASE_SUBMISSION_MUTATION,
    RERUN_ELIGIBILITY,
}