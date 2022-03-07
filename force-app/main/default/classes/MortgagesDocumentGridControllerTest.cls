@isTest
public with sharing class MortgagesDocumentGridControllerTest {
    public class MockGraphQLClient extends MortgagesGraphQLClient {
        public MockGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
            super(clientId, clientSecret, tokenUrl, graphqlUrl);
        }

        public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query mutation, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on mutation.operationName {
                when 'uploadDocumentToGDrive' {
                    results.data = 'true';
                }
            }
            return results;
        }
    }
    @isTest
    public static void getFolders() {
        MortgagesDocumentGridController.getFolders('test', 'Submission_Task__c');
        MortgagesDocumentGridController.getFolders('test', 'Custom_Task__c');
        MortgagesDocumentGridController.getFolders('test', 'Opportunity');
    }

    @isTest
    public static void reviewDocument() {
        try {
            MortgagesDocumentGridController.reviewDocument('test');
        } catch(NoDataFoundException ex) {
            system.assertEquals(ex.getMessage(), 'Script-thrown exception');
        }
    }

    @isTest
    public static void getDocuments() {
        MortgagesDocumentGridController.getDocuments('test', 'Submission_Task__c');
        MortgagesDocumentGridController.getDocuments('test', 'Folder__c');
        MortgagesDocumentGridController.getDocuments('test', 'Opportunity');
        Test.startTest();
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = MortgagesTestFactory.createSpruceTasks(opp);
        FolderManager.createCustomTaskFolder(task, 'reference');
        Document__c document = MortgagesTestFactory.createDocument('ownerUuid', 'reference');
        MortgagesSpruceDocumentsController.addDocumentNote(document.id, 'note');
        Test.stopTest();
        system.debug(MortgagesDocumentGridController.getDocuments(task.id, 'Custom_Task__c'));
    }

    @isTest
    public static void uploadToGDrive() {
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = new Custom_Task__c();
        task.Borrower_Name__c = 'test';
        task.Opportunity__c = opp.id;
        insert task;
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocumentGridController.docsApiClient = new MortgagesDocsApiClient(graphqlClient);
        MortgagesDocumentGridController.uploadToGDrive('externalId', '', task.id);
    }

    @isTest
    public static void getDocumentNote() {
        Test.startTest();
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = MortgagesTestFactory.createSpruceTasks(opp);
        FolderManager.createCustomTaskFolder(task, 'reference');
        Document__c document = MortgagesTestFactory.createDocument('ownerUuid', 'reference');
        Test.stopTest();
        MortgagesDocumentGridController.getDocumentNote(document.id);
    }
}