global class MortgagesSubmissionDashboardController {
    public MortgagesSubmission submission { get; private set; }
    public Boolean hasSubmission { get { return submission != null; } }
    public Boolean hasError { get; set; }
    public String recordId {get; set;}
    public MortgagesSubmissionDashboardController() {
        Map<String, String> params = ApexPages.currentPage().getParameters();
        system.debug(params.get('vertical'));
        MortgagesConstants.Env env = MortgagesConstants.Env.getEnv(params.get('env'));
        this.submission = new MortgagesSubmission();
        this.submission.uuid = params.get('uuid');
        this.submission.status = params.get('status');
        this.submission.vertical = MortgagesConstants.getVertical(params.get('vertical'));
        this.submission.env = env;
        // this.submission.graphqlClient = new MortgagesGraphQLClient(env);
        this.submission.settings = MortgagesSettings.getInstance();
        recordId = ApexPages.CurrentPage().getparameters().get('id');
    }
    public MortgagesSubmissionDashboardController(ApexPages.StandardController controller) {
        Object record = controller.getRecord();
        try {
            if (record instanceOf Lead) {
                initLead((Lead)record);
            }
            
            if (record instanceOf Opportunity) {
                initOpportunity((Opportunity)record);
            }
        } catch(Exception ex) {
            system.debug(ex);
            ApexPages.Message error = new ApexPages.Message(ApexPages.Severity.ERROR, ex.getMessage());
            ApexPages.addMessage(error);
            this.hasError = true;
        }
    }
    
    public void initLead(Lead lead) {
        lead = [SELECT ID, Mortgage_Submission_Uuid__c, SubmissionType__c, Full_Submission_Status__c FROM Lead WHERE id=: lead.id];
        this.submission = new MortgagesSubmission();
        this.submission.uuid = lead.Mortgage_Submission_Uuid__c;
        this.submission.vertical = MortgagesConstants.getVertical(lead.SubmissionType__c);
        this.submission.env = MortgagesUtilities.getEnvironment(lead.id);
        this.submission.graphqlClient = new MortgagesGraphQLClient(this.submission.env);
        this.submission.settings = MortgagesSettings.getInstance();
        this.submission.status = lead.Full_Submission_Status__c;
    }
    
    public void initOpportunity(Opportunity opp) {
        opp = [SELECT Id, submission_id__c, mortgage_Submission_UUID__c, RecordType.Name, Submission_Status__c FROM Opportunity WHERE id=:opp.id LIMIT 1];
        list<Lead> leads = [SELECT Mortgage_Submission_Uuid__c FROM Lead where Submission_Id__c=:opp.submission_id__c limit 1];
        if (leads.size() > 0) {
            initLead(leads[0]);
            this.submission.status = opp.Submission_status__c;
            this.submission.settings = MortgagesSettings.getInstance();
        } else {
            this.submission = new MortgagesSubmission();
            this.submission.uuid = opp.mortgage_Submission_UUID__c;
            this.submission.settings = MortgagesSettings.getInstance();
            this.submission.status = opp.Submission_status__c;
            this.submission.vertical = MortgagesConstants.getVertical(opp.RecordType.Name);
            this.submission.env = MortgagesUtilities.getEnvironment(ClientCredentialsSettings.getDefaultName());
        }
    }
}