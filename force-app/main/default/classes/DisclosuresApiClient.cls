public with sharing class DisclosuresApiClient extends MortgagesApplicationClient {
    public DisclosuresApiClient(MortgagesConstants.Env env) { super(env); }
    public DisclosuresApiClient(MortgagesGraphQLClient client) { super(client); }
    public DisclosuresApiClient(String graphqlUrl, String accessToken) { super(graphqlUrl, accessToken); }
    
    public String searchUserEvents(String userUuid, String submissionUuid, String eventType) {
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'userEvents';
        query.variables = new Map<String, Object> { 'userUuid' => userUuid, 'submissionUuid' => submissionUuid,  'eventType' => eventType};
        query.body = 'query userEvents($userUuid: String!, $submissionUuid: String, $eventType: EventType) {' +
                        'userEvents(userUuid: $userUuid, submissionUuid: $submissionUuid, eventType: $eventType) {' +
                            'userUuid,' +
                            'ip,' +
                            'eventType,' +
                            'createdAt,' +
                            'meta {' +
                                'key,'  +
                                'value' +
                            '}' +
                            'disclosure {' +
                                'uuid,' +
                                'slug,' +
                                'description,' +
                                'textContent,' +
                                'children {' +
                                    'uuid,' +
                                    'slug,' +
                                    'label,' +
                                    'description' +
                                '}' +
                            '}' +
                        '}' +
                    '}';
        
        MortgagesGraphQLClient.Results results = client.query(query, String.class);
        
        processErrors(results);
        
        String data = (String)results.data;
        
        return data;
    }
}