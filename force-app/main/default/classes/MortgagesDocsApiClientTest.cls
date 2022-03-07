@isTest
public with sharing class MortgagesDocsApiClientTest {
    public class MockGraphQLClient extends MortgagesGraphQLClient {
        public MockGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
            super(clientId, clientSecret, tokenUrl, graphqlUrl);
        }

        public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query mutation, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on mutation.operationName {
                when 'salesforceFireSubmissionEvent' {
                    results.data = true;
                }
                 when 'systemIssueAuthorization' {
                    results.data = new Map<String, String>{ 'url' => 'test' };
                }
                when 'bulkCopyDocumentToGDrive' {
                    results.data = 'Success';
                }
                when 'uploadDocumentToGDrive' {
                    results.data = 'Success';
                }
                when 'fireDocumentEvent' {
                    results.data = 'Success';
                }
                when 'salesforceCreateDocument' {
                    results.data = 'Success';
                }
                when 'systemUpdateDocument' {
                    results.data = 'Success';
                }
                when 'systemPDFDocument' {
                    results.data = '"test"';
                }
                when 'systemGeneratePDFDocument' {
                    results.data = 'Success';
                }
            }
            return results;
        }

        public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query mutation) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on mutation.operationName {
                when 'salesforceSync' {
                    results.data = 'salesforceSync';
                }
                
            }
            return results;
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on query.operationName {
                when 'systemSearchDocuments' {
                    results.data = new List<MortgagesDocsApiClient.Document> { new MortgagesDocsApiClient.Document() };
                }
                
            }
            return results;
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on query.operationName {
                when 'mortgagesSalesforcePurchaseSubmission' {
                    results.data = 'Purchase';
                }
                
            }
            return results;
        }
    }

    @isTest
    public static void generateDownloadUrl() {
        // Document document = this.searchDocument(reference);
        // return this.issueAuthorization(document.uuid, 'get');
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);
        client.generateDownloadUrl('submissionUuid');
        // System.assertEquals(null, submission);
    }

    @isTest
    public static void searchDocument() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);
        client.searchDocument('submissionUuid');
        //searchDocument(String reference)
    }

    @isTest
    public static void issueAuthorization() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);
        client.issueAuthorization('submissionUuid', 'put');
        // issueAuthorization
    }

    @isTest
    static void bulkCopyDocumentToGdriveTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);

        List<String> uuids = new List<String> { 'uuid1', 'uuid2' };
        
        client.bulkCopyDocumentToGdrive(uuids, 'path');
    }

    @isTest
    static void uploadDocumentToGdriveTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);

        // List<String> uuids = new List<String> { 'uuid1', 'uuid2' };
        
        client.uploadDocumentToGdrive('uuid', 'path');
    }

    @isTest
    static void fireDocumentEventTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);

        // List<String> uuids = new List<String> { 'uuid1', 'uuid2' };
        
        client.fireDocumentEvent('uuid', 'event');
    }

    @isTest
    static void acceptDocumentTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);

        // List<String> uuids = new List<String> { 'uuid1', 'uuid2' };
        
        client.acceptDocument('uuid');
    }


    @isTest
    static void archiveDocumentTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);

        // List<String> uuids = new List<String> { 'uuid1', 'uuid2' };
        
        client.archiveDocument('uuid');
    }

    @isTest
    static void salesforceCreateDocumentTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);

        // List<String> uuids = new List<String> { 'uuid1', 'uuid2' };
        
        client.salesforceCreateDocument('submissionUuid', 'category', 'reference',null, true);
    }

    @isTest
    static void updateDocumentTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);

        // List<String> uuids = new List<String> { 'uuid1', 'uuid2' };
        
        client.updateDocument(null);
    }

    // @isTest
    // static void generateViewerUrlTest() {
    //     MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
    //     MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);

    //     // List<String> uuids = new List<String> { 'uuid1', 'uuid2' };
        
    //     client.generateViewerUrl('documentUuid');
    // }

    static void generatePDFDocumentTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesDocsApiClient client = new MortgagesDocsApiClient(graphqlClient);

        // List<String> uuids = new List<String> { 'uuid1', 'uuid2' };
        
        client.generatePDFDocument('documentUuid');
    }
}