global class MortgagesEncompassClient extends MortgagesApplicationClient {
    public MortgagesEncompassClient(MortgagesConstants.Env env) { super(env); }
    public MortgagesEncompassClient(MortgagesGraphQLClient client) { super(client); }
    public MortgagesEncompassClient(String graphqlUrl, String accessToken) { super(graphqlUrl, accessToken); }
    
    public class RemoveQueueMessageResponse {
        public String status;
    }

    public class EncompassQueueMessage {
        public EncompassQueueMessage(String messageId, String name) {
            this.messageId = messageId;
            this.name = name;
        }
        public String messageId { get; set; }
        public String name { get; set; }
        public String queue { get; set; }
    }

    public class EncompassLoanRequest {
        public String submissionUuid { get; set; }
        public String request { get; set; }
        public String response { get; set; }

        public EncompassLoanRequest(String submissionUuid, String request, String response) {
            this.submissionUuid = submissionUuid;
            this.request = request;
            this.response = response;
        }
    }

    public List<EncompassQueueMessage> getQueueMessages(String submissionUuid, String queue) {
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'encompassGetQueueMessages';
        query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'queue' => queue };
        query.body = 'query encompassGetQueueMessages($submissionUuid: String!, $queue: String!) {'
                      + 'encompassGetQueueMessages(submissionUuid: $submissionUuid, queue: $queue) {'
                         + 'messageId,'
                         + 'name'
                       + '}'
                    +'}';
        
        MortgagesGraphQLClient.Results results = client.query(query, List<EncompassQueueMessage>.class);

        processErrors(results);

        List<EncompassQueueMessage> messages = (List<EncompassQueueMessage>)results.data;
        
        if (messages != null) {
            for(EncompassQueueMessage message: messages) {
                message.queue = queue;
            }
        }

        return messages;
    }

    class TestException extends Exception {}
    
    public String removeQueueMessage(String submissionUuid, String messageId, String queue, String removedBy) {
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'encompassRemoveQueueMessage';
        Map<String, String> messageData = new Map<String, String> { 'submissionUuid' => submissionUuid, 'messageId' => messageId, 'queue' => queue, 'removedBy' => removedBy };
        query.variables = new Map<String, Object> { 'messageData' => messageData };
        query.body = 'mutation encompassRemoveQueueMessage($messageData: EncMessageRemovalInput) {'
                      + 'encompassRemoveQueueMessage(messageData: $messageData) {'
                         + 'status'
                       + '}'
                    +'}';

        MortgagesGraphQLClient.Results results = client.mutation(query, RemoveQueueMessageResponse.class);

        processErrors(results);

        RemoveQueueMessageResponse removeQueueMessageResponse = (RemoveQueueMessageResponse)results.data;
        return removeQueueMessageResponse.status;
    }


    public EncompassLoanRequest getEncompassLoanRequest(String submissionUuid) {
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'encompassGetLoanRequest';
        query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid };
        query.body = 'query encompassGetLoanRequest($submissionUuid: String!) {'
                      + 'encompassGetLoanRequest(submissionUuid: $submissionUuid) {'
                         + 'submissionUuid,'
                         + 'request,'
                         + 'response'
                       + '}'
                    +'}';
        
        MortgagesGraphQLClient.Results result = client.query(query, EncompassLoanRequest.class);

        processErrors(result);

        EncompassLoanRequest loanRequest = (EncompassLoanRequest)result.data;

        return loanRequest;
    }
}