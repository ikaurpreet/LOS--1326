global virtual class MortgagesApplicationClient {
    public class GrqphQLException extends Exception {}
    protected MortgagesGraphQLClient client;
    
    public MortgagesApplicationClient(MortgagesGraphQLClient client) { 
        this.client = client;
    }
    
    public MortgagesApplicationClient(MortgagesConstants.Env env) {
        this.client = new MortgagesGraphQLClient(MortgagesSettings.getInstance(env));
    }

    public MortgagesApplicationClient(String graphqlUrl, String accessToken) {
        this.client = new MortgagesGraphQLClient(graphqlUrl, accessToken);
    }
    
    protected void processErrors(MortgagesGraphQLClient.Results results) {
        if (results.hasErrors()) {
            throw new GrqphQLException(results.errors.getMessage());
        }
    }
}