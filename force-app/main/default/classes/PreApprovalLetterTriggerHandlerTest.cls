@isTest
private class PreApprovalLetterTriggerHandlerTest {
    @isTest
    static void testPreapprovalAttachToLead(){
    	Lead l = new Lead(User_Id__c = '000001', Cosigner_or_Borrower_ID__c = 'borrower', participant_id__c = 'cosigner', Email = 'cosigner@test.com', LastName = 'Cosigner', User_Role__c='cosigner', SubmissionType__c='In_School', Submission_Id__c = '111222', Has_Account__c=NULL, Status = 'PQRR', mortgage_Submission_UUID__c = '111222');
        insert l;
        Pre_approval_Letter__c  p = new Pre_approval_Letter__c(Submission_uuid__c = '111222');
        insert p;
    }
    
    @isTest 
    static void testPreapprovalAttachToOpp(){
        Pre_approval_Letter__c  p = new Pre_approval_Letter__c(Submission_uuid__c = MortgagesTestFactory.SUBMISSION_UUID);
        insert p;
        String env = 'test';
        String submission_status = 'initial_processing';
        String stageName = 'Initial Processing';
        String taskStatus = 'completed';
        String taskType = 'credit';
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(env, null, MortgagesTestFactory.SUBMISSION_UUID, submission_status, stageName, null, null);
        
    }

}