trigger myNotesTrigger on Notes__c (before insert) {
  
  Map<ID,Schema.RecordTypeInfo> rt_Map = Notes__c.sObjectType.getDescribe().getRecordTypeInfosById();
    
  datetime myDateTime = datetime.now();
  
  for(Notes__c n: Trigger.new){
  
    
    if(rt_map.get(n.recordTypeID).getName().containsIgnoreCase('Outbound Note') && n.Moving_Forward__c == null)  
           n.Moving_Forward__c.addError('Please indicate whether user is moving forward'); // prevent update

            
     
        if(n.User_Insight__c == null && n.Moving_Forward__c == 'No') 
           n.User_Insight__c.addError('Please enter a User Insight'); // prevent update


            

        if(n.Next_Follow_Up_Date_Time__c == null && n.Completed__c == false && n.Moving_Forward__c == 'Yes') 
           n.Next_Follow_Up_Date_Time__c.addError('Please either enter a Next Follow Up Time or Complete the user');
            
        
        if(n.Note_Reason__c == null && rt_map.get(n.recordTypeID).getName().containsIgnoreCase('Inbound Note')) 
           n.Note_Reason__c.addError('Please include a Note Reason');

     
        
        if(n.Description__c == null && rt_map.get(n.recordTypeID).getName().containsIgnoreCase('Inbound Note')) 
           n.Description__c.addError('Please include a Description of the note');
           
           
        if(n.Next_Follow_Up_Date_Time__c <= myDateTime) 
           n.Next_Follow_Up_Date_Time__c.addError('Please put a future date for the Next Follow Up');

    

     }
     }