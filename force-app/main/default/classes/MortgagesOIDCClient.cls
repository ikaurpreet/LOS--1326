public with sharing class MortgagesOIDCClient {
    private String tokenUrl;
    private String clientId;
    private String clientSecret;
    static final Integer TIMEOUT = 60000;

    public class FetchTokenException extends Exception {}
    public class TokenResponse {
        protected String access_token;
        protected String refresh_token;
        protected String expires_in;
        protected String token_type;
        
        public String refreshToken { get { return refresh_token; } }
        public String accessToken { get { return access_token; } }
        public String expiresIn { get { return expires_in; } }
        public String tokenType { get { return token_type; } }
    }

    public MortgagesOIDCClient(MortgagesConstants.Env env) {
        this(MortgagesSettings.getInstance(env));
    }

    public MortgagesOIDCClient(MortgagesSettings settings) {
        this.clientId = settings.clientId;
        this.clientSecret = settings.clientSecret;
        this.tokenUrl = settings.tokenUrl;
    }

    public MortgagesOIDCClient(String tokenUrl, String clientId, String clientSecret) {
        this.tokenUrl = tokenUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

//    TODO delete after verification
//    public TokenResponse refreshToken(String refreshToken) {
//        return new TokenResponse();
//    }

    public TokenResponse clientCredentialsToken() {
        string payload = 'client_id=' +clientId + '&client_secret=' + clientSecret + '&grant_type=client_credentials';
        Map<String, String> headers = new Map<String, String>();
        headers.put('Content-Type', 'application/x-www-form-urlencoded');
        HttpResponse response = this.requestResponse(tokenUrl, 'POST', payload, headers);
        
        if (response.getStatusCode() != 200) {
            throw new FetchTokenException('Cannot fetch access token');
        }
        
        JSONParser parser = JSON.createParser(response.getBody());
        system.debug(response.getBody());
        TokenResponse tokenResponse = (TokenResponse)parser.readValueAs(TokenResponse.class);
        
        return tokenResponse;
    }
    
//        TODO delete after verification
//    public tokenResponse authorizationCodeToken(String code) {
//        string payload = 'code='+code+'&client_id=' +clientId + '&client_secret=' + clientSecret + '&grant_type=authorization_code&redirect_uri=https://dev1-admin.qa.credible.com/cognito/login_callback';
//        Map<String, String> headers = new Map<String, String>();
//        headers.put('Content-Type', 'application/x-www-form-urlencoded');
//        HttpResponse response = this.requestResponse(tokenUrl, 'POST', payload, headers);
//
//        system.debug(response.getStatusCode());
//        system.debug(response.getBody());
//        if (response.getStatusCode() != 200) {
//            throw new FetchTokenException('Cannot fetch access token');
//        }
//
//        JSONParser parser = JSON.createParser(response.getBody());
//
//        TokenResponse tokenResponse = (TokenResponse)parser.readValueAs(TokenResponse.class);
//
//        return tokenResponse;
//    }
    
    private HTTPResponse requestResponse(String url, String method, String payload, Map<String, String> headers) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(url);
        req.setMethod(method);
        req.setTimeout(TIMEOUT);
        for(String key: headers.keySet()) {
            req.setHeader(key, headers.get(key));
        }
        req.setHeader('Content-Length',String.valueOf(payload.length()));
        req.setBody(payload);
        Http http = new Http();
        HTTPResponse res = http.send(req);
        return res;
    }
}