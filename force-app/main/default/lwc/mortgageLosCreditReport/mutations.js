const RE_PULL_HARD_CREDIT_REPORT = `mutation mortgagesSalesforceRerunHardCreditPull($submissionUuid: ID!, $role: SalesforceHardCreditPullRerunTypeEnum!) {
  mortgagesSalesforceRerunHardCreditPull(input: { submissionUuid: $submissionUuid, type: $role })
}`;

export {
    RE_PULL_HARD_CREDIT_REPORT
}