public with sharing class MR_UpdateClosingCostsAction {
    @InvocableMethod(label='Update mortgages closing costs' description='Makes API call to update closing costs for mortgages submission.')
    public static void execute(List<MR_UpdateClosingCostsAction.ActionInput> inputs) {
        MR_UpdateClosingCostsAction.ActionInput input = inputs[0];
        if (input.async) {
            updateClosingCostsAsync(input.opportunityId);
        }
        else {
            updateClosingCosts(input.opportunityId);
        }
    }
    
    public class ActionInput {
        @InvocableVariable(label='Opportunity record Id' description='Record Id of the Opportunity object' required=true)
        public Id opportunityId;

        @InvocableVariable(label='Run async' description='Run action asynchronously' required=false)
        public Boolean async = false;
    }


    
    static void updateClosingCosts(Id opportunityId) {
        String submissionUuid = MR_Actions.submissionUuidForOpportunity(opportunityId);
        MortgagesApiClient mortgagesApiClient = MR_Actions.resolveMortgagesApiClient(opportunityId);
        String result = mortgagesApiClient.updateClosingCosts(submissionUuid);
        if (null == result || !result.contains('"status":"success"')) {
            throw new System.CalloutException('Failed to call "encompassScheduleClosingCostsUpdate" API with submissionUuid="'+ submissionUuid +'".');
        }
    }

    @future(callout=true)
    private static void updateClosingCostsAsync(Id opportunityId) { 
        updateClosingCosts(opportunityId);
    }
}