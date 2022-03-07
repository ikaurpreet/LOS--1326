@isTest
private class MortgagesTeamManagerTest {
    static final String SUBMISSION_UUID = 'sub_uuid';
    static final String ENV = 'test';
    
    @isTest
    static void updateLoanOfficer() {
        String loanOfficerId = 'LO_1';
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(ENV, null, SUBMISSION_UUID, null);
        MortgagesTestFactory.opportunityWithMortgageTeam(opportunity, loanOfficerId, null, null, null);
        HttpClientMockTest httpClient = mockAssignLoanOfficer(SUBMISSION_UUID, loanOfficerId);
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, httpClient);
        
        MortgagesTeamManager.syncUpdateLoanOfficer(opportunity.Id);
        Test.stopTest();
    }
    
    @isTest
    static void updateLoanCoordinator(){
        String loanCoordinatorId = 'LC_1';
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(ENV, null, SUBMISSION_UUID, null);
        MortgagesTestFactory.opportunityWithMortgageTeam(opportunity, null, loanCoordinatorId, null, null);
        HttpClientMockTest httpClient = mockAssignLoanCoordinator(SUBMISSION_UUID, loanCoordinatorId);
        Test.setMock(HttpCalloutMock.class, httpClient);
    
        Test.startTest();
        MortgagesTeamManager.syncUpdateLoanCoordinator(opportunity.Id);
        Test.stopTest();
    }
    
    @isTest
    static void updateLoanProcessor(){
        String loanProcessorId = 'LP_1';
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(ENV, null, SUBMISSION_UUID, null);
        MortgagesTestFactory.opportunityWithMortgageTeam(opportunity, null, null, loanProcessorId, null);
        HttpClientMockTest httpClient = mockAssignLoanProcessor(SUBMISSION_UUID, loanProcessorId);
        Test.setMock(HttpCalloutMock.class, httpClient);
    
        Test.startTest();
        MortgagesTeamManager.syncUpdateLoanProcessor(opportunity.Id);
        Test.stopTest();
    }
    
    @isTest
    static void updateLoanCloser(){
        String loanCloserId = 'LCC_1';
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(ENV, null, SUBMISSION_UUID, null);
        MortgagesTestFactory.opportunityWithMortgageTeam(opportunity, null, null, null, loanCloserId);
        HttpClientMockTest httpClient = mockAssignLoanCloser(SUBMISSION_UUID, loanCloserId);
        Test.setMock(HttpCalloutMock.class, httpClient);
    
        Test.startTest();
        MortgagesTeamManager.syncUpdateLoanCloser(opportunity.Id);
        Test.stopTest();
    }
    
    static HttpClientMockTest mockAssignLoanCloser(String submissionUuid, String loanCloserId) {
        String query = MortgagesApiClient.MUTATION_SALESFORCE_ASSIGN_LOAN_CLOSER;
        String operationName = 'salesforceAssignLoanCloser';
        Map<String, Object> variables = variables(submissionUuid, loanCloserId);
        String request = graphQlRequest(operationName, query, variables);
    
        String response =  graphQlResponse(operationName, true);
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', request, response);
    }
    
    static HttpClientMockTest mockAssignLoanProcessor(String submissionUuid, String loanProcessorId) {
        String query = MortgagesApiClient.MUTATION_SALESFORCE_ASSIGN_LOAN_PROCESSOR;
        String operationName = 'salesforceAssignLoanProcessor';
        Map<String, Object> variables = variables(submissionUuid, loanProcessorId);
        String request = graphQlRequest(operationName, query, variables);
    
        String response =  graphQlResponse(operationName, true);
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', request, response);
    }
    
    static HttpClientMockTest mockAssignLoanCoordinator(String submissionUuid, String loanCoordinatorId) {
        String query = MortgagesApiClient.MUTATION_SALESFORCE_ASSIGN_LOAN_COORDINATOR;
        String operationName = 'salesforceAssignLoanCoordinator';
        Map<String, Object> variables = variables(submissionUuid, loanCoordinatorId);
        String request = graphQlRequest(operationName, query, variables);
    
        String response =  graphQlResponse(operationName, true);
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', request, response);
    }
    
    static HttpClientMockTest mockAssignLoanOfficer(String submissionUuid, String loanOfficerId) {
        String query = MortgagesApiClient.MUTATION_SALESFORCE_ASSIGN_LOAN_OFFICER;
        String operationName = 'salesforceAssignLoanOfficer';
        Map<String, Object> variables = variables(submissionUuid, loanOfficerId);
        String request = graphQlRequest(operationName, query, variables);
    
        String response =  graphQlResponse(operationName, true);
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', request, response);
    }
    
    static Map<String, Object> variables(String submissionUuid, String userId) {
        return new Map<String, Object> { 'submissionUuid' => submissionUuid, 'userId' => userId };
    }
    
    //TODO: reuse the same methods from HttpClientMock after merging  https://github.com/crediblelabs/credible-salesforce/pull/233
    static String graphQlRequest(String operationName, String query, Map<String, Object> variables) {
        String queryVariables = JSON.serialize(variables);
        return JSON.serialize(new Map<String, Object> { 'query' => query, 'operationName' => operationName, 'variables' => queryVariables });
    }
    
    static String graphQlResponse(String operationName, Object responseData) {
        String document = JSON.serialize(responseData);
        return  '{"data":{"' + operationName + '":' + document + '}}';
    }
}