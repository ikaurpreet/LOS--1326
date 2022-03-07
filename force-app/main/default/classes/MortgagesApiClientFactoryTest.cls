@isTest
private class MortgagesApiClientFactoryTest {

    @isTest
    static void createMortgagesApiClient() {
        MortgagesApiClient client = new MortgagesApiClientFactory().createMortgagesApiClient();
    }

    @isTest
    static void createEncompassClient() {
        MortgagesEncompassClient client = new MortgagesApiClientFactory().createEncompassClient();
    }

    @isTest
    static void createImpersonationsClient() {
        MortgagesImpersonationsClient client = new MortgagesApiClientFactory().createImpersonationsClient();
    }

    @isTest
    static void createTasksApiClient() {
        MortgagesTasksApiClient client = new MortgagesApiClientFactory().createTasksApiClient();
    }

    @isTest
    static void createDocsApiClient() {
        MortgagesDocsApiClient client = new MortgagesApiClientFactory().createDocsApiClient();
    }

    @isTest
    static void createDisclosuresApiClient() {
        DisclosuresApiClient client = new MortgagesApiClientFactory().createDisclosuresApiClient();
    }

    @isTest
    static void factoryForEnv() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        HttpClientMockTest httpMock = new HttpClientMockTest();
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();

        MortgagesApiClientFactory factory = new MortgagesApiClientFactory(MortgagesConstants.Env.TEST);

        System.assert(factory != null);
        System.assert(factory.getClient() != null);
        Test.stopTest();
    }

    @isTest
    static void createUserFactory() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        HttpClientMockTest httpMock = new HttpClientMockTest();
        Test.setMock(HttpCalloutMock.class, httpMock);
        Test.startTest();

        MortgagesApiClientFactory factory = MortgagesApiClientFactory.createUserFactory('TEST');

        System.assert(factory != null);
        System.assert(factory.getClient() != null);
        Test.stopTest();
    }

    @isTest
    static void noNamedCredentials() {
        try {
            MortgagesApiClientFactory factory = MortgagesApiClientFactory.prodUserFactory('test');
            System.assert(false, 'Should not get here.');
        } catch (MortgagesNamedCredentialsGraphQLClient.NoNamedCredentialsException e) {
            System.assert(e.getMessage().contains('Can\'t find named credentials for'));
        }
    }
}