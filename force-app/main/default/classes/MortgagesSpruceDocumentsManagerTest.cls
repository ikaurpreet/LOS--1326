@isTest
public with sharing class MortgagesSpruceDocumentsManagerTest {
    @isTest
    public static void assignDocumentToTask() {
        Test.startTest();
        Opportunity opportunity = MortgagesTestFactory.createOpportunity();
        Custom_Task__c master = MortgagesTestFactory.createSpruceTasks(opportunity);
        FolderManager.createCustomTaskFolder(master, 'reference');
        Document__c document = MortgagesTestFactory.createDocument('ownerUuid', 'reference', 'hoi');
        Test.stopTest();
        MortgagesSpruceDocumentsManager.assignDocumentToTask(document);
        List<Document_Folder_Junction__c> junctions = [SELECT ID FROM Document_Folder_Junction__c WHERE document__c =: document.id];
        system.assertEquals(3, junctions.size());
        Custom_Task__c hoi_task = [SELECT id, status__c FROM Custom_Task__c WHERE Master_3rd_Party_Task__c =: master.id and type__c = 'hoi' LIMIT 1];
        master = [SELECT id, status__c FROM Custom_Task__c WHERE id =: master.id LIMIT 1];
        system.assertEquals('New docs available', hoi_task.Status__c);
        system.assertEquals('Docs Awaiting Review', master.status__c);
    }
}