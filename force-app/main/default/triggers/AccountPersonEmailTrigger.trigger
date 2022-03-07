trigger AccountPersonEmailTrigger on Account (before insert) {
    for(Account acc: Trigger.new) {
        acc.Person_Email__c = acc.PersonEmail;
    }
}