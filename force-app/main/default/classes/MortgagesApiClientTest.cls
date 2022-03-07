@isTest
public with sharing class MortgagesApiClientTest {
    public class MockGraphQLClient extends MortgagesGraphQLClient {
        public MockGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
            super(clientId, clientSecret, tokenUrl, graphqlUrl);
        }

        public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query mutation, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on mutation.operationName {
                when 'salesforceFireSubmissionEvent' {
                    results.data = true;
                }
                when 'mortgageAdminSaveLenderLoanNumber' {
                    results.data = true;
                }
            }
            return results;
        }

        public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query mutation) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on mutation.operationName {
                when 'salesforceSync' {
                    results.data = 'salesforceSync';
                }
                when 'mortgagesSalesforceRerunEligibility' {
                    results.data = true;
                }
                when 'mortgagesSalesforceChangeProduct' {
                    results.data = true;
                }
                when 'encompassSystemUpdateLoan' {
                    results.data = '{"encompassSystemUpdateLoan":{"status":"success"}}';
                }
            }
            return results;
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on query.operationName {
                when 'mortgagesSalesforceSubmissions' {
                    MortgagesApiClient.SubmissionsPaginationType data = new MortgagesApiClient.SubmissionsPaginationType();
                    data.items = new List<MortgagesApiClient.PaginationSubmission>{
                            createPaginationSubmission()
                    };
                    results.data = (Object) data;
                }
                when 'mortgagesSalesforceMortgageTeamMembers' {
                    MortgagesApiClient.MortgageTeamMemberTypePaginationType teamMemberPagination = new MortgagesApiClient.MortgageTeamMemberTypePaginationType();
                    teamMemberPagination.totalCount = 1;
                    teamMemberPagination.items = new List<MortgagesApiClient.MortgageTeamMemberType>();
                    results.data = teamMemberPagination;
                }
                when 'mortgageSalesforceMortgageTeamMember' {
                    MortgagesApiClient.MortgageTeamMemberType teamMember = new MortgagesApiClient.MortgageTeamMemberType();
                    teamMember.firstName = 'TestFirstName';
                    teamMember.lastName = 'TestLastName';
                    results.data = teamMember;
                }
                when 'salesforceAssignLoanOfficer' {
                    results.data = true;
                }
                when 'salesforceAssignLoanCoordinator' {
                    results.data = true;
                }
                when 'salesforceAssignLoanProcessor' {
                    results.data = true;
                }
                when 'salesforceAssignLoanCloser' {
                    results.data = true;
                }
            }
            return results;
        }

        private MortgagesApiClient.PaginationSubmission createPaginationSubmission() {
            MortgagesApiClient.PaginationSubmission paginationSubmission = new MortgagesApiClient.PaginationSubmission();
            paginationSubmission.uuid = 'uuid';
            paginationSubmission.status = 'status';
            paginationSubmission.vertical = 'vertical';
            paginationSubmission.createdAt = 'date';
            paginationSubmission.opportunityId = 'id';
            paginationSubmission.coBorrowerLeadId = 'id';
            paginationSubmission.borrowerLeadId = 'id';
            paginationSubmission.borrower = new Map<String, Map<String, String>>();
            return paginationSubmission;
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            switch on query.operationName {
                when 'mortgagesSalesforcePurchaseSubmission' {
                    results.data = 'Purchase';
                }
                when 'mortgagesSalesforcePurchaseProducts' {
                    results.data = 'PurchaseProducts';
                }
                when 'mortgagesSalesforceRefinanceProducts' {
                    results.data = 'RefinanceProducts';
                }
                when 'mortgagesSalesforceRefinanceSubmission' {
                    results.data = 'Refinance';
                }
                when 'mortgagesSalesforceEligibilities' {
                    results.data = 'Eligibilities';
                }
                when 'mortgagesSalesforceEligibility' {
                    results.data = 'Eligibility';
                }
                when 'mortgagesSalesforceRefinanceSelectedProductHistory' {
                    results.data = 'mortgagesSalesforceRefinanceSelectedProductHistory';
                }
                when 'mortgagesSalesforceApplicationConfig' {
                    results.data = 'mortgagesSalesforceApplicationConfig';
                }
                when 'salesforceUpdateApplicationConfig' {
                    results.data = 'salesforceUpdateApplicationConfig';
                }
            }
            return results;
        }
    }

    @isTest
    public static void getApplicationConfig() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String results = client.getApplicationConfig();
        System.assertEquals('mortgagesSalesforceApplicationConfig', results);
    }
    @isTest
    public static void updateApplicationConfig() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String results = client.updateApplicationConfig('CA', true);
        System.assertEquals('salesforceUpdateApplicationConfig', results);
    }
    @isTest
    public static void changeProduct() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        Boolean submission = client.changeProduct('submissionUuid', 12);
        System.assertEquals(null, submission);
    }

    @isTest
    public static void getRefinanceSubmission() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String submission = client.getRefinanceSubmission('submissionUuid');
        System.assertEquals('Refinance', submission);
    }
    @isTest
    public static void searchSubmissions() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        MortgagesApiClient.SubmissionsPaginationType results = client.searchSubmissions('searchQuery', 'vertical', 'status', 'order', 1, 1);
        // System.assertEquals('Refinance', submission);
    }

    @isTest
    public static void getEligibilityField() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String eligibility = client.getEligibilityField('eligibilityUuid', 'fieldName');
        System.assertEquals('Eligibility', eligibility);
    }

    @isTest
    public static void getRefinanceProducts() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String refinanceProducts = client.getRefinanceProducts('eligibilityUuid',
                                      1,
                                      1,
                                      true,
                                      new Set<String>(),
                                      'loanType',
                                      'monthlyPayment',
                                      'apr',
                                      'rate',
                                      'order');
        System.assertEquals('RefinanceProducts', refinanceProducts);
    }

    @isTest
    public static void salesforceSync() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String results = client.salesforceSync('submissionUuid', 'type') ;
        System.assertEquals('salesforceSync', results);
    }

    @isTest
    public static void fireSubmissionEvent() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        Boolean results = client.fireSubmissionEvent('submissionUuid', 'event') ;
        System.assertEquals(true, results);
    }

    @isTest
    public static void getPurchaseProducts() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String purchaseProducts = client.getPurchaseProducts('eligibilityUuid',
                                      1,
                                      1,
                                      true,
                                      new Set<String>(),
                                      'loanType',
                                      'monthlyPayment',
                                      'apr',
                                      'rate',
                                      'order');
        System.assertEquals('PurchaseProducts', purchaseProducts);
    }

    @isTest
    public static void getPurchaseSubmission() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String submission = client.getPurchaseSubmission('submissionUuid');
        System.assertEquals('Purchase', submission);
    }

    @isTest
    public static void mortgagesSalesforceRefinanceSelectedProductHistory() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String results = client.getSelectedProductHistory('submissionUuid');
        System.assertEquals('mortgagesSalesforceRefinanceSelectedProductHistory', results);
    }

    @isTest
    public static void rerunEligibility() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        Boolean results = client.rerunEligibility('submissionUuid');
        System.assertEquals(null, results);
    }

    @isTest
    public static void getEligibility() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String eligibility = client.getEligibility('eligibiityUuid');
        System.assertEquals('Eligibility', eligibility);
    }

    @isTest
    public static void getEligibilities() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        String eligibilities = client.getEligibilities('submissionUuid');
        System.assertEquals('Eligibilities', eligibilities);
    }


    @isTest
    public static void getMortgageTeamMembers() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        MortgagesApiClient.MortgageTeamMemberTypePaginationType results = client.getMortgageTeamMembers('searchQuery', 'role', 'order', 'orderDirection', 1, 1);
        System.assertEquals(1, results.totalCount);
    }


    @isTest
    public static void getMortgageTeamMember() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        MortgagesApiClient.MortgageTeamMemberType results = client.getMortgageTeamMember('userId');
        System.assertEquals('TestFirstName', results.firstName);
        System.assertEquals('TestLastName', results.lastName);
    }

    @isTest
    public static void assignLoanOfficer() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        Boolean results = client.assignLoanOfficer('submissionUuid', 'userId');
    }

    @isTest
    public static void assignLoanCoordinator() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        Boolean results = client.assignLoanCoordinator('submissionUuid', 'userId');
    }

    @isTest
    public static void assignLoanProcessor() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        Boolean results = client.assignLoanProcessor('submissionUuid', 'userId');
    }

    @isTest
    public static void assignLoanCloser() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        Boolean results = client.assignLoanCloser('submissionUuid', 'userId');
    }

    @isTest
    public static void archiveSubmission() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        client.archiveSubmission('submissionUuid');
    }

    @isTest
    public static void unarchiveSubmission() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        client.unarchiveSubmission('submissionUuid');
    }

    @isTest
    public static void createOrUpdateMortgageTeamMember() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        client.createOrUpdateMortgageTeamMember(new MortgagesApiClient.MortgageTeamMemberType(
                'firstName',
                'lastName',
                'email',
                'role',
                'userId',
                1,
                'calendlyLink',
                'licensedStates',
                'branch',
                'phone',
                'loanCoordinatorId'
        ));
    }
    
    @isTest
    static void updateSubmissionStatus() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        client.updateSubmissionStatus('submissionUuid', 'submission_status');
    }
    
    @isTest
    static void updateClosingCosts() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        client.updateClosingCosts('submissionUuid');
    }
    
    @isTest
    static void updateLoan() {
        MR_Loan loan = new MR_Loan();
        loan.lenderLoanNumber = 'loan1';
        loan.loanStatus = MR_Loan.Status.closedLoan;
        loan.submissionUuid = 'uuid-1';
        
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        System.assert(client.updateLoan(loan));
    }
    
    @isTest
    static void mortgageRefiEncompassSelectProductTest() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        client.mortgageRefiEncompassSelectProduct('submission_uuid', Datetime.now(), true);
    }
    
    @isTest
    static void saveLenderLoanNumber() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        System.assert(client.saveLenderLoanNumber('submission_uuid', 'loan_number'));
    }

    @isTest
    static void mortgageEncompassUpdateTasks() {
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgagesApiClient client = new MortgagesApiClient(graphqlClient);
        Datetime lockExpirationDate = DateTime.now();
        client.mortgageEncompassUpdateTasks('submissionUuid', lockExpirationDate);
    }
}