@isTest
private class DeactivateUsersTest {
    @TestSetup
    static void makeData() {
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User']; 
        User u = new User(Alias = 'standt', Email='deactivateUserTest1234@credible.com', 
            EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US', 
            LocaleSidKey='en_US', ProfileId = p.Id, 
            TimeZoneSidKey='America/Los_Angeles', UserName='deactivateUserTest1234@credible.com');
        insert u;
    }

    @isTest
    static void testDeactivateUsers() {
        Sandbox_User_Refresh__c su = new Sandbox_User_Refresh__c();
        su.Email__c = 'test_cred@credible.com';
        su.First_Name__c = 'TestFName';
        su.Last_Name__c = 'TestLName';
        su.Profile__c = 'System Administrator';
        insert su;
        String query = 'SELECT id, Email, profile.name, Do_No_Deactivate_After_Refresh__c, IsActive FROM User WHERE Email = \'deactivateUserTest1234@credible.com\'';
        Test.startTest();
        DeactivateUsers d = new DeactivateUsers('test_cred', query);
        Id batchInstanceId = Database.executeBatch(d, 10);
        Test.stopTest();
    }
}