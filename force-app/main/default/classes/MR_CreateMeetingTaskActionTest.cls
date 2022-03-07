@isTest
private class MR_CreateMeetingTaskActionTest {

  @isTest
  static void executeTest() {
    Account account = MortgagesTestFactory.createAccount('user_id__c');
    Opportunity opportunity = MortgagesTestFactory.createOpportunity(account);
    List<MR_CreateMeetingTaskAction.Variable> variables = new List<MR_CreateMeetingTaskAction.Variable>{ setupVariables(opportunity.Id, 'thirdPartyDocs') };

    HttpCalloutMock httpMock = createMeetingTaskMock();
    Test.setMock(HttpCalloutMock.class, httpMock);
    Test.startTest();
    MR_CreateMeetingTaskAction.execute(variables);
    Test.stopTest();
  }

  @isTest
  static void executeArgumentExceptionTest() {
    String error;
    Opportunity opportunity = MortgagesTestFactory.createOpportunity('test');
    List<MR_CreateMeetingTaskAction.Variable> variables = new List<MR_CreateMeetingTaskAction.Variable>{ setupVariables(opportunity.Id, 'test') };
    try {
      MR_CreateMeetingTaskAction.execute(variables);
    } catch (MR_MeetingTaskFactory.ArgumentException e) {
      error = e.getMessage();
    }

    System.assertEquals(error, 'subtype should be within (loanLock, thirdPartyDocs, closing)');
  }

  static MR_CreateMeetingTaskAction.Variable setupVariables(Id opportunityId, String subtype){
    MR_CreateMeetingTaskAction.Variable variables = new MR_CreateMeetingTaskAction.Variable();
    variables.opportunityId = opportunityId;
    variables.subtype = subtype;
    return variables;
  }

  static HttpCalloutMock createMeetingTaskMock() {
    String expectedRequest = new stringBuilder(new List<String> {
      '{',
        '"variables":"{\\"task\\":{\\"subtype\\":\\"thirdPartyDocs\\",\\"title\\":\\"Schedule appraisal\\",\\"description\\":\\"Schedule a call to discuss appraisal details\\",\\"associateRole\\":\\"loanOfficer\\",\\"participantRole\\":\\"borrower\\",\\"ownerUuid\\":\\"user_id__c\\",\\"submissionUuid\\":\\"' + MortgagesTestFactory.SUBMISSION_UUID + '\\",\\"type\\":\\"call\\"}}",',
        '"operationName":"createMeetingTask",',
        '"query":"mutation createMeetingTask($task: MeetingTaskItemInput) { createMeetingTask(task: $task) { uuid items { uuid } } } "',
      '}'}).toString();

    String mockedResponse = '{"data":{"createMeetingTask":{"status":"success"}}}';
    return new HttpClientMockTest()
        .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
  }
}