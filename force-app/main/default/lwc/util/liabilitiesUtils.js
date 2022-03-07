export const accountType = [
    { value: "mortgage", label: "Mortgage" },
    { value: "heloc", label: "HELOC" },
    { value: "collectionsJudgementsLiens", label: "Collections, Judgements, and Liens" },
    { value: "installment", label: "Installment" },
    { value: "leasePayment", label: "Lease Payment" },
    { value: "openThirtyDayChargeAccount", label: "Open 30 Day Charge Account" },
    { value: "revolving", label: "Revolving" },
    { value: "taxes", label: "Taxes" },
    { value: "taxLien", label: "Tax Lien" },
];

export const otherAccountType = [
    { value: "alimony", label: "Alimony" },
    { value: "childSupport", label: "Child Support" },
    { value: "jobRelatedExpenses", label: "Job Related Expenses" },
    { value: "separateMaintenanceExpense", label: "Separate Maintenance Expense" },
    { value: "other", label: "Other" }
]

export const liabilityOwner = [
    { value: "borrower", label: "Borrower" },
    { value: "co_borrower", label: "Co-Borrower" },
    { value: "both", label: "Joint" },
]

export const liability = {
    uuid: null,
    participantUuid: null,
    whose: "",
    accountType: "",
    companyName: "",
    description: "",
    accountNumber: null,
    unpaidBalance: null,
    monthlyPayment: null,
    monthsLeft: null,
    paidOff: null,
    paidOffAmount: null,
    excludeDti: null,
    resubordinated: null,
    currentLienPosition: null,
    proposedLienPosition: null,
    delete: false
}