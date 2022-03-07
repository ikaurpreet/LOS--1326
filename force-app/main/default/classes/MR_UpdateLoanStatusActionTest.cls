@isTest
private class MR_UpdateLoanStatusActionTest {
    static final String SUBMISSION_UUID = '1234-uuid';
    static final String SUBMISSION_STATUS = 'closed_loan';
    static final String LOAN_STATUS = 'closedLoan';

    @testSetup
    static void setup() {
        String env = 'test';
        String submissionId = '12345';
        MortgagesTestFactory.createOpportunity(env, submissionId, SUBMISSION_UUID, SUBMISSION_STATUS);
    }
    
    @isTest
    static void executed() {
        HttpCalloutMock httpMock = mockUpdateLoanStatusCall(SUBMISSION_UUID, LOAN_STATUS);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        MR_UpdateLoanStatusAction.execute(input(SUBMISSION_STATUS));
        Test.stopTest();
    }
    
    
    @isTest
    static void updateNotSucceeded() {
        String encompassError = 'Failed to update lender loan status for submission with submissionUuid="'+ SUBMISSION_UUID +'".';
        HttpCalloutMock httpMock = mockUpdateLoanStatusFailure(SUBMISSION_UUID, LOAN_STATUS);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        String errorMessage = null;
        try {
            MR_UpdateLoanStatusAction.execute(input(SUBMISSION_STATUS));
            System.assert(false, 'Expected exception at this point.');
        } catch (System.CalloutException e) {
            errorMessage = e.getMessage();
        }
        System.assert(errorMessage.contains(encompassError));
        Test.stopTest();
    }
    
    @isTest
    static void noMatchingLoanStatus() {
        String newSubmissionStatus = 'broker_processing';
        String expectedError = 'No loan status matches to the submission status "' + newSubmissionStatus + '".';
        String errorMessage = null;
        try {
            MR_UpdateLoanStatusAction.execute(input(newSubmissionStatus));
            System.assert(false, 'Expected exception at this point.');
        } catch (System.IllegalArgumentException e) {
            errorMessage = e.getMessage();
        }
        System.assert(errorMessage.contains(expectedError));
    }

    static List<MR_UpdateLoanStatusAction.ActionInput> input(String submissionStatus) {
        MR_UpdateLoanStatusAction.ActionInput input = new MR_UpdateLoanStatusAction.ActionInput();
        input.opportunityId = MortgagesTestFactory.opportunityId();
        input.submissionStatus = submissionStatus;
        return new List<MR_UpdateLoanStatusAction.ActionInput> { input };
    }
    
    static String request(String submissionUuid, String loanStatus) {
        String loanData = '{\\"submissionUuid\\":\\"' + submissionUuid + '\\",'
            + '\\"loanStatus\\":\\"' + loanStatus + '\\",'
            + '\\"lenderLoanNumber\\":null,'
            + '\\"leDate\\":null,'
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
    
    static HttpCalloutMock mockUpdateLoanStatusCall(String submissionUuid, String loanStatus) {
        String expectedRequest = request(submissionUuid, loanStatus);
        String mockedResponse = '{"data":{"encompassSystemUpdateLoan":{"status":"success"}}}';
        return new HttpClientMockTest().withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
    
    static HttpCalloutMock mockUpdateLoanStatusFailure(String submissionUuid, String loanStatus) {
        String expectedRequest = request(submissionUuid, loanStatus);
        String mockedResponse = '{"data":{"encompassSystemUpdateLoan":{"status":"no_success"}}}';
        return new HttpClientMockTest().withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
}