@isTest
public with sharing class DisclosuresControllerTest {
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

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            results.data = results.data = '{"getUserEvents":[{"status":"success"}]}';
            return results;
        }
    }

    @isTest
    public static void getDisclosuresApiClient() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.setMock(HttpCalloutMock.class, new MockGenerator());
        Test.startTest();
        DisclosuresController.getDisclosuresApiClient('test');
        Test.stopTest();
    }

    @isTest
    public static void getUserEvents() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        DisclosuresController.disclosuresApiClient = new DisclosuresApiClient(graphqlClient);
        String result = DisclosuresController.getUserEvents('env', 'submissionUuid', 'userUuid', 'eventType');
    }
}