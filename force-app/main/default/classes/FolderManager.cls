public with sharing class FolderManager {  
    @future
    public static void batchCreateSubmissionTaskFolder(Set<Id> ids) {
        List<Submission_Task__c> tasks = [SELECT id, Uuid__c, title__c, Opportunity__c FROM Submission_Task__c WHERE id in :ids];
        for(Submission_Task__c task: tasks) {
            createSubmissionTaskFolder(task);
        }
    }

    @future
    public static void batchCreateOpportunityFolder(Set<Id> ids) {
        List<Opportunity> opps = [SELECT id, mortgage_Submission_uuid__c, Name FROM Opportunity WHERE id in :ids];
        for(Opportunity opp: opps) {
            createOpportunityFolder(opp);
        }
    }

    @future
    public static void batchCreateAccountFolder(Set<Id> ids) {
        List<Account> accs = [SELECT id, User_uuid__c, Name FROM Account WHERE id in :ids];
        for(Account acc: accs) {
            createAccountFolder(acc);
        }
    }

    public static Folder__c createSubmissionTaskFolder(Submission_Task__c task) {
        Folder__c folder = new Folder__c();
        folder.reference__c = MortgagesUtilities.unprefixify(task.Uuid__c);
        String title = task.title__c;
        if (title.length() > 80) {
            folder.name = title.substring(0, 79);
        } else {
            folder.name = title;
        }
        folder.submission_task__c = task.id;
        folder.Opportunity__c = task.Opportunity__c;
        insert folder;
        return folder;
    }


    public static Folder__c createCustomTaskFolder(Custom_Task__c task, String reference) {
        List<Folder__c> folders = [SELECT Id, Reference__c, Custom_Task__c, Opportunity__c FROM Folder__c WHERE reference__c =: reference and Custom_Task__c =: task.id];
        if(folders.size() > 0) {
            return folders[0];
        }
        Folder__c folder = new Folder__c();
        folder.reference__c = reference;
        String title = task.name;
        if (title != null && title.length() > 80) {
            folder.name = title.substring(0, 79);
        } else {
            folder.name = title;
        }
        folder.custom_task__c = task.id;
        folder.Opportunity__c = task.Opportunity__c;
        insert folder;
        return folder;
    }

    public class Version {
        public Id id { get; set; }
        public string fileName { get; set; }
        public String fileId { get; set; }
        public String ownerName { get; set; }
        public DateTime uploadedAt { get; set; }
        public DateTime reviewedAt { get; set; }
        public String reviewer { get; set; }
        public String source { get; set; }
        public String status { get; set; }
        public String externalId { get; set; } 
        public String notes { get; set; } 
        public DateTime notesDate { get; set; }
        public Boolean isNew { get; set; }
        public String driveLink { get; set; }
        public DateTime driveUploadDate { get; set; }
        public String taskId { get; set; }
        public String category { get; set; }
        public String lenderTags { get; set; }
    }
    public class Document {
        public String name { get; set; }
        public String reference { get; set; }
        public List<Version> versions { get; set; }
    }

    public static List<Document> findCustomTaskDocuments(String taskId) {
        List<Folder__c> folders = [SELECT id FROM Folder__c WHERE Custom_Task__c =:taskId];
        if (folders.size() == 0) { return null; }
        return findFolderDocuments(folders[0].id);
    }

    public static List<Document> findSubmissionTaskDocuments(String taskId) {
        List<Folder__c> folders = [SELECT id FROM Folder__c WHERE Submission_Task__c =:taskId];
        if (folders.size() == 0) { return null; }
        return findFolderDocuments(folders[0].id);
    }

    public static List<Document> findFolderDocuments(String folderId) {
        List<Document_Folder_Junction__c> junctions = [SELECT Document__c FROM Document_Folder_Junction__c WHERE Folder__c =: folderId];
        List<Id> ids = new List<Id>();
        
        for(Document_Folder_Junction__c item: junctions) {
            ids.add(item.Document__c);
        }

        return buildDocuments(ids);
    }

    public static List<Folder__c> findOpportunityFolders(String opportunityId) {
        List<Folder__c> folders = [SELECT id, Name FROM Folder__c WHERE Opportunity__c =: opportunityId];
        return filterEmptyFolders(folders);
    }

    public static List<Folder__c> findSubmissionTaskFolders(String taskId) {
        List<Folder__c> folders = [SELECT id, Name FROM Folder__c WHERE Submission_task__c =: taskId];
        return folders;
    }

    public static List<Folder__c> findCustomTaskFolders(String taskId) {
        List<Folder__c> folders = [SELECT id, Name FROM Folder__c WHERE custom_task__c =: taskId];
        return folders; 
    }
    public static List<Folder__c> findAccountFolders(String accountId) {
        List<Folder__c> folders = [SELECT id, Name FROM Folder__c WHERE account__c =: accountId];
        return folders; 
    }

    public static List<Folder__c> filterEmptyFolders(List<Folder__c> folders) {
        Map<Id, Folder__c> folderMapping = new Map<Id, Folder__c>();
        for(Folder__c folder: folders) {
            folderMapping.put(folder.id, folder);
        }

        List<Document_Folder_Junction__c> documents = [SELECT Folder__c FROM Document_Folder_Junction__c WHERE Folder__c in : folderMapping.keySet()];
        Map<Id, Folder__c> results = new Map<Id, Folder__c>();
        for(Document_Folder_Junction__c item: documents) {
            results.put(item.folder__c, folderMapping.get(item.folder__c));
        }

        return results.values();
    }

    public static List<Document> findOpportunityDocuments(String opportunityId) {
        List<Opportunity> opps = [SELECT mortgage_Submission_uuid__c, id FROM Opportunity WHERE id=: opportunityId];
        if (opps.size() == 0) { return null; }
        List<Folder__c> folders = [SELECT id FROM Folder__c WHERE Opportunity__c =: opps[0].id and reference__c =: opps[0].mortgage_Submission_uuid__c LIMIT 1];
        if (folders.size() == 0) { return null; }
        
        return findFolderDocuments(folders[0].id);
    }

    public static Version reviewDocument(String documentId) {
        List<Document__c> items = [SELECT FileName__c, Review_Date__c, Reviewer__r.Name, Document_Downloaded__c, Document_Upload_Date__c, Source__c, Name, id, reference__c, Account__r.Name FROM Document__c WHERE id =: documentId];
        if(items.size() == 0) { throw new NoDataFoundException(); }
        Document__c item = items[0];
        if (items[0].Reviewer__c != null) {
            throw new SecurityException('Document already reviewed');
        }
        item.Review_Date__c = DateTime.now();
        item.Reviewer__c = UserInfo.getUserId();
        
        update item;
        item = [SELECT FileName__c, Status__c, Review_Date__c, Reviewer__r.Name, Document_Downloaded__c, Document_Upload_Date__c, Source__c, Name, id, reference__c, Account__r.Name FROM Document__c WHERE id =: documentId];
        List<ContentDocumentLink> cdlList = [SELECT id, contentDocumentId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId =: documentId];
        
        Version version = new Version();
        version.id = item.id;
        version.uploadedAt = item.Document_Upload_Date__c;
        version.fileName = item.fileName__c;
        
        if (cdlList.size() > 0) {
            version.fileId = cdlList[0].id;
        }
    
        version.isNew = !item.Document_Downloaded__c;
        version.ownerName = item.Account__r.Name;
        version.source = item.Source__c;
        version.status = item.status__c;
        version.reviewedAt = item.Review_Date__c;
        
        if (item.Reviewer__r != null) {
            version.reviewer = item.Reviewer__r.Name;
        }

        return version;
    }

    public static Version findDocumentVersion(Id id) {
        Document__c item = [SELECT FileName__c, Status__c, Review_Date__c, Reviewer__r.Name, Document_Downloaded__c, Document_Upload_Date__c, Source__c, Name, id, reference__c, Account__r.Name FROM Document__c WHERE id =: id];
        List<ContentDocumentLink> cdlList = [SELECT id, contentDocumentId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId =: id];

        Version version = new Version();
        version.id = item.id;
        version.uploadedAt = item.Document_Upload_Date__c;
        version.fileName = item.fileName__c;
        
        if (cdlList.size() > 0) {
            version.fileId = cdlList[0].contentDocumentId;
        }
        
        version.isNew = !item.Document_Downloaded__c;
        version.ownerName = item.Account__r.Name;
        version.source = item.Source__c;
        version.status = item.Status__c;
        version.reviewedAt = item.Review_Date__c;
        if (item.Reviewer__r != null) {
            version.reviewer = item.Reviewer__r.Name;
        }

        return version;
    }

    public static List<Document> buildDocuments(List<Id> ids) {
        Map<String, Document> results = new Map<String, Document>();
        if(ids.size() == 0) { return results.values(); }
        
        List<Document__c> documents = [SELECT LenderTags__c, category__c, FileName__c, Status__c, Review_Date__c, Reviewer__r.Name, Document_Downloaded__c, Document_Upload_Date__c, Source__c, Name, id, reference__c, External_ID__c, Drive_Upload_Date__c, Drive_Link__c, Account__r.Name FROM Document__c WHERE id =: ids];
        List<ContentDocumentLink> cdlList = [SELECT id, contentDocumentId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId =: ids];
        
        Map<String, String> cdlIds = new Map<String, String>();
        
        for(ContentDocumentLink cdl: cdlList) {
            List<ContentNote> contentDocument = [SELECT id FROM ContentNote WHERE id =: cdl.ContentDocumentId];
            if (contentDocument.size() == 0) {
                system.debug(contentDocument);
                cdlIds.put(cdl.LinkedEntityId, cdl.contentDocumentId);
            }   
        }
        
        for(Document__c item: documents) {
            Document document;
            if (results.containsKey(item.reference__c)) {
                document = results.get(item.reference__c);
            } else {
                document = new Document();
                document.reference = item.reference__c;
                document.versions = new List<Version> ();
                results.put(document.reference, document);
            }

            Version version = new Version();
            version.id = item.id;
            version.uploadedAt = item.Document_Upload_Date__c;
            version.fileName = item.fileName__c;
            version.fileId = cdlIds.get(item.id);
            version.isNew = !item.Document_Downloaded__c;
            version.ownerName = item.Account__r.Name;
            version.externalId = item.External_ID__c;
            version.source = item.Source__c;
            version.status = item.Status__c;
            version.notes = '';
            version.driveLink = item.Drive_Link__c;
            version.driveUploadDate = item.Drive_Upload_Date__c;
            version.category = item.category__c;
            version.reviewedAt = item.Review_Date__c;
            version.lenderTags = item.LenderTags__c;
            if (item.Reviewer__r != null) {
                version.reviewer = item.Reviewer__r.Name;
            }
            document.name = item.FileName__c;
            document.versions.add(version);
        }
        
        return results.values();
    }

    public static Folder__c createOpportunityFolder(Opportunity opp) {
        Folder__c folder = new Folder__c();
        folder.reference__c = opp.mortgage_Submission_uuid__c;
        folder.name = opp.Name + ' Documents';
        folder.opportunity__c = opp.id;
        insert folder;
        return folder;
    }

    public static Folder__c createAccountFolder(Account acc) {
        Folder__c folder = new Folder__c();
        folder.reference__c = acc.User_uuid__c;
        folder.name = acc.Name + ' Documents';
        folder.account__c = acc.id;
        insert folder;
        return folder;
    }

    @future
    public static void batchAssignDocumentToFolders(Set<Id> items) {
        List<Folder__c> folders = [SELECT id, reference__c, opportunity__c FROM Folder__c WHERE id =: items];
        assignDocumentToFolders(folders);
    }

    public static void assignDocumentToFolders(List<Folder__c> items) {
        for(Folder__c item: items) {
            assignDocumentToFolder(item);
        }
    }

    public static List<Document__c> assignDocumentToFolder(Folder__c folder) {
        if (folder.reference__c == null || folder.reference__c == '') { return null; }
        
        String query = '%' + MortgagesUtilities.unprefixify(folder.reference__c) + '%';
        List<Document__c> documents;
        
        if (folder.opportunity__c != null) {
            documents = [SELECT id, category__c FROM Document__c WHERE reference__c like :query and Opportunity__c =: folder.opportunity__c];
        } else if(folder.account__c != null) {
            documents = [SELECT id, category__c FROM Document__c WHERE reference__c like :query and Account__c =: folder.account__c];
        } else {
            return null;
        }
        
        List<Document_Folder_Junction__c> junctions = new List<Document_Folder_Junction__c>();
        List<Document_Folder_Junction__c> existJunctions = [SELECT document__c FROM Document_Folder_Junction__c WHERE folder__c =: folder.id];
        Set<Id> existFolders = new Set<Id>();
        
        for(Document_Folder_Junction__c junction: existJunctions) {
            existFolders.add(junction.document__c);
        }

        for (Document__c document: documents) {
            if(existFolders.contains(document.id)) {
                continue;
            }
            Document_Folder_Junction__c junction = new Document_Folder_Junction__c();
            junction.document__c = document.id;
            junction.folder__c = folder.id;
            junctions.add(junction);
        }

        insert junctions;
        MortgagesSpruceDocumentsManager.processDocuments(documents);
        return documents;
    }

    @future
    public static void batchAssignFolderToDocument(Set<Id> ids) {
        system.debug('Start batch assign documents');
        List<Document__c> documents = [SELECT id, reference__c, category__c, owner_Uuid__c FROM Document__c WHERE id in :ids];
        for(Document__c document: documents) {
            assignFolderToDocument(document);
        }
    }

    public static void putDocumentToFolder(Document__c document, Folder__c folder) {
        Document_Folder_Junction__c junction = new Document_Folder_Junction__c();
        junction.document__c = document.id;
        junction.folder__c = folder.id;
        insert junction;
    }

    public static List<Folder__c> assignFolderToDocument(Document__c document) {
        String reference = MortgagesUtilities.unprefixify(document.reference__c);
        String ownerUuid = MortgagesUtilities.unprefixify(document.owner_Uuid__c);
        List<String> references = reference.split(':');
        references.add(ownerUuid);
        List<Folder__c> folders = [SELECT id, reference__c FROM Folder__c WHERE reference__c in : references];
        List<Document_Folder_Junction__c> junctions = new List<Document_Folder_Junction__c>();
        List<Document_Folder_Junction__c> existJunctions = [SELECT folder__c FROM Document_Folder_Junction__c WHERE document__c =: document.id];
        Set<Id> existFolders = new Set<Id>();
        
        for(Document_Folder_Junction__c junction: existJunctions) {
            existFolders.add(junction.folder__c);
        }

        for(Folder__c folder: folders) {
            if(existFolders.contains(folder.id)) {
                continue;
            }
            system.debug('Found folder for folder for document ' + document.id);
            Document_Folder_Junction__c junction = new Document_Folder_Junction__c();
            junction.document__c = document.id;
            junction.folder__c = folder.id;
            junctions.add(junction);
        }

        insert junctions;

        MortgagesSpruceDocumentsManager.processDocuments(new List<Document__c> { document });

        return folders;
    }
}