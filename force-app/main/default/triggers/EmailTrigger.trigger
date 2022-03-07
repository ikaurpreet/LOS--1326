trigger EmailTrigger on EmailMessage (before insert, before update) {
    if(trigger.isInsert && !EmailTriggerHandler.firstcall){
        EmailTriggerHandler.firstcall = true;
        try{
            EmailTriggerHandler.findOpportunity(trigger.new);
        } catch(Exception e){
            System.debug(e);
        }
    }
}