public with sharing class MortgagesRekeyComponentController {
  public static MortgagesApiClient mortgagesApiClient { get;set; }
  public static MortgagesApiClient getMortgagesApiClient(String env) {
      if (mortgagesApiClient != null) {
          return mortgagesApiClient;
      }
      return MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
  }
  
  @AuraEnabled
  public static String getEligibilities(String submissionUuid, String env) {
      return getMortgagesApiClient(env).getEligibilities(submissionUuid, 999, 0);
  }

  @AuraEnabled
  public static Boolean rerunEligibility(String submissionUuid, String env) {
      return getMortgagesApiClient(env).rerunEligibility(submissionUuid);
  }

  @AuraEnabled
  public static Boolean changeProduct(String submissionUuid, Integer productId, String env){
      Opportunity opportunity = findOpportunity(submissionUuid);

      opportunityStageValidation(opportunity);

      MortgagesApiClient mortgagesApiClient = getMortgagesApiClient(env);

      Boolean changeProductResponse = mortgagesApiClient.changeProduct(submissionUuid, productId);
      
      if (changeProductResponse) {
          Boolean rekeyResponse = rekeyOpportunity(opportunity);

        if (rekeyResponse)
            syncSubmission(submissionUuid, 'opportunity', env);
              
          return changeProductResponse;
      } else {
        unlockOpportunity(submissionUuid);
        return false;
      }
  }

  @AuraEnabled
  public static Boolean lockOpportunity(String submissionUuid, String rekeyReason, String rekeyReasonDescription) {
    Opportunity opportunity = [SELECT Id, Submission_ID__c, Re_key_Status__c, StageName FROM Opportunity WHERE mortgage_Submission_UUID__c =: submissionUuid];

    rekeyReasonValidation(rekeyReason, rekeyReasonDescription);
    rekeyStatusValidation(opportunity);
    opportunityStageValidation(opportunity);

    opportunity.Submission_ID__c += '_locked';
    opportunity.Rekey_Reason__c = rekeyReason;
    opportunity.Rekey_Reason_Description__c = rekeyReasonDescription;

    try {
      update opportunity;
      return true;
     } catch(DmlException e) {
       String exceptionMessage = e.getMessage();
       System.debug(exceptionMessage);
       returnErrorMessage('Is not completed. Something went wrong: ' + exceptionMessage);
       return false;
    }
  }

  @AuraEnabled
  public static List<String> rekeyReasons() {
    List<String> pickListValuesList= new List<String>();
    Schema.DescribeFieldResult fieldResult = Opportunity.Rekey_Reason__c.getDescribe();
    List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
    for( Schema.PicklistEntry pickListVal : ple){
        pickListValuesList.add(pickListVal.getLabel());
    }    
    return pickListValuesList;
  }
  
  // prevents uncommitted work pending, called async
  @future(callout=true)
  private static void syncSubmission(String submissionUuid, String type, String env) {
    getMortgagesApiClient(env).salesforceSync(submissionUuid, 'opportunity');
  }

  private static Boolean rekeyOpportunity(Opportunity opportunity){
    String currentTimeString = Datetime.now().format('yyyy-MM-dd h:mm a');
    String DisclosureState = 'Not Requested';

    opportunity.Submission_ID__c = opportunity.Submission_ID__c.replace('_locked', '');
    
    Opportunity newOpportunity = opportunity.clone(false, false, false, false);
    newOpportunity.mortgage_Submission_UUID__c = opportunity.mortgage_Submission_UUID__c;
    newOpportunity.Comments__c = 'New opportunity created and rekey occurred on ' + currentTimeString + '. ';
    newOpportunity.OwnerId = opportunity.OwnerId;
    newOpportunity.mortgage_Product__c = null;
    newOpportunity.Re_key_Status__c = 'In Progress';
    
    newOpportunity.E_sign_disclosure__c = DisclosureState;
    newOpportunity.CoBorrower_E_Sign_Disclosure__c = DisclosureState;
    newOpportunity.Wet_sign_disclosure__c = DisclosureState;
    newOpportunity.CoBorrower_Wet_Sign_Disclosure__c = DisclosureState;
    newOpportunity.Rekey_Reason__c = '';
    newOpportunity.Rekey_Reason_Description__c = '';

    opportunity.mortgage_Submission_UUID__c += '_archived';
    opportunity.Submission_ID__c += '_' + String.valueOf(Datetime.now().getTime());
    opportunity.Comments__c = (opportunity.Comments__c == null ? '' : opportunity.Comments__c) + 'File withdrawn, rekey occurred on ' + currentTimeString + '. ';
    opportunity.Submission_Status__c = 'archived';
    opportunity.StageName = 'Withdrawn';

    update opportunity;
    insert newOpportunity;
    
    moveRelationships(opportunity, newOpportunity);
    copyRelationships(opportunity, newOpportunity);

    return true;
  }

  private static Opportunity findOpportunity(String submissionUuid) {
    Set<String> opportunityFieldsSet = Schema.SObjectType.Opportunity.fields.getMap().keySet();
    String opportunityFields = String.join((Iterable<String>)opportunityFieldsSet, ', ');
    Opportunity opportunity = Database.query('SELECT ' + opportunityFields + ' FROM Opportunity WHERE mortgage_Submission_UUID__c =: submissionUuid');
    return opportunity;
  }

  private static void unlockOpportunity(String submissionUuid) {
    Opportunity opportunity = [SELECT Id, Submission_ID__c FROM Opportunity WHERE mortgage_Submission_UUID__c =: submissionUuid];

    opportunity.Submission_ID__c = opportunity.Submission_ID__c.replace('_locked', '');
    update opportunity;
  }

  @TestVisible
  private static void moveRelationships(Opportunity opportunityFrom, Opportunity opportunityTo) {

    List<Title_Holder__c> titleHolderList = [SELECT Opportunity__c FROM Title_Holder__c WHERE Opportunity__c =: opportunityFrom.id];
    List<Spouse__c> spouseList = [SELECT Opportunity__c FROM Spouse__c WHERE Opportunity__c =: opportunityFrom.id];
    List<Document__c> documentList =  [SELECT Opportunity__c FROM Document__c WHERE Category__c <> 'Econsent' AND Opportunity__c =: opportunityFrom.id];
    List<Loan__c> loanList = [SELECT Opportunity__c FROM Loan__c WHERE Opportunity__c =: opportunityFrom.id];
    List<Submission_Task__c> submissionTaskList =  [SELECT Opportunity__c FROM Submission_Task__c WHERE Opportunity__c =: opportunityFrom.id AND Type__c NOT IN ('e_sign', 'wet_sign')];

    List<OpportunityContactRole> contactRoleList = [SELECT id, ContactId, Contact_Summary__c, CreatedById, Email__c, Name__c, IsPrimary, Role, 	RoleId__c FROM OpportunityContactRole WHERE IsPrimary = FALSE AND OpportunityId =: opportunityFrom.id];
    List<OpportunityContactRole> newContactRoleList = new List<OpportunityContactRole>();


    for (OpportunityContactRole contactRole : contactRoleList) {

        OpportunityContactRole newContactRole = contactRole.clone(false, true, true, true);
        newContactRole.OpportunityId = opportunityTo.Id;

        newContactRoleList.add(newContactRole);
    }

    for (Title_Holder__c titleHolder : titleHolderList) {
        titleHolder.Opportunity__c = opportunityTo.id;
    }

    for (Spouse__c spouse : spouseList) {
        spouse.Opportunity__c = opportunityTo.id;
    }

    for (Document__c document : documentList) {
        document.Opportunity__c = opportunityTo.id;
    }

    for (Loan__c loan : loanList) {
        loan.Opportunity__c = opportunityTo.id;
    }

    for (Submission_Task__c submissionTask: submissionTaskList) {
        submissionTask.Opportunity__c = opportunityTo.id;
    }

    update spouseList;
    update titleHolderList;
    update documentList;
    update loanList;
    update titleHolderList;
    update submissionTaskList;

    insert newContactRoleList;
  }

  @TestVisible
  private static void copyRelationships(Opportunity opportunityFrom, Opportunity opportunityTo) {

    Set<String> documentFieldsSet = Schema.SObjectType.Document__c.fields.getMap().keySet();
    String opportunityFromId= opportunityFrom.id;
    String documentFields = String.join((Iterable<String>)documentFieldsSet, ', ');
    List<Document__c> documentList =  Database.query('SELECT ' + documentFields +  ' FROM Document__c WHERE Category__c = \'Econsent\' AND Opportunity__c =: opportunityFromId');
    
    if (documentList.size() <> 0) {
      List<Document__c> newDocumentList = new List<Document__c>();
      for (Document__c document : documentList) {
        Document__c newDocument = document.clone(false, false, false, false);
        newDocument.Opportunity__c = opportunityTo.id;
        newDocumentList.add(newDocument);
      }
      insert newDocumentList;
    }
  }

  private static void returnErrorMessage(String errorMessage) {
    AuraHandledException auraEx = new AuraHandledException(errorMessage);
    auraEx.setMessage(errorMessage);
    throw auraEx;
  }
  
  // Validation

  private static void rekeyReasonValidation(String rekeyReason, String rekeyReasonDescription) {
    if (String.isBlank(rekeyReason)) {
      returnErrorMessage('Select rekey reason');
    }

    if ((rekeyReason.trim() == 'Other') && (String.isBlank(rekeyReasonDescription))) {
      returnErrorMessage('Provide a description for rekey reason');
    }
  }

  private static void rekeyStatusValidation(Opportunity opportunity) { 
    if (opportunity.Re_key_Status__c == 'In Progress') {
      returnErrorMessage('Rekey process is already running. Please try again later');
    }

    if (opportunity.Re_key_Status__c == 'Error') {
      returnErrorMessage('Previes Rekey process has failed. Please contact support team');
    }
  }

  private static void opportunityStageValidation(Opportunity opportunity) {
    if (opportunity.StageName == 'FIP') {
      returnErrorMessage('Rekey is disabled for FIP status');
    }
  }
}