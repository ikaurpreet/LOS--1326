public with sharing class MortgagesViewDocumentController {
    @AuraEnabled
    public static string findDocument(String id) {
        return MortgagesSubmissionDocuments.fetchDocument(id);
        // FolderManager.Version document = FolderManager.findDocumentVersion(id);
        
        // return JSON.serialize(document);
    }

    @AuraEnabled
    public static string findSubmissionTaskUploadedDocument(String id) {
        List<FolderManager.Document> documents = FolderManager.findSubmissionTaskDocuments(id);
        FolderManager.Version actualVersion = null;
        if (documents != null && documents.size() > 0) {
            for(FolderManager.Document document: documents) {
                for(FolderManager.Version version: document.versions) {
                    if (version.status == 'Uploaded' || version.status == 'Archived' || version.status == 'Approved') {
                        actualVersion = version;
                    }
                }
            }
        }
        
        return JSON.serialize(actualVersion);
    }

    @AuraEnabled
    public static String downloadDocument(String documentId) {
        Document__c document = [SELECT Id, External_ID__c FROM Document__c WHERE id =: documentId];
        ContentVersion contentVersion = MortgagesDocumentManager.downloadDocumentFile(document);
        return contentVersion.contentDocumentId;
    }

    @AuraEnabled
    public static string generateDirectDownloadURL(String documentId){
        Document__c document = [SELECT Id, External_ID__c FROM Document__c WHERE id =: documentId];
        return MortgagesDocumentManager.generateDocumentUrl(document);
    }
}