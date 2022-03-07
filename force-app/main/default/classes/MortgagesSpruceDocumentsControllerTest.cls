@isTest
public with sharing class MortgagesSpruceDocumentsControllerTest {
    @isTest
    public static void getDocuments() {
        Test.startTest();
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = MortgagesTestFactory.createSpruceTasks(opp);
        FolderManager.createCustomTaskFolder(task, 'reference');
        Document__c document = MortgagesTestFactory.createDocument('ownerUuid', 'reference', 'hoi');
        MortgagesSpruceDocumentsController.addDocumentNote(document.id, 'note');
        Test.stopTest();
        system.debug('test');
        system.debug(MortgagesSpruceDocumentsController.getDocuments(task.id));
    }

    @isTest
    public static void moveDocuments() {
        Test.startTest();
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = MortgagesTestFactory.createSpruceTasks(opp);
        Custom_Task__c secondTask = [SELECT id FROM Custom_Task__c WHERE Master_3rd_Party_Task__c =: task.id LIMIT 1];
        FolderManager.createCustomTaskFolder(task, 'reference');
        Document__c document = MortgagesTestFactory.createDocument('ownerUuid', 'reference');
        Test.stopTest();
        MortgagesSpruceDocumentsController.moveDocuments(document.id, secondTask.id);
    }

    @isTest
    public static void reviewedDocuments() {
        Test.startTest();
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = MortgagesTestFactory.createSpruceTasks(opp);
        FolderManager.createCustomTaskFolder(task, 'reference');
        Document__c document = MortgagesTestFactory.createDocument('ownerUuid', 'reference');
        Test.stopTest();
        MortgagesSpruceDocumentsController.reviewedDocuments(task.id);
    }

    @isTest
    public static void getSubTasks() {
        Test.startTest();
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = MortgagesTestFactory.createSpruceTasks(opp);
        Test.stopTest();
        MortgagesSpruceDocumentsController.getSubTasks(task.id);
    }

    @isTest
    public static void addDocumentNote() {
        Test.startTest();
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = MortgagesTestFactory.createSpruceTasks(opp);
        FolderManager.createCustomTaskFolder(task, 'reference');
        Document__c document = MortgagesTestFactory.createDocument('ownerUuid', 'reference');
        Test.stopTest();
        MortgagesSpruceDocumentsController.addDocumentNote(document.id, 'note');
    }

    @isTest
    public static void getDocumentNote() {
        Test.startTest();
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = MortgagesTestFactory.createSpruceTasks(opp);
        FolderManager.createCustomTaskFolder(task, 'reference');
        Document__c document = MortgagesTestFactory.createDocument('ownerUuid', 'reference');
        Test.stopTest();
        MortgagesSpruceDocumentsController.addDocumentNote(document.id, 'note');
        MortgagesSpruceDocumentsController.getDocumentNote(document.id);
    }
}