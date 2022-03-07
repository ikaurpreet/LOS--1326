@isTest
public with sharing class MortgagesCustomTasksManagerTest {

    @isTest
    public static void getMasterRelatedCustomTasks() {
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        Custom_Task__c task = MortgagesTestFactory.createSpruceTasks(opp);
        MortgagesCustomTasksManager.getMasterRelatedCustomTasks(task.id);
    }
}