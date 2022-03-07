public with sharing class MortgagesCaseAttachmentsController {
    
    @AuraEnabled
    public static string getCaseAttachments(String caseId) {
        Set<Id> linkedEntityIds = new Set<Id>();
        linkedEntityIds.add(caseId);
        // Get case emails
        list<EmailMessage> emails = [SELECT id FROM EmailMessage WHERE ParentId =: caseId];
        for(EmailMessage email: emails) {
            linkedEntityIds.add(email.id);
        }
        
        List<ContentDocumentLink> contentLinks = [SELECT id, ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId in: linkedEntityIds];
        Set<Id> contentDocumentIds = new Set<Id>();
        for(ContentDocumentLink contentLink: contentLinks) {
            contentDocumentIds.add(contentLink.ContentDocumentId);
        }
        List<ContentDocument> contentDocuments = [SELECT id, LatestPublishedVersionId, CreatedDate, ContentSize, FileExtension, FileType, Title FROM ContentDocument WHERE id in: contentDocumentIds];
        return JSON.serialize(contentDocuments);
    }
}