public class CaseTriggerHandler {
  public static void calculateBusinessHoursAges(
    Boolean isInsert,
    List<Case> newCases,
    Map<id, Case> oldCaseMap
  ) {
    if (isInsert) {
      for (Case updatedCase : newCases) {
        updatedCase.Last_Status_Change__c = System.now();
        updatedCase.Time_With_Customer__c = 0;
        updatedCase.Time_With_Support__c = 0;
      }
    } else {
      //Get the stop statuses
      Set<String> stopStatusSet = new Set<String>();
      for (Stop_Status__c stopStatus : [SELECT Name FROM Stop_Status__c]) {
        stopStatusSet.add(stopStatus.Name);
      }

      //Get the default business hours (we might need it)
      BusinessHours defaultHours = [
        SELECT Id
        FROM BusinessHours
        WHERE IsDefault = TRUE
      ];

      //Get the closed statuses (because at the point of this trigger Case.IsClosed won't be set yet)
      Set<String> closedStatusSet = new Set<String>();
      for (CaseStatus status : [
        SELECT MasterLabel
        FROM CaseStatus
        WHERE IsClosed = TRUE
      ]) {
        closedStatusSet.add(status.MasterLabel);
      }

      //For any case where the status is changed, recalc the business hours in the buckets
      for (Case updatedCase : newCases) {
        Case oldCase = oldCaseMap.get(updatedCase.Id);

        if (
          oldCase.Status != updatedCase.Status &&
          updatedCase.Last_Status_Change__c != null
        ) {
          //OK, the status has changed
          if (!oldCase.IsClosed) {
            //We only update the buckets for open cases

            //On the off-chance that the business hours on the case are null, use the default ones instead
            Id hoursToUse = updatedCase.BusinessHoursId != null
              ? updatedCase.BusinessHoursId
              : defaultHours.Id;

            //The diff method comes back in milliseconds, so we divide by 3600000 to get hours.
            Double timeSinceLastStatus =
              BusinessHours.diff(
                hoursToUse,
                updatedCase.Last_Status_Change__c,
                System.now()
              ) / 3600000.0;
            System.debug(timeSinceLastStatus);

            //We decide which bucket to add it to based on whether it was in a stop status before
            if (stopStatusSet.contains(oldCase.Status)) {
              updatedCase.Time_With_Customer__c += timeSinceLastStatus;
            } else {
              updatedCase.Time_With_Support__c += timeSinceLastStatus;
            }

            if (closedStatusSet.contains(updatedCase.Status)) {
              updatedCase.Case_Age_In_Business_Hours__c =
                updatedCase.Time_With_Customer__c +
                updatedCase.Time_With_Support__c;
            }
          }

          updatedCase.Last_Status_Change__c = System.now();
        }
      }
    }
  }

  public static void caseRemoveContactWithAccount(
    Map<id, Case> newCaseMap,
    Map<id, Case> oldCaseMap
  ) {
    for (Case a : newCaseMap.values()) {
      Case oldCase = oldCaseMap.get(a.Id);
      if (a.AccountId != oldCase.AccountId && a.AccountId == null) {
        a.ContactId = null;
        a.Opportunity__c = null;
      }
    }
  }
}