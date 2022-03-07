@isTest
private class MR_UpdateLoanNumberActionTest {
    static final String SUBMISSION_UUID = '1234-uuid';
    static final String LOAN_NUMBER = 'number-1';
    @testSetup
    static void setup() {
        String env = 'test';
        String submissionId = '12345';
        String submissionStatus = 'initial_processing';
        MortgagesTestFactory.createOpportunity(env, submissionId, SUBMISSION_UUID, submissionStatus);
    }
    
    @isTest
    static void executed() {
        HttpCalloutMock httpMock = mockUpdateLoanNumberCall(SUBMISSION_UUID, LOAN_NUMBER);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        MR_UpdateLoanNumberAction.execute(input(LOAN_NUMBER));
        Test.stopTest();
    }
    
    @isTest
    static void updateNotSucceeded() {
        String encompassError = 'Failed to update lender loan number for submission with submissionUuid="'+ SUBMISSION_UUID +'".';
        HttpCalloutMock httpMock = mockUpdateLoanNumberFailure(SUBMISSION_UUID, LOAN_NUMBER);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        String errorMessage = null;
        try {
            MR_UpdateLoanNumberAction.execute(input(LOAN_NUMBER));
            System.assert(false, 'Expected exception at this point.');
        } catch (System.CalloutException e) {
            errorMessage = e.getMessage();
        }
        System.assert(errorMessage.contains(encompassError));
        Test.stopTest();
    }
    
    static List<MR_UpdateLoanNumberAction.ActionInput> input(String loanNumber) {
        MR_UpdateLoanNumberAction.ActionInput input = new MR_UpdateLoanNumberAction.ActionInput();
        input.opportunityId = MortgagesTestFactory.opportunityId();
        input.lenderLoanNumber = loanNumber;
        return new List<MR_UpdateLoanNumberAction.ActionInput> { input };
    }
    
    static String encompassRequest(String submissionUuid, String loanNumber) {
        String loanData = '{\\"submissionUuid\\":\\"' + submissionUuid + '\\",'
            + '\\"loanStatus\\":null,'
            + '\\"lenderLoanNumber\\":\\"' + loanNumber + '\\",'
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
    
    static String mortgagesRequest(String submissionUuid, String loanNumber) {
        return '{'
            + '"variables":"{\\"lenderLoanNumber\\":\\"' + loanNumber + '\\",\\"submissionUuid\\":\\"' + submissionUuid + '\\"}",'
            + '"operationName":"mortgageAdminSaveLenderLoanNumber",'
            + '"query":"' + MortgagesApiClient.MUTATION_MORTGAGE_ADMIN_SAVE_LENDER_LOAN_NUMBER + '"'
            + '}';
    }
    
    static HttpCalloutMock mockUpdateLoanNumberCall(String submissionUuid, String loanNumber) {
        String encompassRequest = encompassRequest(submissionUuid, loanNumber);
        String encompassResponse = '{"data":{"encompassSystemUpdateLoan":{"status":"success"}}}';
        String mortgagesRequest = mortgagesRequest(submissionUuid, loanNumber);
        String mortgagesResponse = '{"data":{"mortgageAdminSaveLenderLoanNumber":true}}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', encompassRequest, encompassResponse)
            .withEndpointExchange('graphqlUrl', mortgagesRequest, mortgagesResponse);
    }
    
    static HttpCalloutMock mockUpdateLoanNumberFailure(String submissionUuid, String loanNumber) {
        String expectedRequest = encompassRequest(submissionUuid, loanNumber);
        String mockedResponse = '{"data":{"encompassSystemUpdateLoan":{"status":"no_success"}}}';
        return new HttpClientMockTest().withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
}