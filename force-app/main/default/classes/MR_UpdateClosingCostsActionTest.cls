@isTest
private class MR_UpdateClosingCostsActionTest {
    static final String SUBMISSION_UUID = '1234-uuid';
    @testSetup
    static void setup() {
        String env = 'test';
        String submissionId = '12345';
        String submissionStatus = 'initial_processing';
        MortgagesTestFactory.createOpportunity(env, submissionId, SUBMISSION_UUID, submissionStatus);
    }
    
    @isTest
    static void executed() {
        HttpCalloutMock httpMock = mockClosingCostUpdateCall(SUBMISSION_UUID);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        MR_UpdateClosingCostsAction.execute(input());
        Test.stopTest();
    }
    
    @isTest
    static void closingCostUpdateFailed() {
        String encompassError = 'Internal Server Error';
        HttpCalloutMock httpMock = mockEncompassFailure(SUBMISSION_UUID, encompassError);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        String errorMessage = null;
        try {
            MR_UpdateClosingCostsAction.execute(input());
            System.assert(false, 'Expected exception at this point.');
        } catch (MortgagesApplicationClient.GrqphQLException e) {
            errorMessage = e.getMessage();
        }
        System.assert(errorMessage.contains(encompassError));
        Test.stopTest();
    }
    
    @isTest
    static void encompassFailed() {
        String encompassError = 'Failed to call "encompassScheduleClosingCostsUpdate" API with submissionUuid="'+ SUBMISSION_UUID +'".';
        HttpCalloutMock httpMock = mockClosingCostUpdateCallFailure(SUBMISSION_UUID);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        String errorMessage = null;
        try {
            MR_UpdateClosingCostsAction.execute(input());
            System.assert(false, 'Expected exception at this point.');
        } catch (System.CalloutException e) {
            errorMessage = e.getMessage();
        }
        System.assert(errorMessage.contains(encompassError));
        Test.stopTest();
    }
    
    static List<MR_UpdateClosingCostsAction.ActionInput> input() {
        MR_UpdateClosingCostsAction.ActionInput input = new MR_UpdateClosingCostsAction.ActionInput();
        input.opportunityId = MortgagesTestFactory.opportunityId();
        return new List<MR_UpdateClosingCostsAction.ActionInput> { input };
    }
    
    static HttpCalloutMock mockClosingCostUpdateCall(String submissionUuid) {
        String expectedRequest =
            '{'
                + '"variables":"{\\"submissionUuid\\":\\"' + submissionUuid + '\\"}",'
                + '"operationName":"encompassScheduleClosingCostsUpdate",'
                + '"query":"' + MortgagesApiClient.QUERY_ENCOMPASS_SCHEDULE_CLOSING_COSTS_UPDATE + '"'
                + '}';
        String mockedResponse = '{"data":{"encompassScheduleClosingCostsUpdate":{"status":"success"}}}';
        return new HttpClientMockTest().withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
    
    static HttpCalloutMock mockClosingCostUpdateCallFailure(String submissionUuid) {
        String expectedRequest =
            '{'
                + '"variables":"{\\"submissionUuid\\":\\"' + submissionUuid + '\\"}",'
                + '"operationName":"encompassScheduleClosingCostsUpdate",'
                + '"query":"' + MortgagesApiClient.QUERY_ENCOMPASS_SCHEDULE_CLOSING_COSTS_UPDATE + '"'
                + '}';
        String mockedResponse = '{"data":{"encompassScheduleClosingCostsUpdate":{"status":"not_success"}}}';
        return new HttpClientMockTest().withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
    
    static HttpCalloutMock mockEncompassFailure(String submissionUuid, String errorMessage) {
        String expectedRequest =
            '{'
                + '"variables":"{\\"submissionUuid\\":\\"' + submissionUuid + '\\"}",'
                + '"operationName":"encompassScheduleClosingCostsUpdate",'
                + '"query":"' + MortgagesApiClient.QUERY_ENCOMPASS_SCHEDULE_CLOSING_COSTS_UPDATE + '"'
                + '}';
        String mockedResponse = '{"errors":[{"message":"' + errorMessage + '","realm":"Encompass","code":"0001"}]}';
        return new HttpClientMockTest().withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
}