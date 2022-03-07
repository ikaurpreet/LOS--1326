@isTest
public with sharing class EmailTriggerHandlerTest {
    @TestSetup
    static void makeData() {
        Opportunity opp = MortgagesTestFactory.createOpportunity();
        opp.External_ID__c = '123456789';
        opp.Encompass_Loan_Number__c = '3423425';
        opp.Escrow__c = '93456123';
        opp.Settlement_File_Number__c = '6749856';
        opp.mortgage_Property_Address__c = '123 Main st.';
        update opp;
    }

    @isTest
    static void testEmailTriggerHandlerWholeExternalId() {
        Test.startTest();
        Case caseRecord = new Case();
        insert caseRecord;
        EmailMessage incomingMail = new EmailMessage();
        incomingMail.fromaddress = 'test@test.com';
        incomingMail.toAddress = 'test2@test.com';
        incomingMail.subject = 'Loan Number: 123456789';
        incomingMail.TextBody = 'Test Test Test';
        incomingMail.parentid = caseRecord.id;
        Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
        Id[] fixedSearchResults = new Id[1];
        fixedSearchResults[0] = o.Id;
        Test.setFixedSearchResults(fixedSearchResults);
        insert incomingMail;
        List<EmailMessage> listEmails = new List<EmailMessage>();
        listEmails.add(incomingMail);
        EmailTriggerHandler.findOpportunity(listEmails);
        Case cs = [SELECT id, Opportunity__c FROM Case LIMIT 1];
        System.assertEquals(o.id, cs.Opportunity__c, 'Failed exact loan number match');
        Test.stopTest();
    }

    // Commented out because we don't support loan numbers ending in a mask for now.  Uncomment if we add this functionality
    // @isTest
    // static void testEmailTriggerHandler2() {
    //     Test.startTest();
    //     Case caseRecord = new Case();
    //     insert caseRecord;
    //     EmailMessage incomingMail = new EmailMessage();
    //     incomingMail.fromaddress = 'test@test.com';
    //     incomingMail.toAddress = 'test2@test.com';
    //     incomingMail.subject = 'Loan Number: 1234XXXX';
    //     incomingMail.TextBody = 'Test Test Test';
    //     incomingMail.parentid = caseRecord.id;
    //     Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
    //     Id[] fixedSearchResults = new Id[1];
    //     fixedSearchResults[0] = o.Id;
    //     Test.setFixedSearchResults(fixedSearchResults);
    //     insert incomingMail;
    //     List<EmailMessage> listEmails = new List<EmailMessage>();
    //     listEmails.add(incomingMail);
    //     EmailTriggerHandler.findOpportunity(listEmails);
    //     Case cs = [SELECT id, Opportunity__c FROM Case LIMIT 1];
    //     System.assertEquals(o.id, cs.Opportunity__c, 'Failed begins with match');
    //     Test.stopTest();
    // }

    @isTest
    static void testEmailTriggerHandlerBeginsWithMask() {
        Test.startTest();
        Case caseRecord = new Case();
        insert caseRecord;
        EmailMessage incomingMail = new EmailMessage();
        incomingMail.fromaddress = 'test@test.com';
        incomingMail.toAddress = 'test2@test.com';
        incomingMail.subject = 'Loan Number: XXXX56789';
        incomingMail.TextBody = 'Test Test Test';
        incomingMail.parentid = caseRecord.id;
        Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
        insert incomingMail;
        List<EmailMessage> listEmails = new List<EmailMessage>();
        listEmails.add(incomingMail);
        EmailTriggerHandler.findOpportunity(listEmails);
        Case cs = [SELECT id, Opportunity__c FROM Case LIMIT 1];
        System.assertEquals(o.id, cs.Opportunity__c, 'Failed begins with mask match');
        Test.stopTest();
    }

    @isTest
    static void testEmailTriggerHandlerLoanEndingIn() {
        Test.startTest();
        Case caseRecord = new Case();
        insert caseRecord;
        EmailMessage incomingMail = new EmailMessage();
        incomingMail.fromaddress = 'test@test.com';
        incomingMail.toAddress = 'test2@test.com';
        incomingMail.subject = 'Blah blah loan ending in 6789';
        incomingMail.TextBody = 'Test Test Test';
        incomingMail.parentid = caseRecord.id;
        Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
        insert incomingMail;
        List<EmailMessage> listEmails = new List<EmailMessage>();
        listEmails.add(incomingMail);
        EmailTriggerHandler.findOpportunity(listEmails);
        Case cs = [SELECT id, Opportunity__c FROM Case LIMIT 1];
        System.assertEquals(o.id, cs.Opportunity__c, 'Failed loan ending in match');
        Test.stopTest();
    }

    @isTest
    static void testEmailTriggerHandlerAddress() {
        Test.startTest();
        Case caseRecord = new Case();
        insert caseRecord;
        EmailMessage incomingMail = new EmailMessage();
        incomingMail.fromaddress = 'test@test.com';
        incomingMail.toAddress = 'test2@test.com';
        incomingMail.subject = 'Address: 123 Main st. San Francisco';
        incomingMail.TextBody = 'Test Test Test';
        incomingMail.parentid = caseRecord.id;
        Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
        insert incomingMail;
        List<EmailMessage> listEmails = new List<EmailMessage>();
        listEmails.add(incomingMail);
        EmailTriggerHandler.findOpportunity(listEmails);
        Case cs = [SELECT id, Opportunity__c FROM Case LIMIT 1];
        System.assertEquals(o.id, cs.Opportunity__c, 'Failed address match');
        Test.stopTest();
    }

    @isTest
    static void testEmailTriggerHandlerWholeEncompassLoanNumber() {
        Test.startTest();
        Case caseRecord = new Case();
        insert caseRecord;
        EmailMessage incomingMail = new EmailMessage();
        incomingMail.fromaddress = 'test@test.com';
        incomingMail.toAddress = 'test2@test.com';
        incomingMail.subject = 'Loan Number: 3423425';
        incomingMail.TextBody = 'Test Test Test';
        incomingMail.parentid = caseRecord.id;
        Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
        insert incomingMail;
        List<EmailMessage> listEmails = new List<EmailMessage>();
        listEmails.add(incomingMail);
        EmailTriggerHandler.findOpportunity(listEmails);
        Case cs = [SELECT id, Opportunity__c FROM Case LIMIT 1];
        System.assertEquals(o.id, cs.Opportunity__c, 'Failed match Encompass loan number');
        Test.stopTest();
    }

    @isTest
    static void testEmailTriggerHandlerEscrowNumber() {
        Test.startTest();
        Case caseRecord = new Case();
        insert caseRecord;
        EmailMessage incomingMail = new EmailMessage();
        incomingMail.fromaddress = 'test@test.com';
        incomingMail.toAddress = 'test2@test.com';
        incomingMail.subject = 'Loan Number: 93456123';
        incomingMail.TextBody = 'Test Test Test';
        incomingMail.parentid = caseRecord.id;
        Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
        insert incomingMail;
        List<EmailMessage> listEmails = new List<EmailMessage>();
        listEmails.add(incomingMail);
        EmailTriggerHandler.findOpportunity(listEmails);
        Case cs = [SELECT id, Opportunity__c FROM Case LIMIT 1];
        System.assertEquals(o.id, cs.Opportunity__c, 'Failed match Escrow number');
        Test.stopTest();
    }

    @isTest
    static void testEmailTriggerHandlerSettlementFileNumber() {
        Test.startTest();
        Case caseRecord = new Case();
        insert caseRecord;
        EmailMessage incomingMail = new EmailMessage();
        incomingMail.fromaddress = 'test@test.com';
        incomingMail.toAddress = 'test2@test.com';
        incomingMail.subject = 'Loan Number: 6749856';
        incomingMail.TextBody = 'Test Test Test';
        incomingMail.parentid = caseRecord.id;
        Opportunity o = [SELECT Id FROM Opportunity LIMIT 1];
        insert incomingMail;
        List<EmailMessage> listEmails = new List<EmailMessage>();
        listEmails.add(incomingMail);
        EmailTriggerHandler.findOpportunity(listEmails);
        Case cs = [SELECT id, Opportunity__c FROM Case LIMIT 1];
        System.assertEquals(o.id, cs.Opportunity__c, 'Failed match Settlement File Number');
        Test.stopTest();
    }
}