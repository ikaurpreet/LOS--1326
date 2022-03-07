public with sharing class MortgagesRelationshipManager {
    public static void loanToOpportunity(List<Loan__c> source) {
        Map<String, List<Loan__c>> grouped = new Map<String, List<Loan__c>>();
        for(Loan__c item: source) {
            String submissionUuid = MortgagesUtilities.unprefixify(item.submission_uuid__c);
            if(!grouped.containsKey(submissionUuid)) {
                grouped.put(submissionUuid, new List<Loan__c>());
            }
            grouped.get(submissionUuid).add(item);
        }

        List<Opportunity> opportunities = [SELECT id, mortgage_Submission_uuid__c FROM Opportunity WHERE mortgage_Submission_uuid__c in: grouped.keySet()];
        for (Opportunity opp: opportunities) {
            List<Loan__c> items = grouped.get(opp.mortgage_Submission_uuid__c);
            for (Loan__c item: items) {
                item.opportunity__c = opp.id;
            }
        }
    }
}