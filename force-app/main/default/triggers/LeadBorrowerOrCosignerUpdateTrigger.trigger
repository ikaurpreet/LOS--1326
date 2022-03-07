trigger LeadBorrowerOrCosignerUpdateTrigger on Lead (after update) {
    // DEACTIVATED TRIGGERS STILL COUNT TOWARD CODE COVERAGE, SO I COMMENTED OUT THE CODE

    // //system.debug('LeadRelationTrigger');
    // //system.debug(Trigger.isBefore ? 'before': 'after');
    // system.debug(Trigger.isInsert ? 'insert': 'update');
    // //system.debug(Trigger.new);
    // //if (Trigger.isBefore) {
    // //    LeadRelationshipManager.record_types(Trigger.new);
    // //    if (Trigger.IsInsert) {
    // //       LeadRelationshipManager.check_if_lead_converted(Trigger.new);
    // //    }
    // //} else {
    //     //LeadConverter.process(Trigger.new);
    //     LeadRelationshipManager.borrower_or_cosigner(Trigger.new);
    // //}
}