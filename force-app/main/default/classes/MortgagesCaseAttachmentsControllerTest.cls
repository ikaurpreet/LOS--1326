@isTest
public with sharing class MortgagesCaseAttachmentsControllerTest {
    @TestSetup
    static void makeData(){
        Case caseRecord = new Case();
        insert caseRecord;
        ContentVersion contentVersionInsert = new ContentVersion(
            Title = 'Test',
            PathOnClient = 'Test.jpg',
            VersionData = Blob.valueOf('Test Content Data'),
            IsMajorVersion = true
        );
        insert contentVersionInsert;
        ContentDocument document = [SELECT Id FROM ContentDocument limit 1];
        EmailMessage email = new EmailMessage(ParentId = caseRecord.id);
        insert email;
        ContentDocumentLink link = new ContentDocumentLink(LinkedEntityId = email.id, ContentDocumentId = document.id);
        insert link;
    }

    @isTest
    public static void getCaseAttachments() {
        Case caseRecord = [SELECT Id from Case limit 1];
        ContentDocument document = [SELECT Id FROM ContentDocument limit 1];
        String result = MortgagesCaseAttachmentsController.getCaseAttachments(caseRecord.id);
        List<Object> parseResult = (List<Object>) JSON.deserializeUntyped(result);
        Map<String, Object> resultDocument = (Map<String, Object>) parseResult[0];
        System.assertEquals(document.id, resultDocument.get('Id'));
    }
}