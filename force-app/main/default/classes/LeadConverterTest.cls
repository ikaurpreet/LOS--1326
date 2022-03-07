@istest
public class LeadConverterTest {
    @TestSetup
    static void makeData() {
        Account a = MortgagesTestFactory.createAccount();
        Lead borrower = new Lead(
            User_Id__c = a.user_uuid__c, 
            Cosigner_or_Borrower_ID__c = 'cosigner', 
            participant_id__c = 'borrower', 
            Email = 'borrower@test.com', 
            LastName = 'Borrower', 
            User_Role__c='borrower', 
            SubmissionType__c='In_School', 
            Submission_Id__c = '111222', 
            Has_Account__c=NULL, 
            Status = 'FIP', 
            isConverted = false
        );
        insert borrower;

    }
    
    public static testmethod void loadConvert() {
    		LeadConverter.loadConvert(new Set<Id>{});
    }
    
    public static testmethod void needConvert() {
    		LeadConverter.needConvert(1);
    }
    
    public static testmethod void convert() {
        Lead borrower = [SELECT Id FROM Lead limit 1];
        Test.startTest();
        LeadConverter.convert(new Set<Id>{borrower.id});
        Test.stopTest();
        borrower = [SELECT Id, IsConverted from Lead where Id =: borrower.Id];
        System.assert(borrower.IsConverted, 'Lead was not converted');
    }
}