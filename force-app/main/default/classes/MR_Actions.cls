public with sharing class MR_Actions {
    private static final Map<MortgagesConstants.Env, MortgagesApiClient> mortgagesApiClients = new Map<MortgagesConstants.Env, MortgagesApiClient>();
    private static final Map<MortgagesConstants.Env, MortgagesTasksApiClient> tasksApiClients = new Map<MortgagesConstants.Env, MortgagesTasksApiClient>();
    
    public class OpportunityFields {
        public Id id { get; set; }
        public String submissionUuid { get; set; }
        public String submissionStatus { get; set; }
    }
    
    public static String submissionUuidForOpportunity(Id opportunityId) {
        Opportunity opportunity =
            [SELECT id, mortgage_Submission_UUID__c FROM Opportunity WHERE id =:opportunityId];
        if (opportunity == null ) {
            throw new MortgagesUtilities.SubjectObjectNotFoundException('Opportunity record with Id="' + opportunityId + '" is not found.');
        }
        return opportunity.mortgage_Submission_UUID__c.trim();
    }
    
    public static OpportunityFields opportunityFields(Id opportunityId) {
        Opportunity opportunity =
            [SELECT id, mortgage_Submission_UUID__c, submission_status__c FROM Opportunity WHERE id =:opportunityId];
        if (opportunity == null ) {
            throw new MortgagesUtilities.SubjectObjectNotFoundException('Opportunity record with Id="' + opportunityId + '" is not found.');
        }
        OpportunityFields opportunityFields = new OpportunityFields();
        opportunityFields.id = opportunity.id;
        opportunityFields.submissionUuid = opportunity.mortgage_Submission_UUID__c.trim();
        opportunityFields.submissionStatus = opportunity.submission_status__c.trim();
        return opportunityFields;
    }
    
    public static MortgagesApiClient resolveMortgagesApiClient(Id opportunityId) {
        MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(opportunityId);
        MortgagesApiClient mortgagesApiClient = mortgagesApiClients.get(env);
        if (mortgagesApiClient == null) {
            mortgagesApiClient = MortgagesApiClientFactory.createUserFactory(env.name()).createMortgagesApiClient();
            mortgagesApiClients.put(env, mortgagesApiClient);
        }
        return mortgagesApiClient;
    }
    
    public static MortgagesTasksApiClient resolveTasksApiClient(Id opportunityId) {
        MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(opportunityId);
        MortgagesTasksApiClient tasksApiClient = tasksApiClients.get(env);
        if (tasksApiClient == null) {
            tasksApiClient = MortgagesApiClientFactory.createUserFactory(env.name()).createTasksApiClient();
            tasksApiClients.put(env, tasksApiClient);
        }
        return tasksApiClient;
    }
}