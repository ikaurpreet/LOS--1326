public with sharing class MR_UpdateClosingDetailsAction {
    @InvocableMethod(label='Update Closing Details' description='Makes API call to update closing details in encompass loan')
    public static void execute(List<MR_UpdateClosingDetailsAction.ActionInput> inputs) {
        MR_UpdateClosingDetailsAction.ActionInput input = inputs[0];
        updateClosingDetails(input);
    }
    
    public class ActionInput {
        @InvocableVariable(label='Opportunity record Id' description='Record Id of the Opportunity object' required=true)
        public Id opportunityId;

        @InvocableVariable(label='CD sent date' description='Closing Disclosure sent date' required=true)
        public Date cdSentDate;

        @InvocableVariable(label='Closing Date' description='Closing Date' required=true)
        public Date closingDate;

        @InvocableVariable(label='Disbursement Date' description='Disbursement Date' required=true)
        public Date disbursementDate;

        @InvocableVariable(label='Closing Payment Method' description='Closing Payment Method' required=true)
        public String paymentMethod;

        @InvocableVariable(label='Wire Amount' description='Wire Amount' required=false)
        public Decimal wireAmount;

        @InvocableVariable(label='Closed Loan Amount' description='Closed Loan Amount' required=false)
        public Decimal closedLoanAmount;
    }

    static void updateClosingDetails(MR_UpdateClosingDetailsAction.ActionInput input) {
        MortgagesApiClient mortgagesApiClient = MR_Actions.resolveMortgagesApiClient(input.opportunityId);
        String submissionUuid = MR_Actions.submissionUuidForOpportunity(input.opportunityId);
        MR_Loan loan = new MR_Loan();
        loan.submissionUuid = submissionUuid;
        loan.closingDetails = new MR_Loan.ClosingDetails();
        loan.closingDetails.cdSentDate = input.cdSentDate;
        loan.closingDetails.closingDate = input.closingDate;
        loan.closingDetails.disbursementDate = input.disbursementDate;
        loan.closingDetails.paymentMethod = input.paymentMethod;
        loan.closingDetails.wireAmount = input.wireAmount;
        loan.closingDetails.closedLoanAmount = input.closedLoanAmount;

        if (!mortgagesApiClient.updateLoan(loan)) {
            throw new System.CalloutException('Failed to update Closing Details for submission with submissionUuid="'+ loan.submissionUuid +'".');
        }
    }
}