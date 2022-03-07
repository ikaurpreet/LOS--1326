public with sharing class DocumentRelationshipManager {
    public static void documentToOpportunity(List<Document__c> source) {
        Map<String, List<Document__c>> opportunityGrouped = new Map<String, List<Document__c>>();
        Map<String, List<Document__c>> accountGrouped = new Map<String, List<Document__c>>();
        for(Document__c document: source) {
            String submissionUuid = document.submission_uuid__c;
            String ownerUuid = document.owner_uuid__c;
            if (submissionUuid != null) {
                if(!opportunityGrouped.containsKey(submissionUuid)) {
                    opportunityGrouped.put(submissionUuid, new List<Document__c>());
                }
                opportunityGrouped.get(submissionUuid).add(document);
            }
            if (ownerUuid != null) {
                if(!accountGrouped.containsKey(ownerUuid)) {
                    accountGrouped.put(ownerUuid, new List<Document__c>());
                }
                accountGrouped.get(ownerUuid).add(document);
            }
        }

        if (opportunityGrouped.keySet().size() > 0) {
            List<Opportunity> opportunities = [SELECT id, mortgage_Submission_uuid__c FROM Opportunity WHERE mortgage_Submission_uuid__c in: opportunityGrouped.keySet()];
            Set<String> opportunityIds = new Set<String> ();
            for (Opportunity opp: opportunities) {
                List<Document__c> documents = opportunityGrouped.get(opp.mortgage_Submission_uuid__c);
                for (Document__c document: documents) {
                    document.opportunity__c = opp.id;
                    opportunityIds.add(opp.id);
                }
            }
            OpportunityEventManager.createDocumentEvent(opportunityIds);
        }

        if (accountGrouped.keySet().size() > 0) {
            List<Account> accounts = [SELECT id, user_uuid__c FROM Account WHERE user_uuid__c in :accountGrouped.keySet()];
            for(Account acc: accounts) {
                List<Document__c> documents = accountGrouped.get(acc.user_uuid__c);
                for (Document__c document: documents) {
                    document.account__c = acc.id;
                }
            }
        }
    }
}