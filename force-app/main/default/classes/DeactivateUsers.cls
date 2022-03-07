public class DeactivateUsers implements Database.Batchable<sObject>, Database.Stateful {
    public String sandboxName;
    private string query;

    public deactivateUsers(String sandboxName) {
        this.sandboxName = sandboxName;
    }

    // This is for testing purposes, so we can pass in the user we created instead of running on all users, because deactivating some users will cause failures
    public deactivateUsers(String sandboxName, String query) {
        this.sandboxName = sandboxName;
        this.query = query;
    }

    public Database.QueryLocator start(Database.BatchableContext BC) {
        // These users cause errors if you try to deactivate them.
        Set<String> specialUsers = new Set<String>();
        specialUsers.add('sholmes@credible.com.invalid');
        specialUsers.add('jmunz@credible.com.invalid');
        specialUsers.add('crediblew9@credible.com.invalid');
        specialUsers.add('jalbin@credible.com.invalid');
        specialUsers.add('tdavis@credible.com.invalid');
        specialUsers.add('rsandoval@00d61000000dqmqeau');
        specialUsers.add('automatedcase@00d61000000dqmqeau.ext');
        specialUsers.add('dgehres@credible.com.invalid');
        specialUsers.add('kgriffin@credible.com.invalid');
        specialUsers.add('noreply@salesforce.com');
        specialUsers.add('lmassenburg@credible.com.invalid');
        specialUsers.add('dwatson@credible.com.invalid');
        specialUsers.add('tbrody@credible.com.invalid');
        specialUsers.add('noreply@salesforce.com.invalid');
        specialUsers.add('aowings@credible.com.invalid');
        specialUsers.add('salesforceadmin@credible.com.invalid');
        if (!String.IsEmpty(query)) {
            return Database.getQueryLocator(query);
        }
        return Database.getQueryLocator([SELECT id, Email, profile.name, Do_No_Deactivate_After_Refresh__c, IsActive FROM User WHERE (IsActive = true OR (IsActive = false AND Do_No_Deactivate_After_Refresh__c = true)) AND Email NOT IN :specialUsers]);
    }

    public void execute(Database.BatchableContext BC, List<sObject> scope) {
        System.debug('Deactivating users...');
        String addedPhrase = '.invalid';

        List<User> users = (List<User>)scope;
        for (User u : users) {
            // Check if the user is alread actives
            if (u.Do_No_Deactivate_After_Refresh__c == false && u.Email.endsWith(addedPhrase)) {
                System.debug('Deactivating user "' + u.email + '".');
                u.IsActive = false;
            } else {
                System.debug('Activating user "' + u.email + '".');
                u.IsActive = true;
            }
            u.Email = u.Email.remove(addedPhrase);
        }

        update users;
    }

    public void finish(Database.BatchableContext info){
        // Creating users is not working now
    	// Id batchInstanceId = Database.executeBatch(new CreateUsersPostSandbox(sandboxName), 10);
    }
}