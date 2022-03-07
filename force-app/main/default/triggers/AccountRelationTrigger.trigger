trigger AccountRelationTrigger on Account (after insert) {
     LeadRelationshipManagerAsync.accountToLead(Trigger.newMap.keySet());
}