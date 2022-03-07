@isTest
public with sharing class AutocreatedRegHandlerTest {
    static testMethod void testCreateAndUpdateUser() {
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User']; 
        User user = new User(Alias = 'standt', Email='standardusercred@credible.com', 
            EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US', 
            LocaleSidKey='en_US', ProfileId = p.Id, 
            TimeZoneSidKey='America/Los_Angeles', UserName='standardusercred@credible.com');
        insert user;
        AutocreatedRegHandler handler = new AutocreatedRegHandler();
        Auth.UserData sampleData = new Auth.UserData('testId', 'testFirst', 'testLast',
            'testFirst testLast', 'standardusercred@credible.com', null, 'standardusercred@credible.com', 'en_US', 'facebook',
            null, new Map<String, String>{'language' => 'en_US'});
        User u = handler.createUser(null, sampleData);
        System.assertEquals('standardusercred@credible.com', u.userName);
        String uid = u.id;
        sampleData = new Auth.UserData('testNewId', 'testNewFirst', 'testNewLast',
            'testNewFirst testNewLast', 'testnewuser@credible.com', null, 'standardcrednew@credible.com', 'en_US', 'facebook',
            null, new Map<String, String>{});
        handler.updateUser(uid, null, sampleData);
    }
}