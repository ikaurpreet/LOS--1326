@isTest
private class MortgagesRekeyComponentControllerTest {

  // @isTest
  // public static void changeProduct() {
  //   stubGraphqlClient();
  //   Opportunity opportunity = createOpportunity('Initial Processing');
  //   Integer productId = 1;

  //   Boolean result = MortgagesRekeyComponentController.changeProduct(opportunity.mortgage_Submission_uuid__c, productId, 'test');

  //   System.assertEquals(true, result);
  // }

  @isTest
  static void moveRelationshipsTest(){
    
    Opportunity opportunityFrom = MortgagesTestFactory.createOpportunity();
    Opportunity opportunityTo = MortgagesTestFactory.createOpportunity();
    Custom_Task__c customTask = MortgagesTestFactory.createSpruceTasks(opportunityFrom);

    MortgagesRekeyComponentController.moveRelationships(opportunityFrom, opportunityTo);

    System.assertEquals(opportunityFrom.Id, [SELECT Opportunity__c FROM Custom_Task__c where Id =: customTask.id].Opportunity__c);
  } 

  @isTest
  static void copyRelationshipsTest(){
    
    Opportunity opportunityFrom = MortgagesTestFactory.createOpportunity();
    Opportunity opportunityTo = MortgagesTestFactory.createOpportunity();

    Document__c document = new Document__c();
    document.owner_uuid__c = 'owner_uuid';
    document.reference__c = 'uuid';
    document.name__c = 'name';
    document.external_id__c = 'test_uuid';
    document.status__c = 'Uploaded';
    document.category__c = 'Econsent';
    document.opportunity__c = opportunityFrom.id;

    insert document;

    MortgagesRekeyComponentController.copyRelationships(opportunityFrom, opportunityTo);

    System.assertEquals(opportunityFrom.Id, [SELECT Opportunity__c FROM Document__c where Id =: document.id].Opportunity__c);
  }

  @isTest
  static void changeProductFipStageTest() {
    AuraHandledException auraException;
    Opportunity opportunity = MortgagesTestFactory.createOpportunity('FIP');

    update opportunity;

    try {
      MortgagesRekeyComponentController.changeProduct(opportunity.mortgage_Submission_uuid__c, 1, 'env');
    } catch (AuraHandledException e) {
      auraException = e;
    }

    System.assertEquals('Rekey is disabled for FIP status', auraException.getMessage());
  }

  @isTest
  static void getEligibilitiesTest() {
    stubGraphqlClient();

    String result = MortgagesRekeyComponentController.getEligibilities('submissionUuid', 'env');
    System.assertEquals(null, result);
  }


  @isTest
  static void rerunEligibilityTest() {
    stubGraphqlClient();

    Boolean result = MortgagesRekeyComponentController.rerunEligibility('submissionUuid', 'env');
    System.assertEquals(null, result);
  }

  @isTest
  static void lockOpportunityTest() {
    Opportunity opportunity = MortgagesTestFactory.createOpportunity(null, null, null, null, 'test', null, null);
    String rekeyReason = 'Did not Register in Time';
    String rekeyReasonDescription = 'Test test';

    Boolean result = MortgagesRekeyComponentController.lockOpportunity(opportunity.mortgage_Submission_uuid__c, rekeyReason, rekeyReasonDescription);

    System.assertEquals(true, result);
    System.assertEquals(rekeyReason, [SELECT Rekey_Reason__c FROM Opportunity where Id =: opportunity.id].Rekey_Reason__c);
    System.assertEquals(rekeyReasonDescription, [SELECT Rekey_Reason_Description__c FROM Opportunity where Id =: opportunity.id].Rekey_Reason_Description__c);
  }

  @isTest
  static void lockOpportunityRekeyInProgressTest() {
    AuraHandledException auraException;
    Opportunity opportunity = MortgagesTestFactory.createOpportunity('test');
    opportunity.Re_key_Status__c = 'In Progress';
    update opportunity;

    try {
      MortgagesRekeyComponentController.lockOpportunity(opportunity.mortgage_Submission_uuid__c, 'Change Lenders', '');
    } catch (AuraHandledException e) {
      auraException = e;
    }

    System.assertEquals('Rekey process is already running. Please try again later', auraException.getMessage());
  }

