@isTest
private class MortgagesSubmissionDocumentsTest {
    static final String TASK_UUID_WITH_DOCS = 'task_uuid_with_docs';
    static final String TASK_UUID_WITHOUT_DOCS = 'task_uuid_without_docs';

    @isTest
    static void fetchDocumentsAndTasksForOpportunity() {
        String env = 'test';
        String submission_status = 'initial_processing';
        String stageName = 'Initial Processing';
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(env, null, MortgagesTestFactory.SUBMISSION_UUID, submission_status, stageName, null, null);
        Submission_Task__c submissionTaskWithDocuments = MortgagesTestFactory.createSubmissionTask(MortgagesTestFactory.SUBMISSION_UUID, TASK_UUID_WITH_DOCS, opportunity.Id, true);
        Submission_Task__c submissionTaskWithoutDocuments = MortgagesTestFactory.createSubmissionTask(MortgagesTestFactory.SUBMISSION_UUID, TASK_UUID_WITHOUT_DOCS, opportunity.Id, false);
        Document__c documentWithoutTask = MortgagesTestFactory.createDocumentWithOpportunity(opportunity.Id, MortgagesTestFactory.SUBMISSION_UUID);

        String response = MortgagesSubmissionDocuments.fetchDocuments(opportunity.Id, null, null, null, null);

        System.assert(response != null);
    }

  @isTest
  static void bulkUpdateLenderTagsTest(){
    Document__c document1 = MortgagesTestFactory.createDocument('ownerUuid', 'reference1');
    Document__c document2 = MortgagesTestFactory.createDocument('ownerUuid', 'reference1');

    List<String> documentIds = new List<String> { document1.Id, document2.id };
    List<String> lenderTags = new List<String> { 'CD - Final', 'CD - Preliminary' };
    MortgagesSubmissionDocuments.bulkUpdateLenderTags(documentIds, lenderTags);
  }

  static void mockBulkAddToGDrive(HttpClientMockTest client, List<String> documentIds, String folder) {
    String operationName = 'bulkCopyDocumentToGDrive';
    String expectedRequest = HttpClientMockTest.graphQlRequest(
        operationName,
        MortgagesDocsApiClient.MUTATION_BULK_COPY_DOCUMENT_TO_GDRIVE,
        new Map<String, Object> { 'uuids' => documentIds, 'path' => folder });

    String mockResponse = HttpClientMockTest.graphQlResponse(
        operationName,
        new Map<String, Object> { 'status' => 'success' });

      client.withEndpointExchange(HttpClientMockTest.GRAPHQL_URL, expectedRequest, mockResponse);
  }

  @isTest
  static void bulkAddToGDriveTest() {
    Opportunity opp = MortgagesTestFactory.createOpportunity();
    Document__c document1 = MortgagesTestFactory.createDocument(opp.Id, 'ownerUuid', 'reference1', null);
    Document__c document2 = MortgagesTestFactory.createDocument(opp.Id, 'ownerUuid', 'reference1', null);

    List<String> documentIds = new List<String> { document1.Id, document2.id };
    String uuid1 = MortgagesUtilities.unprefixify(document1.External_ID__c);
    String uuid2 = MortgagesUtilities.unprefixify(document2.External_ID__c);
    List<String> expectedDocumentIds = new List<String> {uuid1,  uuid2};

    String folder = 'folder';

    HttpClientMockTest httpMock = new HttpClientMockTest();
    mockBulkAddToGDrive(httpMock, expectedDocumentIds, 'FirstName_LastName 123/folder');
    Test.setMock(HttpCalloutMock.class, httpMock);

    Test.startTest();
    MortgagesSubmissionDocuments.bulkAddToGDrive(documentIds, folder);
    Test.stopTest();
  }

  @isTest
  static void documentType() {
    Opportunity opp = MortgagesTestFactory.createOpportunity();
    Document__c noCategoryDoc = MortgagesTestFactory.createDocument(opp.Id, 'ownerUuid', 'reference1', null);
    String noCategoryType = MortgagesSubmissionDocuments.documentType(noCategoryDoc);
    System.assert(noCategoryType == 'Other');

    Document__c hoiDoc = MortgagesTestFactory.createDocument(opp.Id, 'ownerUuid', 'reference2', 'HOI');
    String hoiCategoryType = MortgagesSubmissionDocuments.documentType(hoiDoc);
    System.assert(hoiCategoryType == '3rd Party Docs');

    Document__c incomeDoc = MortgagesTestFactory.createDocument(opp.Id, 'ownerUuid', 'reference3', 'Income');
    String incomeType = MortgagesSubmissionDocuments.documentType(incomeDoc);
    System.assert(incomeType == 'Income');
  }

