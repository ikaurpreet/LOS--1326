public with sharing class MortgagesApplicationConfigController {
    static final Map<String, MortgagesApiClient> mortgagesApiClients = new Map<String, MortgagesApiClient>();
    static MortgagesApiClient getMortgagesApiClient(String env) {
        MortgagesApiClient mortgagesApiClient = mortgagesApiClients.get(env);
        if (mortgagesApiClient != null) {
            return mortgagesApiClient;
        }
        MortgagesApiClient apiClient = MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
        mortgagesApiClients.put(env, apiClient);
        return apiClient;
    }
    
    @AuraEnabled
    public static String getApplicationConfig(String env) {
        return getMortgagesApiClient(env).getApplicationConfig();
    }

    @AuraEnabled
    public static String updateStateConfig(String stateCode, Boolean approved, String env) {
        return getMortgagesApiClient(env).updateApplicationConfig(stateCode, approved);
    }

    @AuraEnabled
    public static String getEnvs() {
        return JSON.serialize(ClientCredentialsSettings.getNames());
    }
}