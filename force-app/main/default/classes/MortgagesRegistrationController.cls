public with sharing class MortgagesRegistrationController {

    @AuraEnabled
    public static String loginToLendersPortal(String accountId, String username, String password){
        String url = 'https://posapi.loandepot.com/api/v1/authentication/wholesale/login';
        String body = '';

        body = '{"password":"' + password + '","userName":"' + username + ':' + accountId + '"}';

        HttpRequest req = new HttpRequest();
        req.setEndpoint(url);
        req.setBody(body);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');


        Http http = new Http();
        HTTPResponse res = http.send(req);

        return res.getBody();
    }

    @AuraEnabled
    public static String mortgagesRegistrationTaskCreate(String submissionUuid, String vertical, String lender){
        String env = MortgagesUtilities.getEnvironment('').name();
        MortgagesApiClient client = MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
        String data = client.mortgagesRegistrationCreateTask(submissionUuid, vertical, lender);

        return data;
    }


    @AuraEnabled
    public static String mortgagesRegistrationFindTask(String submissionUuid){
        String env = MortgagesUtilities.getEnvironment('').name();
        MortgagesApiClient client = MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
        String data = client.mortgagesRegistrationFindTask(submissionUuid);

        return data;
    }

    @AuraEnabled
    public static String mortgagesRegistrationFireTaskEvent(String submissionUuid, String event){
        String env = MortgagesUtilities.getEnvironment('').name();
        MortgagesApiClient client = MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
        String data = client.mortgagesRegistrationFireTaskEvent(submissionUuid, event);

        return data;
    }

    @AuraEnabled
    public static String mortgagesRegistrationUpdateTask(String submissionUuid, String token){
        String env = MortgagesUtilities.getEnvironment('').name();
        MortgagesApiClient client = MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
        String data = client.mortgagesRegistrationUpdateTask(submissionUuid, token);

        return data;
    }
}