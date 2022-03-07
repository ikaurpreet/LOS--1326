public with sharing class MortgagesEncompassController {
    public static MortgagesEncompassClient encompassClient { get;set; }
    public static MortgagesEncompassClient getEncompassClient(String env) {
        if (encompassClient != null) {
            return encompassClient;
        }
        return MortgagesApiClientFactory.createUserFactory(env).createEncompassClient();
    }

    @AuraEnabled
    public static string getEncompassLoanRequest(String submissionUuid, String env) {
        MortgagesEncompassClient client = getEncompassClient(env);
        MortgagesEncompassClient.EncompassLoanRequest loanRequest = client.getEncompassLoanRequest(submissionUuid);

        return JSON.serialize(loanRequest);
    }
}