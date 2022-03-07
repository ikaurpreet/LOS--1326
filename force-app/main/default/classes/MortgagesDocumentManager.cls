public with sharing class MortgagesDocumentManager {
    public static MortgagesDocsApiClient docsApiClient { get;set; }
    public static MortgagesDocsApiClient getDocsApiClient(MortgagesConstants.Env env) {
        if (docsApiClient != null) {
            system.debug('test');
            return docsApiClient;
        }
        return MortgagesApiClientFactory.createUserFactory(env.name()).createDocsApiClient();
    }

    public static void assignDownloadedDocument(Document__c document, ContentVersion version) {
        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = version.contentDocumentId;
        cdl.LinkedEntityId = document.id;
        cdl.ShareType = 'I';
        insert cdl;
        document.Document_Downloaded__c = true;
        update document;
    }

    public static ContentVersion fetchDocument(Document__c document) {
        String url = generateDocumentUrl(document);
        DownloadedDocument downloadedDocument = downloadDocument(url);
        ContentVersion contentVersion = storeDocument(downloadedDocument);
        assignDownloadedDocument(document, contentVersion);
        
        return contentVersion;
    }

    public static ContentVersion downloadDocumentFile(Document__c document) {
        ContentVersion contentVersion = findDocumentContentVersion(document);
        
        if (contentVersion == null) {
            system.debug('contentVersion not found'); 
            contentVersion = fetchDocument(document);
        } else {
            system.debug('contentVersion found: ' + contentVersion.ContentDocumentId);
        }
        
        return contentVersion;
    }

    public static ContentVersion findDocumentContentVersion(Document__c document) {
        List<ContentDocumentLink> cdlList = [SELECT id, contentDocumentId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId =: document.id];
        system.debug(cdlList);
        if (cdlList.size() == 0) { return null; }
        
        for(ContentDocumentLink cdl: cdlList) {
            List<ContentNote> contentNotes = [SELECT id FROM ContentNote WHERE id =: cdl.ContentDocumentId];
            if (contentNotes.size() == 0) {
                List<ContentVersion> contentVersions = [SELECT id, contentDocumentId FROM ContentVersion WHERE ContentDocumentId =: cdl.contentDocumentId];
                return contentVersions[0];
            }   
        }
        
        return null;
    }

    @future
    public static void batchRemoveDocumentContentVersion(Set<Id> ids) {
        system.debug('Start batch remove documents');
        List<Document__c> documents = [SELECT id, reference__c, category__c, owner_Uuid__c FROM Document__c WHERE id in :ids];
        for(Document__c document: documents) {
            removeDocumentContentVersion(document);
        }
    }

    public static void removeDocumentContentVersion(Document__c document) {
        List<ContentDocumentLink> cdlList = [SELECT id, contentDocumentId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId =: document.id LIMIT 1];
        for (ContentDocumentLink contentDocumentLink: cdlList) {
            delete contentDocumentLink;   
        }
    }
    public class DownloadedDocument {
        public string filename { get;set; }
        public Blob body { get;set; }
    }

    public static String generateDocumentUrl(Document__c document) {
        MortgagesConstants.ENV env = MortgagesUtilities.getEnvironment(document.External_ID__c);
        String uuid = MortgagesUtilities.unprefixify(document.External_ID__c);
        String url = getDocsApiClient(env).generateDownloadUrl(uuid);
        return url;
    }

    public static DownloadedDocument downloadDocument(String url) {
        Http h = new Http();
        HttpRequest req = new HttpRequest();

        req.setEndpoint(url);
        req.setTimeout(60000);
        req.setMethod('GET');
        
        // Send the request, and return a response
        HttpResponse res = h.send(req);
        Blob body = res.getBodyAsBlob();
        String contentDisposition = res.getHeader('Content-Disposition');
        Pattern p = Pattern.compile('.+filename=(.+?.*)');
        String fileName = 'default name';

        if(contentDisposition != null) {
            Matcher m = p.matcher(contentDisposition);
            if(m.find()) {
                fileName = m.group(1);
            }
        }

        DownloadedDocument document = new DownloadedDocument();
        document.filename = fileName;
        document.body = body;
        
        return document;
    }
  
    public static ContentVersion storeDocument(DownloadedDocument document) {
        ContentVersion cv = new ContentVersion();
        cv.ContentLocation = 'S';
        cv.TagCsv = 'mortgages_document';
        cv.VersionData = document.body;
        cv.Title = document.fileName;
        cv.PathOnClient = document.fileName;
        
        insert cv;

        cv = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:cv.Id];
        
        return cv;
    }
}