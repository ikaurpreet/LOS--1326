trigger LoanCreateTrigger on Loan__c (before insert) {
  MortgagesRelationshipManager.loanToOpportunity(Trigger.new);
}