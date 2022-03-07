@isTest
private class MortgagesSubmissionDshbController {
    @isTest
    static void MortgagesSubmissionDshbControllerTest() {
        ApexPages.currentPage().getParameters().put('env','test');
        ApexPages.currentPage().getParameters().put('vertical','MortgageRefi');
        new MortgagesSubmissionDashboardController();
    }

    @isTest
    static void MortgagesSubmissionDshbControllerLeadTest() {
        Id recordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Person Account'].Id;
        Account account = new Account(user_id__c = 'test_actual', FirstName = 'FirstName', LastName = 'LastName', RecordTypeId = recordTypeId);
        insert account;
        Lead lead = new Lead(mortgage_Submission_uuid__c = 'test_actual', Status = 'FIP', User_Role__c= 'borrower', Submission_Id__c = 'test_actual', LastName = 'LastName', SubmissionType__c = 'Personal');
        insert lead;
        ApexPages.Standardcontroller sc = new ApexPages.Standardcontroller(lead);
        new MortgagesSubmissionDashboardController(sc);
    }

    @isTest
    static void MortgagesSubmissionDshbControllerOpportunityTest() {
        Opportunity opportunity = MortgagesTestFactory.createOpportunity('test');
        ApexPages.Standardcontroller sc = new ApexPages.Standardcontroller(opportunity);
        new MortgagesSubmissionDashboardController(sc);
    }
}