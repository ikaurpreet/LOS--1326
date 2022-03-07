@isTest
private class MR_SubmitMeetingTaskActionTest {

  @isTest
  static void executeTest() {
    Opportunity opportunity = MortgagesTestFactory.createOpportunity('test');
    insert new Submission_Task__c(Opportunity__c = opportunity.Id, Status__c = 'started', Title__c = 'Schedule appraisal', Submission_Uuid__c = opportunity.mortgage_Submission_UUID__c, Type__c = 'meeting', Uuid__c = 'uuid');
    List<MR_SubmitMeetingTaskAction.Variable> variables = new List<MR_SubmitMeetingTaskAction.Variable>{ setupVariables(opportunity.Id, 'thirdPartyDocs') };

    HttpCalloutMock httpMock = createMeetingTaskMock();
    Test.setMock(HttpCalloutMock.class, httpMock);
    Test.startTest();
    MR_SubmitMeetingTaskAction.execute(variables);
    Test.stopTest();
  }

  @isTest
  static void executeArgumentExceptionTest() {
    String error;
    Opportunity opportunity = MortgagesTestFactory.createOpportunity('test');
    List<MR_SubmitMeetingTaskAction.Variable> variables = new List<MR_SubmitMeetingTaskAction.Variable>{ setupVariables(opportunity.Id, 'test') };
    try {
      MR_SubmitMeetingTaskAction.execute(variables);
    } catch (MR_MeetingTaskFactory.ArgumentException e) {
      error = e.getMessage();
    }

    System.assertEquals(error, 'subtype should be within (loanLock, thirdPartyDocs, closing)');
  }

  static MR_SubmitMeetingTaskAction.Variable setupVariables(Id opportunityId, String subtype){
    MR_SubmitMeetingTaskAction.Variable variables = new MR_SubmitMeetingTaskAction.Variable();
    variables.opportunityId = opportunityId;
    variables.subtype = subtype;
    return variables;
  }

  static HttpCalloutMock createMeetingTaskMock() {
    String expectedRequest = new stringBuilder(new List<String> {
        '{',
          '"variables":"{\\"event\\":\\"submit\\",\\"taskItemUuid\\":\\"uuid\\"}",',
          '"operationName":"fireTaskItemEvent",',
          '"query":"mutation fireTaskItemEvent($taskItemUuid: ID!, $event: String!) { fireTaskItemEvent(taskItemUuid: $taskItemUuid, event: $event) { uuid } } "',
        '}'
     }).toString();

    String mockedResponse = '{"data":{"fireTaskItemEvent":{"status":"success"}}}';
    return new HttpClientMockTest()
        .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
  }
}