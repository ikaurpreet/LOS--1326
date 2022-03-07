@isTest
public class LeadRelationshipManagerTest {
    static testMethod void borrower_or_cosigner() {
        Lead cosigner = new Lead(User_Id__c = '000001', Cosigner_or_Borrower_ID__c = 'borrower', participant_id__c = 'cosigner', Email = 'cosigner@test.com', LastName = 'Cosigner', User_Role__c='cosigner', SubmissionType__c='In_School', Submission_Id__c = '111222', Has_Account__c=NULL, Status = 'PQRR');
        //Lead borrower = new Lead(User_Id__c = '000002', Cosigner_or_Borrower_ID__c = 'cosigner', participant_id__c = 'borrower', Email = 'borrower@test.com', LastName = 'Borrower', User_Role__c='borrower', SubmissionType__c='In_School', Submission_Id__c = '111222', Has_Account__c=NULL, Status = 'PQRR');
        List<Lead> leads = new List<Lead>();
        leads.add(cosigner);
        //leads.add(borrower);
        upsert leads;
    }
    
    static testMethod void accounts() {     
        List<Opportunity> opportunities = new List<Opportunity>();
        LeadRelationshipManager.accounts(opportunities); 
    }
    
    static testMethod void leads() {
        List<Opportunity> opportunities = new List<Opportunity>();
        List<Account> accounts = new List<Account>();
        LeadRelationshipManager.leads(accounts);
    }
    
    static testMethod void record_types_opportunity() {
        List<Opportunity> opportunities = new List<Opportunity>();
        LeadRelationshipManager.record_types(opportunities);
    }
    
    static testMethod void check_if_lead_converted() {
        List<Opportunity> opportunities = new List<Opportunity>();
        LeadRelationshipManager.check_if_lead_converted(opportunities);
    }

    static testMethod void guid() {
        String guid = LeadRelationshipManager.guid();

        System.assertEquals(36, guid.length());
    }

    static testMethod void convertLead() {
        Set<ID> ids = (new Map<Id,SObject>(new List<Opportunity>())).keySet();
        LeadRelationshipManager.convertLead(ids);
    }

    static testMethod void opportunityToAccount() {
        Set<ID> ids = (new Map<Id,SObject>(new List<Opportunity>())).keySet();
        LeadRelationshipManager.opportunityToAccount(ids);
    }

    static testMethod void accountToLead() {
        Set<ID> ids = (new Map<Id,SObject>(new List<Opportunity>())).keySet();
        LeadRelationshipManager.accountToLead(ids);
    }
}