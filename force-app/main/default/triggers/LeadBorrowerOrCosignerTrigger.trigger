trigger LeadBorrowerOrCosignerTrigger on Lead (after update, after insert) {
    // DEACTIVATED TRIGGERS STILL COUNT TOWARD CODE COVERAGE, SO I COMMENTED OUT THE CODE
	// LeadRelationshipManagerAsync.leadToLead(Trigger.newMap.keySet().clone());
}