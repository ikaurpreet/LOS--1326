@isTest
private class DocumentRelationshipManagerTest {
    static Opportunity opp;
    static Account acc;


    @testSetup 
    static void setup() {
        MortgagesTestFactory.createOpportunity();
        MortgagesTestFactory.createAccount();
    }

    @isTest
    static void documentToOpportunity() {
        Account acc = [select Id, user_uuid__c from Account limit 1];
        Opportunity opp = [select Id, mortgage_Submission_UUID__c from Opportunity limit 1];
        Document__c document = new Document__c (
            Reference__c = 'uuid', 
            Owner_Uuid__c = acc.user_uuid__c, 
            External_ID__c = 'uuid', 
            Status__c = 'Created', 
            Category__c = 'Income', 
            Submission_UUID__c = opp.mortgage_Submission_UUID__c
        );
        insert document;
        // For some reason this call is commented out in the trigger.  Is this class actually needed?
        // These lines aren't neccesary if the call is made in the trigger
        List<Document__c> docs = new List<Document__c>();
        docs.add(document);
        DocumentRelationshipManager.documentToOpportunity(docs);
        System.assertEquals(opp.Id, document.Opportunity__c, 'Opportunity was not set on document.');
        System.assertEquals(acc.Id, document.Account__c, 'Account was not set on document.');
    }
}