trigger CosignerRelationTrigger on Opportunity (after insert, after update) {
    for(Opportunity opp : Trigger.New) {
        if (String.isBlank(opp.Cosigner__c) && String.isBlank(opp.Cosigner_Id__c)==FALSE) {LeadRelationshipManagerAsync.opportunityToAccount(Trigger.newMap.keySet());}
        }
    
}