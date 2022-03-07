@isTest
private class MR_RateLockActionTest {
    
  @isTest
  static void executeTest() {
    Opportunity opportunity = MortgagesTestFactory.createOpportunity('test');
    MR_RateLockAction.ActionInput input = setupInput(opportunity.Id);

    List<MR_RateLockAction.ActionInput> inputs = new List<MR_RateLockAction.ActionInput>{ input };
    
    HttpCalloutMock httpMock = mortgageRefiEncompassSelectProductMock(opportunity.mortgage_Submission_UUID__c, input.rateLock);

    Test.setMock(HttpCalloutMock.class, httpMock);
    Test.startTest();
    MR_RateLockAction.execute(inputs);
    Test.stopTest();
  }

  static MR_RateLockAction.ActionInput setupInput(Id opportunityId){
    MR_RateLockAction.ActionInput input = new MR_RateLockAction.ActionInput();
    input.opportunityId = opportunityId;
    input.rateLock = (DateTime)JSON.deserialize('"2020-10-05T16:02:09.648Z"', Datetime.class);
    return input;
  }

  static HttpCalloutMock mortgageRefiEncompassSelectProductMock(String submissionUuid, Datetime rateLock) {
    String expectedRequest =
            '{'
            + '"variables":"{\\"input\\":{\\"rateLocked\\":true,\\"rateLock\\":\\"2020-10-05T16:02:09.648Z\\",\\"submissionUuid\\":\\"' + MortgagesTestFactory.SUBMISSION_UUID +'\\"}}",'
            + '"operationName":"mortgageRefiEncompassSelectProduct",'
            + '"query":"' + MortgagesApiClient.MUTATION_MORTGAGE_REFI_ENCOMPASS_SELECT_PRODUCT + '"'
            + '}';

    String mockedResponse = '{"data":{"mortgageRefiEncompassSelectProduct":{"status":"success"}}}';
    return new HttpClientMockTest()
        .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
  }
}