trigger LeadRelationTrigger on Lead (before insert, before update, after insert, after update) {
    // DEACTIVATED TRIGGERS STILL COUNT TOWARD CODE COVERAGE, SO I COMMENTED OUT THE CODE
    // if (Trigger.isBefore) {
    //     LeadRelationshipManager.record_types(Trigger.new);
    //     if (Trigger.IsInsert) {
    //        LeadRelationshipManager.check_if_lead_converted(Trigger.new); 
    //     }
    // } else {
    //     LeadRelationshipManager.borrower_or_cosigner(Trigger.new);
    // }
}