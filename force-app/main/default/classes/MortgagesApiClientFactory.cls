public virtual  with sharing class MortgagesApiClientFactory {
    protected MortgagesConstants.ENV env;
    protected MortgagesGraphQLClient graphqlClient;
    public MortgagesApiClientFactory(MortgagesConstants.ENV env) {
        this.env = env;
        MortgagesSettings settings = MortgagesSettings.getInstance(this.env);
        MortgagesOIDCClient oidcClient = new MortgagesOIDCClient(settings.tokenUrl, settings.clientId, settings.clientSecret);
        this.graphqlClient = new MortgagesGraphQLClient(settings.graphqlUrl, oidcClient.clientCredentialsToken().accessToken);
    }
    public MortgagesApiClientFactory() {}

    public static MortgagesApiClientFactory createUserFactory(String env) {
        if (Test.isRunningTest()) { 
            return new MortgagesApiClientFactory(MortgagesConstants.getEnv(env)); 
        } else {
            return prodUserFactory(env);
        }
    }
    
    @TestVisible
    static MortgagesApiClientFactory prodUserFactory(String env) {
        if (MortgagesSettings.getInstance().clientCredentials) {
            return new ClientCredentialsFactory(env);
        } else {
            return new NamedCredentialFactory(MortgagesConstants.getEnv(env));
        }
    }

    public MortgagesGraphQLClient getClient() {
        return this.graphqlClient;
    }
    
    public class ClientCredentialsFactory extends MortgagesApiClientFactory {
        public ClientCredentialsFactory(String env) {
            ClientCredentialsSettings settings = new ClientCredentialsSettings(env);
            MortgagesOIDCClient oidcClient = new MortgagesOIDCClient(settings.tokenUrl, settings.clientId, settings.clientSecret);
            this.graphqlClient = new MortgagesGraphQLClient(settings.graphqlUrl, oidcClient.clientCredentialsToken().accessToken);
        }
    }
    public class NamedCredentialFactory extends MortgagesApiClientFactory {
        public NamedCredentialFactory(MortgagesConstants.ENV env) {
            this.graphqlClient = new MortgagesNamedCredentialsGraphQLClient(env.name());
        }
    }

    public virtual MortgagesApiClient createMortgagesApiClient() {
        return new MortgagesApiClient(this.graphqlClient);
    }

    public virtual MortgagesEncompassClient createEncompassClient() {
        return new MortgagesEncompassClient(this.graphqlClient);
    }

    public virtual MortgagesImpersonationsClient createImpersonationsClient() {
        return new MortgagesImpersonationsClient(this.graphqlClient);
    }

    public virtual MortgagesTasksApiClient createTasksApiClient() {
        return new MortgagesTasksApiClient(this.graphqlClient);
    }

    public virtual MortgagesDocsApiClient createDocsApiClient() {
        return new MortgagesDocsApiClient(this.graphqlClient);
    }

    public virtual DisclosuresApiClient createDisclosuresApiClient() {
        return new DisclosuresApiClient(this.graphqlClient);
    }
}