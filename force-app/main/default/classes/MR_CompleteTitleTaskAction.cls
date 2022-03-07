public with sharing class MR_CompleteTitleTaskAction {
    @InvocableMethod(label='Mortgages complete title information task' description='Makes API call to complete title information task for mortgages.')
    public static void execute(List<MR_CompleteTitleTaskAction.ActionInput> inputs) {
        MR_CompleteTitleTaskAction.ActionInput input = inputs[0];
        completeTask(input.opportunityId);
    }
    
    public class ActionInput {
        @InvocableVariable(label='Opportunity record Id' description='Record Id of the Opportunity object' required=true)
        public Id opportunityId;
    }
    
    private static void completeTask(Id opportunityId) {
        String taskUuid = startedTaskUuid(opportunityId);
        if (taskUuid != null) {
            MortgagesTasksApiClient tasksApiClient = MR_Actions.resolveTasksApiClient(opportunityId);
            String unprefixedTaskUuid = MortgagesUtilities.unprefixify(taskUuid);
            tasksApiClient.completeTask(unprefixedTaskUuid);
            completeStartedTask(taskUuid);
        }
    }
    
    private static String startedTaskUuid(Id opportunityId) {
        List<Submission_Task__c> tasks =
        [SELECT id, Uuid__c FROM Submission_Task__c WHERE
            Status__c = 'started' AND Opportunity__c =: opportunityId AND Type__c = 'title_information'];
        if (tasks.size() == 0) {
            return null;
        } else if (tasks.size() > 1) {
            throw new MortgagesUtilities.SubjectObjectNotFoundException('Multiple objects Submission_Task__c record with Opportunity__c="' + opportunityId +
                '" Type__c="title_information" Status__c = "started" were found.');
        }
        return tasks.get(0).Uuid__c;
    }
    
    private static void completeStartedTask(String taskUuid) {
        Submission_Task__c task = [SELECT id, Status__c FROM Submission_Task__c WHERE Uuid__c =: taskUuid];
        task.Status__c = 'completed';
        update task;
    }
}