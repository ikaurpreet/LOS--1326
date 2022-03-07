@isTest
private class MR_LockExpirationDateActionTest {

  @isTest
  static void executeTest() {
    Opportunity opportunity = MortgagesTestFactory.createOpportunity('test');
    MR_LockExpirationDateAction.ActionInput input = setupInput(opportunity.Id);

    List<MR_LockExpirationDateAction.ActionInput> inputs = new List<MR_LockExpirationDateAction.ActionInput>{ input };
    
    HttpCalloutMock httpMock = mortgageEncompassUpdateTasksMock(opportunity.mortgage_Submission_UUID__c, input.lockExpirationDate);

    Test.setMock(HttpCalloutMock.class, httpMock);
    Test.startTest();
    MR_LockExpirationDateAction.execute(inputs);
    Test.stopTest();
  }

  static MR_LockExpirationDateAction.ActionInput setupInput(Id opportunityId){
    MR_LockExpirationDateAction.ActionInput input = new MR_LockExpirationDateAction.ActionInput();
    input.opportunityId = opportunityId;
    input.lockExpirationDate = (Datetime)JSON.deserialize('"2020-11-05T16:02:09.648Z"', Datetime.class);
    return input;
  }

  static HttpCalloutMock mortgageEncompassUpdateTasksMock(String submissionUuid, Datetime rateLock) {
    String expectedRequest =
            '{'
            + '"variables":"{\\"input\\":{\\"tasks\\":[{\\"value\\":\\"2020-11-05T16:02:09.648Z\\",\\"type\\":\\"lockExpirationDate\\"}],\\"submissionUuid\\":\\"' + MortgagesTestFactory.SUBMISSION_UUID +'\\"}}",'
            + '"operationName":"mortgageEncompassUpdateTasks",'
            + '"query":"' + MortgagesApiClient.MUTATION_MORTGAGE_ENCOMPASS_UPDATE_TASKS + '"'
            + '}';

    String mockedResponse = '{"data":{"mortgageEncompassUpdateTasks":{"status":"success"}}}';
    return new HttpClientMockTest()
        .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
  }
}