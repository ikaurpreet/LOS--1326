public with sharing class MR_CreateScheduleLoanTaskAction {
    @InvocableMethod(label='Mortgages create spruce schedule loan task' description='Makes API call to create spruce schedule loan task for mortgages.')
    public static void execute(List<MR_CreateScheduleLoanTaskAction.ActionInput> inputs) {
        MR_CreateScheduleLoanTaskAction.ActionInput input = inputs[0];
        processScheduleTask(input.opportunityId);
    }
    
    public class ActionInput {
        @InvocableVariable(label='Opportunity record Id' description='Record Id of the Opportunity object' required=true)
        public Id opportunityId;
    }
    
    private static void processScheduleTask(Id opportunityId) {
        Opportunity opp = [SELECT Id, Title_Company__c, Task_Sheet__c, User_Id__c FROM Opportunity WHERE Id =: opportunityId];
        Task_Sheet__c taskSheet = [SELECT Enable_Schedule_Closing_Task_with_Spruce__c, Closing_Scheduled__c FROM Task_Sheet__c WHERE id =: opp.Task_Sheet__c];
        MortgagesSubmission submission = MortgagesSubmission.create(opp);
        String tasksJson = MortgagesTasksController.getTasks(submission.uuid, submission.env.name());
        List<MortgagesTasksApiClient.SubmissionTask> tasks = (List<MortgagesTasksApiClient.SubmissionTask>)JSON.deserialize(tasksJson, List<MortgagesTasksApiClient.SubmissionTask>.class);
        String scheduleClosingTaskUuid = '';
        String scheduleClosingTaskId = '';

        for (MortgagesTasksApiClient.SubmissionTask task: tasks) {
            if (task.type == 'spruceScheduleClosing') {
                Submission_Task__c scheduleTask = [SELECT Id, Uuid__c, title__c, Opportunity__c FROM Submission_Task__c WHERE Uuid__c  =: task.uuid];
                scheduleClosingTaskId = scheduleTask.Id;
                scheduleClosingTaskUuid = scheduleTask.Uuid__c;
                break;
            } else {
                continue;
            }
        }

        // create task
        if (taskSheet.Enable_Schedule_Closing_Task_with_Spruce__c != null  && opp.Title_Company__c == 'Spruce') {
            MortgagesTasksApiClient tasksApiClient = MR_Actions.resolveTasksApiClient(opportunityId);
            String userUuid = opp.User_Id__c;
            tasksApiClient.createScheduleClosingTask(submission.uuid, userUuid);
        }

        // archive task
        if (taskSheet.Enable_Schedule_Closing_Task_with_Spruce__c == null  && opp.Title_Company__c == 'Spruce' && scheduleClosingTaskId != '') {
            MortgagesTasksController.archive(scheduleClosingTaskId);
        }

        // complete task
        if (taskSheet.Closing_Scheduled__c != null && scheduleClosingTaskUuid != '') {
            MortgagesTasksApiClient tasksApiClient = MR_Actions.resolveTasksApiClient(opportunityId);
            tasksApiClient.completeTask(scheduleClosingTaskUuid);
        }
    }
}