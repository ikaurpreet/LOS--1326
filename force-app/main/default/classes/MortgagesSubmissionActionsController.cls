public with sharing class MortgagesSubmissionActionsController {
    public static MortgagesImpersonationsClient impersonationsClient { get;set; }
    public static MortgagesApiClient mortgagesApiClient { get;set; }
    public static MortgagesImpersonationsClient getImpersonationsClient(String env) {
        if (impersonationsClient != null) {
            return impersonationsClient;
        }
        return new MortgagesApiClientFactory(MortgagesConstants.getEnv(env)).createImpersonationsClient();
    }
    public static MortgagesApiClient getMortgagesApiClient(String env) {
        if (mortgagesApiClient != null) {
            return mortgagesApiClient;
        }
        return MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
    }
    @AuraEnabled
    public static String requestImpersonation(String userUuid, String env)  {
        String data = getImpersonationsClient(env).requestImpersonation(userUuid);
        return data;
    }

    @AuraEnabled
    public static String salesforceSync(String uuid, String type, String env) {
        String data = getMortgagesApiClient(env).salesforceSync(uuid, type);
        return data;
    }

    @AuraEnabled
    public static String qaEnvName(String env) {
        CredibleClientCredentials__c credentials = CredibleClientCredentials__c.getValues(env);

        return credentials.environment_Name__c.toLowerCase();
    }

    @AuraEnabled
	public static String graphql(String env, String jsonBody){
		return GraphQLProxyController.request(env, jsonBody);
	}

    @AuraEnabled
    public static Boolean fireSubmissionEvent(String uuid, String event, String env){
        Boolean data = getMortgagesApiClient(env).fireSubmissionEvent(uuid, event);
        return data;
    }

    @AuraEnabled
    public static Boolean archiveSubmission(String uuid, String env){
        Boolean submissionArchived = getMortgagesApiClient(env).archiveSubmission(uuid);
        if (submissionArchived) {
            return updateLoan(uuid, env, MR_Loan.Status.applicationWithdrawn);
        }
        return false;
    }

    private static Boolean updateLoan(String SubmissionUuid, String env, MR_Loan.Status status) {
        MR_Loan loan = new MR_Loan();
        loan.submissionUuid = SubmissionUuid;
        loan.loanStatus = status;
        return getMortgagesApiClient(env).updateLoan(loan);
    }

    @AuraEnabled
    public static Boolean unarchiveSubmission(String uuid, String env){
        if (getMortgagesApiClient(env).unarchiveSubmission(uuid)) {
            Boolean result = updateLoan(uuid, env, MR_Loan.Status.active);
            getMortgagesApiClient(env).salesforceSync(uuid, 'opportunity');
            return result;
        }
        return false;
    }
}