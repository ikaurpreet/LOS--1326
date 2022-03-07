trigger LeadTrigger on Lead (before insert, before update, before delete, after insert, after update, after delete, after undelete) {
    LeadTriggerHandler handler = new LeadTriggerHandler();
    handler.run();
}