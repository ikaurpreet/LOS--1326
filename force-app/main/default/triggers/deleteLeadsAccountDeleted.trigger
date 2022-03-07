trigger deleteLeadsAccountDeleted on Account (before delete) {

    //To store parent ids
    list<id> AccountIds=new list<id>();
    for(Account accountVar:trigger.old)
    {
        AccountIds.add(accountVar.id);
    }  
    //Collecting all child records related to Parent records
    list<Lead> listOfLeads=[select id from Lead where Has_Account__c in :AccountIds];
    system.debug('listOfLeads'+listOfLeads);
    //deleting child records
    delete listOfLeads;
}