public with sharing class MortgagesCustomTasksManager {
    public static MortgagesApiClient mortgagesApiClient { get;set; }
    public static MortgagesApiClient getMortgagesApiClient(MortgagesConstants.Env env) {
        if (mortgagesApiClient != null) {
            return mortgagesApiClient;
        }
        return MortgagesApiClientFactory.createUserFactory(env.name()).createMortgagesApiClient();
    }
    
    class CustomTask {
        public Id id { get; set; } 
        public String name { get; set; }
        public String status { get; set; }
        public String taskSheetStatus { get; set; }
        public Date orderedDate { get; set; }
        public String titleCompany { get; set; }
        public String mostRecentComment { get; set; }
        public String spruceApiStatus { get; set; }
    }

    private static Map<String, String> DocumentReviewStatus = new Map<string, string> { 
        'Open' => 'Open',
        'Awaiting docs' => 'Awaiting docs', 
        'New docs available' => 'New docs available',
        'Completed' => 'Completed'
     };

    @AuraEnabled
    public static string getMasterRelatedCustomTasks(string recordId) {
        List<Custom_Task__c> associatedTasks = [
            SELECT id, Name, Status__c, Ordered_Date__c, Title_Company__c, Most_Recent_Comment_Long__c, 
            External_ID__c, Opportunity__c
            FROM Custom_Task__c 
            WHERE Master_3rd_Party_Task__c = :recordId
        ];
        system.debug(associatedTasks);
        Custom_Task__c masterTask = [SELECT Status__c, Name, Opportunity__c, External_ID__c, Ordered_Date__c FROM Custom_Task__c WHERE id = :recordId];
        
        String opportunityId = masterTask.Opportunity__c;
        
        Opportunity opp = [SELECT mortgage_Submission_UUID__c, Submission_ID__c FROM Opportunity WHERE id = :opportunityId];
        String submissionUuid = opp.mortgage_Submission_UUID__c;
        MortgagesConstants.ENV env = MortgagesUtilities.getEnvironment(opp);
        
        MortgagesApiClient.OrderType spruceOrderResponse = new MortgagesApiClient.OrderType();
        spruceOrderResponse.status = 'Not Ordered';
        
        try {
            MortgagesApiClient.OrderType results = getMortgagesApiClient(env).getSpruceOrder(submissionUuid);
            if (results != null) { spruceOrderResponse = results; }
        } catch(MortgagesNamedCredentialsGraphQLClient.AuthException ex) {
            throw ex;
        } catch(Exception ex) {
            system.debug(ex);
        }

        List<CustomTask> result = buildCustomTasks(associatedTasks, spruceOrderResponse.status, spruceOrderResponse.orderedDate);
        System.debug(result);
    	return JSON.serialize(result);
    }
    
    @AuraEnabled
    public static boolean updateTaskDocumentReviewStatus(string recordId, string status) {
        Custom_Task__c task = [SELECT Status__c FROM Custom_Task__c WHERE id = :recordId];
        task.Status__c = DocumentReviewStatus.get(status);
        update task;
        return true;
    }

    public static List<CustomTask> buildCustomTasks(List<Custom_Task__c> customTasks, String orderStatus, String orderedDate) {
        List<CustomTask> result = new List<CustomTask>();
        for (Custom_Task__c task: customTasks) {
            CustomTask customTask = new CustomTask();
            customTask.id = task.id;
            customTask.name = task.Name;
            customTask.status = task.Status__c;
            
            if (orderedDate != null) {
                customTask.orderedDate = Date.valueOf(orderedDate); //task.Ordered_Date__c;
            }
            
            customTask.titleCompany = task.Title_Company__c;
            customTask.mostRecentComment = task.Most_Recent_Comment_Long__c;
            customTask.taskSheetStatus = task.Status__c; // TODO:nick define what field should be used
            customTask.spruceApiStatus = orderStatus;

            result.add(customTask);
        }
        return result;
    }
}