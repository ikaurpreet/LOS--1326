public with sharing class GetRelatedRecordsLOC {
    @AuraEnabled(cacheable=true)
    public static List<Loan__c> getLoans(String oppId) {
        return [SELECT Id, Name ,Lender_Name__c, Account_Number__c, Opportunity__c, Loan_Type__c FROM Loan__c where Opportunity__c =: oppId Order By Name asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Rate__c> getRates(String oppId) {
        return [SELECT Id, Name ,Rate__c, Term__c, Lender__c,Opportunity__c FROM Rate__c where Opportunity__c =: oppId Order By Name asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Policy_Exception__c > getPex(String oppId) {
        return [SELECT Id, Name ,New_Fee__c, New_Fee_Amount__c, Approval_Status__c,Opportunity__c FROM Policy_Exception__c  where Opportunity__c =: oppId Order By Name asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Closed_Loan__c> getClosedLoans(String oppId) {
        return [SELECT Id, Name ,Offer_Accepted_Date__c, Wire_Amount__c, Finance_Payment__r.Name,Opportunity__c FROM Closed_Loan__c where Opportunity__c =: oppId Order By Name asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<OpportunityContactRole> getContactRoles(String oppId) {
        return [Select id,OpportunityId,ContactId,Role,Contact.Name,Contact.Title,IsPrimary,Contact.Phone,Contact.Email,Contact.Account.Name,Contact.Account.Id
                 from OpportunityContactRole where OpportunityId =: oppId Order By Contact.Name asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Title_Holder__c> getTitleHolders(String oppId) {
        return [Select Id,Name, Type__c, Email__c, Phone__c from Title_Holder__c where Opportunity__c =: oppId Order By CreatedDate desc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Spouse__c> getSpouses(String oppId) {
        return [Select Id,Name, Email__c, Phone__c, Spouse_Role__c from Spouse__c where Opportunity__c =: oppId Order By Name asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Contact> getLenderContacts(String oppId) {
        Opportunity o = [Select id,Lender_Account__c from Opportunity where id =: oppId];
        return [Select Id, Name, Title , Email, Phone, AccountId from Contact where AccountId =: o.Lender_Account__c Order By Name asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Task_Sheet__c> gettasksheets(String oppId) {
        return [Select Id, Name from Task_Sheet__c where Opportunity__c =: oppId Order By Name asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Custom_Task__c> getCustomTasksOpenOpp(String oppId) {
        return [Select Id, Name, Status__c, Open_Opportunity__c, CreatedDate, Owner_Name__c, Due_Date__c from Custom_Task__c where Open_Opportunity__c =: oppId
                Order By CreatedDate asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Custom_Task__c> getCustomTasks(String oppId) {
        return [Select Id, Name,Opportunity__c, CreatedDate, Status__c, Due_Date__c, Owner_Name__c from Custom_Task__c where Opportunity__c =: oppId Order By CreatedDate asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Custom_Task__c> getThirdPartyTasks(String oppId) {
        return [Select Id, Name,Title_Company__c, Status__c,Ordered_Date__c, Received_Date__c, Most_Recent_Comment_Long__c,
                 CreatedDate, Owner.Name, Submission__c  from Custom_Task__c where Submission__c =: oppId Order By CreatedDate asc];
    }

    @AuraEnabled(cacheable=true)
    public static List<Submission_Task__c> getSubmissionTasks(String oppId) {
        return [Select Id, Name, Opportunity__c, Type__c, Status__c, LastModifiedDate  from
                Submission_Task__c where Opportunity__c =: oppId Order By LastModifiedDate asc];
    }


    @AuraEnabled(cacheable=true)
    public static List<SObject> getRecords(String objectName, String fieldsToQuery, String parentid, String lookupfield){
        String query = 'SELECT ' + fieldsToQuery + ' FROM ' + objectName;
        query += ' WHERE ' + lookupfield + '=: parentid';
        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static String getUserTimeZone(){
        TimeZone tz = UserInfo.getTimeZone();
        return(tz.getID());
    }

    @AuraEnabled(cacheable=true)
    public static string getAccessLevel(){
        LOS_Tabs_Access__c accessLevel = LOS_Tabs_Access__c.getInstance();
        if(accessLevel.X1003_Edit__c){
            return 'write';
        }else if(accessLevel.X1003_Read__c){
            return 'read';
        }else{
            return 'no_access';
        }
    }

    @AuraEnabled(cacheable=true)
    public static string getEligbilityTabAccessLevel(){
        LOS_Tabs_Access__c accessLevel = LOS_Tabs_Access__c.getInstance();
        if(accessLevel.Eligibility_Edit__c){
            return 'write';
        } else if(accessLevel.Eligibility_Read__c){
            return 'read';
        }
        return 'no_access';
    }

    @AuraEnabled(cacheable=true)
    public static string getTesterHeaderAccess(){
        LOS_Tabs_Access__c accessLevel = LOS_Tabs_Access__c.getInstance();
        if(accessLevel.Tester_Header_Access__c){
            return 'has_access';
        }
        return 'no_access';
    }

    @AuraEnabled(cacheable=true)
    public static Opportunity getOpportunityDetails(String uuid){
        try {
            Opportunity o = [Select id, Submission_Type__c, mortgage_Submission_UUID__c from Opportunity where mortgage_Submission_UUID__c = : uuid];
            return o;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}