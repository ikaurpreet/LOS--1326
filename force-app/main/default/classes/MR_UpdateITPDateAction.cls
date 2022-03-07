public with sharing class MR_UpdateITPDateAction {
    @InvocableMethod(label='Update ITP date' description='Makes API call to update ITP date in encompass loan')
    public static void execute(List<MR_UpdateITPDateAction.ActionInput> inputs) {
        MR_UpdateITPDateAction.ActionInput input = inputs[0];
        updateITPDate(input.opportunityId, input.itpDate);
    }
    
    public class ActionInput {
        @InvocableVariable(label='Opportunity record Id' description='Record Id of the Opportunity object' required=true)
        public Id opportunityId;

        @InvocableVariable(label='ITP date' description='New value of ITP date' required=true)
        public Date itpDate;
    }

    static void updateITPDate(Id opportunityId, Date itpDate) {
        MortgagesApiClient mortgagesApiClient = MR_Actions.resolveMortgagesApiClient(opportunityId);
        String submissionUuid = MR_Actions.submissionUuidForOpportunity(opportunityId);
        MR_Loan loan = new MR_Loan();
        loan.submissionUuid = submissionUuid;
        loan.itpDate = itpDate;
        if (!mortgagesApiClient.updateLoan(loan)) {
            throw new System.CalloutException('Failed to update ITP date for submission with submissionUuid="'+ submissionUuid +'".');
        }
    }
}