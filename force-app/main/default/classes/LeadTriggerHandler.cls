public with sharing class LeadTriggerHandler extends TriggerHandler {

    private final String NO_SUBMISSION_REC_TYPE_NAME = 'NoSubmission';

    public override void beforeInsert() {
        List<Lead> submissionLeads = new List<Lead>();
        Id noSubRecTypeId = Schema.SObjectType.Lead.getRecordTypeInfosByName().get(NO_SUBMISSION_REC_TYPE_NAME).getRecordTypeId();
        for (Lead lead : (List<Lead>)Trigger.new) {
            if (lead.recordTypeId != noSubRecTypeId) {
                submissionLeads.add(lead);
            }
        }
        LeadRelationshipManager.check_if_lead_converted(submissionLeads);
        LeadRelationshipManager.record_types((List<Lead>)Trigger.new);
    }
  
    public override void afterInsert() {
        LeadRelationshipManagerAsync.leadToLead(Trigger.newMap.keySet().clone());
        LeadRelationshipManagerAsync.leadToAccount(Trigger.newMap.keySet().clone());
    }
  
    public override void afterUpdate() {
        LeadRelationshipManagerAsync.leadToLead(Trigger.newMap.keySet().clone());
        LeadRelationshipManagerAsync.leadToAccount(Trigger.newMap.keySet().clone());
    }
}