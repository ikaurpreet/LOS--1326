public with sharing class MR_UpdateLEDateAction {
    @InvocableMethod(label='Update LE date' description='Makes API call to update LE date in encompass loan')
    public static void execute(List<MR_UpdateLEDateAction.ActionInput> inputs) {
        MR_UpdateLEDateAction.ActionInput input = inputs[0];
        updateLEDate(input.opportunityId, input.leDate);
    }
    
    public class ActionInput {
        @InvocableVariable(label='Opportunity record Id' description='Record Id of the Opportunity object' required=true)
        public Id opportunityId;

        @InvocableVariable(label='LE date' description='New value of LE date' required=true)
        public Date leDate;
    }

    static void updateLEDate(Id opportunityId, Date leDate) {
        MortgagesApiClient mortgagesApiClient = MR_Actions.resolveMortgagesApiClient(opportunityId);
        String submissionUuid = MR_Actions.submissionUuidForOpportunity(opportunityId);
        MR_Loan loan = new MR_Loan();
        loan.submissionUuid = submissionUuid;
        loan.leDate = leDate;
        if (!mortgagesApiClient.updateLoan(loan)) {
            throw new System.CalloutException('Failed to update LE date for submission with submissionUuid="'+ submissionUuid +'".');
        }
    }
}