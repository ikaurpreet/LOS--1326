@isTest
private class MortgagesTasksApiClientTest {
    private static final String TASK_UUID = 'task-uuid';
    private class MockGraphQLClient extends MortgagesGraphQLClient {
        MockGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
            super(clientId, clientSecret, tokenUrl, graphqlUrl);
        }

        public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query mutation, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on mutation.operationName {
                when 'test' {

                }
            }
            return results;
        }

        public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query mutation) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on mutation.operationName {
                when 'test' {

                }
                when 'systemCompleteTask' {
                    results.data = '{"systemCompleteTask:{"uuid":"' + TASK_UUID + '"}"}';
                }
                when 'systemRejectTask' {
                    results.data = '{"systemRejectTask": {"uuid":"' + TASK_UUID + '"}}';
                }
                when 'systemApproveTask' {
                    results.data = '{"systemApproveTask": {"uuid":"' + TASK_UUID + '"}}';
                }
            }
            return results;
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
                when 'systemFindGenericTasks' {
                    results.data = 'Purchase';
                }
                
            }
            return results;
        }
    }

    @isTest
    static void getTasks() {
        // Document document = this.searchDocument(reference);
        // return this.issueAuthorization(document.uuid, 'get');
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesTasksApiClient client = new MortgagesTasksApiClient(graphqlClient);
        client.getTasks('submissionUuid');
        // System.assertEquals(null, submission);
    }


    @isTest
    static void rejectTask() {
        MortgagesGraphQLClient mock = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesTasksApiClient client = new MortgagesTasksApiClient(mock);
        
        client.rejectTask(TASK_UUID, 'author', 'role', 'description');
    }

    @isTest
    static void approveTask() {
         MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
         MortgagesTasksApiClient client = new MortgagesTasksApiClient(graphqlClient);
         
         client.approveTask(TASK_UUID);
    }
    
    @isTest
    static void createMeetingTask() {
        MortgagesGraphQLClient mock = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesTasksApiClient client = new MortgagesTasksApiClient(mock);

        client.createMeetingTask(new Map<String, Object> { 'foo' => 'boo'} );
    }

    @isTest
    static void fireTaskItemEvent() {
        MortgagesGraphQLClient mock = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesTasksApiClient client = new MortgagesTasksApiClient(mock);

        client.fireTaskItemEvent('taskItemUuid', 'event');
    }
    
    @isTest
    static void completeTask() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesTasksApiClient client = new MortgagesTasksApiClient(graphqlClient);
        String result = client.completeTask(TASK_UUID);
        System.assert(result.contains(TASK_UUID));
    }
}