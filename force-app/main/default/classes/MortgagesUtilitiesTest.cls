@isTest
private class MortgagesUtilitiesTest {
    @isTest
    static void getSubmissionSalesforceIds() {
        Id recordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Person Account'].Id;
        // Account account = new Account(user_id__c = 'uat_actual', FirstName = 'FirstName', LastName = 'LastName', RecordTypeId = recordTypeId);
        Account account = MortgagesTestFactory.createAccount('uat_actual');
        Lead lead = new Lead(mortgage_Submission_uuid__c = 'uat_actual', Status = 'FIP', User_Role__c= 'borrower', Submission_Id__c = 'uat_actual', LastName = 'LastName', SubmissionType__c = 'MortgageRefi');
        insert lead;
        MortgagesUtilities.getSubmissionSalesforceIds(new Set<String> { 'uat_actual' });
        // Opportunity opportunity = new Opportunity(Name = 'test', StageName= 'test', CloseDate = Date.today(), mortgage_Submission_uuid__c = 'uat_actual', Submission_Id__c = 'uat_actual', Submission_Type__c = 'MortgageRefi');
        // insert opportunity;
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(
            null, 
            lead.mortgage_Submission_uuid__c, 
            lead.Submission_Id__c, 
            null, 
            'test', 
            null, 
            account
        );
        MortgagesUtilities.getSubmissionSalesforceIds(new Set<String> { 'uat_actual' });
    }

    @isTest
    static void getEnvironment() {
        MortgagesTestFactory.createDefaultClientCredentials();
        System.assertEquals(MortgagesConstants.Env.TEST, MortgagesUtilities.getEnvironment('test_actual'));
        System.assertEquals(MortgagesConstants.Env.PRODUCTION, MortgagesUtilities.getEnvironment('production'));

        Id recordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Person Account'].Id;
        Account account = new Account(user_id__c = 'uat_actual', FirstName = 'FirstName', LastName = 'LastName', RecordTypeId = recordTypeId);

        insert account;
        System.assertEquals(MortgagesConstants.Env.TEST, MortgagesUtilities.getEnvironment(account.id));

        Lead lead = new Lead(Participant_ID__c = 'uat_actual', LastName = 'LastName', SubmissionType__c = 'Personal');
        insert lead;
        System.assertEquals(MortgagesConstants.Env.TEST, MortgagesUtilities.getEnvironment(lead.id));

        Opportunity opportunity = new Opportunity(Submission_Id__c = 'uat_actual');
        System.assertEquals(MortgagesConstants.Env.TEST, MortgagesUtilities.getEnvironment(opportunity));
    }
}