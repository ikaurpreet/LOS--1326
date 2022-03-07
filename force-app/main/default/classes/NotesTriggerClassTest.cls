@isTest

private class NotesTriggerClassTest {
    static testMethod void validateNotesTrigger() {
        
        
        Id outboundNotesRecordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Outbound Note' AND sobjectType = 'Notes__c'].Id;
        Id inboundNotesRecordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Inbound Note' AND sobjectType = 'Notes__c'].Id;
        Id personAccountRecordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Person Account'].Id;
        
        datetime myDateTime = datetime.now();
        
        Account acct = new Account(FirstName = 'John', LastName = 'Testing', RecordTypeId = personAccountRecordTypeId);
        
        insert acct;

       
       Notes__c n7 = new Notes__c ();
       Notes__c n = new Notes__c(Account__c = acct.id, RecordTypeId = outboundNotesRecordTypeId, Product__c = 'Refinance', Contact_Type__c = 'Phone');
       Notes__c n1 = new Notes__c(Account__c = acct.id, Product__c = 'Refinance', Contact_Type__c = 'Phone', Moving_Forward__c = 'Yes');
       Notes__c n2 = new Notes__c(Account__c = acct.id, Product__c = 'Refinance', Contact_Type__c = 'Phone', Moving_Forward__c = 'No');
       Notes__c n3 = new Notes__c(Account__c = acct.id, RecordTypeId = inboundNotesRecordTypeId, Product__c = 'Refinance', Contact_Type__c = 'Phone', Description__c = 'blab');
       Notes__c n4 = new Notes__c(Account__c = acct.id, RecordTypeId = inboundNotesRecordTypeId, Product__c = 'Refinance', Contact_Type__c = 'Phone', Note_Reason__c = '3-way call');
       
       
       

       // Insert note
       
       


    }
}