trigger OpportunityBeforeUpdate on Opportunity (before update) {
  for(Opportunity opp: trigger.new) {
    Boolean needUpdateMortgages = MortgagesUtilities.isMortgage(opp) && opp.form_completed_date__c != null && !System.isFuture() && !Test.isRunningTest();

    if (!needUpdateMortgages) { continue; }
    
    Opportunity old = trigger.oldMap.get(opp.id);

    if (old.Loan_Officer_coordinator__c != opp.Loan_Officer_coordinator__c || opp.Loan_Coordinator_Id__c == null) {
      if (opp.Loan_Officer_coordinator__c == null) {
        opp.Loan_Coordinator_Id__c = null;
        system.debug('Remove loan coordinator');
      } else {
        User user = [SELECT id, CommunityNickname FROM User WHERE id=: opp.Loan_Officer_coordinator__c LIMIT 1];
        opp.Loan_Coordinator_Id__c = user.CommunityNickname;
        system.debug('Change loan coordinator to ' + user.CommunityNickname);
        MortgagesTeamManager.updateLoanCoordinator(opp.id);
      }
    } else {
      if (old.Loan_Coordinator_Id__c != opp.Loan_Coordinator_Id__c) {
        List<User> users = [SELECT id FROM User WHERE CommunityNickname=: opp.Loan_Coordinator_Id__c LIMIT 1];
        if (users.size() != 0) {
          opp.Loan_Officer_coordinator__c = users[0].id;
        }
      }
    }

    if (old.OwnerId != opp.OwnerId || opp.Loan_Officer_Id__c == null) {
      if (opp.OwnerId == null) {
        opp.Loan_Officer_Id__c = null;
        system.debug('Remove loan officer');
      } else {
        User user = [SELECT id, CommunityNickname FROM User WHERE id=: opp.OwnerId LIMIT 1];
        opp.Loan_Officer_Id__c = user.CommunityNickname;
        system.debug('Change loan officer to ' + user.CommunityNickname);
        MortgagesTeamManager.updateLoanOfficer(opp.id);
      }
    } else {
      if (old.Loan_Officer_Id__c != opp.Loan_Officer_Id__c) {
        List<User> users = [SELECT id FROM User WHERE CommunityNickname=: opp.Loan_Officer_Id__c LIMIT 1];
        if (users.size() != 0) {
          opp.OwnerId = users[0].id;
        }
      }
    }

    if (old.Loan_Processor_New__c != opp.Loan_Processor_New__c || opp.Loan_Processor_Id__c == null) {
      if (opp.Loan_Processor_New__c == null) {
        opp.Loan_Processor_Id__c = null;
        system.debug('Remove loan processor');
      } else {
        User user = [SELECT id, CommunityNickname FROM User WHERE id=: opp.Loan_Processor_New__c LIMIT 1];
        opp.Loan_Processor_Id__c = user.CommunityNickname;
        system.debug('Change loan processor to ' + user.CommunityNickname);
        MortgagesTeamManager.updateLoanProcessor(opp.id);
      }
    } else {
      if (old.Loan_Processor_Id__c != opp.Loan_Processor_Id__c) {
        List<User> users = [SELECT id FROM User WHERE CommunityNickname=: opp.Loan_Processor_Id__c LIMIT 1];
        if (users.size() != 0) {
          opp.Loan_Processor_New__c = users[0].id;
        }
      }
    }

    if (old.Closing_Coordinator__c != opp.Closing_Coordinator__c || opp.Closing_Coordinator_ID__c == null) {
      if (opp.Closing_Coordinator__c == null) {
        opp.Closing_Coordinator_ID__c = null;
        system.debug('Remove loan closer');
      } else {
        User user = [SELECT id, CommunityNickname FROM User WHERE id=: opp.Closing_Coordinator__c LIMIT 1];
        opp.Closing_Coordinator_ID__c = user.CommunityNickname;
        system.debug('Change loan closer to ' + user.CommunityNickname);
        MortgagesTeamManager.updateLoanCloser(opp.id);
      }
    } else {
      if (old.Closing_Coordinator_ID__c != opp.Closing_Coordinator_ID__c) {
        List<User> users = [SELECT id FROM User WHERE CommunityNickname=: opp.Closing_Coordinator_ID__c LIMIT 1];
        if (users.size() != 0) {
          opp.Closing_Coordinator__c = users[0].id;
        }
      }
    }

    if (old.Lock_Expiration_Date__c != opp.Lock_Expiration_Date__c) {
      MR_LockExpirationDateAction.updateLockExpiration(opp.id);
    }
  }
}