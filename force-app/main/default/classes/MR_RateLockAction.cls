public with sharing class MR_RateLockAction {

  @InvocableMethod(label='Mortgages locking rate' description='Makes API call to locking rate')
  public static void execute(List<MR_RateLockAction.ActionInput> inputs) {
    ActionInput input = inputs[0];

    if (input.async) {
      callAsync(input.opportunityId, input.rateLock);
    }
    else {
      call(input.opportunityId, input.rateLock);
    }
  }

  public class ActionInput {
    @InvocableVariable(label='Opportunity record Id' description='Record Id of Opportunity object' required=true)
    public Id opportunityId;

    @InvocableVariable(label='Rate Lock' description='Rate lock datetime' required=true)
    public Datetime rateLock;

    @InvocableVariable(label='Run async' description='Run action asynchronously' required=false)
    public Boolean async = false;
  }

  private static void call(Id opportunityID, Datetime rateLock) {

    Opportunity opportunity = [SELECT id, mortgage_Submission_uuid__c FROM Opportunity WHERE Id =: opportunityId];
    MortgagesApiClient apiClient = MR_Actions.resolveMortgagesApiClient(opportunityId);
    
    apiClient.mortgageRefiEncompassSelectProduct(opportunity.mortgage_Submission_UUID__c, rateLock, true);
  }


  @future(callout=true)
  private static void callAsync(Id opportunityId, Datetime rateLock) {
    call(opportunityId, rateLock);
  }
}