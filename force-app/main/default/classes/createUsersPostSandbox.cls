public class createUsersPostSandbox implements Database.Batchable<sObject>, Database.Stateful{
    public String query;
    public String sandboxName;
    public createUsersPostSandbox(String sandboxName){
        query = 'Select id, Email__c,First_Name__c,Last_Name__c,Profile__c  from Sandbox_User_Refresh__c';
        this.sandboxName = sandboxName;
    }
    public Database.QueryLocator start(Database.BatchableContext BC){
        return Database.getQueryLocator(query);
    }
    public void execute(Database.BatchableContext BC, List<sObject> scope){
        system.debug('>>'+scope);
        List<Sandbox_User_Refresh__c> users_cs = (List<Sandbox_User_Refresh__c>)scope;
        Set<String> profileSet = new Set<String>();
        for(Sandbox_User_Refresh__c s : users_cs){
            profileSet.add(s.Profile__c);
        }
        List<Profile> profiles = [Select id,Name from Profile where name IN : profileSet];
        Map<String, Id> profileMap = new Map<String, Id>();
        for(Profile p : profiles){
            profileMap.put(p.Name, p.Id);
        }
        List<User> users = new List<User>();
        for(Sandbox_User_Refresh__c s : users_cs){
            User objUser = new User();
            objUser.FirstName = s.First_Name__c;
            objUser.LastName = s.Last_Name__c;
            objUser.Alias = (s.First_Name__c+s.Last_Name__c.subString(0,1)).subString(0,8);
            objUser.Email = s.Email__c;
            objUser.Username = s.Email__c+sandboxName;
            objUser.ProfileId = profileMap.get(s.Profile__c);
            objUser.TimeZoneSidKey = 'America/Los_Angeles';
            objUser.LanguageLocaleKey = 'en_US';
            objUser.EmailEncodingKey = 'UTF-8';
            objUser.LocaleSidKey = 'en_US';
            users.add(objUser);
        }
        insert users;
        for(User u : users){
            System.resetPassword(u.Id, true);
        }
    }
    public void finish(Database.BatchableContext info){
    }
}