@isTest
private class MortgagesOIDCClientTest {
    static final String CLIENT_ID = 'client';
    static final String CLIENT_SECRET = 'secret';
    static final String TOKEN_URL = 'token';
    static final String GRAPHQL_URL = 'graphql';
    static final Boolean ENABLE_ENCOMPASS_QUEUE = true;

    @isTest
    static void clientForEnv() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.startTest();
        MortgagesOIDCClient client = new MortgagesOIDCClient(MortgagesConstants.Env.TEST);
        System.assert(client != null);
        Test.stopTest();
    }

    @isTest
    static void clientForMortgagesSettings() {
        MortgagesSettings settings = MortgagesSettings.createInstance(CLIENT_ID, CLIENT_SECRET, TOKEN_URL, GRAPHQL_URL, ENABLE_ENCOMPASS_QUEUE);
        MortgagesOIDCClient client = new MortgagesOIDCClient(settings);

        System.assert(client != null);
    }

    @isTest
    static void client() {
        MortgagesOIDCClient client = new MortgagesOIDCClient(TOKEN_URL, CLIENT_ID, CLIENT_SECRET);

        System.assert(client != null);
    }

    @isTest
    static void clientCredentialsToken() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.startTest();
        HttpClientMockTest httpMock = new HttpClientMockTest();
        Test.setMock(HttpCalloutMock.class, httpMock);
        MortgagesOIDCClient client = new MortgagesOIDCClient(MortgagesConstants.Env.TEST);

        MortgagesOIDCClient.TokenResponse tokenResponse = client.clientCredentialsToken();

        System.assert(tokenResponse != null);
        System.assertEquals('accessToken', tokenResponse.accessToken);
        System.assertEquals('expiresIn', tokenResponse.expiresIn);
        System.assertEquals('tokenType', tokenResponse.tokenType);
        System.assertEquals(null, tokenResponse.refreshToken);
        Test.stopTest();
    }
}