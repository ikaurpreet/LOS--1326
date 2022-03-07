public with sharing class MR_UpdateLoanStatusAction {
    @InvocableMethod(label='Update mortgages loan status' description='Makes API call to update loan status for mortgages submission.')
    public static void execute(List<MR_UpdateLoanStatusAction.ActionInput> inputs) {
        MR_UpdateLoanStatusAction.ActionInput input = inputs[0];
        MortgagesSubmission.Status submissionStatus = MortgagesSubmission.status(input.submissionStatus);
        updateLoanStatus(input.opportunityId, submissionStatus);
    }
    
    public class ActionInput {
        @InvocableVariable(label='Opportunity record Id' description='Record Id of the Opportunity object' required=true)
        public Id opportunityId;
        
        @InvocableVariable(label='Submission status' description='New value of Submission status' required=true)
        public String submissionStatus;
    }
    
    static void updateLoanStatus(Id opportunityId, MortgagesSubmission.Status submissionStatus) {
        MR_Actions.OpportunityFields opportunity = MR_Actions.opportunityFields(opportunityId);
        MR_Loan loan = new MR_Loan();
        loan.submissionUuid = opportunity.submissionUuid;
        loan.loanStatus = loanStatus(submissionStatus);
        MortgagesApiClient mortgagesApiClient = MR_Actions.resolveMortgagesApiClient(opportunityId);
        Boolean updated = mortgagesApiClient.updateLoan(loan);
        if (!updated) {
            throw new System.CalloutException('Failed to update lender loan status for submission with submissionUuid="'+ opportunity.submissionUuid +'".');
        }
    }
    
    static MR_Loan.Status loanStatus(MortgagesSubmission.Status submissionStatus) {
        MR_Loan.Status loanStatus = MR_Loan.loanStatus(submissionStatus);
        if (loanStatus == null) {
            throw new System.IllegalArgumentException('No loan status matches to the submission status "' + submissionStatus + '".');
        }
        return loanStatus;
    }
}