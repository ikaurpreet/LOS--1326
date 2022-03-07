@isTest
public with sharing class HttpClientMockTest implements HttpCalloutMock {
    public static final String TOKEN_URL = 'tokenUrl';
    public static final String GRAPHQL_URL = 'graphqlUrl';
    
    Integer invocations = 0;
    Map<String, List<HttpExchange>> endpointMocks = new Map<String, List<HttpExchange>>();

    public HttpClientMockTest() {
        putExchange(
            TOKEN_URL,
            new HttpExchange(
                'client_id=clientId&client_secret=clientSecret&grant_type=client_credentials',
                '{"access_token":"accessToken","expires_in":"expiresIn","token_type":"tokenType"}'
            )
        );
    }

    public HttpClientMockTest withEndpointExchange(String endpoint, String request, String response) {
        putExchange(endpoint, new HttpExchange(request, response));
        return this;
    }

    public Integer invokedTimes() {
        return invocations;
    }
    
    public HTTPResponse respond(HTTPRequest req) {
        invocations ++;
        System.assertEquals('POST', req.getMethod());
        String endpoint = req.getEndpoint();
        List<HttpExchange> exchanges = endpointMocks.get(endpoint);
        if (exchanges == null) {
            throw new HttpClientMockException('Endpoint "' + endpoint + '" is not configured for the mock.');
        }
    
        HttpExchange usedExchange = null;
        for (HttpExchange exchange : exchanges) {
            if (exchange.request.equals(req.getBody())) {
                usedExchange = exchange;
            }
        }
        
        if(usedExchange == null) {
            throw new HttpClientMockException('Could not find a matching exchange for request ' + req.getBody() + ' among the configured requests ' + requests(exchanges));
        }
        
        removeExchange(endpoint, usedExchange);
    
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody(usedExchange.response);
        res.setStatusCode(200);
        return res;
    }
    
    public static String graphQlRequest(String operationName, String query, Map<String, Object> variables) {
        String queryVariables = JSON.serialize(variables);
        return JSON.serialize(new Map<String, Object> { 'query' => query, 'operationName' => operationName, 'variables' => queryVariables });
    }
    
    public static String graphQlResponse(String operationName, Map<String, Object> responseData) {
        String document = JSON.serialize(responseData);
        return  '{"data":{"' + operationName + '":' + document + '}}';
    }
    
    void putExchange(String endpoint, HttpExchange exchange) {
        List<HttpExchange> exchanges = endpointMocks.get(endpoint);
        if (exchanges == null) {
            exchanges = new List<HttpExchange>();
            endpointMocks.put(endpoint, exchanges);
        }
        exchanges.add(exchange);
    }
    
    void removeExchange(String endpoint, HttpExchange exchange) {
        List<HttpExchange> exchanges = endpointMocks.get(endpoint);
        if (exchanges == null || exchanges.size() == 0) {
            return;
        }
        List<HttpExchange> newExchanges = new List<HttpExchange>();
        for (HttpExchange httpExchange : exchanges) {
            if (httpExchange != exchange) {
                newExchanges.add(httpExchange);
            }
        }
        endpointMocks.put(endpoint, newExchanges);
    }
    
    List<String> requests(List<HttpExchange> exchanges) {
        List<String> requests = new List<String>();
        for (HttpExchange exchange : exchanges) {
            requests.add(exchange.request);
        }
        return requests;
    }
    
    class HttpExchange {
        public String request { get; private set; }
        public String response { get; private set; }

        HttpExchange(String request, String response) {
            this.request = request;
            this.response = response;
        }
    }

    class HttpClientMockException extends Exception { }
}