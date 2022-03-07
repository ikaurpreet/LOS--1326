@isTest
private class MortgagesApplicationClientTest {
    @isTest
    static void clientForEnv() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.startTest();
        MortgagesApplicationClient client = new MortgagesApplicationClient(MortgagesConstants.Env.TEST);
        System.assert(client != null);
        Test.stopTest();
    }

    @isTest
    static void clientForGraphqlUrl() {
        MortgagesApplicationClient client = new MortgagesApplicationClient('testUrl', 'testAccessToken');
        System.assert(client != null);

    }
}