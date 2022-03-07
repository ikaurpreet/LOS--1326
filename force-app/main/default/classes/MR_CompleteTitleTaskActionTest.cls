@isTest
private class MR_CompleteTitleTaskActionTest {
    static final String SUBMISSION_UUID = '1-submission-uuid';
    static final String TASK_UUID_1 = '1-task-uuid';
    static final String TASK_UUID_2 = '2-task-uuid';
    static final String TASK_TYPE = 'title_information';
    static final String ENV = 'test';
    
    @testSetup
    static void setup() {
        String submissionId = '12345';
        String submissionStatus = 'initial_processing';
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(ENV, submissionId, SUBMISSION_UUID, submissionStatus);
        Submission_Task__c task = MortgagesTestFactory.createSubmissionTask(ENV, SUBMISSION_UUID, TASK_UUID_1, opportunity.Id, TASK_TYPE, 'started');
    }
    
    @isTest
    static void executed() {
        HttpCalloutMock httpMock = mockCompleteTaskCall(TASK_UUID_1);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        MR_CompleteTitleTaskAction.execute(input());
        String status = taskStatus(ENV, TASK_UUID_1);
        System.assertEquals('completed', status);
        Test.stopTest();
    }
    
    @isTest
    static void multipleStartedTasks() {
        Id opportunityId = MortgagesTestFactory.opportunityId();
        MortgagesTestFactory.createSubmissionTask(ENV, SUBMISSION_UUID, TASK_UUID_2, opportunityId, TASK_TYPE, 'started');
        String expectedError = 'Multiple objects Submission_Task__c record with Opportunity__c="' + opportunityId +
            '" Type__c="title_information" Status__c = "started" were found.';
        String errorMessage = null;
        try {
            HttpClientMockTest httpMock = mockCompleteTaskCall(TASK_UUID_1);
            Test.setMock(HttpCalloutMock.class, httpMock);
            Test.startTest();
            MR_CompleteTitleTaskAction.execute(input());
            System.assert(false, 'Expected exception at this point.');
        } catch (MortgagesUtilities.SubjectObjectNotFoundException e) {
            errorMessage = e.getMessage();
        }
        System.assertEquals(expectedError, errorMessage);
        Test.stopTest();
    }
    
    @isTest
    static void noStartedTask() {
        String taskStatus = 'submitted';
        Submission_Task__c task = [SELECT id, Status__c FROM Submission_Task__c LIMIT 1];
        task.Status__c = taskStatus;
        update task;
    
        HttpClientMockTest httpMock = mockCompleteTaskCall(TASK_UUID_1);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        MR_CompleteTitleTaskAction.execute(input());
    
        System.assertEquals(taskStatus, taskStatus(ENV, TASK_UUID_1));
        System.assertEquals(0, httpMock.invokedTimes());
        Test.stopTest();
    }
    
    static String taskStatus(String env, String taskUuid) {
        String prefixedUuid = env + '_' + taskUuid;
        Submission_Task__c task = [SELECT id, Status__c FROM Submission_Task__c WHERE Uuid__c =: prefixedUuid];
        return task.Status__c;
    }
    
    static List<MR_CompleteTitleTaskAction.ActionInput> input() {
        MR_CompleteTitleTaskAction.ActionInput input = new MR_CompleteTitleTaskAction.ActionInput();
        input.opportunityId = MortgagesTestFactory.opportunityId();
        return new List<MR_CompleteTitleTaskAction.ActionInput> { input };
    }

    static String request(String taskUuid) {
        return '{'
            + '"variables":"{\\"uuid\\":\\"' + taskUuid + '\\"}",'
            + '"operationName":"systemCompleteTask",'
            + '"query":"' + MortgagesTasksApiClient.MUTATION_COMPLETE_TASK + '"'
            + '}';
    }
    
    static HttpClientMockTest mockCompleteTaskCall(String taskUuid) {
        String expectedRequest = request(taskUuid);
        String mockedResponse = '{"data":{"systemCompleteTask":{"uuid":"'+ taskUuid + '","status":"completed"}}}';
        return new HttpClientMockTest().withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
}