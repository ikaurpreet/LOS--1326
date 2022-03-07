trigger convertLeadTrigger on Lead (after insert, after update) {
    // DEACTIVATED TRIGGERS STILL COUNT TOWARD CODE COVERAGE, SO I COMMENTED OUT THE CODE
    // Set<Id> leadIds = new Set<Id>();
    // for(Lead lead : Trigger.New) {
    //     if( (lead.Status == 'FIP' && lead.Has_Account__c != null) || lead.Status == 'PQLL') {
    //         leadIds.add(lead.Id);
    //     } 
    // }
    // if (!leadIds.isEmpty()) {
    //     LeadRelationshipManagerAsync.convertLead(leadIds);
    // }
}