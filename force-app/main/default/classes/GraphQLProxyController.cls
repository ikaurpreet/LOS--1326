/**
 * A general controller which proxies requests from Salesforce FE to rails GraphQL APIs.
 */
public virtual with sharing class GraphQLProxyController {
    public class GrqphQLException extends Exception {}

    private static Map<String, MortgagesGraphQLClient> graphQlClients = new Map<String, MortgagesGraphQLClient>();

    private static MortgagesGraphQLClient graphQLClient(String env) {
        MortgagesGraphQLClient mortgagesGraphQLClient =  graphQlClients.get(env);
        if (mortgagesGraphQLClient != null) {
            return mortgagesGraphQLClient;
        }
        mortgagesGraphQLClient = MortgagesApiClientFactory.createUserFactory(env).getClient();
        graphQlClients.put(env, mortgagesGraphQLClient);
        return mortgagesGraphQLClient;
    }

    @AuraEnabled
    public static String request(String env, String jsonBody){
        return graphQLClient(env).query(jsonBody);
    }

    @AuraEnabled
    public static String query(ID identifier, String query, String variables) {
        MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(identifier);
        MortgagesGraphQLClient client = graphQLClient(env.name());
        MortgagesGraphQLClient.Query gqlQuery = new MortgagesGraphQLClient.Query();

        gqlQuery.operationName = query.split(' ')[1].split('[(]')[0]; // Uses the query to get the operation name.
        gqlQuery.body = query;
        gqlQuery.stringifyedVariables = variables;

        MortgagesGraphQLClient.Results results = client.query(gqlQuery);

        if (results.hasErrors()) {
            throw new GrqphQLException(results.errors.getMessage());
        }

        return (String)results.data;
    }

    @AuraEnabled
    public static String mutate(ID identifier, String query, String variables){
        return GraphQLProxyController.query(identifier, query, variables);
    }

    @AuraEnabled
    public static String queryWithMap(ID identifier, String query, Map<String, Object> variables) {
        return GraphQLProxyController.query(identifier, query, JSON.serialize(variables));
    }

    @AuraEnabled
    public static String mutateWithMap(ID identifier, String query, Map<String, Object> variables){
        return GraphQLProxyController.query(identifier, query, JSON.serialize(variables));
    }
}