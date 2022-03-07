const REFINANCE_SUBMISSION_MUTATION = `mutation mortgageLosRefiUpdateBorrowerQualification($args: MortgageBorrowerQualificationInput!) {
	mortgageLosRefiUpdateBorrowerQualification(qualificationInput: $args) {
		uuid
		borrower {
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
	}
}`

const PURCHASE_SUBMISSION_MUTATION = `mutation mortgageLosPurchaseUpdateBorrowerQualification($args: MortgagePurchaseBorrowerQualificationInput!) {
	mortgageLosPurchaseUpdateBorrowerQualification(qualificationInput: $args) {
		uuid
		borrower {
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
	}
}`

export {
	REFINANCE_SUBMISSION_MUTATION,
	PURCHASE_SUBMISSION_MUTATION
}