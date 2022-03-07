export const AssetsGroups = [{
    label: 'Savings/Checking',
    assetTypes: [
        'savings',
        'checking'
    ]
},
{
    label: 'Assets that may need to be liquidated',
    assetTypes: [
        'mutual',
        'market',
        'certificate',
        'stockOptions',
        'stocks',
        'bonds'
    ]
},
{
    label: 'Retirement',
    assetTypes: [
        'retirement'
    ]
},
{
    label: 'Trust',
    assetTypes: [
        'trust',
        'trustAccount'
    ]
},
{
    label: 'Other assets',
    assetTypes: []
}];

export const ownerOptions = [
    { value: "borrower", label: "Borrower" },
    { value: "coBorrower", label: "Co-Borrower" },
    { value: "both", label: "Both" }
];

export const assetsTypeOptions = [
    { value: 'savings', label: 'Savings' },
    { value: 'checking', label: 'Checking' },
    { value: 'mutual', label: 'Mutual Fund' },
    { value: 'market', label: 'Money Market' },
    { value: 'certificate', label: 'Certificate of deposit' },
    { value: 'stockOptions', label: 'Stock Options' },
    { value: 'stocks', label: 'Stocks' },
    { value: 'bonds', label: 'Bonds' },
    { value: 'retirement', label: 'Retirement Fund' },
    { value: 'trust', label: 'Trust Funds' },
    { value: 'trustAccount', label: 'Trust Account' },
    { value: 'other', label: 'Other Liquid Asset' },
    { value: 'loanDeposit', label: 'Bridge Loan Deposit' },
    { value: 'development', label: 'Individual Development Account' },
    { value: 'insurance', label: 'Cash Value of Life Insurance' },
    { value: 'proceedsFromSaleRealEstate', label: 'Proceeds from the Sale of Real Estate' }
];

export const ASSETS_SUMMARY_COMMON_CLASS = 'slds-form-element slds-form-element_edit slds-form-element_readonly slds-form-element_horizontal slds-hint-parent';
export const ASSETS_SUMMARY_JOINTLY = 'Jointly';
export const ASSETS_SUMMARY_NOT_JOINTLY = 'Not Jointly';