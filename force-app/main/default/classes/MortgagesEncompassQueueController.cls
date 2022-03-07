public with sharing class MortgagesEncompassQueueController {
    public static MortgagesEncompassClient encompassClient { get;set; }
    public static MortgagesEncompassClient getEncompassClient(String env) {
        if (encompassClient != null) {
            return encompassClient;
        }
        return MortgagesApiClientFactory.createUserFactory(env).createEncompassClient();
    }
    @AuraEnabled
    public static String getQueueMessages(String submissionUuid, String env) {
        MortgagesEncompassClient client = getEncompassClient(env);    
        List<MortgagesEncompassClient.EncompassQueueMessage> messages = new List<MortgagesEncompassClient.EncompassQueueMessage>();
        messages.addAll(client.getQueueMessages(submissionUuid, 'backward'));
        messages.addAll(client.getQueueMessages(submissionUuid, 'forward'));

        return JSON.serialize(messages);
    }

    @AuraEnabled
    public static String removeMessage(String submissionUuid, String env, String messageId, String queue) {
        String removedBy = System.userInfo.getUserEmail(); 
        MortgagesEncompassClient client = getEncompassClient(env);
        String status = client.removeQueueMessage(submissionUuid, messageId, queue, removedBy);
        system.debug('Message ' + messageId + ' removed with status ' + status);
        return getQueueMessages(submissionUuid, env);
    }
}