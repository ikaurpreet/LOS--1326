@istest

private class unsubscribeTest{
    
static testMethod void testUnsubscribe() {

// Create a new email and envelope object
   Messaging.InboundEmail email = new Messaging.InboundEmail() ;
   Messaging.InboundEnvelope env    = new Messaging.InboundEnvelope();

// Create a new test Lead and insert it in the Test Method        
   Lead l = new lead(firstName='Rasmus', 
            lastName='Mencke',
            Company='Salesforce', 
            Email='rmencke@salesforce.com', 
            HasOptedOutOfEmail=false,
            Participant_Id__c = 'test_unsubscribe8483',
            Submission_Id__c='unsubscribetest_1',
            SubmissionType__c = 'NoSubmission',
            RecordTypeId='01261000000oQBPAA2');
   insert l;

// Create a new test Contact and insert it in the Test Method  
   Contact c = new Contact(firstName='Rasmus', 
                lastName='Mencke', 
                Email='rmencke@salesforce.com', 
                HasOptedOutOfEmail=false);
   insert c;
   
   // test with subject that matches the unsubscribe statement
   email.subject = 'test unsubscribe test';
   env.fromAddress = 'rmencke@salesforce.com';
   
   // call the class and test it with the data in the testMethod
   unsubscribe unsubscribeObj = new unsubscribe();
   unsubscribeObj.handleInboundEmail(email, env );
                        
   }
 
static testMethod void testUnsubscribe2() {

// Create a new email and envelope object
   Messaging.InboundEmail email = new Messaging.InboundEmail();
   Messaging.InboundEnvelope env = new Messaging.InboundEnvelope();

// Create a new test Lead and insert it in the Test Method        
   Lead l = new lead(firstName='Rasmus', 
            lastName='Mencke',
            Company='Salesforce', 
            Email='rmencke@salesforce.com', 
            RecordTypeId='01261000000oQBPAA2',
            Submission_Id__c ='unsubscribetest_2',
            Participant_Id__c = 'test_unsubscribe8484',
            SubmissionType__c = 'NoSubmission',
            HasOptedOutOfEmail=false);
   insert l;

// Create a new test Contact and insert it in the Test Method    
   Contact c = new Contact(firstName='Rasmus', 
                lastName='Mencke', 
                Email='rmencke@salesforce.com', 
                HasOptedOutOfEmail=false);
   insert c;
   
   // Test with a subject that does Not contain unsubscribe
   email.subject = 'test';
   env.fromAddress = 'rmencke@salesforce.com';

   // call the class and test it with the data in the testMethod
   unsubscribe unsubscribeObj = new unsubscribe();
   unsubscribeObj.handleInboundEmail(email, env );                      
   }    
   
}