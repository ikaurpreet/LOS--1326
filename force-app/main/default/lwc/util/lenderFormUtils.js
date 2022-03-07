export const lenderFormL3 = {
    uuid: "",
    property: {
        estimatedValue: "",
        monthlyHomeownersFee: "",
        monthlyInsuranceFee: "",
        monthlyTaxes: "",
        otherMonthlyCosts: ""
    },
    selectedProduct: {
        amortizationType: "",
        armFixedTerm: "",
        loanTerm: "",
        loanType: "",
        pmiMonthlyPayment: "",
        qualifyingInterestRate: "",
        rate: "",
        totalLoanAmount: "",
        principalInterest: ""
    }
};

export const lenderFormL1 = {
    uuid: "",
    loanPurpose: "",
    borrower: {
        uuid: "",
        profile: {
            email: ""
        }
    },
    coBorrower: "",
    property: {
        estimatedValue: "",
        appraisedValue: "",
        attachmentType: "",
        communityPropertyState: "",
        occupancyType: "",
        propertyType: "",
        dateOfPurchase: "",
        estimatedLiensToBePaidOff: "",
        originalPurchasePrice: ""
    },
    selectedProduct: {
        loanType: ""
    }
}

export const lenderFormL4 = {
    uuid: "",
    borrower: {
        creditCardsAndOtherDebts: ""
    },
    property: {
        estimatedLiensToBePaidOff: "",
        estimatedValue: ""
    },
    feeManagement: {
        totalClosingCosts: "",
        discount: "",
        sellerCredits: "",
        totalPaidClosingCosts: "",
        totalOtherAssets: "",
        additionalCredits: []
    },
    selectedProduct: {
        totalLoanAmount: "",
    }
}

export const attachmentType = [
    { value: "attached", label: "Attached" },
    { value: "detached", label: "Detached" },
];

export const amortizationType = [
    { value: "ARM", label: "ARM" },
    { value: "Fixed", label: "Fixed Rate" }
]

export const addlCreditType = [
    { value: "cashDeposit", label: "Cash Deposit on sales contract" },
    { value: "lenderCredit", label: "Lender Credit" },
    { value: "sellerCredit", label: "Seller Credit" },
    { value: "relocationFunds", label: "Relocation Funds" },
    { value: "other", label: "Other" }
]

const communityPropertyStateBorrowerLabel = "At least one borrower lives in a community property state";
const communityPropertyStatePropertyLabel = "The property is in a community property state";

export const communityPropertyState = [
    { value: "borrower", label: communityPropertyStateBorrowerLabel, key: 'communityPropertyState-0-borrower' },
    { value: "property", label: communityPropertyStatePropertyLabel, key: 'communityPropertyState-1-property' },
    { value: "both", label: `${communityPropertyStateBorrowerLabel}; ${communityPropertyStatePropertyLabel}`, key: 'communityPropertyState-2-both' },
];

export const emptyL1SelectedProduct = {
    loanType: null,
}

export const emptyL4SelectedProduct = {
    totalLoanAmount: null,
}

export const emptyFeeManagement = {
    additionalCredits: []
}

export const addlCreditRecord = {
    creditType: null,
    amount: null
}