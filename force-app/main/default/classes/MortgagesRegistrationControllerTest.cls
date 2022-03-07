@isTest
private class MortgagesRegistrationControllerTest {

    static final String MOCK_RESPONSE_DATA ='{"status":"created"}';


    @isTest
    static void mortgagesRegistrationFindTask() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        HttpClientMockTest httpClientMock = mockGetRegistrationTask(MOCK_RESPONSE_DATA);
        Test.setMock(HttpCalloutMock.class, httpClientMock);
        Test.startTest();

        String response = MortgagesRegistrationController.mortgagesRegistrationFindTask('submissionUuid');

        System.assertEquals(MOCK_RESPONSE_DATA, response);
        Test.stopTest();
    }

    @isTest
    static void mortgagesRegistrationTaskCreate() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        HttpClientMockTest httpClientMock = mockRegistrationCreateTask(MOCK_RESPONSE_DATA);
        Test.setMock(HttpCalloutMock.class, httpClientMock);
        Test.startTest();

        String response = MortgagesRegistrationController.mortgagesRegistrationTaskCreate('submissionUuid', 'refinance', 'loan_depot');

        System.assertEquals(MOCK_RESPONSE_DATA, response);
        Test.stopTest();
    }

    @isTest
    static void mortgagesRegistrationFireTaskEvent() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        HttpClientMockTest httpClientMock = mockRegistrationFireTaskEvent(MOCK_RESPONSE_DATA);
        Test.setMock(HttpCalloutMock.class, httpClientMock);
        Test.startTest();

        String response = MortgagesRegistrationController.mortgagesRegistrationFireTaskEvent('submissionUuid', 'event');

        System.assertEquals(MOCK_RESPONSE_DATA, response);
        Test.stopTest();
    }

    @isTest
    static void mortgagesRegistrationUpdateTask() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        HttpClientMockTest httpClientMock = mockRegistrationUpdatetask(MOCK_RESPONSE_DATA);
        Test.setMock(HttpCalloutMock.class, httpClientMock);
        Test.startTest();

        String response = MortgagesRegistrationController.mortgagesRegistrationUpdateTask('submissionUuid', 'token');

        System.assertEquals(MOCK_RESPONSE_DATA, response);
        Test.stopTest();
    }

    @isTest
    static void loginToLendersPortal() {

        Test.setMock(HttpCalloutMock.class, new MortgagesRegistrationHttpMock());

        String res = MortgagesRegistrationController.loginToLendersPortal('accountId', 'username', 'password');

        System.assertEquals('{"data":{"token":"token"}}', res);
    }

    private static HttpClientMockTest mockRegistrationCreateTask(String data) {
      String expectedRequest =
          '{'
              + '"variables":"{\\"lender\\":\\"loan_depot\\",\\"vertical\\":\\"refinance\\",\\"submissionUuid\\":\\"submissionUuid\\"}",'
              + '"operationName":"mortgagesRegistrationCreateTask",'
              + '"query":"' + MortgagesApiClient.MUTATION_MORTGAGES_REFISTRATION_CREATE_TASK + '"'
              + '}';
      String mockedResponse = '{"data":{"mortgagesRegistrationCreateTask":' + data + '}}';
      return new HttpClientMockTest()
          .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }

    private static HttpClientMockTest mockGetRegistrationTask(String data) {
        String expectedRequest =
            '{'
                + '"variables":"{\\"submissionUuid\\":\\"submissionUuid\\"}",'
                + '"operationName":"mortgagesRegistrationFindTask",'
                + '"query":"' + MortgagesApiClient.QUERY_MORTGAGES_REFISTRATION_FIND_TASK + '"'
                + '}';
        String mockedResponse = '{"data":{"mortgagesRegistrationFindTask":' + data + '}}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }

    private static HttpClientMockTest mockRegistrationFireTaskEvent(String data) {
        String expectedRequest =
            '{'
                + '"variables":"{\\"event\\":\\"event\\",\\"submissionUuid\\":\\"submissionUuid\\"}",'
                + '"operationName":"mortgagesRegistrationFireTaskEvent",'
                + '"query":"' + MortgagesApiClient.MUTATION_MORTGAGES_REGISTRATION_FIRE_TASK_EVENT + '"'
                + '}';
        String mockedResponse = '{"data":{"mortgagesRegistrationFireTaskEvent":' + data + '}}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }

    private static HttpClientMockTest mockRegistrationUpdatetask(String data) {
        String expectedRequest =
            '{'
                + '"variables":"{\\"token\\":\\"token\\",\\"submissionUuid\\":\\"submissionUuid\\"}",'
                + '"operationName":"mortgagesRegistrationUpdateTask",'
                + '"query":"' + MortgagesApiClient.MUTATION_MORTGAGES_REGISTRATION_UPDATE_TASK + '"'
                + '}';
        String mockedResponse = '{"data":{"mortgagesRegistrationUpdateTask":' + data + '}}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
}