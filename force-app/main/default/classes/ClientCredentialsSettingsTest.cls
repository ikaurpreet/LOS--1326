@isTest
public with sharing class ClientCredentialsSettingsTest {
    public static void createTestClientCredentials(String name) {
        CredibleClientCredentials__c db = new CredibleClientCredentials__c();
        db.client_id__c = 'client_id';
        db.client_secret__c = 'client_secret';
        db.name = name;
        insert db;
    }
    
    @isTest
    public static void ClientCredentialsSettings() {
        createTestClientCredentials('Test');
        ClientCredentialsSettings settings = new ClientCredentialsSettings('Test');
        system.assertEquals('https://test-customers.auth.us-east-1.amazoncognito.com/oauth2/token',  settings.tokenUrl);
        system.assertEquals('https://test.qa.credible.com/graphql',  settings.graphqlUrl);
        system.assertEquals('client_id',  settings.clientId);
        system.assertEquals('client_secret',  settings.clientSecret);
        createTestClientCredentials('Production');
        settings = new ClientCredentialsSettings('Production');
        system.assertEquals('https://www.credible.com/graphql',  settings.graphqlUrl);
    }
    
    @isTest
    public static void getNames() {
        createTestClientCredentials('Test');
        system.assertEquals(new Set<String> { 'Test' },  ClientCredentialsSettings.getNames());
    }
}