public with sharing class MortgagesSubmissionDocuments {
    static String borrowerName;
    static String coBorrowerName;
    static Opportunity opp;
    static final Set<String> TASKS_WITH_DOCUSIGN = new Set<String>{ 'credit'};
    static final Set<String> ARCHIVED_STATUSES = new Set<String>{ 'Archived', 'Denied' };
    static final Map<Id, ContentVersion> contentVersions = new Map<Id, ContentVersion>();
    static final Map<Id, ContentNote> contentNotes = new Map<Id, ContentNote>();
    static final Map<String, Document__c> documentsByReference = new Map<String, Document__c> ();
    static final Map<String, Submission_Task__c> submissionTasks = new Map<String, Submission_Task__c> ();
    public static final Set<String> expirableCategories = new Set<String> { 'Assets', 'Property', 'HOI', 'Payoff', 'Appraisal Invoice', 'HOA', 'Appraisal' };

    static MortgagesDocsApiClient docsApiClient { get;set; }
    static MortgagesDocsApiClient getDocsApiClient(MortgagesConstants.Env env) {
        if (docsApiClient != null) {
            return docsApiClient;
        }
        docsApiClient = MortgagesApiClientFactory.createUserFactory(env.name()).createDocsApiClient();
        return docsApiClient;
    }


    static void initOpportunity(String id) {
        List<Opportunity> opps = [SELECT Name, Account.FirstName, Account.LastName, Cosigner__r.FirstName, Cosigner__r.LastName FROM Opportunity WHERE id =: id LIMIT 1];
        if(opps.size() == 0) { return; }
        opp = opps[0];
        borrowerName = 'Bo - ' + opp.account.FirstName + ' ' + opp.account.LastName;

        if (opp.Cosigner__r != null) {
            coBorrowerName = 'Co - ' + opp.Cosigner__r.FirstName + ' ' + opp.Cosigner__r.LastName;
        }

        initSubmissionTasks(opp);

        List<Document__c> documents = [SELECT id, Expiration_Date__c, GDrive_Metadata__c, LenderTags__c, Reviewer__c, reference__c, Category__c, status__c, LastModifiedBy.Name, Last_Modified_By__r.Name, Document_Upload_Date__c, Most_Recent_Status_Change_Date__c FROM Document__c WHERE opportunity__c =: id];

        if (documents.size() == 0) { return; }

        Set<Id> ids = new Set<Id> ();
        for(Document__c document: documents) {
            ids.add(document.id);
            documentsByReference.put(document.reference__c, document);
        }

        List<ContentDocumentLink> links = [SELECT id, ContentDocumentId, LinkedEntityId FROM ContentDocumentLink WHERE LinkedEntityId =: ids];

        Map<String, String> linksToDocuments = new Map<String, String>();
        for(ContentDocumentLink link: links) {
            linksToDocuments.put(link.ContentDocumentId, link.LinkedEntityId);
        }

        if(linksToDocuments.keySet().size() == 0) { return; }

        List<ContentNote> notes = [SELECT id, content FROM ContentNote WHERE id in : linksToDocuments.keySet()];
        List<ContentVersion> versions = [SELECT id, contentDocumentId FROM ContentVersion WHERE contentDOcumentId in : linksToDocuments.keySet()];

        Set<Id> contentNoteIds = new Set<Id>();
        for(ContentNote note: notes) {
            contentNotes.put(linksToDocuments.get(note.id), note);
            contentNoteIds.add(note.id);
        }

        for(ContentVersion version: versions) {
            if(!contentNoteIds.contains(version.contentDocumentId)) {
                contentVersions.put(linksToDocuments.get(version.contentDocumentId), version);
            }
        }
    }

    static void initSubmissionTasks(Opportunity opportunity) {
        List<Submission_Task__c> tasks = [SELECT uuid__c, id, participant_role__c, Type__c, Title__c, Description__c, status__c, LastModifiedDate, has_documents__c FROM Submission_Task__c WHERE opportunity__c =: opportunity.Id];
        for(Submission_Task__c task : tasks) {
            submissionTasks.put(MortgagesUtilities.unprefixify(task.uuid__c), task);
        }
    }

    @AuraEnabled
    public static String renameDocument(String id, String name) {
        Document__c document = [SELECT Id, External_ID__c, Name__c FROM Document__c WHERE id =: id];

        MortgagesConstants.ENV env = MortgagesUtilities.getEnvironment(document.External_ID__c);
        String uuid = MortgagesUtilities.unprefixify(document.External_ID__c);

        Object results = getDocsApiClient(env).updateDocument(new Map<String, String> { 'uuid' => uuid, 'name' => name });
        document.Name = name.length() > 80 ? name.substring(0, 79) : name;
        document.Name__c = name;
        update document;

        return fetchDocument(id);
    }

    @AuraEnabled
    public static string generateViewerUrl(String documentId) {
        Document__c doc = [SELECT id, External_ID__c FROM Document__c WHERE id =: documentId];
        MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(doc.External_ID__c);
        String documentUuid = MortgagesUtilities.unprefixify(doc.External_ID__c);
        string viewerUrl = getDocsApiClient(env).generateViewerUrl(documentUuid);
        return viewerUrl;
    }

    @AuraEnabled
    public static Boolean generatePDFDocument(String documentId) {
        Document__c doc = [SELECT id, External_ID__c FROM Document__c WHERE id =: documentId];
        MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(doc.External_ID__c);
        String documentUuid = MortgagesUtilities.unprefixify(doc.External_ID__c);
        Boolean results = getDocsApiClient(env).generatePDFDocument(documentUuid);
        return results;
    }

    @AuraEnabled
    public static String fetchSubmissionTaskDocuments(String id) {
        Submission_Task__c submissionTask = [SELECT id, Opportunity__c FROM Submission_Task__c WHERE id =: id];
        initOpportunity(submissionTask.Opportunity__c);
        List<Document_Folder_Junction__c> junctions = [SELECT Document__c FROM Document_Folder_Junction__c WHERE Folder__c in (SELECT id FROM Folder__c WHERE Submission_Task__c =: id)];
        system.debug(junctions);
        if (junctions.size() == 0) { return null; }

        List<Id> documentIds = new List<Id>();

        for(Document_Folder_Junction__c item: junctions) {
            documentIds.add(item.Document__c);
        }

        List<String> statuses = new List<String> { 'Uploaded', 'Archived', 'Approved' };
        List<Document__c> documents = [SELECT id, Expiration_Date__c, Name__c, GDrive_Metadata__c, LenderTags__c, Reference__c, Reviewer__r.Name, category__c, filename__c, status__c, LastModifiedDate, Opportunity__c, source__c, LastModifiedBy.Name, Last_Modified_By__r.Name, Document_Upload_Date__c, Most_Recent_Status_Change_Date__c FROM Document__c WHERE id in : documentIds AND status__c in : statuses ORDER by CreatedDate DESC];
        List<Object> results = new List<Object> ();

        for(Document__c document: documents) {
            results.add(buildDocument(document, 'test'));
        }

        return JSON.serialize(results);
    }

    static Map<String, String> SUBMISSION_TASK_TYPE = new Map<String, String> {
        'income'   => 'Income',
        'asset'    => 'Assets',
        'property' => 'Property',
        'e_sign'   => 'Disclosures',
        'wet_sign' => 'Disclosures',
        'tax'      => 'Tax',
        'Document' => 'Other'
    };

    static Map<String, String> DOCUMENT_TYPE = new Map<String, String> {
        'Misc' => 'Other',
        'Econsent' => 'Non-Borrower Docs',
        'Review' => 'Non-Borrower Docs',
        'Title' => '3rd Party Docs',
        'HOI' => '3rd Party Docs',
        'Payoff' => '3rd Party Docs',
        'Lock Form' => '3rd Party Docs',
        'HOA' => '3rd Party Docs',
        // 'CLA' => '3rd Party Docs',
        'Appraisal' => '3rd Party Docs',
        'Policy Exception' => '3rd Party Docs',
        'Appraisal Invoice' => '3rd Party Docs',
        // 'Pre Approval Letter' => '3rd Party Docs',
        'Credit' => 'Other',
        'Legal' => '3rd Party Docs',
        'Conditional Loan Approval (CLA)' => 'Other',
        'Clear to Close (CTC)' => 'Other',
        'Prelim Title CD' => 'Other',
        'Prelim Lender CD' => 'Other',
        'Final Lender CD' => 'Other',
        'AUS Findings' => 'Other'
    };

    static Map<String, String> DOCUMENT_STATUS = new Map<String, String> {
        'Uploaded' => 'Awaiting Approval',
        'Created' => 'Pending',
        'Approved' => 'Accepted'
    };

    @AuraEnabled
    public static String downloadDocument(String documentId) {
        Document__c document = [SELECT Id, External_ID__c FROM Document__c WHERE id =: documentId];
        ContentVersion contentVersion = MortgagesDocumentManager.downloadDocumentFile(document);
        return contentVersion.contentDocumentId;
    }

    @AuraEnabled
    public static string reviewDocument(String documentId) {
        FolderManager.Version document = FolderManager.reviewDocument(documentId);
        return JSON.serialize(document);
    }

    @AuraEnabled
    public static String fetchDocument(String id) {
        return JSON.serialize(fetchDocumentSource(id));
    }

    static Map<String, Object> fetchDocumentSource(String id) {
        List<Submission_Task__c> tasks = [SELECT Uuid__c, Opportunity__c, id, participant_role__c, Type__c, Description__c, Title__c, status__c, LastModifiedDate FROM Submission_Task__c WHERE id =:id];
        List<Document__c> documents = [SELECT Expiration_Date__c, Name__c, GDrive_Metadata__c, LenderTags__c, Reference__c, Opportunity__c, id, Reviewer__r.Name, category__c, filename__c, status__c, LastModifiedDate, source__c, LastModifiedBy.Name, Last_Modified_By__r.Name, Document_Upload_Date__c, Most_Recent_Status_Change_Date__c FROM Document__c WHERE id =: id];
        String opportunityId = tasks.size() > 0 ? tasks[0].Opportunity__c: documents[0].Opportunity__c;
        initOpportunity(opportunityId);

        if (tasks.size() > 0) {
            return buildTask(tasks[0]);
        } else {
            Document__c document = documents[0];
            String type = documentType(document);
            return buildDocument(document, type);
        }
    }

    class ExpirationDateException extends Exception {}

    public static void checkDocumentExpiration(Document__c doc) {
        if (doc.Expiration_Date__c == null && expirableCategories.contains(doc.Category__c)) { 
            throw new ExpirationDateException('Expiration date required for document accept'); 
        }
    }

    @AuraEnabled
    public static String acceptDocument(String id) {
        Map<String, Object> document = fetchDocumentSource(id);
        system.debug(document);
        if ((String)document.get('origin') != 'borrower') {
            system.debug('document');
            Document__c doc = [SELECT id, Expiration_Date__c, External_ID__c, Category__c FROM Document__c WHERE id =: (String)document.get('id')];
            MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(doc.External_ID__c);
            String documentUuid = MortgagesUtilities.unprefixify(doc.External_ID__c);
            
            checkDocumentExpiration(doc);
            
            MortgagesDocsApiClient.DocumentType results = getDocsApiClient(env).acceptDocument(documentUuid);
            updateDocumentStatus((String)doc.id, 'Approved');
        } else {
            system.debug('submission task');
            String taskId = (String)(document.containsKey('taskId') ? document.get('taskId') : document.get('id'));
            String documentId = (String)document.get('id');
            List<Document__c> docs = [SELECT id, Expiration_Date__c, External_ID__c, Category__c FROM Document__c WHERE id =: documentId];
            if (docs.size() > 0) {
                Document__c doc = docs[0];
                checkDocumentExpiration(doc);
            }

            MortgagesTasksController.approve(taskId);
            updateDocumentStatus((String)document.get('id'), 'Approved');
        }

        return fetchDocument(id);
    }

    @AuraEnabled
    public static String archiveDocument(String id) {
        Map<String, Object> document = fetchDocumentSource(id);
        if ((String)document.get('origin') != 'borrower') {
            Document__c doc = [SELECT id, External_ID__c FROM Document__c WHERE id =: (String)document.get('id')];
            MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(doc.External_ID__c);
            String documentUuid = MortgagesUtilities.unprefixify(doc.External_ID__c);
            MortgagesDocsApiClient.DocumentType results = getDocsApiClient(env).archiveDocument(documentUuid);
            updateDocumentStatus((String)doc.id, 'Archived');
        } else {
            system.debug('submission task');
            String taskId = (String)(document.containsKey('taskId') ? document.get('taskId') : document.get('id'));
            MortgagesTasksController.archive(taskId);
            updateDocumentStatus((String)document.get('id'), 'Archived');
        }

        return fetchDocument(id);
    }

    @AuraEnabled
    public static String reRequestDocument(String id, String description) {
        String taskId;
        Map<String, Object> document = fetchDocumentSource(id);

        if (document.containsKey('taskId')) {
            taskId = (String)document.get('taskId');
        } else {
            taskId = (String)document.get('id');
        }

        MortgagesTasksController.reject(taskId, description);
        updateDocumentStatus((String)document.get('id'), 'Archived');
        return fetchDocument(id);
    }

    static void updateDocumentStatus(String documentId, String status) {
        if (documentId == null) { return; }
        List<Document__c> docs = [SELECT id, External_ID__c FROM Document__c WHERE id =: documentId LIMIT 1];
        if (docs.size() == 0) { return; }
        Document__c doc = docs[0];
        doc.status__c = status;
        DateTime t_date = System.now().dateGmt();
        t_date = t_date.AddHours(System.now().timeGmt().Hour());
        t_date = t_date.AddMinutes(System.now().timeGmt().Minute());
        doc.Most_Recent_Status_Change_Date__c = t_date;
        update doc;
    }

    static Map<String, Object> buildTask(Submission_Task__c task) {
        Map<String, Object> item = new Map<String, Object>();

        item.put('id', task.id);
        item.put('url', '/lightning/r/Submission_Task__c/' + task.id + '/view');
        item.put('type', 'task');
        if (task.type__c == 'review') {
            item.put('type', 'review');
        }

        item.put('name', task.title__c);

        item.put('status', taskStatus(task.status__c));

        item.put('origin', 'borrower');

        item.put('updatedAt', task.LastModifiedDate);

        if (task.participant_role__c == 'co_borrower') {
            item.put('owner', coBorrowerName);
          } else if (task.participant_role__c == 'borrower') {
            item.put('owner', borrowerName);
          } else {
            item.put('owner', 'Both');
          }

        Map<String, String> document = findDocument(task);

        if (document != null) {
            String lenderTags = document.get('lenderTags') != null ? (String)document.get('lenderTags') : '';
            item.put('documentId', document.get('id'));
            item.put('note', document.get('note'));
            item.put('reviewer', document.get('reviewer'));
            item.put('expirationDate', document.get('expirationDate'));
            item.put('lenderTags', buildLenderTags(lenderTags.split(';')));
            item.put('url', '/lightning/r/Document__c/' + document.get('id') + '/view');
            if (task.type__c == 'e_sign' && document.get('status') != 'Uploaded') {
                String status = document.get('status');
                status = DOCUMENT_STATUS.containsKey(status) ? DOCUMENT_STATUS.get(status) : status;
                item.put('status', status);
            }
        }

        return item;
    }

    static String taskStatus(String status) {
        if (status == 'submitted' || status == 'resubmitted') {
            return 'Awaiting Approval';
        } else if(status == 'completed') {
            return 'Accepted';
        } else if (status == 'rejected') {
            return 'Re-requested';
        } else if(status == 'archived') {
            return 'Archived';
        }
        return 'Outstanding';
    }

    @TestVisible
    static Map<String, Object> buildDocument(Document__c document, String type) {
        String taskUuid = getTaskUuid(document);
        System.debug('getTaskUuid: ' + taskUuid);
        if (submissionTasks.isEmpty()) {
            Opportunity opp = new Opportunity(Id = document.Opportunity__c);
            initSubmissionTasks(opp);
        }

        System.debug('submissionTasks: ' + submissionTasks);
        Submission_Task__c submissionTask = submissionTasks.get(taskUuid);
        Map<String, Object> item = new Map<String, Object>();

        String participantRole = submissionTask != null ? submissionTask.Participant_Role__c : 'borrower';
        item.put('id', document.id);
        item.put('category', document.category__c);
        item.put('participantRole', participantRole);
        item.put('expirationDate', document.Expiration_Date__c);
        if (document.name__c != null) {
            item.put('name', document.name__c);
        } else {
            item.put('name', document.filename__c);
        }

        if (document.GDrive_Metadata__c != null) {
            item.put('gdriveMetadata', document.GDrive_Metadata__c);
        } else {
            item.put('gdriveMetadata', 'null');
        }

        item.put('url', '/lightning/r/Document__c/' + document.id + '/view');

        String status = documentStatus(document);

        if (type != 'Non-Borrower Docs') {
            item.put('status', status);
            item.put('owner', borrowerName);
        }

        if (submissionTask != null && submissionTask.Participant_Role__c == 'borrower') {
            item.put('owner', borrowerName);
        }

        if (isCreditReport(type,document.name__c)) {
            item.put('owner', '');
        }

        if (submissionTask != null && submissionTask.Participant_Role__c == 'co_borrower') {
            item.put('owner', coBorrowerName);
        }

        if (submissionTask != null && submissionTask.Participant_Role__c == 'both') {
            item.put('owner', 'Both');
        }

        if (status != 'Pending') {
            item.put('documentId', document.id);
            if(contentVersions.containsKey(document.id)) {
                item.put('fileId', contentVersions.get(document.id).ContentDocumentId);
            }
        }

        System.debug('submissionTask: ' + submissionTask);
        if (submissionTask != null) {
            item.put('origin', 'borrower');
            item.put('taskId', submissionTask.id);
            String taskStatus = taskStatus(submissionTask.status__c);
            List<String> cantCreateConditionTypes = new List<String>{'review', 'e_sign'};
            Boolean canCreateCondition = !cantCreateConditionTypes.contains(submissionTask.type__c);
            item.put('canCreateCondition', canCreateCondition);
            if(taskStatus == 'Outstanding' && submissionTask.type__c != 'e_sign') {
                item.put('status', 'Outstanding');
            }
            if(submissionTask.type__c == 'e_sign' && status == 'Awaiting Approval') {
                item.put('status', 'Outstanding');
            }
            if (submissionTask.type__c == 'credit') {
                item.put('status', taskStatus);
            }
        }

        item.put('updatedAt', document.LastModifiedDate);
        if (document.Last_Modified_By__r != null) {
            item.put('lastModifiedBy', document.Last_Modified_By__r);
        } else {
            item.put('lastModifiedBy', document.LastModifiedBy);
        }

        item.put('opportunity', opp);
        if(contentNotes.containsKey(document.id)) {
            item.put('note', contentNotes.get(document.id).content.toString().unescapeHtml4());
        }

        if (document.reviewer__r != null) {
            item.put('reviewer', document.Reviewer__r.name);
        }

        String lenderTags = Document.LenderTags__c != null ? Document.LenderTags__c : '';
        item.put('lenderTags', buildLenderTags(lenderTags.split(';')));
        item.put('category', document.Category__c);

        item.put('uploadDate', document.Document_Upload_Date__c);
        item.put('mostRecentStatusChangeDate', document.Most_Recent_Status_Change_Date__c);

        return item;
    }

    @TestVisible
    static String getTaskUuid(Document__c document) {
        String reference = document.reference__c;
        if (reference != null && reference.contains(':')) {
            return reference.substringBefore(':');
        }
        return reference;
    }

    static List<Map<String, String>> buildLenderTags(List<String> source) {
        List<Map<String, String>> results = new List<Map<String, String>>();
        Map<String, String> valuesToLabel= new Map<String, String>();

        Schema.DescribeFieldResult fieldResult = Document__c.LenderTags__c.getDescribe();
		List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();

        for( Schema.PicklistEntry pickListVal : ple){
			valuesToLabel.put(pickListVal.getValue(), pickListVal.getLabel());
		}

        for(String item: source) {
            if (item != null && item != '') {
                results.add(new Map<String, String> { 'value' => item, 'label' => valuesToLabel.get(item) });
            }
        }

        return results;
    }

    @AuraEnabled
    public static string fetchLenderDocuments(String opportunityId) {
        initOpportunity(opportunityId);
        List<Document__c> documents = [SELECT id, Expiration_Date__c, Name__c, GDrive_Metadata__c, LenderTags__c, Reference__c, Reviewer__r.Name, category__c, filename__c, status__c, LastModifiedDate, LastModifiedBy.Name, Last_Modified_By__r.Name, Opportunity__c,  Document_Upload_Date__c, Most_Recent_Status_Change_Date__c, source__c FROM Document__c WHERE opportunity__c =: opportunityId and LenderTags__c != null];
        Map<String, List<Map<String, Object>>> data = new Map<String, List<Map<String, Object>>>();
        for(Document__c document: documents) {
            String type = documentType(document);

            Map<String, Object> item = buildDocument(document, type);

            List<Map<String, String>> lenderTags = (List<Map<String, String>>)item.get('lenderTags');

            for(Map<String, String> tag: lenderTags) {
                if(!data.containsKey(tag.get('value'))) {
                    data.put(tag.get('value'), new List<Map<String, Object>>());
                }
                data.get(tag.get('value')).add(item);
            }
        }

        Schema.DescribeFieldResult fieldResult = Document__c.LenderTags__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();

        List<Map<String, Object>> results = new List<Map<String, Object>>();
        for(Schema.PicklistEntry item: ple) {
            Object items = data.containsKey(item.value) ? data.get(item.value) : new List<Object> {};
            results.add(new Map<String, Object>{ 'name' => item.label, 'items' => items });
        }
        return JSON.serialize(results);
    }

    @AuraEnabled
    public static string fetchOnlyDocuments(String opportunityId){
        initOpportunity(opportunityId);
        List<Document__c> documents = [SELECT id, Expiration_Date__c, GDrive_Metadata__c, LenderTags__c, Reference__c, Reviewer__r.Name, category__c, filename__c, status__c, LastModifiedDate, LastModifiedBy.Name, Last_Modified_By__r.Name, Name__c, Opportunity__c, source__c, Document_Upload_Date__c, Most_Recent_Status_Change_Date__c FROM Document__c WHERE opportunity__c =: opportunityId];
        List<Map<String, Object>> results = new List<Map<String, Object>>();

        for(Document__c document: documents) {
            String type = documentType(document);

            Map<String, Object> item = buildDocument(document, type);

            results.add(item);
        }
        return JSON.serialize(results);
    }

    @AuraEnabled
    public static string fetchSubmissionTasks(String opportunityId) {
        Map<String, List<Map<String, Object>>> data = new Map<String, List<Map<String, Object>>>();
        initOpportunity(opportunityId);

        List<Submission_Task__c> tasks = tasksWithDocuments();

        for(Submission_Task__c task: tasks) {
            String type = 'Other';
            if (SUBMISSION_TASK_TYPE.containsKey(task.type__c)) {
                type = SUBMISSION_TASK_TYPE.get(task.type__c);
            }

            Map<String, Object> item = buildTask(task);


            if(!data.containsKey(type)) {
                data.put(type, new List<Map<String, Object>>());
            }

            data.get(type).add(item);
        }

        List<Map<String, Object>> results = new List<Map<String, Object>>();

        for(String type: data.keySet()) {
            results.add(new Map<String, Object> { 'name' => type, 'items' => data.get(type) });
        }

        return JSON.serialize(results);
    }

    @AuraEnabled
    public static string fetchDocuments(String opportunityId, boolean onlyTasks, boolean onlyAccepted, boolean onlyArchived, boolean only3rdParty) {
        return fetchDocuments(opportunityId, onlyAccepted, onlyArchived, only3rdParty);
    }

    @AuraEnabled
    public static string fetchDocuments(String opportunityId, boolean onlyAccepted, boolean onlyArchived, boolean only3rdParty) {
        Map<String, List<Map<String, Object>>> data = new Map<String, List<Map<String, Object>>>();
        initOpportunity(opportunityId);

        onlyAccepted = onlyAccepted == null ? false : true;
        onlyArchived = onlyArchived == null ? false : true;
        only3rdParty = only3rdParty == null ? false : true;

        List<Document__c> documents = [SELECT id, Expiration_Date__c, Name__c, GDrive_Metadata__c, LenderTags__c, Reference__c, Reviewer__r.Name, category__c, filename__c, status__c, LastModifiedDate, Opportunity__c, source__c, LastModifiedBy.Name, Last_Modified_By__r.Name, Document_Upload_Date__c, Most_Recent_Status_Change_Date__c FROM Document__c WHERE opportunity__c =: opportunityId];

        for(Document__c document: documents) {
            String type = documentType(document);

            Map<String, Object> item = buildDocument(document, type);

            if (onlyAccepted) {
                if (type == 'Non-Borrower Docs' || item.get('status') != 'Accepted') {
                    continue;
                }
            }

            if (onlyArchived) {
                if(item.get('status') != 'Archived') {
                    continue;
                }
            }

            if (only3rdParty) {
                if(type != '3rd Party Docs' && type != 'Non-Borrower Docs') {
                    continue;
                }
            }

            if(!data.containsKey(type)) {
                data.put(type, new List<Map<String, Object>>());
            }

            data.get(type).add(item);
        }

        List<Map<String, Object>> results = new List<Map<String, Object>>();

        for(String type: data.keySet()) {
            results.add(new Map<String, Object> { 'name' => type, 'items' => data.get(type) });
        }

        return JSON.serialize(results);
    }

    static List<Submission_Task__c> tasksWithDocuments() {
        List<Submission_Task__c> tasks = new List<Submission_Task__c>();
        for(Submission_Task__c task : submissionTasks.values()) {
            Boolean hasDocs = task.has_documents__c != null ? task.has_documents__c : false;
            if (hasDocs) {
                tasks.add(task);
            }
        }
        return tasks;
    }

    @AuraEnabled
	public static string addNote(String documentId, String note) {
        Document__c document = [SELECT Opportunity__c FROM Document__c WHERE id =: documentId];
		List<ContentDocumentLink> contentDocumentLinks = [SELECT ContentDocumentId
		                                                  FROM ContentDocumentLink
		                                                  WHERE LinkedEntityId =: documentId];
		List<Id> ids = new List<Id>();

		for(ContentDocumentLink link: contentDocumentLinks) {
			ids.add(link.ContentDocumentId);
		}

		List<ContentNote> notes = [SELECT content FROM ContentNote WHERE id in :ids];

		system.debug(note);

		if (notes.size() > 0){
			if (note == null || note == '') {
				delete notes[0];
			} else {
				notes[0].Content = Blob.valueOf(note.escapeHtml4());
				notes[0].Title = 'Document comment';
				update notes[0];
			}
            OpportunityEventManager.createDocumentEvent(document.Opportunity__c);
			return note;
		} else {
			if (note != null && note != '') {
				ContentNote contentNote = new ContentNote();
				contentNote.Title = 'Document comment';
				contentNote.Content = Blob.valueOf(note.escapeHtml4());
				insert contentNote; //Insert Content Note

				//create ContentDocumentLink  record to link with parentId
				ContentDocumentLink contentDocumentLink = new ContentDocumentLink();
				contentDocumentLink.LinkedEntityId = documentId; // Specify your parent Id
				contentDocumentLink.ContentDocumentId = contentNote.Id;  //Content Note Id
				contentDocumentLink.shareType = 'I'; // Specify your sharing type
				contentDocumentLink.visibility = 'InternalUsers'; // Specify your sharing type
				insert contentDocumentLink;
			}
            OpportunityEventManager.createDocumentEvent(document.Opportunity__c);
			return note;
		}
	}

    @AuraEnabled
    public static string addToGDrive(String documentId, String folder) {
        Document__c document = [SELECT Opportunity__r.Borrower_Name__c, Opportunity__r.Encompass_Loan_Number__c, External_ID__c FROM Document__c WHERE id =: documentId];

        String canonicalPath = canonicalPathByDocument(document, folder);
        MortgagesConstants.ENV env = MortgagesUtilities.getEnvironment(document.External_ID__c);
        String uuid = MortgagesUtilities.unprefixify(document.External_ID__c);

        String documentGdriveLink = getDocsApiClient(env).copyDocumentToGDrive(uuid, canonicalPath);
        return documentGdriveLink;
    }

    @AuraEnabled
    public static Boolean bulkAddToGDrive(List<String> documentIds, String folder){
      if (documentIds.IsEmpty())
        return false;
      try {
        List<Document__c> documents = [SELECT Opportunity__r.Borrower_Name__c, Opportunity__r.Encompass_Loan_Number__c, External_ID__c FROM Document__c WHERE id IN :documentIds];
        MortgagesDocsApiClient docsApiClient = getDocsApiClient(MortgagesUtilities.getEnvironment(documents[0].External_ID__c));

        List<String> documentUuids = new List<String>();
        String canonicalPath = canonicalPathByDocument(documents[0], folder);

        for(Document__c document : documents) {
          String uuid = MortgagesUtilities.unprefixify(document.External_ID__c);
          documentUuids.add(uuid);
        }

        docsApiClient.bulkCopyDocumentToGdrive(documentUuids, canonicalPath);

        return true;
      } catch (Exception e) {
        throw new AuraHandledException(e.getMessage());
      }
    }


    @AuraEnabled
    public static void updateLenderTags(String documentId, List<String> lenderTags){
        Document__c document = [SELECT id, Opportunity__c, LenderTags__c FROM Document__c WHERE id =: documentId];
        document.LenderTags__c = String.join(lenderTags, ';');
        OpportunityEventManager.createDocumentEvent(document.Opportunity__c);
        update document;
    }

    @AuraEnabled
    public static Boolean bulkUpdateLenderTags(List<String> documentIds, List<String> lenderTags){
      try {
        List<Document__c> documents = [SELECT Id, LenderTags__c FROM Document__c WHERE id IN :documentIds];

        for(Document__c document : documents) {
          document.LenderTags__c = String.join(lenderTags, ';');
        }
        update documents;
        return true;
      } catch (Exception e) {
          throw new AuraHandledException(e.getMessage());
      }
    }

    @AuraEnabled
    public static Boolean updateExpirationDate(String documentId, String expirationDate) {
        Document__c document = [SELECT id, External_ID__c, Opportunity__c, Expiration_Date__c FROM Document__c WHERE id =: documentId];
        document.Expiration_Date__c = date.valueOf(expirationDate);
        MortgagesDocsApiClient docsApiClient = getDocsApiClient(MortgagesUtilities.getEnvironment(document.External_ID__c));
        docsApiClient.updateExpirationDate(MortgagesUtilities.unprefixify(document.External_ID__c), expirationDate);
        update document;
        return true;
    }

    static Map<String, String> findDocument(Submission_Task__c task) {
        String documentReference = documentReference(task);
        if (!documentsByReference.containsKey(documentReference)) { return null; }
        Document__c document = documentsByReference.get(documentReference);

        Map<String, String> data = new Map<String, String>();
        data.put('id', document.id);
        data.put('reviewer', document.Reviewer__c);
        data.put('lenderTags', document.LenderTags__c);
        data.put('status', document.status__c);
        data.put('participantRole', task.Participant_Role__c);
        data.put('category', document.category__c);
        
        if (document.Expiration_Date__c != null) {
            data.put('expirationDate', document.Expiration_Date__c.format());
        }

        if (contentNotes.containsKey(document.id)) {
            data.put('note', contentNotes.get(document.id).content.toString().unescapeHtml4());
        }

        return data;
    }

    @TestVisible
    static String documentReference(Submission_Task__c task) {
        String taskUuid = MortgagesUtilities.unprefixify(task.uuid__c);
        if (TASKS_WITH_DOCUSIGN.contains(task.type__c)) {
            if (task.status__c == 'completed') {
                return taskUuid;
            } else {
                return taskUuid + ':template';
            }
        } else {
            return taskUuid;
        }
    }

    private static String canonicalPathByDocument(Document__c document, String folder) {
      String borrowerName = document.Opportunity__r.Borrower_Name__c.replace(' ', '_');
      String loanNumber = document.Opportunity__r.Encompass_Loan_Number__c;
      return borrowerName + ' ' + loanNumber + '/' + folder;
    }

    @TestVisible
    static String documentType(Document__c document) {
        String type = document.category__c;
        if (DOCUMENT_TYPE.containsKey(type)) {
            return DOCUMENT_TYPE.get(type);
        }
        return type == null ? 'Other' : type;
    }

    @TestVisible
    static Boolean isCreditReport(String type, String documentName) {
        return type == 'Other' && documentName != null && documentName.contains('credit report received on');

    }

    @TestVisible
    static String documentStatus(Document__c document) {
        String status = document.status__c;
        status = DOCUMENT_STATUS.containsKey(status) ? DOCUMENT_STATUS.get(status) : status;
        return status;
    }
}