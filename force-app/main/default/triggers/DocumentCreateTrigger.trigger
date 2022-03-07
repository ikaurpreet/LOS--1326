trigger DocumentCreateTrigger on Document__c (before insert, after insert, after update, before update) {
  if(Trigger.isBefore && Trigger.isUpdate) {
    for(Document__c document: Trigger.new) {
      Document__c old = Trigger.oldMap.get(document.id);
      if (old != document) {
        document.Last_Modified_By__c = UserInfo.getUserId();
      }
    }
  }
  if(Trigger.isInsert && Trigger.isBefore) {
    //DocumentRelationshipManager.documentToOpportunity(Trigger.new);
  }
  if(Trigger.isInsert && Trigger.isAfter) {
    Set<Id> ids = new Set<Id> ();
    for(Document__c document: Trigger.new) {
        ids.add(document.id);
    }
    FolderManager.batchAssignFolderToDocument(ids);
  }
  if(Trigger.isUpdate && Trigger.isAfter) {
    Set<Id> ids = new Set<Id> ();
    Set<Id> idsToRemoveDocuments = new Set<Id> ();
    Set<String> opportunityIds = new Set<String> ();
    for(Document__c document: Trigger.new) {
      Document__c old = trigger.oldMap.get(document.id);
      if (old != document) { 
        opportunityIds.add(document.Opportunity__c);
      }
      if (old.reference__c != document.reference__c) {
        ids.add(document.id);
      }
      
      if (old.Filename__c != document.Filename__c) {
        idsToRemoveDocuments.add(document.id);
      }
    }
    if (ids.size() != 0) {
      FolderManager.batchAssignFolderToDocument(ids);
    }
    if (idsToRemoveDocuments.size() != 0) {
      MortgagesDocumentManager.batchRemoveDocumentContentVersion(idsToRemoveDocuments);
    }
    OpportunityEventManager.createDocumentEvent(opportunityIds);
  }
}