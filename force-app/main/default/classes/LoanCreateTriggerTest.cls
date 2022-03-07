@isTest
private class LoanCreateTriggerTest {
    @isTest
    static void createLoan() {
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Loan__c loan = new Loan__c(submission_uuid__c = 'actual', External_Id__c = 'testId');
        insert loan;
    }
}