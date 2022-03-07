public with sharing class MR_UpdateLoanNumberAction {
    @InvocableMethod(label='Update mortgages lender loan number' description='Makes API call to update lender loan number for mortgages submission.')
    public static void execute(List<MR_UpdateLoanNumberAction.ActionInput> inputs) {
        MR_UpdateLoanNumberAction.ActionInput input = inputs[0];
        updateLenderLoanNumber(input.opportunityId, input.lenderLoanNumber);
    }
    
    public class ActionInput {
        @InvocableVariable(label='Opportunity record Id' description='Record Id of the Opportunity object' required=true)
        public Id opportunityId;
    
        @InvocableVariable(label='Lender loan number' description='New value of the lender loan number' required=true)
        public String lenderLoanNumber;
    }
    
    static void updateLenderLoanNumber(Id opportunityId, String lenderLoanNumber) {
        MortgagesApiClient mortgagesApiClient = MR_Actions.resolveMortgagesApiClient(opportunityId);
        String submissionUuid = MR_Actions.submissionUuidForOpportunity(opportunityId);
        MR_Loan loan = new MR_Loan();
        loan.submissionUuid = submissionUuid;
        loan.lenderLoanNumber = lenderLoanNumber;
        if (!mortgagesApiClient.updateLoan(loan)) {
            throw new System.CalloutException('Failed to update lender loan number for submission with submissionUuid="'+ submissionUuid +'".');
        }
        if (!mortgagesApiClient.saveLenderLoanNumber(submissionUuid, lenderLoanNumber)) {
            throw new System.CalloutException('Failed to save lender loan number for submission with submissionUuid="'+ submissionUuid +'".');
        }
    }
}