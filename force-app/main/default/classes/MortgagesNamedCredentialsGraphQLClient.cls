public with sharing class MortgagesNamedCredentialsGraphQLClient extends MortgagesGraphQLClient  {
    public string name { get; set; }
    public MortgagesNamedCredentialsGraphQLClient(String name) {
        super('callout:' + name + '/graphql', '');
        this.name = name;
        checkIfAuthSettingsExist();
    }

    public virtual class AuthException extends Exception {}

    public class NoNamedCredentialsException extends AuthException {}
    public class TokenExpiredException extends AuthException {}
    public class NoTokenException extends AuthException {}
    public class NoExternalSourceException extends AuthException {}

    public void checkIfAuthSettingsExist() {
        List<NamedCredential> namedCredentials = [SELECT id, DeveloperName FROM NamedCredential WHERE DeveloperName =: this.name];
        if (namedCredentials.size() == 0) {
            throw new NoNamedCredentialsException('Can\'t find named credentials for ' + this.name + ' env. Please, contact with administrator.');
        }
        List<ExternalDataUserAuth> userAuths = [SELECT ID, ExternalDataSourceId, UserId, Username  FROM ExternalDataUserAuth WHERE ExternalDataSourceId =: namedCredentials[0].id and  userId =: UserInfo.getUserId()];
        if (userAuths.size() == 0) {
            throw new NoExternalSourceException(ExternalDataUserAuth.getSObjectType().getDescribe().getKeyPrefix());
        }
    }

    public String findAuthId() {
        NamedCredential namedCredentials = [SELECT id, DeveloperName, AuthProviderId FROM NamedCredential WHERE DeveloperName =: this.name LIMIT 1];
        AuthProvider authProvider = [SELECT id, OauthKickoffUrl FROM AuthProvider WHERE id=: namedCredentials.AuthProviderId];
        ExternalDataUserAuth userAuth = [SELECT ID, ExternalDataSourceId, UserId, Username  FROM ExternalDataUserAuth WHERE ExternalDataSourceId =: namedCredentials.id and  userId =: UserInfo.getUserId()];
        return userAuth.id;
    }

    protected override void handleErrors(MortgagesGraphQLClient.ErrorCollection errors) {
        switch on errors.getMessage() {
            when 'TokenExpired' {
                throw new TokenExpiredException(findAuthId());
            }
            when 'NoToken' {
                throw new NoTokenException(findAuthId());
            } when else {
                super.handleErrors(errors);
            }
        }
    }
}