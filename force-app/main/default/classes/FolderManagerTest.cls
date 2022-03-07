@isTest
public with sharing class FolderManagerTest {
    @isTest
    public static void createSubmissionTaskFolder() {
        Submission_Task__c task = new Submission_Task__c();
        task.title__c = 'test';
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        task.Submission_Uuid__c = opp.mortgage_Submission_UUID__c;
        task.opportunity__c = opp.id;
        task.uuid__c = 'test_uuid';
        task.type__c = 'document';
        insert task;
        FolderManager.createSubmissionTaskFolder(task);
    }
    
    @isTest
    public static void createCustomTaskFolder() {
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = new Custom_Task__c();
        task.type__c = 'title';
        insert task;
        FolderManager.createCustomTaskFolder(task, 'reference');
        FolderManager.createCustomTaskFolder(task, 'reference');
        List<Folder__c> folders = [SELECT id FROM Folder__c WHERE Custom_Task__c =: task.id and reference__c =: 'reference'];
        system.assertEquals(1, folders.size());
    }

    @isTest
    public static void createOpportunityFolder() {
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        FolderManager.createOpportunityFolder(opp);
    }

    @isTest
    public static void createAccountFolder() {
        Account account = MortgagesTestFactory.createAccount();
        FolderManager.createAccountFolder(account);
    }


    @isTest
    public static void assignDocumentToFolder() {
        Document__c document = MortgagesTestFactory.createDocument('owner_uuid', 'test_reference_test');
        Folder__c folder = MortgagesTestFactory.createFolder('reference');
        FolderManager.assignDocumentToFolder(folder);
    }

    @isTest
    public static void assignFolderToDocument() {
        Document__c document = MortgagesTestFactory.createDocument('owner_uuid', 'test:reference:test');
        Folder__c folder = MortgagesTestFactory.createFolder('reference');
        FolderManager.assignFolderToDocument(document);
    }

    @isTest
    public static void findCustomTaskDocuments() {
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = new Custom_Task__c();
        task.type__c = 'title';
        insert task;
        FolderManager.createCustomTaskFolder(task, 'reference');
        Document__c document = MortgagesTestFactory.createDocument('owner_uuid', 'test:reference:test');
        FolderManager.assignFolderToDocument(document);
        FolderManager.findCustomTaskDocuments(task.id);
    }

    @isTest
    public static void findSubmissionTaskDocuments() {
        Submission_Task__c task = new Submission_Task__c();
        task.title__c = 'test';
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        task.Submission_Uuid__c = opp.mortgage_Submission_UUID__c;
        task.Opportunity__c = opp.id;
        task.uuid__c = 'reference';
        task.type__c = 'document';
        insert task;
        FolderManager.createSubmissionTaskFolder(task);
        Document__c document = MortgagesTestFactory.createDocument('owner_uuid', 'test:reference:test');
        FolderManager.assignFolderToDocument(document);
        FolderManager.findSubmissionTaskDocuments(task.id);
    }

    @isTest
    public static void reviewDocument() {
        Document__c document = MortgagesTestFactory.createDocument('owner_uuid', 'test:reference:test');
        FolderManager.reviewDocument(document.id);
    }

    @isTest
    public static void findOpportunityFolders() {
        FolderManager.findOpportunityFolders('test');
    }

    @isTest
    public static void findSubmissionTaskFolders() {
        FolderManager.findSubmissionTaskFolders('test');
    }

    @isTest
    public static void findCustomTaskFolders() {
        FolderManager.findCustomTaskFolders('test');
    }
    
    @isTest
    public static void findOpportunityDocuments() {
        FolderManager.findOpportunityDocuments('test');
    }
}