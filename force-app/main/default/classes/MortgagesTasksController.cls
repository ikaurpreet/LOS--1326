public with sharing class MortgagesTasksController {
    public static MortgagesTasksApiClient tasksApiClient { get;set; }
    public static MortgagesTasksApiClient getTasksApiClient(String env) {
        if (tasksApiClient != null) {
            return tasksApiClient;
        }
        tasksApiClient = MortgagesApiClientFactory.createUserFactory(env).createTasksApiClient();
        return tasksApiClient;
    }
    public static MortgagesDocsApiClient docsApiClient { get;set; }
    public static MortgagesDocsApiClient getDocsApiClient(String env) {
        if (docsApiClient != null) {
            return docsApiClient;
        }
        docsApiClient = MortgagesApiClientFactory.createUserFactory(env).createDocsApiClient();
        return docsApiClient;
    }

    @AuraEnabled
    public static String getSubmissionUuidAndEnv(String opportunityId) {
        Map<String, Object> results = new Map<String, Object>();
        Opportunity opp = [SELECT ID From Opportunity WHERE id =: opportunityId];
        MortgagesSubmission submission = MortgagesSubmission.create(opp);

        if (submission != null) {
            results.put('uuid', submission.uuid);
            results.put('env', submission.env);
        }
        return JSON.serialize(results);
    }

    @AuraEnabled
    public static String getTasks(String submissionUuid, String env)  {
        String data = getTasksApiClient(env).getTasks(submissionUuid);
        return data;
    }

    @AuraEnabled
    public static string generateDownloadUrl(String taskUuid, String env){
        String url = getDocsApiClient(env).generateDownloadUrl(taskUuid);
        return url;
    }

    @AuraEnabled
    public static string reject(String taskId, String description) {
        Submission_Task__c task = [SELECT id, Uuid__c FROM Submission_Task__c WHERE id =: taskId LIMIT 1];
        MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(task.Uuid__c);
        String uuid = MortgagesUtilities.unprefixify(task.Uuid__c);
        Id userId = userinfo.getUserId();
        User userDetails =[SELECT Id, Name, Email, Profile.Name, UserRole.Name FROM User where Id=:userId ];
        String results = getTasksApiClient(env.name()).rejectTask(uuid, UserInfo.getName(), userDetails.UserRole.Name, description);
        task.status__c = 'rejected';
        Document__c document = findDocument(task.id);
        String name = document.Name__c != null && document.Name__c.length() > 0 ? document.Name__c : document.Filename__c;
        document.Name__c = '[OLD] ' + (name.length() > 250 ? name.substring(0, 250) : name);
        document.name = document.Name__c.length() > 80 ? document.Name__c.substring(0, 79) : document.Name__c;
        document.status__c = 'Archived';
        update document;
        update task;
        return results;
    }

    @AuraEnabled
    public static string approve(String taskId) {
        Submission_Task__c task = [SELECT id, Uuid__c FROM Submission_Task__c WHERE id =: taskId LIMIT 1];
        MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(task.Uuid__c);
        String uuid = MortgagesUtilities.unprefixify(task.Uuid__c);
        String results = getTasksApiClient(env.name()).approveTask(uuid);
        task.status__c = 'completed';
        List<FolderManager.Document> documents = FolderManager.findSubmissionTaskDocuments(task.id);
        Document__c document = findDocument(task.id);
        document.status__c = 'Approved';
        update document;
        update task;
        return results;
    }

    @AuraEnabled
    public static string archive(String taskId){
        Submission_Task__c task = [SELECT id, Uuid__c FROM Submission_Task__c WHERE id =: taskId LIMIT 1];
        MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(task.Uuid__c);
        String uuid = MortgagesUtilities.unprefixify(task.Uuid__c);
        String results = getTasksApiClient(env.name()).archiveTask(uuid);
        task.status__c = 'archived';
        List<FolderManager.Document> documents = FolderManager.findSubmissionTaskDocuments(task.id);
        Document__c document = findDocument(task.id);

        if (document != null) {
            document.status__c = 'Archived';
            update document;
        }

        update task;
        return results;
    }

    public static Document__c findDocument(String taskId) {
        List<FolderManager.Document> documents = FolderManager.findSubmissionTaskDocuments(taskId);
        FolderManager.Version actualVersion = null;

        if (documents != null && documents.size() > 0) {
            for(FolderManager.Document document: documents) {
                for(FolderManager.Version version: document.versions) {
                    if (version.status == 'Uploaded' || version.status == 'Archived') {
                        actualVersion = version;
                    }
                }
            }
        }
        if (actualVersion == null) { return null; }

        Document__c document = [SELECT id, Name__c, Filename__c FROM Document__c WHERE id =: actualVersion.id];

        return document;
    }

    @AuraEnabled
    public static string requestNewDocument(String opportunityId, String type, String title, String participantRole, String description, Map<String, Object> metadata) {
        Opportunity opp = [SELECT Id, Submission_ID__c, mortgage_Submission_UUID__c, User_Id__c FROM Opportunity WHERE Id =: opportunityId];
        MortgagesConstants.Env env = MortgagesUtilities.getEnvironment(opp);

        String submissionUuid = opp.mortgage_Submission_UUID__c;
        String ownerUuid = opp.User_Id__c;
        String normalizedParticipanRole = participantRole == 'co_borrower' ? 'coBorrower' : participantRole;

        MortgagesTasksApiClient.SubmissionTask mortgagesTask = getTasksApiClient(env.name()).createTask(submissionUuid, ownerUuid, type, title, normalizedParticipanRole, description, metadata, opportunityId + '_' + guid());

        Submission_Task__c task = createSubmissionSubmissionTask(getPrefix(env), opp, mortgagesTask, true);

        return task.id;
    }


    @AuraEnabled
    public static String getConditionInstructions(String id) {
        Condition_Template__mdt condition = [SELECT Instruction__c FROM Condition_Template__mdt WHERE Id =: id];
        return condition.Instruction__c;
    }

    @AuraEnabled
    public static List<Map<String, String>> getConditionTypeDocuments(String type) {
        List<Condition_Template__mdt> conditions = [SELECT Id, Name__c FROM Condition_Template__mdt WHERE Type__c =: type];
        List<Map<String, String>> documentNames = new List<Map<String, String>>();
        

        for(Condition_Template__mdt document : conditions) {
            Map<String, String> documentData = new Map<String, String>();
            documentData.put('id', document.Id);
            documentData.put('name', document.Name__c);
            documentNames.add(documentData);
        }

        return documentNames;
    }

    private static Submission_Task__c createSubmissionSubmissionTask(String envPrefix, Opportunity opp, MortgagesTasksApiClient.SubmissionTask mortgagesTask, boolean hasDocuments) {
        String normalizedParticipanRole = mortgagesTask.participantRole == 'coBorrower' ? 'co_borrower' : mortgagesTask.participantRole;

        Submission_Task__c task = new Submission_Task__c();
        task.Need_Approve__c = true;
        task.Opportunity__c = opp.id;
        task.Has_Documents__c = hasDocuments;
        task.Description__c = mortgagesTask.description;
        task.Participant_Role__c = normalizedParticipanRole;
        task.Status__c = mortgagesTask.status;
        task.Submission_Uuid__c = mortgagesTask.submissionUuid;
        task.Title__c = mortgagesTask.title;
        task.Type__c = mortgagesTask.type;
        task.Uuid__c = envPrefix + mortgagesTask.uuid;
        insert task;
        return task;
    }

    private static String getPrefix(MortgagesConstants.ENV env) {
        String envName = env.name().toLowerCase();
        if (envName == 'production') {
            return 'mort_';
        } else {
            return '';
        }
    }

    private static String guid() {
        Blob b = Crypto.GenerateAESKey(128);
        String h = EncodingUtil.ConvertTohex(b);
        String guid = h.SubString(0,8)+ '-' + h.SubString(8,12) + '-' + h.SubString(12,16) + '-' + h.SubString(16,20) + '-' + h.substring(20);
        return guid;
    }
}