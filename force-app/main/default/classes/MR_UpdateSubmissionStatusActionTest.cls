@isTest
private class MR_UpdateSubmissionStatusActionTest {
    static final String SUBMISSION_UUID = '1234-uuid';
    static final String SUBMISSION_ID = '12345';
    static final String STATUS_INITIAL_PROCESSING = 'initial_processing';
    static final String STATUS_BROKER_PROCESSING = 'broker_processing';
    static final String GRAPH_QL_STATUS_BROKER_PROCESSING = 'brokerProcessing';
    static final String ENV = 'test';
    
    @testSetup
    static void setup() {
        MortgagesTestFactory.createOpportunity(ENV, SUBMISSION_ID, SUBMISSION_UUID, STATUS_INITIAL_PROCESSING);
    }

    @isTest
    static void updateStatusForExistingOpportunity() {
        HttpCalloutMock httpMock = mockMortgageRefiSubmissionStatusChanger(GRAPH_QL_STATUS_BROKER_PROCESSING, SUBMISSION_UUID);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Id opportunityId = MortgagesTestFactory.opportunityId();
        Test.startTest();
        MR_UpdateSubmissionStatusAction.execute(input(opportunityId, STATUS_BROKER_PROCESSING));
        Test.stopTest();
    }
    
    @isTest
    static void skipStatusUpdate() {
        String new_status = STATUS_BROKER_PROCESSING;
        Id opportunityId = MortgagesTestFactory.opportunityId();
        prepareSubmissionStatus(opportunityId, new_status);
        HttpClientMockTest httpMock = mockMortgageRefiSubmissionStatusChanger(GRAPH_QL_STATUS_BROKER_PROCESSING, SUBMISSION_UUID);
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();
        MR_UpdateSubmissionStatusAction.execute(input(opportunityId, new_status));
        
        System.assertEquals(0, httpMock.invokedTimes());
        Test.stopTest();
    }

    @isTest
    static void failForUnknownSubmissionStatus() {
        String new_status = 'fake_status';
        Id opportunityId = MortgagesTestFactory.opportunityId();
        String error = null;
        try {
            MR_UpdateSubmissionStatusAction.execute(input(opportunityId, new_status));
        } catch (System.IllegalArgumentException e) {
            error = e.getMessage();
        }
        System.assert(error.contains('Unknown submission status "' + new_status + '".'));
    }
    
    @isTest
    static void failForGraphQlError() {
        Id opportunityId = MortgagesTestFactory.opportunityId();
        String expectedError = 'NotFound';
        HttpCalloutMock httpMock = errorOnMortgageRefiSubmissionStatusChanger(GRAPH_QL_STATUS_BROKER_PROCESSING, SUBMISSION_UUID, expectedError);
        Test.setMock(HttpCalloutMock.class, httpMock);
        String error = null;
        try {
            Test.startTest();
            MR_UpdateSubmissionStatusAction.execute(input(opportunityId, STATUS_BROKER_PROCESSING));
        } catch (MortgagesApplicationClient.GrqphQLException e) {
            error = e.getMessage();
        }
        System.assert(error.contains(expectedError));
        Test.stopTest();
    }
    
    @isTest
    static void notValidStatus() {
        String new_status = STATUS_INITIAL_PROCESSING;
        Id opportunityId = MortgagesTestFactory.opportunityId();
        String error = null;
        try {
            MR_UpdateSubmissionStatusAction.execute(input(opportunityId, new_status));
        } catch (System.IllegalArgumentException e) {
            error = e.getMessage();
        }
        System.assert(error.contains('Status "' + new_status + '" is not allowed for this operation.'));
    }
    
    static HttpClientMockTest mockMortgageRefiSubmissionStatusChanger(String submissionStatus, String submissionUuid) {
        String expectedRequest =
            '{'
                + '"variables":"{\\"status\\":\\"' + submissionStatus + '\\",\\"uuid\\":\\"' + submissionUuid + '\\"}",'
                + '"operationName":"mortgageRefiSubmissionStatusChanger",'
                + '"query":"' + MortgagesApiClient.MUTATION_MORTGAGE_REFI_SUBMISSION_STATUS_CHANGER + '"'
                + '}';
        String mockedResponse = '{"data":{"mortgageRefiSubmissionStatusChanger":{"uuid":"' + submissionUuid + '"}}}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
    
    static HttpClientMockTest errorOnMortgageRefiSubmissionStatusChanger(String submissionStatus, String submissionUuid, String errorMessage) {
        String expectedRequest =
            '{'
                + '"variables":"{\\"status\\":\\"' + submissionStatus + '\\",\\"uuid\\":\\"' + submissionUuid + '\\"}",'
                + '"operationName":"mortgageRefiSubmissionStatusChanger",'
                + '"query":"' + MortgagesApiClient.MUTATION_MORTGAGE_REFI_SUBMISSION_STATUS_CHANGER + '"'
                + '}';
        String mockedResponse = '{"errors":[{"message":"' + errorMessage + '","realm":"Basic","code":"0001"}]}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
    
    static List<MR_UpdateSubmissionStatusAction.ActionInput> input(Id opportunityId, String submissionStatus) {
        MR_UpdateSubmissionStatusAction.ActionInput input = new MR_UpdateSubmissionStatusAction.ActionInput();
        input.opportunityId = opportunityId;
        input.submissionStatus = submissionStatus;
        return new List<MR_UpdateSubmissionStatusAction.ActionInput>{ input };
    }
    
    static void prepareSubmissionStatus(Id opportunityId, String submissionStatus) {
        Opportunity opportunity =
            [SELECT id, submission_status__c FROM Opportunity WHERE id =:opportunityId];
        opportunity.submission_status__c = submissionStatus;
        update opportunity;
    }
}