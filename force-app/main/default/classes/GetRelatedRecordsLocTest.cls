@isTest
private class GetRelatedRecordsLocTest {
    @TestSetup
    static void makeData(){
        Contact c = new Contact(firstName='Rasmus', lastName='Mencke', Email='rmencke@salesforce.com', HasOptedOutOfEmail=false);
   		insert c;
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(null, null, '13219ec0-3a81-44c5-a300-de14b7d0235g', null, null, null, null);
        Loan__c loan = new Loan__c(submission_uuid__c = 'actual', External_Id__c = 'testId', Opportunity__c = opportunity.Id);
        insert loan;
        Rate__c rate = new Rate__c(Name = 'test' ,Rate__c = 3.0, Term__c = 60, Lender__c = 'test' , Opportunity__c = opportunity.id);
        insert rate;
        Policy_Exception__c pex = new Policy_Exception__c(New_Fee__c = 3, New_Fee_Amount__c = 30, Approval_Status__c = 'Pending Approval', Opportunity__c = opportunity.Id);
        insert pex;
        Closed_Loan__c closedloans = new Closed_Loan__c(Name = 'test' , Offer_Accepted_Date__c = Date.today() , Wire_Amount__c = 100 , Opportunity__c = opportunity.Id);
        insert closedloans;
        Title_Holder__c titleHolder = new Title_Holder__c(Name = 'test' , Opportunity__c = opportunity.Id);
        insert titleHolder;
        Spouse__c spouse = new Spouse__c(Name = 'test' , Opportunity__c = opportunity.Id);
        insert spouse;
        Custom_Task__c customTasks = MortgagesTestFactory.createCustomTasks(opportunity);
        Custom_Task__c spruceTasks = MortgagesTestFactory.createSpruceTasks(opportunity);
        Submission_Task__c submissionTask = MortgagesTestFactory.createTask();
        submissionTask.Opportunity__c = opportunity.Id;
        update submissionTask;
    }
    @isTest
    static void getRecords(){
        Test.startTest();
        Opportunity o = [Select Id, mortgage_Submission_uuid__c from Opportunity limit 1];
        Id oppId = o.Id;
        System.assertEquals(1 , GetRelatedRecordsLOC.getLoans(oppId).size());
        System.assertEquals(1 , GetRelatedRecordsLOC.getRates(oppId).size());
        System.assertEquals(1 , GetRelatedRecordsLOC.getPex(oppId).size());
        System.assertEquals(1 , GetRelatedRecordsLOC.getClosedLoans(oppId).size());
        System.assertEquals(1 , GetRelatedRecordsLOC.getContactRoles(oppId).size());
        System.assertEquals(1 , GetRelatedRecordsLOC.getTitleHolders(oppId).size());
        System.assertEquals(1 , GetRelatedRecordsLOC.getSpouses(oppId).size());
        System.assertEquals(1 , GetRelatedRecordsLOC.getLenderContacts(oppId).size());
        System.assertEquals(0 , GetRelatedRecordsLOC.gettasksheets(oppId).size());
        System.assertEquals(2 , GetRelatedRecordsLOC.getCustomTasksOpenOpp(oppId).size());
        System.assertEquals(2 , GetRelatedRecordsLOC.getCustomTasks(oppId).size());
        System.assertEquals(0 , GetRelatedRecordsLOC.getThirdPartyTasks(oppId).size());
        System.assertEquals(1 , GetRelatedRecordsLOC.getSubmissionTasks(oppId).size());
        System.assertEquals(
            1, 
            GetRelatedRecordsLOC.getRecords(
                'Loan__c', 
                'submission_uuid__c, External_Id__c, Opportunity__c',
                oppId,
                'Opportunity__c'
            ).size()
        );
        GetRelatedRecordsLOC.getUserTimeZone();
        System.assertEquals(oppId, GetRelatedRecordsLOC.getOpportunityDetails(o.mortgage_Submission_uuid__c).Id);
        GetRelatedRecordsLOC.getAccessLevel();
        GetRelatedRecordsLOC.getEligbilityTabAccessLevel();
        GetRelatedRecordsLOC.getTesterHeaderAccess();
        Test.stopTest();
    }

}