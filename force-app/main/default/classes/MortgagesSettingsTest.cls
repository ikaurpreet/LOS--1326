@isTest
private with sharing class MortgagesSettingsTest {
    @isTest
    private static void stage(){
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        MortgagesStageSettings__c settings = new MortgagesStageSettings__c();
        settings.Client_Id__c = 'Client_Id__c';
        settings.Client_Secret__c = 'Client_Secret__c';
        settings.GraphQL_Url__c = 'GraphQL_Url__c';
        settings.Token_Url__c = 'Token_Url__c';
        insert settings;
        Test.startTest();
        MortgagesSettings.getInstance(MortgagesConstants.Env.TEST);
        Test.stopTest();
    }

    @isTest
    private static void develop() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        MortgagesDevelopSettings__c settings = new MortgagesDevelopSettings__c();
        settings.Client_Id__c = 'Client_Id__c';
        settings.Client_Secret__c = 'Client_Secret__c';
        settings.GraphQL_Url__c = 'GraphQL_Url__c';
        settings.Token_Url__c = 'Token_Url__c';
        insert settings;
        Test.startTest();
        MortgagesSettings.getInstance(MortgagesConstants.Env.TEST);
        Test.stopTest();
    }

    @isTest
    private static void uat() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        MortgagesUATSettings__c settings = new MortgagesUATSettings__c();
        settings.Client_Id__c = 'Client_Id__c';
        settings.Client_Secret__c = 'Client_Secret__c';
        settings.GraphQL_Url__c = 'GraphQL_Url__c';
        settings.Token_Url__c = 'Token_Url__c';
        insert settings;
        Test.startTest();
        MortgagesSettings.getInstance(MortgagesConstants.Env.TEST);
        Test.stopTest();
    }

    @isTest
    private static void local() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        MortgagesLocalSettings__c settings = new MortgagesLocalSettings__c();
        settings.Client_Id__c = 'Client_Id__c';
        settings.Client_Secret__c = 'Client_Secret__c';
        settings.GraphQL_Url__c = 'GraphQL_Url__c';
        settings.Token_Url__c = 'Token_Url__c';
        insert settings;
        Test.startTest();
        MortgagesSettings.getInstance(MortgagesConstants.Env.TEST);
        Test.stopTest();
    }

    @isTest
    private static void production() {
        MortgagesTestFactory.createClientCredentialsAndLocalSettings();
        try {
            Test.startTest();
            MortgagesSettings.getInstance(MortgagesConstants.Env.PRODUCTION);
            Test.stopTest();
        } catch(Exception ex) {
            System.assertEquals('Mortgages settings not found for your profile', ex.getMessage());
        }
    }
}