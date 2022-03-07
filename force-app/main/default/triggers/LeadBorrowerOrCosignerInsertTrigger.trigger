trigger LeadBorrowerOrCosignerInsertTrigger on Lead (after insert) {
    // DEACTIVATED TRIGGERS STILL COUNT TOWARD CODE COVERAGE, SO I COMMENTED OUT THE CODE
    // LeadRelationshipManager.borrower_or_cosigner(Trigger.new);
}