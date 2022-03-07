@istest
public class AccountDeleteLeadTest {
    Private Static testmethod void validateDeleteTrigger() {    
        Account user = new Account(FirstName='Test', LastName='Testerson', Person_Email__c='test555@gmail.com', user_id__c='testabc5555');
        insert user;
        
        Account acc = [select id,name from Account where user_id__c = 'testabc5555'];

        Lead borrower = new Lead(User_Id__c = '000002', Cosigner_or_Borrower_ID__c = 'cosigner', participant_id__c = 'borrower', Email = 'borrower@test.com', LastName = 'Borrower', User_Role__c='borrower', SubmissionType__c='In_School', Submission_Id__c = '111222', Has_Account__c = acc.id, Status = 'FIP', isConverted = false);
        
        insert borrower;
        delete user;
    }
}