@isTest
private class MR_ActionsTest {
    static final String SUBMISSION_UUID = '1234-uuid';
    @testSetup
    static void setup() {
        String env = 'test';
        String submissionId = '12345';
        String submissionStatus = 'initial_processing';
        MortgagesTestFactory.createOpportunity(env, submissionId, SUBMISSION_UUID, submissionStatus);
    }
    
    @isTest
    static void getSubmissionUuidOfOpportunity() {
        String actualSubmissionUuid = MR_Actions.submissionUuidForOpportunity(getOpportunityId());
        
        System.assertEquals(SUBMISSION_UUID, actualSubmissionUuid);
    }
    
    @isTest
    static void resolveApiClient() {
        Test.setMock(HttpCalloutMock.class, new HttpClientMockTest());
        Test.startTest();
        MortgagesApiClient client = MR_Actions.resolveMortgagesApiClient(getOpportunityId());
        
        System.assert(client != null);
        Test.stopTest();
    }
    
    private static Id getOpportunityId() {
        List<Opportunity> opportunities = [SELECT id FROM Opportunity LIMIT 1];
        return opportunities[0].Id;
    }
}