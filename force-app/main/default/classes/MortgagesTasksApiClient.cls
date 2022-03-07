global class MortgagesTasksApiClient extends MortgagesApplicationClient {
    public MortgagesTasksApiClient(MortgagesConstants.Env env) { super(env); }
    public MortgagesTasksApiClient(MortgagesGraphQLClient client) { super(client); }
    public MortgagesTasksApiClient(String graphqlUrl, String accessToken) { super(graphqlUrl, accessToken); }

    private static final String RESPONSE_TASK_FIELDS =
        '{' +
            'uuid,' +
            'submissionUuid,' +
            'ownerUuid,' +
            'status,' +
            'group,' +
            'type,' +
            'participantRole,' +
            'title,' +
            'description,' +
            'createdAt,' +
            'updatedAt' +
        '}';

    public String rejectTask(String uuid, String author, String authorRole, String description) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'systemRejectTask';
        mutation.variables = new Map<String, Object> { 'uuid' => uuid, 'author' => author, 'authorRole' => authorRole, 'comment' => description };
        mutation.body = 'mutation systemRejectTask($uuid: ID!, $comment: String!, $author: String!, $authorRole: String!) {' +
            'systemRejectTask(uuid: $uuid, comment: $comment, author: $author, authorRole: $authorRole) {' +
                'uuid,' +
                'submissionUuid,' +
                'ownerUuid,' +
                'status,' +
                'group,' +
                'type,' +
                'participantRole,' +
                'title,' +
                'description,' +
                'createdAt,' +
                'updatedAt' +
            '}' +
        '}';

        MortgagesGraphQLClient.Results results = client.mutation(mutation);

        processErrors(results);

        String data = (String)results.data;

        return data;
    }

    public String approveTask(String uuid) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'systemApproveTask';
        mutation.variables = new Map<String, Object> { 'uuid' => uuid };
        mutation.body = 'mutation systemApproveTask($uuid: ID!) {' +
            'systemApproveTask(uuid: $uuid) {' +
                'uuid,' +
                'submissionUuid,' +
                'ownerUuid,' +
                'status,' +
                'group,' +
                'type,' +
                'participantRole,' +
                'title,' +
                'description,' +
                'createdAt,' +
                'updatedAt' +
            '}' +
        '}';

        MortgagesGraphQLClient.Results results = client.mutation(mutation);

        processErrors(results);

        String data = (String)results.data;

        return data;
    }

    public String archiveTask(String uuid) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'systemArchiveTask';
        mutation.variables = new Map<String, Object> { 'uuid' => uuid };
        mutation.body = 'mutation systemArchiveTask($uuid: ID!) {' +
            'systemArchiveTask(uuid: $uuid) {' +
                'uuid,' +
                'submissionUuid,' +
                'ownerUuid,' +
                'status,' +
                'group,' +
                'type,' +
                'participantRole,' +
                'title,' +
                'description,' +
                'createdAt,' +
                'updatedAt' +
            '}' +
        '}';

        MortgagesGraphQLClient.Results results = client.mutation(mutation);

        processErrors(results);

        String data = (String)results.data;

        return data;
    }

    public String getTasks(String submissionUuid) {
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'systemFindGenericTasks';
        query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'stage' => 'review' };
        query.body = 'query systemFindGenericTasks($submissionUuid: ID!, $stage: TaskGenericStageEnum) {' +
            'systemFindGenericTasks(submissionUuid: $submissionUuid, stage: $stage) {' +
                'uuid,' +
                'submissionUuid,' +
                'ownerUuid,' +
                'status,' +
                'group,' +
                'type,' +
                'participantRole,' +
                'title,' +
                'description,' +
                'createdAt,' +
                'updatedAt' +
            '}' +
        '}';

        MortgagesGraphQLClient.Results results = client.query(query);

        processErrors(results);

        String data = (String)results.data;

        return data;
    }

    public static final String MUTATION_COMPLETE_TASK =
        'mutation systemCompleteTask($uuid: ID!){systemCompleteTask(uuid: $uuid)' + RESPONSE_TASK_FIELDS + '}';

    public String completeTask(String taskUuid) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'systemCompleteTask';
        mutation.variables = new Map<String, Object> { 'uuid' => taskUuid };
        mutation.body = MUTATION_COMPLETE_TASK;

        MortgagesGraphQLClient.Results results = client.mutation(mutation);
        processErrors(results);
        String data = (String)results.data;
        return data;
    }

    public String createMeetingTask(Map<String, Object> meetingTaskInput) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'createMeetingTask';
        mutation.variables = new Map<String, Object> { 'task' => meetingTaskInput };
        StringBuilder queryBuilder = new stringBuilder(new List<String> {
            'mutation createMeetingTask($task: MeetingTaskItemInput) { ',
                'createMeetingTask(task: $task) { ',
                    'uuid ',
                    'items { ',
                        'uuid ',
                    '} ',
                '} ',
            '} '
        });
        mutation.body = queryBuilder.toString();
        return executeMutation(mutation);
    }

    public String fireTaskItemEvent(String taskItemUuid, String event) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'fireTaskItemEvent';
        mutation.variables = new Map<String, Object> { 'taskItemUuid' => taskItemUuid, 'event' => event };
        StringBuilder queryBuilder = new StringBuilder(new List<String> {
            'mutation fireTaskItemEvent($taskItemUuid: ID!, $event: String!) { ',
                'fireTaskItemEvent(taskItemUuid: $taskItemUuid, event: $event) { ',
                    'uuid ',
                '} ',
            '} '
        });
        mutation.body = queryBuilder.toString();
        return executeMutation(mutation);
    }

    private String executeMutation(MortgagesGraphQLClient.Mutation mutation) {
        MortgagesGraphQLClient.Results results = client.mutation(mutation);
        processErrors(results);
        return (String)results.data;
    }

    public String createScheduleClosingTask(String submissionUuid, String ownerUuid) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'createSpruceScheduleClosingTask';
        Map<String, Object> taskInput = new Map<String, Object> {	
            'submissionUuid' => submissionUuid,	
            'ownerUuid' => ownerUuid
          };
        mutation.variables = new Map<String, Object> { 'input' => taskInput };
        mutation.body = 'mutation createSpruceScheduleClosingTask($input: CreateSpruceScheduleClosingTaskInput) { ' +
                'createSpruceScheduleClosingTask(input: $input) {' +
                    'uuid,' +
                    'submissionUuid,' +
                    'status,' +
                    'taskGroup,' +
                    'participantRole,' +
                    'title,' +
                    'description,' +
            '}' +
        '}';

        MortgagesGraphQLClient.Results results = client.mutation(mutation, String.class);

        processErrors(results);

        return (String)results.data;
    }
  
    public SubmissionTask createTask(String submissionUuid, String ownerUuid, String type, String title, String participantRole, String description, Map<String, Object> metadata, String reference) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'systemCreateTask';
        mutation.variables = new Map<String, Object> {
            'type' => type,
            'title' => title,
            'submissionUuid' => submissionUuid,
            'ownerUuid' => ownerUuid,
            'participantRole' => participantRole,
            'metadata' => metadata,
            'description' => description,
            'reference' => reference
        };

        mutation.body = 'mutation systemCreateTask($type: TaskItemTypeEnum!, $title: String!, $submissionUuid: ID!, $ownerUuid: ID!, $participantRole: ParticipantRoleEnum!, $description: String!, $metadata: JSON!, $reference: ID) {' +
            'systemCreateTask(type: $type, title: $title, submissionUuid: $submissionUuid, ownerUuid: $ownerUuid, participantRole: $participantRole, description: $description, metadata: $metadata, reference: $reference) {' +
                'uuid,' +
                'submissionUuid,' +
                'ownerUuid,' +
                'status,' +
                'type,' +
                'participantRole,' +
                'title,' +
                'description,' +
                'createdAt,' +
                'updatedAt' +
            '}' +
        '}';

        MortgagesGraphQLClient.Results results = client.mutation(mutation, SubmissionTask.class);

        processErrors(results);

        return (SubmissionTask)results.data;
    }

    public class SubmissionTask {
        public String uuid { get; set; }
        public String submissionUuid { get; set; }
        public String ownerUuid { get; set; }
        public String status { get; set; }
        public String type { get; set; }
        public String participantRole { get; set; }
        public String title { get; set; }
        public String description { get; set; }
        public String createdAt { get; set; }
        public String updatedAt { get; set; }

        public SubmissionTask(String uuid, String submissionUuid, String ownerUuid, String status, String type, String participantRole, String title, String description, String createdAt, String updatedAt) {
            this.uuid = uuid;
            this.submissionUuid = submissionUuid;
            this.ownerUuid = ownerUuid;
            this.status = status;
            this.type = type;
            this.participantRole = participantRole;
            this.title = title;
            this.description = description;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }
    }
}