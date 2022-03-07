@isTest
public with sharing class MR_EncompasQueueControllerTest {
    @isTest
    public static void setSubjectError() {
        MortgagesSubmission submission = new MortgagesSubmission();
        MR_EncompasQueueController controller = new MR_EncompasQueueController();
        controller.setSubject(submission);
        System.assertEquals('Attempt to de-reference a null object', controller.errorMessage);
    }

    public class MockGraphQLClient extends MortgagesGraphQLClient {
        public MockGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
            super(clientId, clientSecret, tokenUrl, graphqlUrl);
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            results.data = new List<MortgagesEncompassClient.EncompassQueueMessage> { new MortgagesEncompassClient.EncompassQueueMessage('messageId', 'name') };
            return results;
        }

        public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            MortgagesEncompassClient.RemoveQueueMessageResponse data = new MortgagesEncompassClient.RemoveQueueMessageResponse();
            data.status = 'success';
            results.data = data;
            return results;
        }
    }

    @isTest
    public static void setSubjectSuccess() {
        MortgagesSubmission submission = new MortgagesSubmission();
        submission.graphqlClient = new MockGraphQLClient('clientId', 'clientSecret', 'tokenUrl', 'graphqUrl');
        MR_EncompasQueueController controller = new MR_EncompasQueueController();
        controller.setSubject(submission);
        List<MortgagesEncompassClient.EncompassQueueMessage> messages = controller.forward;
        System.assertEquals('messageId', messages[0].messageId);
        System.assertEquals('name', messages[0].name);
    }

    @isTest
    public static void removeMessage() {
        MortgagesSubmission submission = new MortgagesSubmission();
        submission.graphqlClient = new MockGraphQLClient('clientId', 'clientSecret', 'tokenUrl', 'graphqUrl');
        MR_EncompasQueueController controller = new MR_EncompasQueueController();
        controller.setSubject(submission);
        controller.messageId = 'messageId';
        controller.queue = 'backward';
        controller.removeMessage();
    }
}