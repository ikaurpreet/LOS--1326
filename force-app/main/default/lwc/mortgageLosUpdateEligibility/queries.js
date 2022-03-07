const productData = `
      points
      rate
      dti
      lender {
        name
      }
`

const LAST_ELIGIBILITY_QUERY = `query mortgagesLosLastEligibility($submissionUuid: ID!) {
  mortgagesLosLastEligibility(submissionUuid: $submissionUuid) {
    uuid
    status
    outcome
    createdAt
    endTime
    lowestParRateProduct: products(count: 1) {
      ${productData}
    }
  }
}`

export {
  LAST_ELIGIBILITY_QUERY
}