  @isTest
  static void documentStatus() {
    Opportunity opp = MortgagesTestFactory.createOpportunity();
    Document__c document = MortgagesTestFactory.createDocument(opp.Id, 'ownerUuid', 'reference1', null);
    updateDocument(document, 'docusign', 'Uploaded');
    String status = MortgagesSubmissionDocuments.documentStatus(document);
    System.assertEquals('Awaiting Approval', status);

    updateDocument(document, 'docusign', 'Created');
    status = MortgagesSubmissionDocuments.documentStatus(document);
    System.assertEquals('Pending', status);

    updateDocument(document, 'docusign', 'Approved');
    status = MortgagesSubmissionDocuments.documentStatus(document);
    System.assertEquals('Accepted', status);

    updateDocument(document, 'docusign', 'Awaiting Final Signature');
    status = MortgagesSubmissionDocuments.documentStatus(document);
    System.assertEquals('Awaiting Final Signature', status);
  }

  @isTest
  static void documentReferenceForCompletedCreditTask() {
    String env = 'test';
    String submission_status = 'initial_processing';
    String stageName = 'Initial Processing';
    String taskStatus = 'completed';
    String taskType = 'credit';
    Opportunity opportunity = MortgagesTestFactory.createOpportunity(env, null, MortgagesTestFactory.SUBMISSION_UUID, submission_status, stageName, null, null);
    Submission_Task__c completedTask = MortgagesTestFactory.createSubmissionTask(env, MortgagesTestFactory.SUBMISSION_UUID, TASK_UUID_WITH_DOCS, opportunity.Id, taskType, taskStatus);

    String documentReference = MortgagesSubmissionDocuments.documentReference(completedTask);

    System.assert(documentReference == TASK_UUID_WITH_DOCS);
  }

  @isTest
  static void documentReferenceForStartedCreditTask() {
    String env = 'test';
    String submission_status = 'initial_processing';
    String stageName = 'Initial Processing';
    String taskStatus = 'started';
    String taskType = 'credit';
    Opportunity opportunity = MortgagesTestFactory.createOpportunity(env, null, MortgagesTestFactory.SUBMISSION_UUID, submission_status, stageName, null, null);
    Submission_Task__c startedTask = MortgagesTestFactory.createSubmissionTask(env, MortgagesTestFactory.SUBMISSION_UUID, TASK_UUID_WITH_DOCS, opportunity.Id, taskType, taskStatus);

    String documentReference = MortgagesSubmissionDocuments.documentReference(startedTask);

    System.assert(documentReference == TASK_UUID_WITH_DOCS + ':template');
  }

  @isTest
  static void documentReferenceForStartedPropertyTask() {
    String env = 'test';
    String submission_status = 'initial_processing';
    String stageName = 'Initial Processing';
    String taskStatus = 'started';
    String taskType = 'property';
    Opportunity opportunity = MortgagesTestFactory.createOpportunity(env, null, MortgagesTestFactory.SUBMISSION_UUID, submission_status, stageName, null, null);
    Submission_Task__c startedTask = MortgagesTestFactory.createSubmissionTask(env, MortgagesTestFactory.SUBMISSION_UUID, TASK_UUID_WITH_DOCS, opportunity.Id, taskType, taskStatus);

    String documentReference = MortgagesSubmissionDocuments.documentReference(startedTask);

    System.assert(documentReference == TASK_UUID_WITH_DOCS);
  }

  @isTest
  static void getTaskUuid() {
    String reference = TASK_UUID_WITH_DOCS + ':template';
    Opportunity opp = MortgagesTestFactory.createOpportunity();
    Document__c document = MortgagesTestFactory.createDocument(opp.Id, 'ownerUuid', reference, null);

    String taskUuid = MortgagesSubmissionDocuments.getTaskUuid(document);

    System.assertEquals(TASK_UUID_WITH_DOCS, taskUuid);
  }

  @isTest
  static void buildUploadedCreditDocumentWithStartedTask() {
    Opportunity opportunity = MortgagesTestFactory.createOpportunity();
    Boolean hasDocuments = true;
    Submission_Task__c task = MortgagesTestFactory.createSubmissionTask(MortgagesTestFactory.SUBMISSION_UUID, TASK_UUID_WITH_DOCS, opportunity.Id, hasDocuments);
    Document__c document = [SELECT Expiration_Date__c, Name__c, GDrive_Metadata__c, LenderTags__c, Reference__c, Opportunity__c, id, Reviewer__r.Name, category__c, filename__c, status__c, LastModifiedDate, source__c, LastModifiedBy.Name, Document_Upload_Date__c, Most_Recent_Status_Change_Date__c, Last_Modified_By__r.Name FROM Document__c WHERE reference__c =: TASK_UUID_WITH_DOCS];

    //started task with uploaded document
    updateTask(task, 'started', 'credit');
    updateDocument(document, 'docusign', 'Uploaded');
    Map<String, Object> fields = MortgagesSubmissionDocuments.buildDocument(document, 'test');

    System.assertEquals(task.id, fields.get('taskId'));
    System.assertEquals('Outstanding', fields.get('status'));
  }

