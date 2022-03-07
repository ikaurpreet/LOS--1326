trigger CaseTrigger on Case(before insert, before update) {
  CaseTriggerHandler.calculateBusinessHoursAges(
    Trigger.isInsert,
    Trigger.new,
    Trigger.oldMap
  );
  if (Trigger.isUpdate) {
    CaseTriggerHandler.caseRemoveContactWithAccount(
      Trigger.newMap,
      Trigger.oldMap
    );
  }
}