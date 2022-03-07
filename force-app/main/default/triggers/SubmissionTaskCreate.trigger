trigger SubmissionTaskCreate on Submission_Task__c (before insert, after insert, after update) {
    if(Trigger.isAfter && Trigger.isUpdate) {
        Set<String> opportunityIds = new Set<String> ();
        for(Submission_Task__c task: Trigger.new) {
            opportunityIds.add(task.Opportunity__c);
        }
        OpportunityEventManager.createDocumentEvent(opportunityIds);
    }
    if(Trigger.isInsert && Trigger.isBefore) {
    Map<String, List<Submission_Task__c>> grouped = new Map<String, List<Submission_Task__c>>();
    for(Submission_Task__c task: Trigger.new) {

        String source;
        if (task.title__c != null) {
            source = task.title__c;
        } else if (task.description__c != null) {
            source = task.description__c;
        } else {
            source = task.Uuid__c;
        }

        task.name = source.length() > 80 ? source.substring(0, 79) : source;

        String submissionUuid = task.submission_uuid__c;
        if(!grouped.containsKey(submissionUuid)) {
            grouped.put(submissionUuid, new List<Submission_Task__c>());
        }
        
        grouped.get(submissionUuid).add(task);
    }
    if (false) {
        List<Opportunity> opportunities = [SELECT id, mortgage_Submission_uuid__c FROM Opportunity WHERE mortgage_Submission_uuid__c in: grouped.keySet()];
        
        for (Opportunity opp: opportunities) {
            List<Submission_Task__c> tasks = grouped.get(opp.mortgage_Submission_uuid__c);
            for (Submission_Task__c task: tasks) {
                task.opportunity__c = opp.id;
            }
        }
    }
    }

    if(Trigger.isInsert && Trigger.isAfter) {
        Set<Id> ids = new Set<Id> ();
        Set<String> opportunityIds = new Set<String> ();
        for(Submission_Task__c task: Trigger.new) {
            ids.add(task.id);
            opportunityIds.add(task.Opportunity__c);
        }
        FolderManager.batchCreateSubmissionTaskFolder(ids);
        OpportunityEventManager.createDocumentEvent(opportunityIds);
    }
}