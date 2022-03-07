public with sharing class ClientCredentialsSettings {
    public String tokenUrl { get; set; }
    public String graphqlUrl { get; set; }
    public String clientId { get; set; }
    public String clientSecret { get; set; }
    public ClientCredentialsSettings(String env) {
        CredibleClientCredentials__c credentials = CredibleClientCredentials__c.getValues(env);
        String name = credentials.name.toLowerCase();
        String graphqlName = String.isBlank(credentials.environment_Name__c) ? credentials.name.toLowerCase() : credentials.environment_Name__c.toLowerCase();
        this.tokenUrl = 'https://' + graphqlName + '-customers.auth.us-east-1.amazoncognito.com/oauth2/token';

        if (name == 'production') {
            this.graphqlUrl = 'https://www.credible.com/graphql';
        } else {
            this.graphqlUrl = 'https://' + graphqlName + '.qa.credible.com/graphql';
        }

        this.clientId = credentials.client_Id__c;
        this.clientSecret = credentials.client_Secret__c;
    }
    public static Set<String> getNames() {
        Map<String, CredibleClientCredentials__c> credentials = CredibleClientCredentials__c.getAll();
        return credentials.keySet();
    }

    public static String getDefaultName() {
        return getNames().iterator().next();
    }
}