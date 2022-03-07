const participantReportData = `
      createdAt
      uuid
      documentUuid
      status
      description
      `

const LAST_HARD_CREDIT_REPORT_QUERY = `query mortgagesSalesforceHardCreditPulls($submissionUuid: ID!) {
  mortgagesSalesforceHardCreditPulls(submissionUuid: $submissionUuid, limit: 1) {
    borrower {
        ${participantReportData}
      }
      coBorrower {
        ${participantReportData}
      }
  }
}`,
CREDIT_REPORT_PDF_URL_QUERY = `query mortgagesLosConsumerReportPdf($participantUuid: ID!) {
  mortgagesLosConsumerReportPdf(participantUuid: $participantUuid){
    link
  }
}
`

export {
  LAST_HARD_CREDIT_REPORT_QUERY,
  CREDIT_REPORT_PDF_URL_QUERY
}