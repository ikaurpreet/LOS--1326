virtual global class MortgagesGraphQLClient {
    static final Integer TIMEOUT = 60000;
    static final Set<Integer> GRAPHQL_CODES = new Set<Integer> { 200, 400 };
    class FetchTokenException extends Exception {}
    class InternalServerException extends Exception {}
    class TokenResponse {
        protected String access_token;
        protected String expires_in;
        protected String token_type;

        public String accessToken { get { return access_token; } }
        public String expiresIn { get { return expiresIn; } }
        public String tokenType { get { return tokenType; } }
    }

    public class Location {
        public Integer line;
        public Integer column;
    }

    public class Error {
        public String message;
        public List<Location> locations;
        public List<String> path;
        public String realm;
        public String code;
    }

    public class ErrorCollection {
        public List<Error> errors;

        public ErrorCollection(List<Error> errors) {
            this.errors = errors;
        }

        public String getMessage() {
            return this.errors[0].message;
        }
    }

    public class Results {
        public Object data;
        public ErrorCollection errors;

        public Boolean hasErrors() {
            return errors != null && errors.errors != null;
        }
    }

    /* `stringifyedVariables` will be used if `variables` is empty. `stringifyedVariables` is used for more complex variables (like arrays). */
    public virtual class Query {
        public String body;
        public Map<String, Object> variables;
        public String stringifyedVariables;
        public String operationName;
    }

    public virtual class Mutation extends Query {}

    public string graphqlUrl;
    public String accessToken;
    private MortgagesOIDCClient oidcClient;

    public MortgagesGraphQLClient(MortgagesConstants.Env env) {
        this(MortgagesSettings.getInstance(env));
    }

    public MortgagesGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
        this.graphqlUrl = graphqlUrl;
        this.oidcClient = new MortgagesOIDCClient(tokenUrl, clientId, clientSecret);
    }

    public MortgagesGraphQLClient(MortgagesSettings settings) {
        this.graphqlUrl = settings.graphqlUrl;
        this.oidcClient = new MortgagesOIDCClient(settings.tokenUrl, settings.clientId, settings.clientSecret);
    }

    public MortgagesGraphQLClient(String graphqlUrl) {
        this.graphqlUrl = graphqlUrl;
    }

    public MortgagesGraphQLClient(String graphqlUrl, String accessToken) {
        this.graphqlUrl = graphqlUrl;
        this.accessToken = accessToken;
    }

    public String query(String query) {
        String response = graphql(query);

        Map<String, Object> deserialized = (Map<String, Object>)JSON.deserializeUntyped(response);
        if (deserialized.containsKey('errors')) {
            String operationErrors = JSON.serialize(deserialized.get('errors'));
            system.debug('Errors: ' + operationErrors);
            ErrorCollection errors = new ErrorCollection((List<Error>)JSON.deserialize(operationErrors, List<Error>.class));
            handleErrors(errors);
            throw new UnknownException(errors.getMessage());
        }
        return response;
    }

    virtual public Results query(Query query, System.Type type) {
        return graphql(query, type);
    }

    virtual public Results query(Query query) {
        return graphql(query, String.class);
    }

    virtual public Results mutation(Query query, System.Type type) {
        return graphql(query, type);
    }

    virtual public Results mutation(Query query) {
        return graphql(query, String.class);
    }

    public String mutation(String query) {
        return graphql(query);
    }

    public class UnknownException extends Exception {}
    protected virtual void handleErrors(ErrorCollection errors) { }

    private Results graphql(Query query, System.Type type) {
        Map<String, String> payload = new Map<String, String>();
        payload.put('query', query.body);
        payload.put('operationName', query.operationName);
        String variables = query.variables != null ? JSON.serialize(query.variables) : query.stringifyedVariables != null ? query.stringifyedVariables : JSON.serialize(null);
        payload.put('variables', variables);
        String response = graphql(JSON.serialize(payload));

        Results results = new Results();
        Map<String, Object> deserialized = (Map<String, Object>)JSON.deserializeUntyped(response);
        if (deserialized.containsKey('data')) {
            Map<String, Object> data = (Map<String, Object>)deserialized.get('data');

            if (data.containsKey(query.operationName)) {
                String operationResult = JSON.serialize(data.get(query.operationName));
                if (type == String.class) {
                    results.data = operationResult;
                } else {
                    try{
                        results.data = (Object)JSON.deserialize(operationResult, type);
                    } catch(System.JSONException ex) {
                        results.data = null;
                    }
                }
            }
        }

        if (deserialized.containsKey('errors')) {
            String operationErrors = JSON.serialize(deserialized.get('errors'));
            system.debug('Errors: ' + operationErrors);
            results.errors = new ErrorCollection((List<Error>)JSON.deserialize(operationErrors, List<Error>.class));
            handleErrors(results.errors);
        }

        return results;
    }

    private String graphql(String query) {
        String token = accessToken != NULL ? accessToken : fetchToken();
        Map<String, String> headers = new Map<String, String>();
        headers.put('Content-Type', 'application/json;charset=UTF-8');
        headers.put('Authorization', 'Bearer ' + token);
        HttpResponse response = requestResponse(graphqlUrl, 'POST', query, headers);

        Integer statusCode = response.getStatusCode();

        if (!GRAPHQL_CODES.contains(statusCode)) {
            throw new InternalServerException('Internal server error');
        }

        return response.getBody();
    }

    private virtual String fetchToken() {
        return this.oidcClient.clientCredentialsToken().accessToken;
    }

    private HTTPResponse requestResponse(String url, String method, String payload, Map<String, String> headers) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(url);
        system.debug(req.getEndpoint());
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