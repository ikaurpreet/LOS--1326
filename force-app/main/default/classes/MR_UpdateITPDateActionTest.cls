@isTest
private class MR_UpdateITPDateActionTest {
    static final String SUBMISSION_UUID = '1234-uuid';
    static final String ITP_DATE = '"2020-11-05"';

    static List<MR_UpdateITPDateAction.ActionInput> setupInput() {
        MR_UpdateITPDateAction.ActionInput input = new MR_UpdateITPDateAction.ActionInput();
        input.opportunityId = MortgagesTestFactory.opportunityId();
        input.itpDate = (Date)JSON.deserialize(ITP_DATE, Date.class);
        return new List<MR_UpdateITPDateAction.ActionInput>{ input };
    }

    @testSetup
    static void setup() {
        String env = 'test';
        String submissionId = '12345';
        String submissionStatus = 'initial_processing';
        Opportunity opportunity = MortgagesTestFactory.createOpportunity('test', submissionId, SUBMISSION_UUID, submissionStatus);
    }
    
    @isTest
    static void executed() {
        List<MR_UpdateITPDateAction.ActionInput> inputs = setupInput();
        MR_UpdateITPDateAction.ActionInput input = inputs[0];
        
        HttpCalloutMock httpMock = mockUpdateITPDateCall(SUBMISSION_UUID, input.itpDate);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        MR_UpdateITPDateAction.execute(inputs);
        Test.stopTest();
    }
    
    @isTest
    static void updateNotSucceeded() {
        List<MR_UpdateITPDateAction.ActionInput> inputs = setupInput();
        MR_UpdateITPDateAction.ActionInput input = inputs[0];

        String encompassError = 'Failed to update ITP date for submission with submissionUuid="'+ SUBMISSION_UUID +'".';
        HttpCalloutMock httpMock = mockUpdateITPDateFailure(SUBMISSION_UUID, input.itpDate);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        String errorMessage = null;
        try {
            MR_UpdateITPDateAction.execute(inputs);
            System.assert(false, 'Expected exception at this point.');
        } catch (System.CalloutException e) {
            errorMessage = e.getMessage();
        }
        System.assert(errorMessage.contains(encompassError));
        Test.stopTest();
    }
    
    static String encompassRequest(String submissionUuid, Date itpDate) {
        String loanData = '{\\"submissionUuid\\":\\"' + submissionUuid + '\\",'
            + '\\"loanStatus\\":null,'
            + '\\"lenderLoanNumber\\":null,'
            + '\\"leDate\\":null,'
            + '\\"itpDate\\":\\"2020-11-05\\",'
            + '\\"closingDetails\\":null,'
            + '\\"adverseActionDate\\":null'
            + '}';
        return '{'
            + '"variables":"{\\"loanData\\":' + loanData + '}",'
            + '"operationName":"encompassSystemUpdateLoan",'
            + '"query":"' + MortgagesApiClient.MUTATION_ENCOMPASS_UPDATE_LOAN + '"'
            + '}';
    }
    
    static HttpCalloutMock mockUpdateITPDateCall(String submissionUuid, Date itpDate) {
        String encompassRequest = encompassRequest(submissionUuid, itpDate);
        String encompassResponse = '{"data":{"encompassSystemUpdateLoan":{"status":"success"}}}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', encompassRequest, encompassResponse);
    }
    
    static HttpCalloutMock mockUpdateITPDateFailure(String submissionUuid, Date itpDate) {
        String expectedRequest = encompassRequest(submissionUuid, itpDate);
        String mockedResponse = '{"data":{"encompassSystemUpdateLoan":{"status":"no_success"}}}';
        return new HttpClientMockTest().withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
}