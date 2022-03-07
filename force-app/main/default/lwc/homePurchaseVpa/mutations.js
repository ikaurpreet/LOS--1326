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
  borrower {
      ${participantData}
  }`;

const INCOME_MUTATION_QUERY = `mutation mortgagesLosPurchaseUpdateVerifiedIncomes(
    $submissionUuid: ID!,
    $participantRole: MortgageParticipantRoleEnum!,
    $verifiedAmounts:[LosVerifiedIncomeAmountInput!]!) {
    mortgagesLosPurchaseUpdateVerifiedIncomes(
      submissionUuid: $submissionUuid,
      participantRole: $participantRole,
      verifiedAmounts: $verifiedAmounts) {
        ${submissionData}
    }
}`;

const ASSET_MUTATION_QUERY = `mutation mortgagesLosPurchaseUpdateVerifiedProvedAssets(
    $submissionUuid: ID!,
    $participantRole: MortgageParticipantRoleEnum!,
    $verifiedAmounts:[LosVerifiedAssetAmountInput!]!) {
    mortgagesLosPurchaseUpdateVerifiedProvedAssets(
      submissionUuid: $submissionUuid,
      participantRole: $participantRole,
      verifiedAmounts: $verifiedAmounts) {
        ${submissionData}
    }
}`;

const RERUN_MUTATION_QUERY = `mutation mortgagePurchaseVpaRerunEligibility($submissionUuid: ID!) {
    mortgagePurchaseVpaRerunEligibility(submissionUuid: $submissionUuid)
}`;

const PUSH_MUTATION_QUERY = `mutation mortgagePurchaseVpaPushToClientDashboard($submissionUuid: ID!) {
  mortgagePurchaseVpaPushToClientDashboard(submissionUuid: $submissionUuid)
}`;





export { INCOME_MUTATION_QUERY, ASSET_MUTATION_QUERY, RERUN_MUTATION_QUERY, PUSH_MUTATION_QUERY };