public with sharing class DataStorageCleaner {
    public static String AUTOMATION_PREFIX = '%automation%';
    public static void cleanOpportunities(Integer count) {
        String query = '%' + AUTOMATION_PREFIX + '%';
        List<Opportunity> opportunities = [SELECT Id, Account.PersonEmail FROM Opportunity WHERE Account.PersonEmail like :query ORDER BY CreatedDate ASC LIMIT :count ];
        List<Id> opportunityIds = new List<Id>();
        Map<Id, Account> accounts = new Map<Id, Account> ();
        for(opportunity opp: opportunities) {
            opportunityIds.add(opp.id);
            accounts.put(opp.account.id, opp.account);
        }
        List<Document__c> documents = [SELECT id FROM Document__c WHERE Opportunity__c in : opportunityIds];
        List<Custom_Task__c> tasks = [SELECT id FROM Custom_Task__c WHERE Opportunity__c in : opportunityIds];
        List<Spouse__c> spouses = [SELECT id FROM Spouse__c WHERE Opportunity__c in : opportunityIds];
        List<Loan__c> loans = [SELECT id FROM Loan__c WHERE Opportunity__c in : opportunityIds];
        List<Submission_Task__c> submission_tasks = [SELECT id FROM Submission_Task__c WHERE Opportunity__c in : opportunityIds];
        List<Outbound_Task__c> outbound_tasks = [SELECT id FROM Outbound_Task__c WHERE Opportunity__c in : opportunityIds];
        Database.delete(spouses, false);
        Database.delete(outbound_tasks, false);
        Database.delete(loans, false);
        Database.delete(tasks, false);
        Database.delete(documents, false);
        Database.delete(submission_tasks, false);
        Database.delete(opportunities, false);
        Database.delete(accounts.values(), false);
    }

    public static void cleanContacts(Integer count) {
        String query = '%' + AUTOMATION_PREFIX + '%';
        List<Contact> accounts = [SELECT Id, Email FROM Contact WHERE Email like :query ORDER BY CreatedDate ASC LIMIT :count];
        delete accounts;
    }

    public static void cleanAccounts(Integer count) {
        String query = '%' + AUTOMATION_PREFIX + '%';
        List<Account> accounts = [SELECT Id, PersonEmail FROM Account WHERE PersonEmail like :query ORDER BY CreatedDate ASC LIMIT :count];
        Database.delete(accounts, false);
    }

    public static void cleanLeads(Integer count) {
        String query = '%' + AUTOMATION_PREFIX + '%';
        List<Lead> leads = [SELECT Id, Email, Has_Account__r.PersonEmail FROM Lead WHERE Email like :query ORDER BY CreatedDate ASC LIMIT :count];
        Map<Id, Account> accounts = new Map<Id, Account> ();
        List<Id> leadIds = new List<Id>();
        for(Lead lead: leads) {
            leadIds.add(lead.id);
            if (lead.Has_Account__r != null) {
                accounts.put(lead.Has_Account__r.id, lead.Has_Account__r);
            }
        }
        Database.delete(leads, false);
        Database.delete(accounts.values(), false);
    }

    public static void cleanDocuments(Integer count) {
        List<Document__c> documents = [SELECT id FROM Document__c LIMIT :count];
        delete documents;
    }

    public static void cleanCases(Integer count) {
        List<Case> cases = [SELECT id FROM Case LIMIT :count];
        delete cases;
    }

    public static void cleanCommsLogs(Integer count) {
        List<Comms_Log__c> entities = [SELECT id FROM Comms_Log__c LIMIT :count];
        delete entities;
    }

    public static void cleanCustomTasks(Integer count) {
        List<Custom_Task__c> tasks = [SELECT Id FROM Custom_Task__c LIMIT :count];
        delete tasks;
    }

    public static void cleanOutboundTasks(Integer count) {
        List<Outbound_Task__c> tasks = [SELECT Id FROM Outbound_Task__c LIMIT :count];
        delete tasks;
    }

    public static void clearPreviewDocuments() {
        List<Document__c> documents = [SELECT id FROM Document__c WHERE Document_Downloaded__c = true];
        if (documents.size() == 0) { return; }
        Set<Id> documentIds = new Set<Id>();
        for(Document__c document: documents) {
            documentIds.add(document.id);
            document.Document_Downloaded__c = false;
        }
    
        List<ContentDocumentLink> contentLinks = [SELECT id, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId in: documentIds and IsDeleted = false];
        Set<Id> contentDocumentIds = new Set<Id>();
        for(ContentDocumentLink contentLink: contentLinks) {
            contentDocumentIds.add(contentLink.ContentDocumentId);
        }
        List<ContentDocument> contentDocuments = [SELECT id FROM ContentDocument WHERE id in: contentDocumentIds];
        delete contentDocuments;

        update documents;
    }
}