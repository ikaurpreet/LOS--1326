public with sharing class MortgagesDocumentGridController extends GraphQLProxyController {
    public static MortgagesDocsApiClient docsApiClient { get;set; }
    public static MortgagesDocsApiClient getDocsApiClient(MortgagesConstants.Env env) {
        if (docsApiClient != null) {
            system.debug('test');
            return docsApiClient;
        }
        return MortgagesApiClientFactory.createUserFactory(env.name()).createDocsApiClient();
    }

    @AuraEnabled
    public static string getFolders(String recordId, String recordType) {
        List<Folder__c> folders;
        if (recordType == 'Submission_Task__c') {
            folders = FolderManager.findSubmissionTaskFolders(recordId);
        } else if(recordType == 'Custom_Task__c') {
            folders = FolderManager.findCustomTaskFolders(recordId);
        } else if(recordType == 'Opportunity') {
            folders = FolderManager.findOpportunityFolders(recordId);
        } else if(recordType == 'Account') {
            folders = FolderManager.findAccountFolders(recordId);
        }
        system.debug(folders);
        return JSON.serialize(folders);
    }

    @AuraEnabled
    public static string reviewDocument(String documentId) {
        FolderManager.Version document = FolderManager.reviewDocument(documentId);
        return JSON.serialize(document);
    }

    @AuraEnabled
    public static string getDocuments(String recordId, String recordType) {
        List<FolderManager.Document> documents;
        if (recordType == 'Submission_Task__c') {
            documents = FolderManager.findSubmissionTaskDocuments(recordId);
        } else if(recordType == 'Custom_Task__c') {
            documents = FolderManager.findCustomTaskDocuments(recordId);
        } else if(recordType == 'Folder__c') {
            documents = FolderManager.findFolderDocuments(recordId);
        } else if(recordType == 'Opportunity') {
            documents = FolderManager.findOpportunityDocuments(recordId);
        }
        if (documents != null) {
            for (FolderManager.Document document : documents){
                for (FolderManager.Version version : document.versions){
                    fetchDocumentNote(version);
                }
            }
        }

        return JSON.serialize(documents);
    }

    public static void fetchDocumentNote(FolderManager.Version version) {
		List<ContentDocumentLink> contentDocumentLinks = [SELECT ContentDocumentId
		                                                  FROM ContentDocumentLink
		                                                  WHERE LinkedEntityId =: version.id];
		List<Id> ids = new List<Id>();
		
		for(ContentDocumentLink link: contentDocumentLinks) {
			ids.add(link.ContentDocumentId);	
		}

		List<ContentNote> notes = [SELECT content, ContentModifiedDate FROM ContentNote WHERE id in :ids];

		system.debug(notes);

		if (notes.size() > 0){
			version.notes = notes[0].Content.toString().unescapeHtml4();
			version.notesDate = notes[0].ContentModifiedDate;
		}
	}

    @AuraEnabled
	public static string getDocumentNote(String documentId){
		List<ContentDocumentLink> contentDocumentLinks = [SELECT ContentDocumentId
		                                                  FROM ContentDocumentLink
		                                                  WHERE LinkedEntityId =: documentId];
		List<Id> ids = new List<Id>();
		
		for(ContentDocumentLink link: contentDocumentLinks) {
			ids.add(link.ContentDocumentId);	
		}

		List<ContentNote> notes = [SELECT content FROM ContentNote WHERE id in :ids];

		system.debug(notes);

		if (notes.size() > 0){
			return notes[0].Content.toString().unescapeHtml4();
		}
		
		return '';
	}

    @AuraEnabled
    public static string uploadToGDrive(String externalId, String path, String customTaskId) {
        List<Custom_Task__c> tasks = [SELECT Borrower_Name__c, Encompass_Loan_Number__c, Opportunity__c FROM Custom_Task__c WHERE id = :customTaskId];
        String borrowerName;
        String loanNumber;
        if (tasks.size() > 0) {
            borrowerName = tasks[0].Borrower_Name__c.replace(' ', '_');
            loanNumber = tasks[0].Encompass_Loan_Number__c;
        } else {
            Opportunity opp = [SELECT Borrower_Name__c, Encompass_Loan_Number__c FROM Opportunity WHERE id =: customTaskId];
            borrowerName = opp.Borrower_Name__c.replace(' ', '_');
            loanNumber = opp.Encompass_Loan_Number__c;
        }
        
        String canonicalPath = borrowerName + ' ' + loanNumber + '/Title';
        String actualPath = path != '' ? path : canonicalPath;
        
        MortgagesConstants.ENV env = MortgagesUtilities.getEnvironment(externalId);
        String uuid = MortgagesUtilities.unprefixify(externalId);

        String documentGdriveLink = getDocsApiClient(env).copyDocumentToGdrive(uuid, actualPath);
        return documentGdriveLink;
    }
}