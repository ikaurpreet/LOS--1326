@isTest
private class MortgagesOrderTitleControllerTest {
    @isTest
    static void getSubmission() {
        Opportunity opportunity = MortgagesTestFactory.createOpportunity('test');
        Custom_Task__c customTask = MortgagesTestFactory.createCustomTasks(opportunity);
        
        String submission = MortgagesOrderTitleController.getSubmission(customTask.Id);
        
        System.assert(submission != null);
        System.assert(submission.contains('"vertical":"MortgageRefi"'));
        System.assert(submission.contains('"isRefinance":true'));
        System.assert(submission.contains('"isPurchase":false'));
        System.assert(submission.contains('"status":"fullFormInProgress"'));
    }
    
    @isTest
    static void createSpruceOrder() {
        String submissionUuid = 'submission-uuid';
        String submissionStatus = 'initial_processing';
        String stageName= 'Initial Processing';
        String env = 'Test';
        String orderUuid = 'order-uuid';
        
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(env, null, submissionUuid, submissionStatus, stageName, 'refinance', null);
        Custom_Task__c spruceTask = MortgagesTestFactory.createSpruceTasks(opportunity);
        
        HttpClientMockTest httpClientMock = new HttpClientMockTest();
        mockGetSpruceOrder(httpClientMock, submissionUuid, orderUuid);
        mockInitSpruceOrder(httpClientMock, submissionUuid, orderUuid);
        mockCreateSpruceOrder(httpClientMock, submissionUuid, orderUuid);
        Test.setMock(HttpCalloutMock.class, httpClientMock);
        
        Test.startTest();
        MortgagesOrderTitleController.createSpruceOrder(submissionUuid, spruceTask.Id, env);
        
        
        Test.stopTest();
    }

    static void mockGetSpruceOrder(HttpClientMockTest httpMock, String submissionUuid, String orderUuid) {
        String operationName = 'spruceLocalOrder';
        String expectedRequest = HttpClientMockTest.graphQlRequest(
            operationName,
            MortgagesApiClient.QUERY_GET_SPRUCE_ORDER,
            new Map<String, Object> { 'submissionUuid' => submissionUuid });
    
        String mockResponse = HttpClientMockTest.graphQlResponse(
            operationName,
            new Map<String, Object> { 'uuid' => orderUuid, 'status' => 'success' });
    
        httpMock.withEndpointExchange(HttpClientMockTest.GRAPHQL_URL, expectedRequest, mockResponse);
    }
    
    static void mockCreateSpruceOrder(HttpClientMockTest httpMock, String submissionUuid, String orderUuid) {
        String operationName = 'createSpruceOrder';
        String expectedRequest = HttpClientMockTest.graphQlRequest(
            operationName,
            MortgagesApiClient.MUTATION_CREATE_SPRUCE_ORDER,
            new Map<String, Object> { 'submissionUuid' => submissionUuid });
    
        String mockResponse = HttpClientMockTest.graphQlResponse(
            operationName,
            new Map<String, Object> { 'uuid' => orderUuid, 'status' => 'success' });
    
        httpMock.withEndpointExchange(HttpClientMockTest.GRAPHQL_URL, expectedRequest, mockResponse);
    
    }
    
    static void mockInitSpruceOrder(HttpClientMockTest httpMock, String submissionUuid, String orderUuid) {
        String operationName = 'createInitialSpruceOrder';
        String expectedRequest = HttpClientMockTest.graphQlRequest(
            operationName,
            MortgagesApiClient.MUTATION_CREATE_INITIAL_SPRUCE_ORDER,
            new Map<String, Object> { 'submissionUuid' => submissionUuid });
        
        String mockResponse = HttpClientMockTest.graphQlResponse(
            operationName,
            new Map<String, Object> { 'uuid' => orderUuid, 'status' => 'success' });
        
        httpMock.withEndpointExchange(HttpClientMockTest.GRAPHQL_URL, expectedRequest, mockResponse);
    }
}