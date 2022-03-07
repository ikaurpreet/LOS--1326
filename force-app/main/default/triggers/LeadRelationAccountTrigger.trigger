trigger LeadRelationAccountTrigger on Lead (after insert, after update) {
    // DEACTIVATED TRIGGERS STILL COUNT TOWARD CODE COVERAGE, SO I COMMENTED OUT THE CODE
	//  LeadRelationshipManagerAsync.leadToAccount(Trigger.newMap.keySet().clone());
}