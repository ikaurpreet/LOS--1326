@IsTest
public class DeletePiiInformationTest{
    @isTest static void deletePiiInformationAccount(){
        String userUuid = 'testDelitingPii';
        Account user = new Account(FirstName='Test', LastName='Testerson', Person_Email__c='test555@gmail.com', user_uuid__c=userUuid, Phone='000000000', PersonEmail='test555@gmail.com');
        insert user;

        DeletePiiInformation.deletePiiInformationFor(userUuid);

        Account acc = [SELECT id, user_id__c, Person_Email__c, FirstName, LastName, Phone, PersonEmail FROM Account where user_uuid__c =: userUuid LIMIT 1];

        System.assertEquals(acc.Person_Email__c, 'deleted@domain.com');
        System.assertEquals(acc.PersonEmail, 'deleted@domain.com');
        System.assertEquals(acc.FirstName, 'DELETED');
        System.assertEquals(acc.LastName, 'DELETED');
        System.assertEquals(acc.Phone, 'DELETED');
    }

    @isTest static void deletePiiInformationOpportunity(){
        Opportunity opportunity = MortgagesTestFactory.createOpportunity();
        String userUuid = opportunity.user_id__c;

        DeletePiiInformation.deletePiiInformationFor(userUuid);

        Opportunity opp = [SELECT id, user_id__c, Borrower_Name__c FROM Opportunity where user_id__c =: userUuid LIMIT 1];

        System.assertEquals(opp.Borrower_Name__c, 'DELETED DELETED');
    }
}