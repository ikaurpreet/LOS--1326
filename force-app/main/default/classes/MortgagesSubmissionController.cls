public with sharing class MortgagesSubmissionController {
    public static MortgagesApiClient mortgagesApiClient { get;set; }
    public static MortgagesApiClient getMortgagesApiClient(String env) {
        if (mortgagesApiClient != null) {
            return mortgagesApiClient;
        }
        return MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
    }

    @AuraEnabled
    public static String getEnvs() {
        return JSON.serialize(ClientCredentialsSettings.getNames());
    }

    @AuraEnabled
    public static String getPurchaseSubmission(String submissionUuid, String env)  {
        String data = getMortgagesApiClient(env).getPurchaseSubmission(submissionUuid);
        // return JSON.serialize(data);
        return data;
    }
    
    @AuraEnabled
    public static String getRefinanceSubmission(String submissionUuid, String env)  {
        // return new List<String> ();
        String data = getMortgagesApiClient(env).getRefinanceSubmission(submissionUuid);
        // return JSON.serialize(data);
        return data;
    }

    @AuraEnabled
    public static string getSelectedProductHistory(String uuid, String env) {
        return getMortgagesApiClient(env).getSelectedProductHistory(uuid);
    }

    @AuraEnabled
    public static string search(String query, String vertical, String env, String status, String order, Integer limitRecords, Integer offsetRecords){
        // MortgagesApiClient.SubmissionsPaginationType results = new MortgagesApiClient.SubmissionsPaginationType();
        MortgagesApiClient.SubmissionsPaginationType results = getMortgagesApiClient(env).searchSubmissions(query, vertical, status, order, limitRecords, offsetRecords);
        List<MortgagesApiClient.PaginationSubmission> submissions = results.items;
        Set<String> submissionUuids = new Set<String>();
        for(MortgagesApiClient.PaginationSubmission sub: submissions) {
            submissionUuids.add(sub.uuid);
        }

        Map<String, Map<String, String>> groupIds = MortgagesUtilities.getSubmissionSalesforceIds(submissionUuids);

        for(MortgagesApiClient.PaginationSubmission sub: submissions) {
            if (!groupIds.containsKey(sub.uuid)) {
                continue;
            }

            Map<String, String> ids = groupIds.get(sub.uuid);
            if (ids.containsKey('opportunity')) {
                sub.opportunityId = ids.get('opportunity');
            }

            if (ids.containsKey('borrower')) {
                sub.borrowerLeadId = ids.get('borrower');
            }

            if (ids.containsKey('cosigner')) {
                sub.coBorrowerLeadId = ids.get('cosigner');
            }
        }

        return JSON.serialize(results);
    }
}