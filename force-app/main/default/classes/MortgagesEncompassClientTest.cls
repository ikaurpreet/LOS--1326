@isTest
public with sharing class MortgagesEncompassClientTest {
    @isTest
    public static void initialize() {
        
    }

    public class QueueMessagesGraphQLClient extends MortgagesGraphQLClient {
        public QueueMessagesGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
            super(clientId, clientSecret, tokenUrl, graphqlUrl);
        }

        public override MortgagesGraphQLClient.Results query(Query query, System.Type type) {
            return new MortgagesGraphQLClient.Results();
        }

        public override MortgagesGraphQLClient.Results mutation(Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            MortgagesEncompassClient.RemoveQueueMessageResponse data = new MortgagesEncompassClient.RemoveQueueMessageResponse();
            results.data = data;
            return results;
        }
    }

    @isTest
    public static void getQueueMessages() {
        MortgagesGraphQLClient graphql_client = new QueueMessagesGraphQLClient('test', 'test', 'test', 'test');
        MortgagesEncompassClient client = new MortgagesEncompassClient(graphql_client);
        client.getQueueMessages('submissionUuid', 'queue');
    }

    @isTest
    public static void removeQueueMessage() {
        MortgagesGraphQLClient graphql_client = new QueueMessagesGraphQLClient('test', 'test', 'test', 'test');
        MortgagesEncompassClient client = new MortgagesEncompassClient(graphql_client);
        client.removeQueueMessage('submissionUuid', 'messageId', 'queue', 'removedBy');
    }

    @isTest
    public static void getEncompassLoanRequest() {
        MortgagesGraphQLClient graphql_client = new QueueMessagesGraphQLClient('test', 'test', 'test', 'test');
        MortgagesEncompassClient client = new MortgagesEncompassClient(graphql_client);
        client.getEncompassLoanRequest('submissionUuid');
    }
}