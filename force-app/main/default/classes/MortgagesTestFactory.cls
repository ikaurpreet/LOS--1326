@isTest
public with sharing class MortgagesTestFactory {

    public static final String SUBMISSION_UUID = '13219ec0-3a81-44c5-a300-de14b7d0235f';
    public static final String TASK_UUID = 'e9ed190f-9c35-4024-84bb-e131a28020ba';

    public static Account createAccount() {
        return createAccount(null);
    }

    public static CredibleClientCredentials__c createDefaultClientCredentials() {
        List<CredibleClientCredentials__c> results = [SELECT id FROM CredibleClientCredentials__c WHERE name = 'Test'];
        if (results.size() == 0) {
            CredibleClientCredentials__c cs = new CredibleClientCredentials__c(Name='Test', client_Id__c='client_Id__c', client_Secret__c='client_Secret__c');
            insert cs;
            return cs;
        } else {
            return results[0];
        }
    }

    public static MortgagesLocalSettings__c createLocalSettings() {
        if (MortgagesLocalSettings__c.getInstance(UserInfo.getUserId()).client_Id__c == null) {
            MortgagesLocalSettings__c ls = new MortgagesLocalSettings__c(SetupOwnerId=UserInfo.getUserId(), Name='Test', client_Id__c='clientId', client_Secret__c='clientSecret', token_Url__c='tokenUrl', graphql_Url__c='graphqlUrl', Enable_Encompass_Queue__c=false);
            insert ls;
            return ls;
        } else {
            return MortgagesLocalSettings__c.getInstance(UserInfo.getUserId());
        }
    }

    public static void createClientCredentialsAndLocalSettings() {
        createDefaultClientCredentials();
        createLocalSettings();
    }

    public static Account createAccount(String userId) {
        userId = userId == null ? 'user_' + String.valueOf(randomInteger()) : userId;

        Id recordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Person Account'].Id;
        Account account = new Account(user_id__c = userId, user_uuid__c = userId, FirstName = 'FirstName', LastName = 'LastName', RecordTypeId = recordTypeId);
        insert account;
        return account;
    }

    public static Document__c createDocument(Id opportunityId, String ownerUuid, String reference, string category) {
        createDefaultClientCredentials();
        category = category == null ? 'Misc' : category;
        ownerUuid = ownerUuid == null ? 'borrower_uuid' : ownerUuid;
        reference = reference == null ? SUBMISSION_UUID: reference;

        Document__c document = new Document__c();
        document.name__c = 'name';
        document.external_id__c = 'test_uuid';
        document.reference__c = reference;
        document.owner_uuid__c = ownerUuid;
        document.status__c = 'Uploaded';
        document.category__c = category;
        if (opportunityId != null) {
            document.opportunity__c = opportunityId;
        }

        insert document;
        return document;
    }

    public static Document__c createDocument(String ownerUuid, String reference, string category) {
        return createDocument(null, ownerUuid, reference, category);
    }

    public static Document__c createDocument(String ownerUuid, String reference) {
        return createDocument(null, ownerUuid, reference, null);
    }

    public static Document__c createDocumentWithOpportunity(Id opportunityId, String reference) {
        return createDocument(opportunityId, null, reference, null);
    }

    public static Folder__c createFolder(String reference) {
        Folder__c folder = new Folder__c();
        folder.reference__c = reference;
        insert folder;
        return folder;
    }

    public static Custom_Task__c createCustomTasks(Opportunity opp) {
        Custom_Task__c customTask = new Custom_Task__c();
        customTask.Opportunity__c = opp.id;
        customTask.name = 'Test task';
        customTask.type__c = 'lock_loan';
        insert customTask;
        return customTask;
    }

    public static Custom_Task__c createSpruceTasks(Opportunity opp) {
        Custom_Task__c master = new Custom_Task__c();
        master.Opportunity__c = opp.id;
        master.type__c = '3rd Parties';
        master.RecordTypeId = Schema.SObjectType.Custom_Task__c.getRecordTypeInfosByName().get('Spruce Task').getRecordTypeId();
        master.name = 'Spruce Order';
        insert master;

        Custom_Task__c title = new Custom_Task__c();
        title.name = 'Title';
        title.type__c = 'title';
        title.Master_3rd_Party_Task__c = master.id;
        insert title;

        Custom_Task__c hoi = new Custom_Task__c();
        hoi.name = 'HOI';
        hoi.type__c = 'hoi';
        hoi.Master_3rd_Party_Task__c = master.id;
        insert hoi;

        Custom_Task__c payoff = new Custom_Task__c();
        payoff.name = 'Payoff';
        payoff.type__c = 'payoff';
        payoff.Master_3rd_Party_Task__c = master.id;
        insert payoff;

        return master;
    }

    public static Submission_Task__c createTask() {
        String Description = 'Task description ' + String.valueOf(randomInteger());
        String ParticipantRole = 'borrower';
        String TaskStatus = 'started';
        String TaskName = 'Task name ' + String.valueOf(randomInteger());
        String Title = 'Task Title ' + String.valueOf(randomInteger());
        String TaskType = 'asset';
        String TaskUuid = 'uuid_' + String.valueOf(randomInteger());

        Account account = createAccount();
        Opportunity opportunity = createOpportunity();

        Submission_Task__c task = new Submission_Task__c(
            Description__c = Description,
            Opportunity__c = opportunity.id,
            OwnerId = UserInfo.getUserId(),
            Participant_Role__c = ParticipantRole,
            Status__c = TaskStatus,
            Name = TaskName,
            Submission_Uuid__c = opportunity.Submission_ID__c,
            Type__c = TaskType,
            Title__c = Title,
            Uuid__c = TaskUuid);

        insert task;
        return task;
    }

    private static Integer randomInteger() {
        return Integer.valueof((math.random() * 1000));
    }

    public static Opportunity createOpportunity() {
        return createOpportunity(null, null, null, null, null, null, null);
    }

    public static Opportunity createOpportunity(String env) {
        return createOpportunity(env, null, null, null, null, null, null);
    }

    public static Opportunity createOpportunity(String env, String submissionId, String submissionUuid, String submissionStatus) {
        return createOpportunity(env, submissionId, submissionUuid, submissionStatus, null, null, null);
    }

    public static Opportunity createOpportunity(Account account) {
        return createOpportunity(null, null, null, null, null, null, account);
    }

    public static Opportunity createOpportunity(
        String env,
        String submissionId,
        String submissionUuid,
        String submissionStatus,
        String stageName,
        String vertical,
        Account account) {

        env = env == null ? 'test' : env;
        createDefaultClientCredentials();
        createLocalSettings();
        submissionId = submissionId == null ? String.valueOf(randomInteger()) : submissionId;
        submissionUuid = submissionUuid == null ? SUBMISSION_UUID : submissionUuid;
        submissionStatus = submissionStatus == null ? 'fullFormInProgress' : submissionStatus;
        stageName = stageName == null ? 'FIP' : stageName;
        vertical = vertical == null? 'refinance' : vertical;
        account = account == null ? createAccount(): account;

        String prefixedSubmissionId = env + '_' + submissionId;

        insert new Lead(
            mortgage_Submission_UUID__c = submissionUuid,
            Full_Submission_Status__c = submissionStatus,
            Participant_ID__c = prefixedSubmissionId,
            Status = 'FIP',
            User_Role__c = 'borrower',
            Submission_ID__c = prefixedSubmissionId,
            LastName = 'LastName',
            SubmissionType__c = vertical);

        Opportunity opportunity = new Opportunity(
            Name = String.join(new String[]{env, vertical, submissionId}, '_'),
            StageName = stageName,
            CloseDate = Date.today(),
            mortgage_Submission_UUID__c = submissionUuid,
            Submission_ID__c = prefixedSubmissionId,
            Submission_Type__c = 'MortgageRefi',
            SubmissionType__c = 'MortgageRefi',
            submission_status__c = submissionStatus,
            AccountId = account.Id,
            Encompass_Loan_Number__c = '123');
        insert opportunity;

        return opportunity;
    }

    public static Opportunity opportunityWithMortgageTeam(
        Opportunity opportunity,
        String loanOfficerId,
        String loanCoordinatorId,
        String loanProcessorId,
        String closingCoordinatorId
    ) {
        if (opportunity == null) {
            opportunity = createOpportunity();
        }
        opportunity.Loan_Officer_Id__c = loanOfficerId;
        opportunity.Loan_Coordinator_Id__c = loanCoordinatorId;
        opportunity.Loan_Processor_Id__c = loanProcessorId;
        opportunity.Closing_Coordinator_ID__c = closingCoordinatorId;
        update opportunity;
        return opportunity;
    }

    public static Id opportunityId() {
        List<Opportunity> opportunities = [SELECT id FROM Opportunity LIMIT 1];
        return opportunities[0].Id;
    }

    public static Submission_Task__c createSubmissionTask(String submissionUuid, String taskUuid, Id opportunityId, Boolean hasDocuments) {
        return createSubmissionTask(null, submissionUuid, taskUuid, opportunityId, null, null, hasDocuments);
    }

    public static Submission_Task__c createSubmissionTask(String env, String submissionUuid, String taskUuid, Id opportunityId, String type, String status) {
        return createSubmissionTask(env, submissionUuid, taskUuid, opportunityId, type, status, null);
    }

    public static Submission_Task__c createSubmissionTask(String env, String submissionUuid, String taskUuid, Id opportunityId, String type, String status, Boolean hasDocuments) {
        env = env == null ? 'test' : env;
        type = type == null ? 'Document' : type;
        status = status == null ? 'started' : status;
        hasDocuments = hasDocuments == null ? false : hasDocuments;

        Submission_Task__c task = new Submission_Task__c(
            Opportunity__c = opportunityId,
            Submission_Uuid__c = submissionUuid,
            Uuid__c = env + '_' +taskUuid,
            Status__c = status,
            Type__c = type,
            Title__c = 'test title',
            Name = 'test task',
            has_documents__c = hasDocuments
        );

        insert task;

        if (hasDocuments) {
            Document__c doc = createDocumentWithOpportunity(opportunityId, taskUuid);
            System.debug('Task uuid: ' + task.Uuid__c);
            System.debug('DOC: ' + doc);
        }
        return task;
    }
}