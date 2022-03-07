public with sharing class MortgagesSpruceDocumentsManager {
    public static Set<String> types = new Set<String> { 'hoi', 'payoff', 'title' };
    public static void processDocuments(List<Document__c> documents) {
        for(Document__c document: documents) {
            if (document.Category__c != null && types.contains(document.Category__c.toLowerCase())) {
                assignDocumentToTask(document);
            }
        }
    }

    public static void moveDocument(String documentId, String taskId) {
        List<Document_Folder_Junction__c> junctions = [SELECT Folder__c FROM Document_Folder_Junction__c WHERE document__c =: documentId];
        Map<Id, List<Document_Folder_Junction__c>> folderIds = new Map<Id, List<Document_Folder_Junction__c>> ();
        
        for(Document_Folder_Junction__c item: junctions) {
            if(!folderIds.containsKey(item.Folder__c)) {
                folderIds.put(item.Folder__c, new List<Document_Folder_Junction__c>());
            }
            folderIds.get(item.Folder__c).add(item);
        }

        List<Folder__c> folders = [SELECT Reference__c, Custom_Task__r.RecordTypeId, Custom_Task__r.Type__c, Custom_Task__r.id FROM Folder__c WHERE id in : folderIds.keySet()];
        for(Folder__c folder: folders) {
            system.debug(folder.custom_task__r.type__c);
            if (types.contains(folder.custom_task__r.type__c)) {
                delete folderIds.get(folder.id);
            }
        }
        system.debug(junctions.size());
        system.debug([SELECT Folder__c FROM Document_Folder_Junction__c WHERE document__c =: documentId]);

        Document__c document = [SELECT Id FROM Document__c WHERE id =: documentId];
        Custom_Task__c task = [SELECT Id, Name, Opportunity__c, Master_3rd_Party_Task__c, Type__c FROM Custom_Task__c WHERE id =: taskId];
        system.debug(task);
        Custom_Task__c master = [SELECT id, Name FROM Custom_Task__c WHERE id =: task.Master_3rd_Party_Task__c];
        List<Folder__c> masterFolders = [SELECT Reference__c, Custom_Task__r.RecordTypeId, Custom_Task__r.id FROM Folder__c WHERE Custom_Task__c =: master.id];
        Folder__c sub_folder = FolderManager.createCustomTaskFolder(task, masterFolders[0].reference__c + ':' + task.Type__c);
        FolderManager.putDocumentToFolder(document, sub_folder);      
    }

    public static void assignDocumentToTask(Document__c document) {
        List<Document_Folder_Junction__c> junctions = [SELECT Folder__c FROM Document_Folder_Junction__c WHERE document__c =: document.id];
        List<Id> folderIds = new List<Id> ();
        
        for(Document_Folder_Junction__c item: junctions) {
            folderIds.add(item.Folder__c);
        }

        List<Folder__c> folders = [SELECT Reference__c, Custom_Task__r.RecordTypeId, Custom_Task__r.id FROM Folder__c WHERE id in : folderIds];
        String spruceRecordTypeId = Schema.SObjectType.Custom_Task__c.getRecordTypeInfosByName().get('Spruce Task').getRecordTypeId();
        
        for(Folder__c folder: folders) {
            if (folder.Custom_Task__r.RecordTypeId == spruceRecordTypeId) {
                Custom_Task__c master_task = [SELECT Status__c FROM Custom_Task__c WHERE id =:folder.Custom_Task__r.id];
                system.debug('spruce');
                List<Custom_Task__c> sub_tasks = [SELECT Opportunity__c, ID, Status__c, Name FROM Custom_Task__c WHERE Master_3rd_Party_Task__c =: folder.Custom_Task__r.id and type__c =: document.Category__c];
                if (sub_tasks.size() > 0) {
                    system.debug('sub task');
                    Custom_Task__c sub_task = sub_tasks[0];
                    Folder__c sub_folder = FolderManager.createCustomTaskFolder(sub_task, folder.reference__c + ':' + document.Category__c);
                    FolderManager.putDocumentToFolder(document, sub_folder);                    
                    sub_task.Status__c = 'New docs available';
                    update sub_task;
                }
                master_task.Status__c = 'Docs Awaiting Review';
                update master_task;
            }
        }
    }
}