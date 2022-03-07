@isTest
private class MortgagesTasksControllerTest {
    private static final String SUBMISSION_UUID = 'submission_uuid';
    private static final String SUBMISSION_ID = 'submission_id';

    @isTest
    static void getTasksApiClientForTestEnv() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.startTest();
        HttpCalloutMock httpMock = new HttpClientMockTest();
        Test.setMock(HttpCalloutMock.class, httpMock);

        System.assert(MortgagesTasksController.getTasksApiClient('test') != null);
        System.assert(MortgagesTasksController.getTasksApiClient('test') != null);
        Test.stopTest();
    }

    @isTest
    static void getDocsApiClientForTestEnv() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.startTest();
        HttpCalloutMock httpMock = new HttpClientMockTest();
        Test.setMock(HttpCalloutMock.class, httpMock);

        System.assert(MortgagesTasksController.getDocsApiClient('test') != null);
        System.assert(MortgagesTasksController.getDocsApiClient('test') != null);
        Test.stopTest();
    }

    @isTest
    static void getSubmissionUuidAndEnv() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.startTest();
        MortgagesTestFactory.createOpportunity('test', SUBMISSION_ID, SUBMISSION_UUID, 'submitted_to_lender');
        HttpCalloutMock httpMock = new HttpClientMockTest();
        Test.setMock(HttpCalloutMock.class, httpMock);
        List<Opportunity> opportunities = [SELECT id FROM Opportunity LIMIT 1];

        String result = MortgagesTasksController.getSubmissionUuidAndEnv(String.valueOf(opportunities[0].ID));
        System.assertEquals('{"env":"TEST","uuid":"' + SUBMISSION_UUID +'"}', result);
        Test.stopTest();
    }

    @isTest
    static void getTasks() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.startTest();
        String expectedRequest =
        '{'
        + '"variables":"{\\"stage\\":\\"review\\",\\"submissionUuid\\":\\"' + SUBMISSION_UUID + '\\"}",'
        + '"operationName":"systemFindGenericTasks",'
        + '"query":"query systemFindGenericTasks($submissionUuid: ID!, $stage: TaskGenericStageEnum) {'
            + 'systemFindGenericTasks(submissionUuid: $submissionUuid, stage: $stage) {'
                + 'uuid,'
                + 'submissionUuid,'
                + 'ownerUuid,'
                + 'status,'
                + 'group,'
                + 'type,'
                + 'participantRole,'
                + 'title,'
                + 'description,'
                + 'createdAt,'
                + 'updatedAt'
                + '}'
            + '}"'
        + '}';
        String mockedResponse = '{"data":{"systemFindGenericTasks":{"field":"value"}}}';
        HttpCalloutMock httpMock = new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
        Test.setMock(HttpCalloutMock.class, httpMock);

        String result = MortgagesTasksController.getTasks(SUBMISSION_UUID, 'test');
        System.assertEquals('{"field":"value"}', result);
        Test.stopTest();
    }
}