  @isTest
  static void buildUploadedCreditDocumentWithCompletedTask() {
    Opportunity opportunity = MortgagesTestFactory.createOpportunity();
    Boolean hasDocuments = true;
    Submission_Task__c task = MortgagesTestFactory.createSubmissionTask(MortgagesTestFactory.SUBMISSION_UUID, TASK_UUID_WITH_DOCS, opportunity.Id, hasDocuments);
    Document__c document = [SELECT Expiration_Date__c, Name__c, GDrive_Metadata__c, LenderTags__c, Reference__c, Opportunity__c, id, Reviewer__r.Name, category__c, filename__c, status__c, LastModifiedDate, source__c, LastModifiedBy.Name, Document_Upload_Date__c, Most_Recent_Status_Change_Date__c, Last_Modified_By__r.Name FROM Document__c WHERE reference__c =: TASK_UUID_WITH_DOCS];

    //completed task with uploaded document
    updateTask(task, 'completed', 'credit');
    updateDocument(document, 'docusign', 'Uploaded');
    Map<String, Object> fields = MortgagesSubmissionDocuments.buildDocument(document, 'test');

    System.assertEquals(task.id, fields.get('taskId'));
    System.assertEquals('Accepted', fields.get('status'));
  }

  @isTest
  static void buildApprovedCreditDocumentWithCompletedTask() {
    Opportunity opportunity = MortgagesTestFactory.createOpportunity();
    Boolean hasDocuments = true;
    Submission_Task__c task = MortgagesTestFactory.createSubmissionTask(MortgagesTestFactory.SUBMISSION_UUID, TASK_UUID_WITH_DOCS, opportunity.Id, hasDocuments);
    Document__c document = [SELECT Expiration_Date__c, Name__c, GDrive_Metadata__c, LenderTags__c, Reference__c, Opportunity__c, id, Reviewer__r.Name, category__c, filename__c, status__c, LastModifiedDate, source__c, LastModifiedBy.Name, Document_Upload_Date__c, Most_Recent_Status_Change_Date__c, Last_Modified_By__r.Name FROM Document__c WHERE reference__c =: TASK_UUID_WITH_DOCS];

    //completed task with approved document
    updateTask(task, 'completed', 'credit');
    updateDocument(document, 'docusign', 'Approved');
    Map<String, Object> fields = MortgagesSubmissionDocuments.buildDocument(document, 'test');

    System.assertEquals(task.id, fields.get('taskId'));
    System.assertEquals('Accepted', fields.get('status'));
  }

  @isTest
  static void buildUploadedEsignDocumentWithStartedTask() {
    Opportunity opportunity = MortgagesTestFactory.createOpportunity();
    Boolean hasDocuments = true;
    Submission_Task__c task = MortgagesTestFactory.createSubmissionTask(MortgagesTestFactory.SUBMISSION_UUID, TASK_UUID_WITH_DOCS, opportunity.Id, hasDocuments);
    Document__c document = [SELECT Expiration_Date__c, Name__c, GDrive_Metadata__c, LenderTags__c, Reference__c, Opportunity__c, id, Reviewer__r.Name, category__c, filename__c, status__c, LastModifiedDate, source__c, LastModifiedBy.Name, Document_Upload_Date__c, Most_Recent_Status_Change_Date__c, Last_Modified_By__r.Name FROM Document__c WHERE reference__c =: TASK_UUID_WITH_DOCS];

    //started task with uploaded document
    updateTask(task, 'started', 'e_sign');
    updateDocument(document, 'docusign', 'Uploaded');
    Map<String, Object> fields = MortgagesSubmissionDocuments.buildDocument(document, 'test');

    System.assertEquals(task.id, fields.get('taskId'));
    System.assertEquals('Outstanding', fields.get('status'));
  }

  @isTest
  static void buildApprovedEsignDocumentWithCompletedTask() {
    Opportunity opportunity = MortgagesTestFactory.createOpportunity();
    Boolean hasDocuments = true;
    Submission_Task__c task = MortgagesTestFactory.createSubmissionTask(MortgagesTestFactory.SUBMISSION_UUID, TASK_UUID_WITH_DOCS, opportunity.Id, hasDocuments);
    Document__c document = [SELECT Expiration_Date__c, Name__c, GDrive_Metadata__c, LenderTags__c, Reference__c, Opportunity__c, id, Reviewer__r.Name, category__c, filename__c, status__c, LastModifiedDate, source__c, LastModifiedBy.Name, Document_Upload_Date__c, Most_Recent_Status_Change_Date__c, Last_Modified_By__r.Name FROM Document__c WHERE reference__c =: TASK_UUID_WITH_DOCS];

    //completed task with approved document
    updateTask(task, 'completed', 'e_sign');
    updateDocument(document, 'docusign', 'Approved');
    Map<String, Object> fields = MortgagesSubmissionDocuments.buildDocument(document, 'test');

    System.assertEquals(task.id, fields.get('taskId'));
    System.assertEquals('Accepted', fields.get('status'));
  }

  static void updateDocument(Document__c document, String source, String status) {
    if (document != null) {
      if (source != null) {
        document.source__c = source;
      }
      if (status != null) {
        document.status__c = status;
      }
      update document;
    }
  }

  static void updateTask(Submission_Task__c task, String status, String type) {
    if (task != null) {
      if (status != null) {
        task.status__c = status;
      }
      if (type != null) {
        task.type__c = type;
      }
      update task;
    }
  }
}