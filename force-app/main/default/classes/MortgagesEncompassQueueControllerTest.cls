@isTest
public with sharing class MortgagesEncompassQueueControllerTest {
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
            // switch on mutation.operationName {
            //     when 'salesforceFireSubmissionEvent' {
            //         results.data = true;
            //     }
            // }
            results.data = new MortgagesEncompassClient.RemoveQueueMessageResponse();
            return results;
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query mutation, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            results.data = (Object)new List<MortgagesEncompassClient.EncompassQueueMessage> {};
            // switch on mutation.operationName {
            //     when 'salesforceSync' {
            //         results.data = 'salesforceSync';
            //     }
            // }
            return results;
        }
    }

    @isTest
    public static void getEncompassClientTest() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new MockGenerator());
        MortgagesEncompassQueueController.getEncompassClient('test');
        Test.stopTest();
    }

    @isTest
    public static void getQueueMessagesTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesEncompassQueueController.encompassClient = new MortgagesEncompassClient(graphqlClient);
        String results = MortgagesEncompassQueueController.getQueueMessages('submissionUuid', 'env');
    }

    @isTest
    public static void removeMessageTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesEncompassQueueController.encompassClient = new MortgagesEncompassClient(graphqlClient);
        String results = MortgagesEncompassQueueController.removeMessage('submissionUuid', 'env', 'messageId', 'queue');
    }
}