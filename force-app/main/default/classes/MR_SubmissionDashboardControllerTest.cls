@isTest
public with sharing class MR_SubmissionDashboardControllerTest {
    @isTest
    public static void leadObject() {
        MortgagesTestFactory.createDefaultClientCredentials();
        Lead lead = new Lead(Participant_ID__c = 'local_actual', LastName = 'LastName', SubmissionType__c = 'MortgageRefi', Mortgage_Submission_Uuid__c = 'uuid');
        insert lead;

        ApexPages.StandardController standardController = new ApexPages.StandardController(lead);
        MortgagesSubmissionDashboardController controller = new MortgagesSubmissionDashboardController(standardController);
        System.assertEquals('uuid', controller.submission.uuid);
        System.assertEquals(MortgagesConstants.Vertical.MortgageRefi, controller.submission.vertical);
        System.assertEquals(MortgagesConstants.Env.TEST, controller.submission.env);
        System.assertEquals(true, controller.hasSubmission);
    }

    public static testmethod void submissionObject() {
        MortgagesTestFactory.createDefaultClientCredentials();
        Id recordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Person Account'].Id;
        Account acct = new Account(FirstName = 'John', LastName = 'Testing', RecordTypeId = recordTypeId, User_Id__c = '000001');
        insert acct;
        Lead lead = new Lead(Has_Account__c = acct.id, Participant_ID__c = 'local_actual', User_Id__c = '000001', User_Role__c = 'borrower', LastName = 'Testing1', Status = 'FIP', SubmissionType__c='MortgageRefi', Submission_Id__c = '111222', Mortgage_Submission_Uuid__c = 'uuid');
        insert lead;
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Opportunity opportunity = [SELECT Id, Name, AccountId FROM Opportunity WHERE id =: opp.id];
        ApexPages.StandardController standardController = new ApexPages.StandardController(opportunity);
        MortgagesSubmissionDashboardController controller = new MortgagesSubmissionDashboardController(standardController);
        System.assertEquals(MortgagesConstants.Vertical.MortgageRefi, controller.submission.vertical);
        System.assertEquals(MortgagesConstants.Env.TEST, controller.submission.env);
        System.assertEquals(true, controller.hasSubmission);
    }
}