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
}`

export {
  RERUN_ELIGIBILITY
}