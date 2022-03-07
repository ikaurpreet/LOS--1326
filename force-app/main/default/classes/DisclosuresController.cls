public with sharing class DisclosuresController {
    public static DisclosuresApiClient disclosuresApiClient { get;set; }
    public static DisclosuresApiClient getDisclosuresApiClient(String env) {
        if (disclosuresApiClient != null) {
            return disclosuresApiClient;
        }
        return MortgagesApiClientFactory.createUserFactory(env).createDisclosuresApiClient();
    }

    @AuraEnabled
    public static String getUserEvents(String env, 
                                                                         String submissionUuid, 
                                                                         String userUuid, 
                                                                         String eventType) {
        DisclosuresApiClient client = getDisclosuresApiClient(env);
        String userEvents = client.searchUserEvents(userUuid, submissionUuid, eventType);

        return userEvents;
    }
}