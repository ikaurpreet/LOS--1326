trigger CaseRemoveContactWithAccount on Case (before update) {
    for(Case a: Trigger.New) {
        Case oldCase = trigger.oldMap.get(a.Id);
        
        if (a.AccountId != oldCase.AccountId && a.AccountId == null){
            a.ContactId = null;
            a.Opportunity__c = null;
        }
    }
}