@istest
public class ErrorMessageNotesControllerTest{
    Private Static testmethod void validateNotesController(){    
        
        
        
        Id outboundNotesRecordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Outbound Note' AND sobjectType = 'Notes__c'].Id;
        Id inboundNotesRecordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Inbound Note' AND sobjectType = 'Notes__c'].Id;
        Id personAccountRecordTypeId = [SELECT Id FROM RecordType WHERE Name = 'Person Account'].Id;
        
        Account acct = new Account(FirstName = 'John', LastName = 'Testing', RecordTypeId = personAccountRecordTypeId);
        
        insert acct;
        
        Notes__c note = new Notes__c(RecordTypeId=inboundNotesRecordTypeId, Account__c=acct.id);
        Notes__c note2 = new Notes__c(RecordTypeId=outboundNotesRecordTypeId, Account__c=acct.id );
        
       
        
        
        
        
        

    }
}