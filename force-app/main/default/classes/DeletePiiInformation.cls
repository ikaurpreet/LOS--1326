@RestResource(urlMapping='/deletePiiInformation/*')
global class DeletePiiInformation {
  @HttpPost
  global static void deletePiiInformationFor(String userUuid) {
    try {
        Account acc = [SELECT id, user_uuid__c, Person_Email__c, FirstName, LastName, Phone, PersonEmail FROM Account where user_uuid__c =: userUuid LIMIT 1];
        acc.FirstName = 'DELETED';
        acc.LastName = 'DELETED';
        acc.Phone = 'DELETED';
        acc.Person_Email__c = 'deleted@domain.com';
        acc.PersonEmail = 'deleted@domain.com';
        update acc;

    } catch (QueryException e) {
        system.debug('Account does not exist for userUuid '+ userUuid);
    }

    try {
        Opportunity[] opps = [SELECT id, user_id__c, Borrower_Name__c FROM Opportunity where user_id__c =: userUuid];
        for(Opportunity opp: opps) {
            opp.Borrower_Name__c = 'DELETED DELETED';
            opp.Mortgage_Property_Address__c = 'DELETED';
        update opp;
        }
    } catch (QueryException e) {
        system.debug('Opportunity does not exist for userUuid '+ userUuid);
    }
  }
}