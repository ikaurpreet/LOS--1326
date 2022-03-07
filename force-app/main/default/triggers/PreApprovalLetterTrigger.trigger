trigger PreApprovalLetterTrigger on Pre_approval_Letter__c (before insert, before update) {
    if(trigger.isbefore && (trigger.isInsert || trigger.isUpdate)){
    	PreApprovalLetterTriggerHandler.updateLead(Trigger.new, Trigger.OldMap);    
    }	
}