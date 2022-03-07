global class MortgagesImpersonationsClient extends MortgagesApplicationClient {
    public MortgagesImpersonationsClient(MortgagesConstants.Env env) { super(env); }
    public MortgagesImpersonationsClient(MortgagesGraphQLClient client) { super(client); }
    public MortgagesImpersonationsClient(String graphqlUrl, String accessToken) { super(graphqlUrl, accessToken); }

    public String requestImpersonation(String userUuid) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'requestImpersonation';
        mutation.variables = new Map<String, Object> { 'input' => new Map<String, String> { 'impersonatee' => userUuid } };
        mutation.body = 'mutation requestImpersonation($input: RequestInpersonationInput!) {' +
            'requestImpersonation(input: $input) {' +
                'uuid,' +
                'impersonatee,' +
                'impersonator,' +
                'authCode,' +
                'expiresAt,' +
                'impersonatedAt,' +
                'createdAt' +
            '}' +
        '}';
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation);
        
        processErrors(results);   
        
        String data = (String)results.data;
        
        return data;

        
    }
}