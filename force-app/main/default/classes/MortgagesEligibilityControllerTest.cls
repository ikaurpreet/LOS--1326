@isTest
public with sharing class MortgagesEligibilityControllerTest {
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

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query mutation, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on mutation.operationName {
                when 'salesforceFireSubmissionEvent' {
                    results.data = true;
                }
            }
            return results;
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query mutation) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on mutation.operationName {
                when 'salesforceSync' {
                    results.data = 'salesforceSync';
                }
            }
            return results;
        }
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
    private static void getEligibilitiesTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesEligibilityController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        String results = MortgagesEligibilityController.getEligibilities('uuid', 'env');
    }

    @isTest
    private static void getEligibilityFieldTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesEligibilityController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        String results = MortgagesEligibilityController.getEligibilityField('uuid', 'field', 'env');
    }

    @isTest
    private static void getEligibilityTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesEligibilityController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        String results = MortgagesEligibilityController.getEligibility('uuid', 'env');
    }

    @isTest
    private static void getPurchaseProductsTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesEligibilityController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        String results = MortgagesEligibilityController.getPurchaseProducts('env', 'eligibilityUuid',
                                                                            0,
                                                                            0,
                                                                            true,
                                                                            new List<String> { 'lendersSet' },
                                                                            'loanType',
                                                                            'monthlyPayment',
                                                                            'apr',
                                                                            'rate',
                                                                            'order');
    }

    @isTest
    private static void getRefinanceProductsTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesEligibilityController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        String results = MortgagesEligibilityController.getRefinanceProducts('env', 'eligibilityUuid',
                                                                            0,
                                                                            0,
                                                                            true,
                                                                            new List<String> { 'lendersSet' },
                                                                            'loanType',
                                                                            'monthlyPayment',
                                                                            'apr',
                                                                            'rate',
                                                                            'order');
    }
}