public with sharing class MortgagesDocsApiClient extends MortgagesApplicationClient {
    public MortgagesDocsApiClient(MortgagesConstants.Env env) { super(env); }
    public MortgagesDocsApiClient(MortgagesGraphQLClient client) { super(client); }
    public MortgagesDocsApiClient(String graphqlUrl, String accessToken) { super(graphqlUrl, accessToken); }

    public class Document {
        public String uuid  { get; set; }
    }

    public class DocumentNotFoundException extends Exception {}

    public String generateDownloadUrl(String documentUuid) {
        return this.issueAuthorization(documentUuid, 'get');
    }

    public static final Map<String, String> SF_TO_API_DOCUMENT_CATEGORY = new Map<String, String> {	
        'Income' => 'income',
        'Assets' => 'assets',
        'Credit' => 'credit',
        'Legal' => 'legal',
        'Misc' => 'misc',
        'Property' => 'property',
        'Appraisal' => 'appraisal',
        // 'CLA' => 'cla',
        'Appraisal Invoice' => 'appraisalInvoice',
        'Policy Exception' => 'policyException',
        'Tax' => 'tax',
        'Title' => 'title',
        'HOI' => 'hoi',
        'Payoff' => 'payoff',
        'Lock Form' => 'lockForm',
        'Pre Approval Letter' => 'preApprovalLetter',
        'Econsent' => 'econsent',
        'HOA' => 'hoa',
        'Review' => 'review',
        'Conditional Loan Approval (CLA)' => 'conditionalLoanApproval',
        'Clear to Close (CTC)' => 'clearToClose',
        'Prelim Title CD' => 'prelimTitleCd',
        'Prelim Lender CD' => 'prelimLenderCd',
        'Final Lender CD' => 'finalLenderCd',
        'AUS Findings' => 'ausFindings' 
    };

    public class DocumentType {
        public String uuid { get; set; }
        public String status { get; set; }
        public String ownerUuid { get; set; }
        public String reference { get; set; }
        public Map<String, String> metadata { get; set;}

        public DocumentType(String uuid, String status, String ownerUuid, String reference, Map<String, String> metadata) {
        this.uuid = uuid;
        this.status = status;
        this.ownerUuid = ownerUuid;
        this.reference = reference;
        this.metadata = metadata;
        }
    }

    public Document searchDocument(String reference) {
MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'systemSearchDocuments';
        query.variables = new Map<String, Object> { 'reference' => reference };
        query.body = 'query systemSearchDocuments($reference: [String]) {' +
            'systemSearchDocuments(reference: $reference) {' +
                'uuid,' +
            '}' +
        '}';
        
        MortgagesGraphQLClient.Results results = client.query(query, List<Document>.class);
        
        processErrors(results);   
        
        List<Document> data = (List<Document>)results.data;

        if (data.size() == 0) {
            throw new DocumentNotFoundException('Document not found');
        }
        
        return data[0];
    }

    public String issueAuthorization(String documentUuid, String type) {
        MortgagesGraphQLClient.Query mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'systemIssueAuthorization';
        mutation.variables = new Map<String, Object> { 'documentUuid' => documentUuid, 'type' => type };
        mutation.body = 'mutation systemIssueAuthorization($documentUuid: ID!, $type: String!) {' +
            'systemIssueAuthorization(documentUuid: $documentUuid, type: $type) {' +
                'url,' +
            '}' +
        '}';
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, Map<String, String>.class);

        processErrors(results);   
        
        Map<String, String> data = (Map<String, String>)results.data;
        
        return data.get('url');
    }

    public String uploadDocumentToGdrive(String documentUuid, String path) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'uploadDocumentToGDrive';
        mutation.variables = new Map<String, Object> { 'uuid' => documentUuid, 'path' => path };
        mutation.body = 'mutation uploadDocumentToGDrive($uuid: ID!, $path: String!) {' +
                        + 'uploadDocumentToGDrive(uuid: $uuid, path: $path)'
                      + '}';
          
        MortgagesGraphQLClient.Results results = client.mutation(mutation, String.class);
        processErrors(results);
        
        return (String)results.data;
    }

    public static final String MUTATION_BULK_COPY_DOCUMENT_TO_GDRIVE =  new stringBuilder(new List<String> { 
        'mutation bulkCopyDocumentToGDrive($uuids: [ID]!, $path: String!) {',
            'bulkCopyDocumentToGDrive(uuids: $uuids, path: $path)',
        '}'
    }).toString();

    public String bulkCopyDocumentToGdrive(List<String> documentUuids, String path) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'bulkCopyDocumentToGDrive';
        mutation.variables = new Map<String, Object> { 'uuids' => documentUuids, 'path' => path };
        StringBuilder queryBuilder = new stringBuilder(new List<String> { 
            'mutation bulkCopyDocumentToGDrive($uuids: [ID]!, $path: String!) {',
                'bulkCopyDocumentToGDrive(uuids: $uuids, path: $path)',
            '}'
        });
        
        mutation.body = MUTATION_BULK_COPY_DOCUMENT_TO_GDRIVE;
        MortgagesGraphQLClient.Results results = client.mutation(mutation, String.class);
        processErrors(results);
        
        return (String)results.data;
    }

    public String copyDocumentToGdrive(String documentUuid, String path) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'copyDocumentToGDrive';
        mutation.variables = new Map<String, Object> { 'uuid' => documentUuid, 'path' => path };
        mutation.body = 'mutation copyDocumentToGDrive($uuid: ID!, $path: String!) {' +
                        + 'copyDocumentToGDrive(uuid: $uuid, path: $path)'
                      + '}';
          
        MortgagesGraphQLClient.Results results = client.mutation(mutation, String.class);
        processErrors(results);
        
        return (String)results.data;
    }

    public static final String MUTATION_SALESFORCE_CREATE_DOCUMENT =
      'mutation salesforceCreateDocument($submissionUuid: String, $reference: String, $name: String, $category: DocumentCategoryEnum, $metadata: JSON, $approve: Boolean, $expiresAt: ISO8601DateTime) {'
          + 'salesforceCreateDocument(submissionUuid: $submissionUuid reference: $reference, name: $name, category: $category, metadata: $metadata, approve: $approve, expiresAt: $expiresAt) {'
              + 'uuid,'
              + 'status,'
              + 'ownerUuid,'
              + 'reference'
              + '}'
          + '}';

    public static final String MUTATION_SALESFORCE_UPDATE_DOCUMENT =
        'mutation systemUpdateDocument($uuid: ID!, $originalFilename: String, $name: String, $key: String, $ownerUuid: String, $appSlug: String, $reference: String, $metadata: JSON, $source: SourceEnum, $expiresAt: ISO8601DateTime) {'
          + 'systemUpdateDocument(uuid: $uuid, originalFilename: $originalFilename, name: $name, key: $key, ownerUuid: $ownerUuid, appSlug: $appSlug, reference: $reference, metadata: $metadata, source: $source, expiresAt: $expiresAt) {'
              + 'uuid,'
              + 'status,'
              + 'ownerUuid,'
              + 'reference'
              + '}'
          + '}';

    public static final String MUTATION_FIRE_DOCUMENT_EVENT = 
        'mutation systemFireDocumentEvent($documentUuid: ID!, $event: String!) {'
          + 'systemFireDocumentEvent(documentUuid: $documentUuid, event: $event) {'
              + 'uuid,'
              + 'key,'
              + 'originalFilename,'
              + 'ownerUuid,'
              + 'appSlug,'
              + 'callbackEndpointUrl,'
              + 'callbackMutation,'
              + 'reference,'
              + 'status,'
              + 'metadata,'
              + 'source,'
              + 'category'
          + '}'
        + '}';

  
    public DocumentType fireDocumentEvent(String documentUuid, String event) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'systemFireDocumentEvent';
        mutation.variables = new Map<String, Object> { 'documentUuid' => documentUuid, 'event' => event };
        mutation.body = MUTATION_FIRE_DOCUMENT_EVENT;
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, DocumentType.class);	
        processErrors(results);
        
        return (DocumentType)results.data;
    }

    public DocumentType acceptDocument(String documentUuid) {
        return fireDocumentEvent(documentUuid, 'approve');
    }

    public DocumentType archiveDocument(String documentUuid) {
        return fireDocumentEvent(documentUuid, 'archive');
    }

    public DocumentType salesforceCreateDocument(String submissionUuid, String category, String reference, Map<String, String> metadata, Boolean approve) {
        return salesforceCreateDocument(submissionUuid, 'name', category, reference, metadata, approve, null);
    }

    public DocumentType salesforceCreateDocument(String submissionUuid, String name, String category, String reference, Map<String, String> metadata, Boolean approve, String expirationDate) {
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'salesforceCreateDocument';
        system.debug(category);
        system.debug(SF_TO_API_DOCUMENT_CATEGORY.get(category));
        query.variables = new Map<String, Object> { 'submissionUuid' => submissionUuid, 'name' => name, 'reference' => reference, 'metadata' => metadata, 'category' => SF_TO_API_DOCUMENT_CATEGORY.get(category), 'approve' => approve, 'expiresAt' => expirationDate };
        query.body = MUTATION_SALESFORCE_CREATE_DOCUMENT;
        
        MortgagesGraphQLClient.Results results = client.query(query, DocumentType.class);	
        processErrors(results);
        
        return (DocumentType)results.data;	
    }

    public DocumentType updateDocument(Map<String, String> data) {
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'systemUpdateDocument';
        query.variables = data;
        query.body = MUTATION_SALESFORCE_UPDATE_DOCUMENT;
        
        MortgagesGraphQLClient.Results results = client.query(query, DocumentType.class);	
        processErrors(results);
        
        return (DocumentType)results.data;	
    }

    public static final String QUERY_SYSTEM_PDF_DOCUMENT = 
    'query systemPDFDocument($documentUuid: ID!, $viewer: Boolean) {' 
        + 'systemPDFDocument(documentUuid: $documentUuid, viewer: $viewer)'
    + '}';

    public String generateViewerUrl(String documentUuid) {
        MortgagesGraphQLClient.Query query = new MortgagesGraphQLClient.Query();
        query.operationName = 'systemPDFDocument';
        query.body = QUERY_SYSTEM_PDF_DOCUMENT;
        query.variables = new Map<String, Object> { 'documentUuid' => documentUuid, 'viewer' => true };
        
        MortgagesGraphQLClient.Results results = client.query(query, String.class);
        processErrors(results);

        return (String)JSON.deserialize((String)results.data, String.class);
    }

    public static final String MUTATION_SYSTEM_GENERATE_PDF_DOCUMENT = 
    'mutation systemGeneratePDFDocument($documentUuid: ID!) {' 
        + 'systemGeneratePDFDocument(documentUuid: $documentUuid)'
    + '}';

    public Boolean generatePDFDocument(String documentUuid) {
        MortgagesGraphQLClient.Mutation mutation = new MortgagesGraphQLClient.Mutation();
        mutation.operationName = 'systemGeneratePDFDocument';
        mutation.body = MUTATION_SYSTEM_GENERATE_PDF_DOCUMENT;
        mutation.variables = new Map<String, Object> { 'documentUuid' => documentUuid };
        
        MortgagesGraphQLClient.Results results = client.mutation(mutation, Boolean.class);
        processErrors(results);

        return (Boolean)results.data;
    }

    public DocumentType updateExpirationDate(String documentUuid, String expirationDate) {
        return updateDocument(new Map<String, String> { 'uuid' => documentUuid, 'expiresAt' => expirationDate });
    }
}