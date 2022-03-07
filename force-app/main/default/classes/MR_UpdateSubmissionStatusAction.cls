public with sharing class MR_UpdateSubmissionStatusAction {

    @InvocableMethod(label='Update mortgages submission status' description='Updates mortgages submission status for the opportunity record on the mortgages-api side and send disbursementDate to Encompass')
    public static void execute(List<MR_UpdateSubmissionStatusAction.ActionInput> inputs) {
        MR_UpdateSubmissionStatusAction.ActionInput input = inputs[0];
        MortgagesSubmission.Status submissionStatus = MortgagesSubmission.status(input.submissionStatus);
        check(submissionStatus);

        if (input.async) {
            // Future methods do not support parameter type of MortgagesSubmission.Status
            // That's why we can't pass submissionStatus instead of input.submissionStatus
            processAsync(input.opportunityId, input.submissionStatus, input.disbursementDate);
        }
        else {
            process(input.opportunityId, submissionStatus, input.disbursementDate);
        }
    }
    
    public class ActionInput {
        @InvocableVariable(label='Opportunity record Id' description='Record Id of Opportunity object' required=true)
        public Id opportunityId;

        @InvocableVariable(label='Submission status' description='New value of Submission status' required=true)
        public String submissionStatus;

        @InvocableVariable(label='Disbursement date' description='Disbursement date' required=false)
        public Date disbursementDate;

        @InvocableVariable(label='Run async' description='Run action asynchronously' required=false)
        public Boolean async = false;
    }
    
    static void check(MortgagesSubmission.Status submissionStatus) {
        if (allowedStatuses.contains(submissionStatus)) return;
        throw new System.IllegalArgumentException('Status "' + submissionStatus + '" is not allowed for this operation.');
    }
    
    static final Set<MortgagesSubmission.Status> allowedStatuses = new Set<MortgagesSubmission.Status> {
        MortgagesSubmission.Status.broker_processing,
            MortgagesSubmission.Status.submitted_to_lender,
            MortgagesSubmission.Status.initial_approval,
            MortgagesSubmission.Status.cleared_to_close,
            MortgagesSubmission.Status.closing_disclosure_sent,
            MortgagesSubmission.Status.closed_loan,
            MortgagesSubmission.Status.archived,
            MortgagesSubmission.Status.application_denied,
            MortgagesSubmission.Status.application_withdrawn,
            MortgagesSubmission.Status.file_closed_for_incompleteness
    };

    private static void process(Id opportunityId, MortgagesSubmission.Status submissionStatus, Date disbursementDate) {
        updateStatus(opportunityId, submissionStatus);
        sendDisbursementDateToEncompass(opportunityId, disbursementDate);
    }

    @future(callout=true)
    private static void processAsync(Id opportunityId, String inputStatus, Date disbursementDate) {
        MortgagesSubmission.Status submissionStatus = MortgagesSubmission.status(inputStatus);
        updateStatus(opportunityId, submissionStatus);
        sendDisbursementDateToEncompass(opportunityId, disbursementDate);
    }

    static void updateStatus(Id opportunityId, MortgagesSubmission.Status submissionStatus) {
        MR_Actions.OpportunityFields opportunityFields = MR_Actions.opportunityFields(opportunityId);
        if (opportunityFields.submissionStatus == submissionStatus.name()) {
            System.debug('Submission with uuid=' + opportunityFields.submissionUuid + ' already has status=' + opportunityFields.submissionStatus);
            return;
        }
        String graphQlStatus = MortgagesSubmission.graphQlSubmissionStatus(submissionStatus);
        MortgagesApiClient mortgagesApiClient = MR_Actions.resolveMortgagesApiClient(opportunityId);
        mortgagesApiClient.updateSubmissionStatus(opportunityFields.submissionUuid, graphQlStatus);
    }

    static void sendDisbursementDateToEncompass(Id opportunityId, Date disbursementDate) {
        if (disbursementDate != null) {
            MR_Actions.OpportunityFields opportunityFields = MR_Actions.opportunityFields(opportunityId);
            MR_Loan loan = new MR_Loan();
            loan.submissionUuid = opportunityFields.submissionUuid;
            loan.adverseActionDate = disbursementDate;

            MortgagesApiClient mortgagesApiClient = MR_Actions.resolveMortgagesApiClient(opportunityId);
            if (!mortgagesApiClient.updateLoan(loan)) {
                throw new System.CalloutException('Failed to update Closing Details for submission with submissionUuid="'+ loan.submissionUuid +'".');
            }
        }
    }
}