public with sharing class MR_LockExpirationDateAction {
    static MortgagesApiClient mortgagesApiClient { get;set; }
    static MortgagesApiClient getMortgagesApiClient(MortgagesConstants.Env env) {
        if (mortgagesApiClient != null) {
            return mortgagesApiClient;
        }
        mortgagesApiClient = MortgagesApiClientFactory.createUserFactory(env.name()).createMortgagesApiClient();
        return mortgagesApiClient;
    }

    @InvocableMethod(label='Mortgages Lock Expiration Date' description='Makes API call to update Lock Expiration Date')
    public static void execute(List<MR_LockExpirationDateAction.ActionInput> inputs) {
        ActionInput input = inputs[0];
        Opportunity opportunity = [SELECT id, mortgage_Submission_uuid__c FROM Opportunity WHERE Id =: input.opportunityId];

        MortgagesApiClient apiClient = MR_Actions.resolveMortgagesApiClient(input.opportunityId);

        apiClient.mortgageEncompassUpdateTasks(opportunity.mortgage_Submission_UUID__c, input.lockExpirationDate);
    }

    public class ActionInput {
        @InvocableVariable(label='Opportunity record Id' description='Record Id of Opportunity object' required=true)
        public Id opportunityId;
    
        @InvocableVariable(label='lockExpirationDate' description='Lock Expiration Date' required=true)
        public Datetime lockExpirationDate;
      }

      @future(callout=true)
    public static void updateLockExpiration(Id opportunityId) {
        syncUpdateLockExpiration(opportunityId);
    }

    public static void syncUpdateLockExpiration(Id opportunityId) {
        Opportunity opportunity = [SELECT id, Mortgage_Submission_Uuid__c, Lock_Expiration_Date__c FROM Opportunity WHERE id=:opportunityId];

        if (opportunity == null) { return; }
    
        if (opportunity.Mortgage_Submission_Uuid__c != null && opportunity.Lock_Expiration_Date__c != null) {
            MortgagesApiClient apiClient = MR_Actions.resolveMortgagesApiClient(opportunityId);
            apiClient.mortgageEncompassUpdateTasks(opportunity.mortgage_Submission_UUID__c, opportunity.Lock_Expiration_Date__c);
            system.debug('Update lock expiration date');
        } else {
            system.debug('Non mortgages opportunity');
        }
    }
}