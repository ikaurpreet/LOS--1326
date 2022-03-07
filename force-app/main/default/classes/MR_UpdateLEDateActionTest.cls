@isTest
private class MR_UpdateLEDateActionTest {
    static final String SUBMISSION_UUID = '1234-uuid';
    static final String LE_DATE = '"2020-11-06"';

    static List<MR_UpdateLEDateAction.ActionInput> setupInput() {
        MR_UpdateLEDateAction.ActionInput input = new MR_UpdateLEDateAction.ActionInput();
        input.opportunityId = MortgagesTestFactory.opportunityId();
        input.leDate = (Date)JSON.deserialize(LE_DATE, Date.class);
        return new List<MR_UpdateLEDateAction.ActionInput>{ input };
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
        List<MR_UpdateLEDateAction.ActionInput> inputs = setupInput();
        MR_UpdateLEDateAction.ActionInput input = inputs[0];
        
        HttpCalloutMock httpMock = mockUpdateLEDateCall(SUBMISSION_UUID, input.leDate);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        MR_UpdateLEDateAction.execute(inputs);
        Test.stopTest();
    }
    
    @isTest
    static void updateNotSucceeded() {
        List<MR_UpdateLEDateAction.ActionInput> inputs = setupInput();
        MR_UpdateLEDateAction.ActionInput input = inputs[0];

        String encompassError = 'Failed to update LE date for submission with submissionUuid="'+ SUBMISSION_UUID +'".';
        HttpCalloutMock httpMock = mockUpdateLEDateFailure(SUBMISSION_UUID, input.leDate);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        String errorMessage = null;
        try {
            MR_UpdateLEDateAction.execute(inputs);
            System.assert(false, 'Expected exception at this point.');
        } catch (System.CalloutException e) {
            errorMessage = e.getMessage();
        }
        System.assert(errorMessage.contains(encompassError));
        Test.stopTest();
    }
    
    static String encompassRequest(String submissionUuid, Date leDate) {
        String loanData = '{\\"submissionUuid\\":\\"' + submissionUuid + '\\",'
            + '\\"loanStatus\\":null,'
            + '\\"lenderLoanNumber\\":null,'
            + '\\"leDate\\":\\"2020-11-06\\",'
            + '\\"itpDate\\":null,'
            + '\\"closingDetails\\":null,'
            + '\\"adverseActionDate\\":null'
            + '}';
        return '{'
            + '"variables":"{\\"loanData\\":' + loanData + '}",'
            + '"operationName":"encompassSystemUpdateLoan",'
            + '"query":"' + MortgagesApiClient.MUTATION_ENCOMPASS_UPDATE_LOAN + '"'
            + '}';
    }
    
    static HttpCalloutMock mockUpdateLEDateCall(String submissionUuid, Date leDate) {
        String encompassRequest = encompassRequest(submissionUuid, leDate);
        String encompassResponse = '{"data":{"encompassSystemUpdateLoan":{"status":"success"}}}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', encompassRequest, encompassResponse);
    }
    
    static HttpCalloutMock mockUpdateLEDateFailure(String submissionUuid, Date leDate) {
        String expectedRequest = encompassRequest(submissionUuid, leDate);
        String mockedResponse = '{"data":{"encompassSystemUpdateLoan":{"status":"no_success"}}}';
        return new HttpClientMockTest().withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
}