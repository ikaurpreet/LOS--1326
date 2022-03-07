@isTest
public with sharing class MortgagesGraphQLClientTest {
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
                when 'graphqlUrl' {
                    // Create a fake response
                    System.assertEquals('Bearer accessToken', req.getHeader('Authorization'));
                    System.assertEquals('application/json;charset=UTF-8', req.getHeader('Content-Type'));
                    res.setHeader('Content-Type', 'application/json');
                    res.setBody('{"data":{"encompassGetQueueMessages":{"example":"test"}}}');
                    res.setStatusCode(200);
                }
            }

            return res;
        }
    }

    @isTest
    private static void initialize() {
        MortgagesSettings settings = new MortgagesSettings('clientId', 'clientSecret', 'tokenUrl', 'graphqlUrl', true);
        MortgagesGraphQLClient client = new MortgagesGraphQLClient('clientId', 'clientSecret', 'tokenUrl', 'graphqlUrl');
        client = new MortgagesGraphQLClient(settings);
    }

    @isTest
    private static void stringRequest() {
        MortgagesGraphQLClient client = new MortgagesGraphQLClient('clientId', 'clientSecret', 'tokenUrl', 'graphqlUrl');
        Test.setMock(HttpCalloutMock.class, new MockGenerator());
        System.assertEquals('{"data":{"encompassGetQueueMessages":{"example":"test"}}}', client.query('test'));
    }

    public class TestObject {
        public String example { get; set; }
    }

    @isTest
    private static void queryRequest() {
        MortgagesGraphQLClient client = new MortgagesGraphQLClient('clientId', 'clientSecret', 'tokenUrl', 'graphqlUrl');
        Test.setMock(HttpCalloutMock.class, new MockGenerator());
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'encompassGetQueueMessages';
        query.variables = new Map<String, Object> { };
        query.body = 'query encompassGetQueueMessages($submissionUuid: String, $queue: String) {'
                      + 'encompassGetQueueMessages(submissionUuid: $submissionUuid, queue: $queue) {'
                         + 'messageId,'
                         + 'name'
                       + '}'
                    +'}';

        MortgagesGraphQLClient.Results results = client.query(query, TestObject.class);
        TestObject data = (TestObject)results.data;

        System.assertEquals('test', data.example);

        results = client.mutation(query, TestObject.class);
        data = (TestObject)results.data;

        System.assertEquals('test', data.example);
    }
}