@isTest
private class DisclosuresApiClientTest {
    public class MockGraphQLClient extends MortgagesGraphQLClient {
        public MockGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
            super(clientId, clientSecret, tokenUrl, graphqlUrl);
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on query.operationName {
                when 'test' {

                }
            }
            return results;
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on query.operationName {
                when 'userEvents' {
                    results.data = 'userEvents';
                }
                
            }
            return results;
        }
    }

    @isTest
    public static void searchUserEvents() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        DisclosuresApiClient client = new DisclosuresApiClient(graphqlClient);
        client.searchUserEvents('userUuid', 'submissionUuid', 'eventType');
    }
}