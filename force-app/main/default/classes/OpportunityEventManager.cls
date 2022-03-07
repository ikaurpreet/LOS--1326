public with sharing class OpportunityEventManager {
    @future
    public static void asyncCreateDocumentEvent(String opportunityId) {
        createDocumentEvent(new Set<String> { opportunityId });
    }
    @future
    public static void asyncCreateDocumentEvent(Set<String> opportunityIds) {
        createDocumentEvent(opportunityIds);
    }

    public static void createDocumentEvent(String opportunityId) { 
        createDocumentEvent(new Set<String> { opportunityId });
    }
    
    public static void createDocumentEvent(Set<String> opportunityIds) {
        List<Opportunity_Change__e> opportunityChangeEvents = new List<Opportunity_Change__e>();
        for(String opportunityId : opportunityIds) {
            opportunityChangeEvents.add(new Opportunity_Change__e(Opportunity_Id__c=opportunityId, Type__c='documents'));
        }
        
        // Call method to publish events
        List<Database.SaveResult> results = EventBus.publish(opportunityChangeEvents);
        
        // Inspect publishing result for each event
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) {
                System.debug('Successfully published event.');
            } else {
                for(Database.Error err : sr.getErrors()) {
                    System.debug('Error returned: ' +
                                err.getStatusCode() +
                                ' - ' +
                                err.getMessage());
                }
            }       
        }
    }
}