public with sharing class MortgagesSpruceDocumentsController{
	@AuraEnabled
	public static string getDocuments(String taskId){
		List<FolderManager.Document> documents = FolderManager.findCustomTaskDocuments(taskId);

		for (FolderManager.Document document : documents){
			for (FolderManager.Version version : document.versions){
				fetchDocumentNote(version);
				version.taskId = findTask(version);
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
	public static void moveDocuments(String documentId, String taskId) {
			MortgagesSpruceDocumentsManager.moveDocument(documentId, taskId);
	}

	@AuraEnabled
	public static void reviewedDocuments(String taskId) {
		Custom_Task__c master = [SELECT id FROM Custom_Task__c WHERE id =: taskId];
		List<Custom_Task__c> subTasks = [SELECT id FROM Custom_Task__c WHERE Master_3rd_Party_Task__c =: master.id];
		master.status__c = 'Awaiting 3rd Party';
		update master;
		
		for(Custom_Task__c task: subTasks) {
			task.status__c = 'Awaiting docs';
		}
		
		update subTasks;
		
		List<FolderManager.Document> documents = FolderManager.findCustomTaskDocuments(taskId);
		for(FolderManager.Document document: documents) {
			for(FolderManager.Version version: document.versions) {
				if (version.reviewer == null) {
					FolderManager.reviewDocument(version.id);
				}
			}
		}
	}

	public static string findTask(FolderManager.Version version) {
		List<Document_Folder_Junction__c> junctions = [SELECT Folder__c FROM Document_Folder_Junction__c WHERE Document__c =: version.id];
		List<String> folderIds = new List<String> ();
		for(Document_Folder_Junction__c item: junctions) {
			folderIds.add(item.Folder__c);
		}
		List<Folder__c> folders = [SELECT id, custom_task__r.id, custom_task__r.type__c FROM Folder__c WHERE id in :folderIds];
		for(Folder__c folder: folders) {
			if (folder.Custom_Task__r != null && MortgagesSpruceDocumentsManager.types.contains(folder.Custom_Task__r.Type__c)) {
				return folder.Custom_Task__r.id;
			}
		}
		return null;
	}

	@AuraEnabled
	public static string getSubTasks(String taskId){
		List<Map<String, String>> results = new List<Map<String, String>>();
		List<Custom_Task__c> subTasks = [SELECT id, name
		                                 FROM Custom_Task__c
		                                 WHERE Master_3rd_Party_Task__c = :taskId];

		for (Custom_Task__c task : subTasks){
			results.add(new Map<String, String>{'name' => task.name, 'id' => task.id});
		}

		return JSON.serialize(results);
	}

	@AuraEnabled
	public static string addDocumentNote(String documentId, String documentNote){
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
			if (documentNote == null || documentNote == '') {
				delete notes[0];	
			} else {
				notes[0].Content = Blob.valueOf(documentNote.escapeHtml4());
				notes[0].Title = 'Document comment';
				update notes[0];
			}
			return documentNote;
		} else {
			if (documentNote != null && documentNote != '') { 
				ContentNote contentNote = new ContentNote();
				contentNote.Title = 'Document comment';
				contentNote.Content = Blob.valueOf(documentNote.escapeHtml4());
				insert contentNote; //Insert Content Note

				//create ContentDocumentLink  record to link with parentId
				ContentDocumentLink contentDocumentLink = new ContentDocumentLink();
				contentDocumentLink.LinkedEntityId = documentId; // Specify your parent Id
				contentDocumentLink.ContentDocumentId = contentNote.Id;  //Content Note Id
				contentDocumentLink.shareType = 'I'; // Specify your sharing type
				contentDocumentLink.visibility = 'InternalUsers'; // Specify your sharing type
				insert contentDocumentLink;
			}
			return documentNote;
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
}