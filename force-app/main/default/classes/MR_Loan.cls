public class MR_Loan {
    public String submissionUuid { get; set; }
    public String lenderLoanNumber { get; set; }
    public MR_Loan.Status loanStatus { get; set; }
    public Date leDate { get; set; }
    public Date itpDate { get; set; }
    public Date adverseActionDate { get; set; }
    public MR_Loan.ClosingDetails  closingDetails { get; set; }

    public class ClosingDetails {
        public Date closingDate { get; set; }
        public Date disbursementDate { get; set; }
        public Date cdSentDate { get; set; }
        public String paymentMethod { get; set; }
        public Decimal wireAmount { get; set; }
        public Decimal closedLoanAmount { get; set; }
    }
    
    public enum Status {
        active,
        closedLoan,
        applicationWithdrawn,
        applicationDenied,
        fileClosedForIncompleteness
    }
    
    public static Status loanStatus(MortgagesSubmission.Status submissionStatus) {
        return submissionToLoanStatuses.get(submissionStatus);
    }
    
    private static final Map<MortgagesSubmission.Status, Status> submissionToLoanStatuses =
        new Map<MortgagesSubmission.Status, Status> {
            MortgagesSubmission.Status.closed_loan => Status.closedLoan,
            MortgagesSubmission.Status.application_withdrawn => Status.applicationWithdrawn,
            MortgagesSubmission.Status.application_denied => Status.applicationDenied,
            MortgagesSubmission.Status.file_closed_for_incompleteness => Status.fileClosedForIncompleteness,
            MortgagesSubmission.Status.archived => Status.applicationWithdrawn
    };
}