trigger OpportunityAfterInsert on Opportunity (after insert) {
    Id homePurchaseRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('HomePurchase').getRecordTypeId();
    Id reFiRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName().get('MortgageRefi').getRecordTypeId();
    
    Set<Id> oppIds = new Set<Id>();
    Set<Id> accIds = new Set<Id>();
    for(Opportunity opp: Trigger.new) {
        if (opp.mortgage_Submission_uuid__c != null && (opp.RecordTypeId == homePurchaseRecordTypeId ||  opp.RecordTypeId == reFiRecordTypeId)) {
            oppIds.add(opp.id);
            accIds.add(opp.AccountId);
            
        }
    }

    FolderManager.batchCreateOpportunityFolder(oppIds);
    FolderManager.batchCreateAccountFolder(accIds);
    PreApprovalLetterTriggerHandler.updateOnOppInsert(trigger.new);
}