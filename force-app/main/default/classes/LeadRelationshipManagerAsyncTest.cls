@isTest
public with sharing class LeadRelationshipManagerAsyncTest {
	public static Lead createLead() {
		Lead borrower = new Lead(User_Id__c = '000002', Cosigner_or_Borrower_ID__c = 'cosigner', participant_id__c = 'borrower', Email = 'borrower@test.com', LastName = 'Borrower', User_Role__c='borrower', SubmissionType__c='In_School', Submission_Id__c = '111222', Has_Account__c=NULL, Status = 'FIP', isConverted = false);
    		insert borrower;
    		return borrower;
	}
	
	public static Account createAccount() {
		Account a = new Account(Name='TestAccount', 
							 user_id__c='12123123',
								FirstName='test', 
								LastName='test3',
								PersonEmail='asdasdads@adasd.sd',
								Person_Email__c='asdasdads@adasd.sd'); 
								insert a;
		return a;
	}
	
	
	public static Set<ID> AccountIds() {
		return new Set<ID> { createAccount().ID };
	}
	
	public static Set<ID> LeadIds() {
		return new Set<ID> { createLead().ID };
	}
    public testmethod static void processLeads() {
    		Test.startTest();
    		LeadRelationshipManagerAsync.processLeads(LeadIds());
    		Test.stopTest();
    }
    
    public testmethod static void leadToLead() {
    		Test.startTest();
    		LeadRelationshipManagerAsync.leadToLead(LeadIds());
    		Test.stopTest();
    }
    
    public testmethod static void leadToAccount() {
    		Test.startTest();
    		LeadRelationshipManagerAsync.leadToAccount(LeadIds());
    		Test.stopTest();
    }
    
    public testmethod static void accountToLead() {
    		Test.startTest();
    		LeadRelationshipManagerAsync.accountToLead(LeadIds());
    		Test.stopTest();
    }
    
    public testmethod static void opportunityToAccount() {
    		
    }
    
    public testmethod static void convertLead() {
    		LeadRelationshipManagerAsync.convertLead(LeadIds());
    }
}