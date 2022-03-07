@isTest
public with sharing class MortgagesViewDocumentControllerTest {
    @isTest
    public static void findSubmissionTaskUploadedDocument() {
        Submission_Task__c task = new Submission_Task__c();
        task.title__c = 'test';
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        task.Submission_Uuid__c = opp.mortgage_Submission_UUID__c;
        task.uuid__c = 'test_uuid';
        task.type__c = 'document';
        task.opportunity__c = opp.id;
        insert task;
        FolderManager.createSubmissionTaskFolder(task);
        Document__c document = MortgagesTestFactory.createDocument('test owner', 'test_uuid');
        MortgagesViewDocumentController.findSubmissionTaskUploadedDocument(task.id);
    }

    private class RestMock implements HttpCalloutMock {

        public HTTPResponse respond(HTTPRequest req) {
            String fullJson = 'your Json Response';

            HTTPResponse res = new HTTPResponse();
            res.setHeader('Content-Type', 'text/json');
            res.setHeader('Content-Disposition', 'content-type=jps&filename=test.jsp');
            res.setBody(fullJson);
            res.setStatusCode(200);
            return res;
        }
    }

    private class MockGraphQLClient extends MortgagesGraphQLClient {
        public MockGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
            super(clientId, clientSecret, tokenUrl, graphqlUrl);
        }

        public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            
            switch on query.operationName {
                when 'systemIssueAuthorization' {
                    results.data = new Map<String, String>{ 'url' => 'https://google.com.ua' };
                }
            }
            return results;
        }
    }

    @isTest
    public static void downloadDocument() {
        Test.setMock(HttpCalloutMock.class, new RestMock());
        
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocumentManager.docsApiClient = new MortgagesDocsApiClient(graphqlClient);        
        Document__c document = MortgagesTestFactory.createDocument('test owner', 'test reference');
        Test.startTest();
        MortgagesViewDocumentController.downloadDocument(document.id);
        MortgagesViewDocumentController.downloadDocument(document.id);
        Test.StopTest();
    }
}