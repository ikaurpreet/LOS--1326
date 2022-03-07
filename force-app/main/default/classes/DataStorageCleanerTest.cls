@isTest
public with sharing class DataStorageCleanerTest {
    @isTest
    public static void cleanOpportunities() {
        DataStorageCleaner.cleanOpportunities(1);
    }

    @isTest
    public static void cleanContacts() {
        DataStorageCleaner.cleanContacts(1);
    }

    @isTest
    public static void cleanAccounts() {
        DataStorageCleaner.cleanAccounts(1);
    }

    @isTest
    public static void cleanLeads() {
        DataStorageCleaner.cleanLeads(1);
    }

    @isTest
    public static void cleanDocuments() {
        DataStorageCleaner.cleanDocuments(1);
    }

    @isTest
    public static void cleanCases() {
        DataStorageCleaner.cleanCases(1);
    }

    @isTest
    public static void cleanCustomTasks() {
        DataStorageCleaner.cleanCustomTasks(1);
    }

    @isTest
    public static void cleanOutboundTasks() {
        DataStorageCleaner.cleanOutboundTasks(1);
    }

    @isTest
    public static void clearPreviewDocuments() {
        DataStorageCleaner.clearPreviewDocuments();
    }
}