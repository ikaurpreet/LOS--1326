@isTest
private class MortgagesSubmissionActionsControllerTest {
    public class MockGenerator implements HttpCalloutMock {
        // Implement this interface method
        public HTTPResponse respond(HTTPRequest req) {
            // Optionally, only send a mock response for a specific endpoint

            System.assertEquals('POST', req.getMethod());
            String endpoint = req.getEndpoint();
            HttpResponse res = new HttpResponse();
            switch on endpoint {
                when 'tokenUrl' {
                    // Create a fake response
                    System.assertEquals('application/x-www-form-urlencoded', req.getHeader('Content-Type'));
                    System.assertEquals('client_id=clientId&client_secret=clientSecret&grant_type=client_credentials', req.getBody());
                    System.assertEquals('tokenUrl', req.getEndpoint());
                    res.setHeader('Content-Type', 'application/json');
                    res.setBody('{"access_token":"accessToken","expires_in":"expiresIn","token_type":"tokenType"}');
                    res.setStatusCode(200);
                }
            }
            return res;
        }
    }

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
                when 'salesforceArchiveSubmission' {
                    results.data = true;
                }
                when 'salesforceUnarchiveSubmission' {
                    results.data = true;
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
                when 'encompassSystemUpdateLoan' {
                    results.data = '{"encompassSystemUpdateLoan":{"status":"success"}}';
                }
            }
            return results;
        }
    }

    @isTest
    private static void getImpersonationsClientTest() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.setMock(HttpCalloutMock.class, new MockGenerator());
        Test.startTest();
        MortgagesSubmissionActionsController.getImpersonationsClient('test');
        Test.stopTest();
    }

    @isTest
    private static void getMortgagesApiClientTest() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.setMock(HttpCalloutMock.class, new MockGenerator());
        Test.startTest();
        MortgagesSubmissionActionsController.getMortgagesApiClient('test');
        Test.stopTest();
    }

    @isTest
    private static void salesforceSyncTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesSubmissionActionsController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        String results = MortgagesSubmissionActionsController.salesforceSync('uuid', 'type', 'env');
    }

    @isTest
    private static void fireSubmissionEventTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesSubmissionActionsController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        Boolean results = MortgagesSubmissionActionsController.fireSubmissionEvent('uuid', 'event', 'env');
    }

    @isTest
    private static void requestImpersonationTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesSubmissionActionsController.impersonationsClient = new MortgagesImpersonationsClient(graphqlClient);
        String results = MortgagesSubmissionActionsController.requestImpersonation('uuid', 'stage');
    }

    @isTest
    private static void archiveSubmission() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesSubmissionActionsController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        Boolean results = MortgagesSubmissionActionsController.archiveSubmission('uuid', 'env');
        System.assert(results);
    }

    @isTest
    private static void unarchiveSubmission() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesSubmissionActionsController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        Boolean results = MortgagesSubmissionActionsController.unarchiveSubmission('uuid', 'env');
        System.assert(results);
    }
}