  @isTest
  static void lockOpportunityRekeyErrorTest() {
    AuraHandledException auraException;
    Opportunity opportunity = MortgagesTestFactory.createOpportunity('test');
    opportunity.Re_key_Status__c = 'Error';
    update opportunity;

    try {
      MortgagesRekeyComponentController.lockOpportunity(opportunity.mortgage_Submission_uuid__c, 'Change Lenders', '');
    } catch (AuraHandledException e) {
      auraException = e;
    }

    System.assertEquals('Previes Rekey process has failed. Please contact support team', auraException.getMessage());
  }

  @isTest
  static void lockOpportunityFipStageTest() {
    AuraHandledException auraException;
    Opportunity opportunity = MortgagesTestFactory.createOpportunity('FIP');
    update opportunity;

    try {
      MortgagesRekeyComponentController.lockOpportunity(opportunity.mortgage_Submission_uuid__c, 'Change Lenders', '');
    } catch (AuraHandledException e) {
      auraException = e;
    }

    System.assertEquals('Rekey is disabled for FIP status', auraException.getMessage());
  }

  static void lockOpportunityFailRekeyReasonTest() {
    AuraHandledException auraException;
    Opportunity opportunity = MortgagesTestFactory.createOpportunity();
    String rekeyReason = null;
    String rekeyReasonDescription = 'Test test';

    try {
      MortgagesRekeyComponentController.lockOpportunity(opportunity.mortgage_Submission_uuid__c, rekeyReason, rekeyReasonDescription);
    } catch (AuraHandledException e) {
      auraException = e;
    }
    System.assertEquals('Select rekey reason', auraException.getMessage());
  }

  @isTest
  static void lockOpportunityFailRekeyReasonDescriptionTest() {
    AuraHandledException auraException;
    Opportunity opportunity = MortgagesTestFactory.createOpportunity();
    String rekeyReason = 'Other';
    String rekeyReasonDescription = '';

    try {
      MortgagesRekeyComponentController.lockOpportunity(opportunity.mortgage_Submission_uuid__c, rekeyReason, rekeyReasonDescription);
    } catch (AuraHandledException e) {
      auraException = e;
    }
    System.assertEquals('Provide a description for rekey reason', auraException.getMessage());
  }

  @isTest
  static void rekeyReasonsTest() {
    List<String> result = MortgagesRekeyComponentController.rekeyReasons();

    List<String> expectedResult  = new String[]{ 'Change Lenders', 'Registered Incorrectly', 'Did not Register in Time', 'Other Credible Service Failure' };

    System.assertEquals(expectedResult, result);
  }

  static void stubGraphqlClient() {
    MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
    MortgagesRekeyComponentController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
  }


  private class MockGraphQLClient extends MortgagesGraphQLClient {
    public MockGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
        super(clientId, clientSecret, tokenUrl, graphqlUrl);
    }

    public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query, System.Type type) {
      return results(query.operationName);
    }

    public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query) {
      return results(query.operationName);
    }

    public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query mutation) {
      return results(mutation.operationName);
    }

    public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query mutation, System.Type type) {
      return results(mutation.operationName);
    }

    private MortgagesGraphQLClient.Results results(String operationName) {
      MortgagesGraphQLClient.Results result = new MortgagesGraphQLClient.Results();

      switch on operationName {
        when 'mortgagesSalesforceEligibility' {
          result.data = 'mortgagesSalesforceEligibility';
        }
        when 'mortgageSalesforceChangeProduct' {
          result.data = true;
        }
        when 'mortgagesSalesforceRerunEligibility' {
          result.data = true;
        }
        when 'salesforceSync' {
          result.data = 'salesforceSync';
        }
      }
      return result;
    }
  }
}