global class MortgagesSubmission {
    public static Set<String> FORM_STATUSES = new Set<String> { 'full_form_in_progress', 'FIP' };
    public string uuid { get; set; }
    public MortgagesConstants.Env env { get; set; }
    public MortgagesConstants.Vertical vertical { get; set; }
    public string status { get; set; }
    public MortgagesGraphQLClient graphqlClient { get; set; }
    public MortgagesSettings settings { get; set; }
    public Boolean isPurchase { get { return vertical == MortgagesConstants.Vertical.HomePurchase; } }
    public Boolean isRefinance { get { return vertical == MortgagesConstants.Vertical.MortgageRefi; } }

    public static MortgagesSubmission create(Lead lead) {
        lead = [SELECT ID, Mortgage_Submission_Uuid__c, SubmissionType__c, Full_Submission_Status__c FROM Lead WHERE id=: lead.id];
        MortgagesSubmission submission = new MortgagesSubmission();
        submission.uuid = lead.Mortgage_Submission_Uuid__c;
        submission.vertical = MortgagesConstants.getVertical(lead.SubmissionType__c);
        submission.env = MortgagesUtilities.getEnvironment(lead.id);
        // submission.graphqlClient = new MortgagesGraphQLClient(submission.env);
        // submission.settings = MortgagesSettings.getInstance(submission.env);
        submission.status = lead.Full_Submission_Status__c;

        return submission;
    }

    public static MortgagesSubmission create(Opportunity opp) {
        opp = [SELECT Id, mortgage_Submission_UUID__c, Submission_Status__c, SubmissionType__c  FROM Opportunity WHERE id=:opp.id LIMIT 1];
        MortgagesSubmission submission = new MortgagesSubmission();
        submission.uuid = opp.Mortgage_Submission_Uuid__c;
        system.debug(opp.SubmissionType__c);
        submission.vertical = MortgagesConstants.getVertical(opp.SubmissionType__c);
        submission.env = MortgagesUtilities.getEnvironment(opp.Mortgage_Submission_Uuid__c);
        // submission.graphqlClient = new MortgagesGraphQLClient(submission.env);
        // submission.settings = MortgagesSettings.getInstance(submission.env);
        submission.status = opp.Submission_Status__c;
        return submission;
    }
    
    public static MortgagesSubmission.Status status(String submissionStatus) {
        for (MortgagesSubmission.Status status : MortgagesSubmission.Status.values()) {
            if (status.name().equals(submissionStatus)) {
                return status;
            }
        }
        throw new System.IllegalArgumentException('Unknown submission status "' + submissionStatus + '".');
    }
    
    public static String graphQlSubmissionStatus(MortgagesSubmission.Status submissionStatus) {
        String graphQlStatus = graphQlSubmissionStatuses.get(submissionStatus);
        if (graphQlStatus != null) {
            return graphQlStatus;
        }
        throw new System.IllegalArgumentException('Submission status "' + submissionStatus + '" is not configured for API calls.');
    }
    
    public enum Status {
        initial_processing,
        broker_processing,
        submitted_to_lender,
        initial_approval,
        cleared_to_close,
        closing_disclosure_sent,
        closed_loan,
        archived,
        application_denied,
        application_withdrawn,
        file_closed_for_incompleteness
    }
    
    private static final Map<MortgagesSubmission.Status, String> graphQlSubmissionStatuses = new Map<MortgagesSubmission.Status, String> {
        MortgagesSubmission.Status.initial_processing =>'initialProcessing',
        MortgagesSubmission.Status.submitted_to_lender =>'submittedToLender',
        MortgagesSubmission.Status.initial_approval =>'initialApproval',
        MortgagesSubmission.Status.broker_processing =>'brokerProcessing',
        MortgagesSubmission.Status.cleared_to_close =>'clearedToClose',
        MortgagesSubmission.Status.closed_loan =>'closedLoan',
        MortgagesSubmission.Status.closing_disclosure_sent =>'closingDisclosureSent',
        MortgagesSubmission.Status.archived =>'archived',
        MortgagesSubmission.Status.application_denied =>'applicationDenied',
        MortgagesSubmission.Status.application_withdrawn =>'applicationWithdrawn',
        MortgagesSubmission.Status.file_closed_for_incompleteness =>'fileClosedForIncompleteness'
    };
}