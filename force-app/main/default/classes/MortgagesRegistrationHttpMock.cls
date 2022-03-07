@isTest
public with sharing  class MortgagesRegistrationHttpMock implements HttpCalloutMock {
    // Implement this interface method
    public HTTPResponse respond(HTTPRequest req) {
        // Optionally, only send a mock response for a specific endpoint
        // and method.
        System.assertEquals('https://posapi.loandepot.com/api/v1/authentication/wholesale/login', req.getEndpoint());
        System.assertEquals('{"password":"password","userName":"username:accountId"}', req.getBody());
        System.assertEquals('POST', req.getMethod());
        
        // Create a fake response
        HttpResponse res = new HttpResponse();
        res.setHeader('Content-Type', 'application/json');
        res.setBody('{"data":{"token":"token"}}');
        res.setStatusCode(200);
        return res;
    }
}