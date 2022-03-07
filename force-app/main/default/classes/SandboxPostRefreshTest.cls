@isTest
class SandboxPostRefreshTest {

    @isTest
    static void testMySandboxPrep() {
        Test.startTest();
        Test.testSandboxPostCopyScript(
            new SandboxPostRefresh(), UserInfo.getOrganizationId(),
                UserInfo.getOrganizationId(), UserInfo.getOrganizationName());
        Test.stopTest();
    }
}