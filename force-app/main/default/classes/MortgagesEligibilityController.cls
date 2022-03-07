public with sharing class MortgagesEligibilityController {
    public static MortgagesApiClient mortgagesApiClient { get;set; }
    public static MortgagesApiClient getMortgagesApiClient(String env) {
        if (mortgagesApiClient != null) {
            return mortgagesApiClient;
        }
        return MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
    }
    
    @AuraEnabled
    public static String getEligibilities(String submissionUuid, String env)  {
        return getMortgagesApiClient(env).getEligibilities(submissionUuid);
    }
    
    @AuraEnabled
    public static String getEligibilityField(String uuid, String field, String env) {
        return getMortgagesApiClient(env).getEligibilityField(uuid, field);
    }

    @AuraEnabled
    public static string getEligibility(String uuid, String env) {
        return getMortgagesApiClient(env).getEligibility(uuid);
    }

    @AuraEnabled
    public static string getPurchaseProducts(String env,
                                            String eligibilityUuid, 
                                            Integer limitRecords, 
                                            Integer offsetRecords, 
                                            Boolean onlyBest, 
                                            List<String> lenders, 
                                            String loanType,
                                            String monthlyPayment,
                                            String apr,
                                            String rate,
                                            String order) {
        Set<String> lendersSet = new Set<String>(lenders);
        return getMortgagesApiClient(env).getPurchaseProducts(eligibilityUuid, 
                                                                                                limitRecords, 
                                                                                                offsetRecords, 
                                                                                                onlyBest, 
                                                                                                lendersSet, 
                                                                                                loanType, 
                                                                                                monthlyPayment, 
                                                                                                apr, 
                                                                                                rate,
                                                                                                order);
    }

    @AuraEnabled
    public static string getRefinanceProducts(String env,
                                            String eligibilityUuid, 
                                            Integer limitRecords, 
                                            Integer offsetRecords, 
                                            Boolean onlyBest, 
                                            List<String> lenders, 
                                            String loanType,
                                            String monthlyPayment,
                                            String apr,
                                            String rate,
                                            String order) {
        Set<String> lendersSet = new Set<String>(lenders);
        return getMortgagesApiClient(env).getRefinanceProducts(eligibilityUuid, 
                                                                                                limitRecords, 
                                                                                                offsetRecords, 
                                                                                                onlyBest, 
                                                                                                lendersSet, 
                                                                                                loanType, 
                                                                                                monthlyPayment, 
                                                                                                apr, 
                                                                                                rate,
                                                                                                order);
    }
}