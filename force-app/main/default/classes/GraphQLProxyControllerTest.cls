@IsTest public class GraphQLProxyControllerTest {

    @IsTest public static void getGraphQlResponse() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        Test.startTest();
        String jsonRequest = 'requestData';
        String mockResponse = '{"success": true}';
        Test.setMock(HttpCalloutMock.class, new GraphQLClientMock(jsonRequest, mockResponse));

        System.assertEquals(mockResponse, GraphQLProxyController.request('TEST', jsonRequest));
        Test.stopTest();
    }

    public class GraphQLClientMock implements HttpCalloutMock {

        private String grapgQlRequest { get; set; }
        private String grapgQlResponse { get; set; }

        public GraphQLClientMock(String grapgQlRequest, String grapgQlResponse) {
            this.grapgQlRequest = grapgQlRequest;
            this.grapgQlResponse = grapgQlResponse;
        }

        public HTTPResponse respond(HTTPRequest req) {

            System.assertEquals('POST', req.getMethod());
            String endpoint = req.getEndpoint();
            HttpResponse res = new HttpResponse();
            switch on endpoint {
                when 'tokenUrl' {
                    // Create a fake response
                    System.assertEquals('application/x-www-form-urlencoded', req.getHeader('Content-Type'));
                    System.assertEquals('client_id=clientId&client_secret=clientSecret&grant_type=client_credentials', req.getBody());
                    System.assertEquals('tokenUrl', req.getEndpoint());

                    res.setHeader('Content-Type', 'application/json');
                    res.setBody('{"access_token":"accessToken","expires_in":"expiresIn","token_type":"tokenType"}');
                    res.setStatusCode(200);
                }
                when 'graphqlUrl' {
                    // Create a fake response
                    System.assertEquals('Bearer accessToken', req.getHeader('Authorization'));
                    System.assertEquals('application/json;charset=UTF-8', req.getHeader('Content-Type'));
                    System.assertEquals(grapgQlRequest, req.getBody());

                    res.setHeader('Content-Type', 'application/json');
                    res.setBody(grapgQlResponse);
                    res.setStatusCode(200);
                }
            }

            return res;
        }
    }

}