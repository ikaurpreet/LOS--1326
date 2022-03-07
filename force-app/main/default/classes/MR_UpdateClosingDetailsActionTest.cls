@isTest
public inherited sharing class MR_UpdateClosingDetailsActionTest {
    static final String SUBMISSION_UUID = '1234-uuid';
    static final String CD_SENT_DATE = '"2020-11-05"';
    static final String CLOSING_DATE = '"2020-11-06"';
   
    static List<MR_UpdateClosingDetailsAction.ActionInput> setupInput() {
        MR_UpdateClosingDetailsAction.ActionInput input = new MR_UpdateClosingDetailsAction.ActionInput();
        input.opportunityId = MortgagesTestFactory.opportunityId();
        input.cdSentDate = (Date)JSON.deserialize(CD_SENT_DATE, Date.class);
        input.disbursementDate = (Date)JSON.deserialize(CLOSING_DATE, Date.class);
        input.closingDate = (Date)JSON.deserialize(CLOSING_DATE, Date.class);
        input.paymentMethod = 'Wire';
        input.wireAmount = 120.12;
        return new List<MR_UpdateClosingDetailsAction.ActionInput>{ input };
    }

    @testSetup
    static void setup() {
        String env = 'test';
        String submissionId = SUBMISSION_UUID;
        String submissionStatus = 'initial_processing';
        
        Opportunity opportunity = MortgagesTestFactory.createOpportunity('test', submissionId, SUBMISSION_UUID, submissionStatus);
    }

    @isTest
    static void executed() {
        List<MR_UpdateClosingDetailsAction.ActionInput> inputs = setupInput();
        
        HttpCalloutMock httpMock = mockUpdateClosingDetailsCall(SUBMISSION_UUID);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        MR_UpdateClosingDetailsAction.execute(inputs);
        Test.stopTest();
    }

    @isTest
    static void updateNotSucceeded() {
        List<MR_UpdateClosingDetailsAction.ActionInput> inputs = setupInput();
        
        String encompassError = 'Failed to update Closing Details for submission with submissionUuid="'+ SUBMISSION_UUID +'".';
        HttpCalloutMock httpMock = mockUpdateClosingDetailsFailure(SUBMISSION_UUID);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        String errorMessage = null;
        try {
            MR_UpdateClosingDetailsAction.execute(inputs);
            System.assert(false, 'Expected exception at this point.');
        } catch (System.CalloutException e) {
            errorMessage = e.getMessage();
        }
        System.assert(errorMessage.contains(encompassError));
        Test.stopTest();
    }

    static String encompassRequest(String submissionUuid) {
        String loanData = '{\\"submissionUuid\\":\\"' + submissionUuid + '\\",'
            + '\\"loanStatus\\":null,'
            + '\\"lenderLoanNumber\\":null,'
            + '\\"leDate\\":null,'
            + '\\"itpDate\\":null,'
            + '\\"closingDetails\\":{'
            + '\\"wireAmount\\":120.12,'
            + '\\"paymentMethod\\":\\"Wire\\",'
            + '\\"disbursementDate\\":\\"2020-11-06\\",'
            + '\\"closingDate\\":\\"2020-11-06\\",'
            + '\\"closedLoanAmount\\":null,'
            + '\\"cdSentDate\\":\\"2020-11-05\\"'
            + '},'
            + '\\"adverseActionDate\\":null'
            + '}';
        return '{'
            + '"variables":"{\\"loanData\\":' + loanData + '}",'
            + '"operationName":"encompassSystemUpdateLoan",'
            + '"query":"' + MortgagesApiClient.MUTATION_ENCOMPASS_UPDATE_LOAN + '"'
            + '}';
    }

    static HttpCalloutMock mockUpdateClosingDetailsCall(String submissionUuid) {
        String encompassRequest = encompassRequest(submissionUuid);
        String encompassResponse = '{"data":{"encompassSystemUpdateLoan":{"status":"success"}}}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', encompassRequest, encompassResponse);
    }

    static HttpCalloutMock mockUpdateClosingDetailsFailure(String submissionUuid) {
        String expectedRequest = encompassRequest(submissionUuid);
        String mockedResponse = '{"data":{"encompassSystemUpdateLoan":{"status":"no_success"}}}';
        return new HttpClientMockTest().withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
}