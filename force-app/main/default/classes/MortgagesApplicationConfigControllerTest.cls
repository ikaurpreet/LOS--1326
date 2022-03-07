@isTest
private class MortgagesApplicationConfigControllerTest {
    static final String MOCK_RESPONSE_DATA = '{"key":"value"}';

    @isTest
    static void getApplicationConfig() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        HttpClientMockTest httpClientMock = mockGetApplicationConfig(MOCK_RESPONSE_DATA);
        Test.setMock(HttpCalloutMock.class, httpClientMock);
        Test.startTest();

        String config = MortgagesApplicationConfigController.getApplicationConfig('TEST');

        System.assertEquals(MOCK_RESPONSE_DATA, config);
        Test.stopTest();
    }

    @isTest
    static void updateStateConfig() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        HttpClientMockTest httpClientMock = mockUpdateApplicationConfig('CA', true, MOCK_RESPONSE_DATA);
        Test.setMock(HttpCalloutMock.class, httpClientMock);
        Test.startTest();

        String config = MortgagesApplicationConfigController.updateStateConfig('CA', true, 'TEST');

        System.assertEquals(MOCK_RESPONSE_DATA, config);
        Test.stopTest();
    }

    @isTest
    static void getEnvs() {
        ClientCredentialsSettingsTest.createTestClientCredentials('env1');
        ClientCredentialsSettingsTest.createTestClientCredentials('env2');

        String envs = MortgagesApplicationConfigController.getEnvs();

        System.assert (envs.contains('env1'));
        System.assert (envs.contains('env2'));
    }

    private static HttpClientMockTest mockUpdateApplicationConfig(String stateCode, Boolean approved, String mockData) {
        String expectedRequest =
            '{'
                + '"variables":"{\\"states\\":[{\\"approved\\":' + approved + ',\\"code\\":\\"'+ stateCode + '\\"}]}",'
                + '"operationName":"salesforceUpdateApplicationConfig",'
                + '"query":"' + MortgagesApiClient.MUTATION_SALESFORCE_UPDATE_APPLICATION_CONFIG + '"'
                + '}';
        String mockedResponse = '{"data":{"salesforceUpdateApplicationConfig":' + mockData + '}}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }

    private static HttpClientMockTest mockGetApplicationConfig(String data) {
        String expectedRequest =
            '{'
                + '"variables":"null",'
                + '"operationName":"mortgagesSalesforceApplicationConfig",'
                + '"query":"' + MortgagesApiClient.QUERY_MORTGAGES_SALESFORCE_APPLICATION_CONFIG + '"'
                + '}';
        String mockedResponse = '{"data":{"mortgagesSalesforceApplicationConfig":' + data + '}}';
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
}