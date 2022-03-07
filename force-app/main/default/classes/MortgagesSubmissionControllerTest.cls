@isTest
private class MortgagesSubmissionControllerTest {
    private class MockGraphQLClient extends MortgagesGraphQLClient {
        public MockGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
            super(clientId, clientSecret, tokenUrl, graphqlUrl);
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            MortgagesApiClient.SubmissionsPaginationType data = new MortgagesApiClient.SubmissionsPaginationType();
            MortgagesApiClient.PaginationSubmission submission = new MortgagesApiClient.PaginationSubmission();
            submission.uuid = 'uuid_actual';
            data.items = new List<MortgagesApiClient.PaginationSubmission> { submission };
            results.data = data;
            // switch on mutation.operationName {
            //     when 'salesforceFireSubmissionEvent' {
            //         results.data = true;
            //     }
            // }
            return results;
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            
            return results;
        }
    }

    @isTest
    static void getPurchaseSubmissionTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesSubmissionController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        String results = MortgagesSubmissionController.getPurchaseSubmission('uuid', 'env');
    }

    @isTest
    static void getRefinanceSubmissionTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesSubmissionController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        String results = MortgagesSubmissionController.getRefinanceSubmission('uuid', 'env');
    }

    @isTest
    static void searchTest() {
        MortgagesTestFactory.createOpportunity();
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesSubmissionController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        MortgagesSubmissionController.search('query', 'vertical', 'env', 'status', 'order', 0, 0);
    }
}