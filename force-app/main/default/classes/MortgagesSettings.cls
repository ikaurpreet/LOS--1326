global class MortgagesSettings {
    public class UnkonwnEnvironmentException extends Exception {}
    public class NotFoundException extends Exception {}

    public string clientId { get; private set; }
    public string clientSecret { get; private set; }
    public string tokenUrl { get; private set; }
    public string graphqlUrl { get; private set; }
    public Boolean enableEncompassQueue { get; private set; }
    public Boolean clientCredentials { get; private set; }
    public Boolean enableReKey { get; private set; }

    public static MortgagesSettings getInstance() {
        Mortgages_Settings__c settings = Mortgages_Settings__c.getInstance(UserInfo.getUserId());
        if(settings != null) {
            return new MortgagesSettings(settings.Client_Credentials__c, settings.Enable_Encompass_Queue__c);
        } else {
            return new MortgagesSettings(false, false);
        }
    }
    public static MortgagesSettings getInstance(MortgagesConstants.Env deprecatedEnv) {
        String env = ClientCredentialsSettings.getDefaultName();
        switch on env {
            when 'PRODUCTION' {
                MortgagesProductionSettings__c settings = MortgagesProductionSettings__c.getInstance(UserInfo.getUserId());
                return createInstance(settings.client_Id__c, settings.client_Secret__c, settings.token_Url__c, settings.graphql_Url__c, settings.Enable_Encompass_Queue__c);
            }
            when else {
                MortgagesLocalSettings__c settings = MortgagesLocalSettings__c.getInstance(UserInfo.getUserId());
                return createInstance(settings.client_Id__c, settings.client_Secret__c, settings.token_Url__c, settings.graphql_Url__c, settings.Enable_Encompass_Queue__c);
            }
        }
    }

    public static MortgagesSettings createInstance(String clientId, String clientSecret, String tokenUrl, String graphqlUrl, Boolean enableEncompassQueue) {
        if (clientId == null || clientSecret == null || tokenUrl == null || graphqlUrl == null) {
            throw new NotFoundException('Mortgages settings not found for your profile');
        } else {
            return new MortgagesSettings(clientId, clientSecret, tokenUrl, graphqlUrl, enableEncompassQueue);
        }
    }

    public MortgagesSettings(Boolean clientCredentials, Boolean enableEncompassQueue) {
       this.enableEncompassQueue = enableEncompassQueue;
       this.clientCredentials = clientCredentials;
       this.enableReKey = enabledReKey();
    }

    public MortgagesSettings(String clientId, String clientSecret, String tokenUrl, String graphqlUrl, Boolean enableEncompassQueue) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tokenUrl = tokenUrl;
        this.graphqlUrl = graphqlUrl;
        this.enableEncompassQueue = enableEncompassQueue;
        this.enableReKey = enabledReKey();
    }

    private static Boolean enabledReKey() {
        User user = [SELECT UserRole.Name FROM User WHERE id =: UserInfo.getUserId() LIMIT 1];
        return user.UserRole != null && user.UserRole.Name == 'Mortgage Analyst';
    }
}