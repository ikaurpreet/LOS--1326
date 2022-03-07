const participantData = `
  provedAssets {
    provedAmount
    assetType
    institutionName
    amount
    jointAccount {
      uuid
    }
    uuid
  }
  incomes {
    provedAmount
    amount
    incomeType
    paymentTermType
  }
`,
  submissionData = `
  purchaseProperty {
    propertyType
    occupancyType
    address {
      zipCode
    }
  }
  vpa {
    status
  }
  borrower {
      ${participantData}
  }`


const REFINANCE_SUBMISSION_QUERY = `query mortgagesSalesforcePurchaseSubmission($submissionUuid: ID!) {
  mortgagesSalesforcePurchaseSubmission(submissionUuid: $submissionUuid) {
      ${submissionData}
    }
  }`;

const VPAELIG_SUBMISSION_QUERY = `query mortgagePurchaseVpaEligibilities($submissionUuid: ID!) {
  mortgagePurchaseVpaEligibilities(submissionUuid: $submissionUuid) {
    uuid
    createdAt
    maxLoanAmount
    status
  }
}`

export { REFINANCE_SUBMISSION_QUERY, VPAELIG_SUBMISSION_QUERY };