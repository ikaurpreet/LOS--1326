public with sharing class MortgagesActionsController {

    @AuraEnabled
    public static string getSubmissioName(String recordId) {
        Opportunity opp = [SELECT name FROM Opportunity WHERE id=:recordId LIMIT 1];
        return opp.name;
    }
}