@isTest
private class MortgagesDocumentUploadControllerTest {
    @isTest
    static void getDocumentCategories() {
        Set<String> expectedCategories = MortgagesDocsApiClient.SF_TO_API_DOCUMENT_CATEGORY.keySet();
        List<Map<String, String>> documentCategories = MortgagesDocumentUploadController.getDocumentCategories();

        Set<String> categoryNames = new Set<String>();
        for(Map<String,String> category: documentCategories) {
            categoryNames.add(category.get('value'));
        }
        categoryNames.retainAll(expectedCategories);
        
        System.assertEquals(expectedCategories, categoryNames);
    }
    
    @isTest
    static void createDocument() {
        Opportunity opportunity = MortgagesTestFactory.createOpportunity('test');
        String documentId = 'doc1';
        String category = 'Income';
        String fileName = 'file';
        String expirationDate = null;
        Map<String, String> metadata = new Map<String, String> { 'key' => 'value' };
        Boolean approve = false;
        String submissionUuid = opportunity.mortgage_Submission_UUID__c;
        String reference = submissionUuid + ':' + documentId;
    
        HttpClientMockTest httpClientMock = mockSalesforceCreateDocument(submissionUuid, reference, metadata, MortgagesDocsApiClient.SF_TO_API_DOCUMENT_CATEGORY.get(category), approve, expirationDate);
        Test.setMock(HttpCalloutMock.class, httpClientMock);
        Test.startTest();
    
        String document = MortgagesDocumentUploadController.createDocument(opportunity.Id, documentId, category, fileName, metadata, approve, expirationDate);
        
        System.assert(document != null);
        Test.stopTest();
    }
    
    static HttpClientMockTest mockSalesforceCreateDocument(String submissionUuid, String reference, Map<String, String> metadata, String category, Boolean approve, String expirationDate) {
        String variables = JSON.serialize(new Map<String, Object> { 'submissionUuid' => submissionUuid, 'name' => 'file', 'reference' => reference, 'metadata' => metadata, 'category' => category, 'approve' => approve, 'expiresAt' => expirationDate });
        String expectedRequest = JSON.serialize(
            new Map<String, Object> {
                'query' => MortgagesDocsApiClient.MUTATION_SALESFORCE_CREATE_DOCUMENT,
                'operationName' => 'salesforceCreateDocument',
                'variables' => variables
            });
        
        String document = JSON.serialize(
            new Map<String, String> { 'uuid' => 'doc_uuid', 'status' => 'created', 'ownerUuid' => 'owner_uuid', 'reference' => reference });
        String mockedResponse = '{"data":{"salesforceCreateDocument":' + document + '}}';
        
        return new HttpClientMockTest()
            .withEndpointExchange('graphqlUrl', expectedRequest, mockedResponse);
    }
}