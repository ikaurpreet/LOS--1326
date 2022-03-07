global class SandboxPostRefresh implements SandboxPostCopy {
    global void runApexClass(SandboxContext context) {
        System.debug(context.organizationId());
        System.debug(context.sandboxId());
        System.debug(context.sandboxName());
        run(context.sandboxName());
    }

    global static void run(String sandboxName) {
        if (!Test.isRunningTest())
            Id batchInstanceId = Database.executeBatch(new DeactivateUsers(sandboxName), 10);

        List<CredibleClientCredentials__c> credentials = [SELECT id FROM CredibleClientCredentials__c];
        delete credentials;

        List<MortgagesProductionSettings__c> settings = [SELECT id FROM MortgagesProductionSettings__c];
        delete settings;
	}
}