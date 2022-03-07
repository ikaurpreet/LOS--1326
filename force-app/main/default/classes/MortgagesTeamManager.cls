public with sharing class MortgagesTeamManager {
    static MortgagesApiClient mortgagesApiClient { get;set; }
    static MortgagesApiClient getMortgagesApiClient(MortgagesConstants.Env env) {
        if (mortgagesApiClient != null) {
            return mortgagesApiClient;
        }
        mortgagesApiClient = MortgagesApiClientFactory.createUserFactory(env.name()).createMortgagesApiClient();
        return mortgagesApiClient;
    }

    @future(callout=true)
    public static void updateLoanOfficer(Id opportunityId) {
        syncUpdateLoanOfficer(opportunityId);
    }
    
    public static void syncUpdateLoanOfficer(Id opportunityId) {
        Opportunity opportunity = [SELECT id, Submission_Id__c, Mortgage_Submission_Uuid__c, Loan_Officer_Id__c FROM Opportunity WHERE id=:opportunityId];
        if (opportunity == null) { return; }
    
        if (opportunity.Mortgage_Submission_Uuid__c != null && opportunity.Loan_Officer_Id__c != null) {
            MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(opportunity);
            MortgagesApiClient client = getMortgagesApiClient(env);
            client.assignLoanOfficer(opportunity.Mortgage_Submission_Uuid__c, opportunity.Loan_Officer_Id__c);
            system.debug('Update loan officer');
        } else {
            system.debug('Non mortgages opportunity');
        }
    }

    @future(callout=true)
    public static void updateLoanCoordinator(Id opportunityId) {
        syncUpdateLoanCoordinator(opportunityId);
    }

    public static void syncUpdateLoanCoordinator(Id opportunityId) {
        Opportunity opportunity = [SELECT id, Submission_Id__c, Mortgage_Submission_Uuid__c, Loan_Coordinator_Id__c FROM Opportunity WHERE id=:opportunityId];
        if (opportunity == null) { return; }
        
        if (opportunity.Mortgage_Submission_Uuid__c != null && opportunity.Loan_Coordinator_Id__c != null) {
            MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(opportunity);
            MortgagesApiClient client = getMortgagesApiClient(env);
            client.assignLoanCoordinator(opportunity.Mortgage_Submission_Uuid__c, opportunity.Loan_Coordinator_Id__c);
            system.debug('Update loan coordinator');
        } else {
            system.debug('Non mortgages opportunity');
        }
    }

    @future(callout=true)
    public static void updateLoanProcessor(Id opportunityId) {
        syncUpdateLoanProcessor(opportunityId);
    }

    public static void syncUpdateLoanProcessor(Id opportunityId) {
        Opportunity opportunity = [SELECT id, Submission_Id__c, Mortgage_Submission_Uuid__c, Loan_Processor_Id__c FROM Opportunity WHERE id=:opportunityId];
        if (opportunity == null) { return; }
        
        if (opportunity.Mortgage_Submission_Uuid__c != null && opportunity.Loan_Processor_Id__c != null) {
            MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(opportunity);
            MortgagesApiClient client = getMortgagesApiClient(env);
            client.assignLoanProcessor(opportunity.Mortgage_Submission_Uuid__c, opportunity.Loan_Processor_Id__c);
            system.debug('Update loan processor');
        } else {
            system.debug('Non mortgages opportunity');
        }
    }

    @future(callout=true)
    public static void updateLoanCloser(Id opportunityId) {
        syncUpdateLoanCloser(opportunityId);
    }

    public static void syncUpdateLoanCloser(Id opportunityId) {
        Opportunity opportunity = [SELECT id, Submission_Id__c, Mortgage_Submission_Uuid__c, Closing_Coordinator_ID__c FROM Opportunity WHERE id=:opportunityId];
        if (opportunity == null) { return; }
        
        if (opportunity.Mortgage_Submission_Uuid__c != null && opportunity.Closing_Coordinator_ID__c != null) {
            MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(opportunity);
            MortgagesApiClient client = getMortgagesApiClient(env);
            client.assignLoanCloser(opportunity.Mortgage_Submission_Uuid__c, opportunity.Closing_Coordinator_ID__c);
            system.debug('Update loan closer');
        } else {
            system.debug('Non mortgages opportunity');
        }
    }
}