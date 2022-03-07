public with sharing class MortgagesDocumentUploadController {
    static final String appSlug = 'salesforce-documents';
    static Map<String, String> CATEGORY_TO_LENDER_TAG = new Map<String, String> {
        'Conditional Loan Approval (CLA)' => 'Lender - CLA PDF',
        'Clear to Close (CTC)' => 'Lender - CTC PDF',
        'Prelim Title CD' => 'CD - Preliminary',
        'Prelim Lender CD' => 'CD - Preliminary',
        'Final Lender CD' => 'CD - Final',
        'AUS Findings' => 'AUS'
    };

    static final Map<MortgagesConstants.Env, MortgagesDocsApiClient> docsApiClients = new Map<MortgagesConstants.Env, MortgagesDocsApiClient>();
    static MortgagesDocsApiClient getDocsApiClient(MortgagesConstants.Env env) {
        MortgagesDocsApiClient docsApiClient = docsApiClients.get(env);
        if (docsApiClient != null) {
            return docsApiClient;
        }
        MortgagesDocsApiClient apiClient = MortgagesApiClientFactory.createUserFactory(env.name()).createDocsApiClient();
        docsApiClients.put(env, apiClient);
        return apiClient;
    }

    @AuraEnabled
    public static List<Map<String,String>> getDocumentCategories() {
        Schema.DescribeFieldResult fieldResult = Document__c.Category__c.getDescribe();
        List<Schema.PicklistEntry> ple = fieldResult.getPicklistValues();
        List<Map<String,String>> options = new List<Map<String,String>>();

        for( Schema.PicklistEntry f : ple) {
            options.add(new Map<String, String>{'label' => f.getLabel(), 'value' => f.getValue()});
        }

        return options;
    }

    class ExpirationDateException extends Exception {}

    @AuraEnabled
    public static String createDocument(String opportunityId, String documentId, String category, String filename, Map<String, String> metadata, Boolean approve, String expirationDate) {
        Opportunity opp = [SELECT Id, mortgage_Submission_UUID__c, Submission_ID__c FROM Opportunity WHERE Id =: opportunityId];
        MortgagesConstants.ENV env = MortgagesUtilities.getEnvironment(opp);
        MortgagesDocsApiClient client = getDocsApiClient(env);

        if (approve && expirationDate == null && MortgagesSubmissionDocuments.expirableCategories.contains(category)) { 
            throw new ExpirationDateException('Expiration date required for document accept'); 
        }
        String submissionUuid = opp.mortgage_Submission_UUID__c;
        String reference = submissionUuid + ':' + documentId;

        MortgagesDocsApiClient.DocumentType documentType = client.salesforceCreateDocument(submissionUuid, filename, category, reference, metadata, approve, expirationDate);
        Document__c salesforceDoc = createSalesforceDocument(submissionUuid, documentType, category, filename, expirationDate, getPrefix(env));

        return salesforceDoc.Id;
    }

    private static Document__c createSalesforceDocument(String submissionUuid, MortgagesDocsApiClient.DocumentType documentType, String category, String fileName, String expirationDate, String envPrefix) {
        List<Document__c> documents = [SELECT id, Owner_Uuid__c, name, Category__c, Submission_UUID__c, reference__c, source__c, External_ID__c, name__c, filename__c FROM Document__c WHERE External_ID__c =: envPrefix + documentType.uuid];
        if (documents.size() > 0) {
            return documents[0];
        }
        Document__c doc = new Document__c();
        doc.name = documentType.uuid;
        doc.Owner_Uuid__c = documentType.ownerUuid;
        doc.Category__c = category;
        doc.Submission_UUID__c = submissionUuid;
        doc.reference__c = documentType.reference;
        doc.source__c = 'manual';
        doc.status__c = documentType.status;
        doc.External_ID__c = envPrefix + documentType.uuid;
        doc.name__c = fileName;
        doc.filename__c = fileName;
        if (expirationDate != null) {
            doc.Expiration_Date__c = Date.valueOf(expirationDate);
        }
        

        String lenderTag = CATEGORY_TO_LENDER_TAG.get(category);

        if (lenderTag != null) {
            doc.LenderTags__c = lenderTag;
        }

        insert doc;
        FolderManager.assignFolderToDocument(doc);
        return doc;
    }

    private static String getPrefix(MortgagesConstants.ENV env) {
        String envName = env.name().toLowerCase();
        if (envName == 'production') {
            return 'mort_';
        } else {
            return '';
        }
    }
}