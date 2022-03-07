@isTest
public with sharing class MortgageTeamMemberControllerTest {
    public class MockGraphQLClient extends MortgagesGraphQLClient {
        public MockGraphQLClient(String clientId, String clientSecret, String tokenUrl, String graphqlUrl) {
            super(clientId, clientSecret, tokenUrl, graphqlUrl);
        }

        public override MortgagesGraphQLClient.Results query(MortgagesGraphQLClient.Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            MortgagesApiClient.MortgageTeamMemberType teamMember = new MortgagesApiClient.MortgageTeamMemberType();
            teamMember.firstName = 'Test';
            MortgagesApiClient.MortgageTeamMemberTypePaginationType pagination = new MortgagesApiClient.MortgageTeamMemberTypePaginationType();
            pagination.totalCount = 1;
            pagination.items = new List<MortgagesApiClient.MortgageTeamMemberType> { teamMember };
            
            switch on query.operationName {
                when 'mortgagesSalesforceMortgageTeamMembers' {
                    results.data = pagination;
                }

                when 'mortgageSalesforceMortgageTeamMember' {
                    results.data = teamMember;
                }
            }
            return results;
        }

        public override MortgagesGraphQLClient.Results mutation(MortgagesGraphQLClient.Query query, System.Type type) {
            MortgagesGraphQLClient.Results results = new MortgagesGraphQLClient.Results();
            results.data = true;

            return results;
        }
    }

    @isTest
    private static void searchTest() {
        MortgagesApiClient.MortgageTeamMemberType teamMember = new MortgagesApiClient.MortgageTeamMemberType();
        teamMember.firstName = 'Test';
        MortgagesApiClient.MortgageTeamMemberTypePaginationType pagination = new MortgagesApiClient.MortgageTeamMemberTypePaginationType();
        pagination.totalCount = 1;
        pagination.items = new List<MortgagesApiClient.MortgageTeamMemberType> { teamMember };
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgageTeamMemberController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        String result = MortgageTeamMemberController.search('query', 'env', 'role', 'order', 'asc', 0, 0);

        List<User> users = [SELECT Id, FirstName, LastName, Salesforce_Linked_Email__c, CommunityNickname, Branch__c, Mortgage_Role__c, Licensed_States_Text__c, Calendly_Link__c, NMLS__c, Phone FROM User WHERE Mortgage_Role__c IN ('Loan Officer', 'Loan Processor', 'Loan Officer Coordinator', 'Closing Coordinator')];
        List<MortgagesApiClient.MortgageTeamMemberType> aggregatedResponse = new List<MortgagesApiClient.MortgageTeamMemberType>();
    
        for(User user: users) {
            MortgagesApiClient.MortgageTeamMemberType member = new MortgagesApiClient.MortgageTeamMemberType();
            for(MortgagesApiClient.MortgageTeamMemberType mortgageMember: pagination.items) 
                if (mortgageMember.userId == user.CommunityNickname && MortgageTeamMemberController.USER_ROLES_MAP.get(mortgageMember.role) == user.Mortgage_Role__c)
                    member = mortgageMember;
            member.shouldSync = MortgageTeamMemberController.shouldSync(member, user);
            aggregatedResponse.add(MortgageTeamMemberController.prepareMember(member, user));
        }

        System.assertEquals(JSON.serialize(aggregatedResponse), result);
    }

    @isTest
    private static void findByUserIdTest() {
        MortgagesApiClient.MortgageTeamMemberType teamMember = new MortgagesApiClient.MortgageTeamMemberType();
        teamMember.firstName = 'Test';
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgageTeamMemberController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        String result = MortgageTeamMemberController.findByUserId('userId', 'env');
        System.assertEquals(JSON.serialize(teamMember), result);
    }

    @isTest
    private static void createOrUpdateTest() {
        UserRole r = new UserRole(DeveloperName = 'MyCustomRole', Name = 'My Role');
        insert r;
        User u = new User(
            ProfileId = [SELECT Id FROM Profile WHERE Name = 'System Administrator'].Id,
            LastName = 'last',
            Email = 'puser000@amamama.com',
            Salesforce_Linked_Email__c = 'puser000@amamama.com',
            Username = 'puser000@amamama.com' + System.currentTimeMillis(),
            CompanyName = 'TEST',
            Title = 'title',
            Alias = 'alias',
            TimeZoneSidKey = 'America/Los_Angeles',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US',
            LocaleSidKey = 'en_US',
            UserRoleId = r.Id
        );
        insert u;
        MortgagesApiClient.MortgageTeamMemberType teamMember = new MortgagesApiClient.MortgageTeamMemberType();
        teamMember.firstName = 'Test';
        MortgagesGraphQLClient graphqlClient = new MockGraphQLClient('test', 'test', 'test', 'test');
        MortgageTeamMemberController.mortgagesApiClient = new MortgagesApiClient(graphqlClient);
        Boolean result = MortgageTeamMemberController.createOrUpdate(u.id, 'env');
        System.assertEquals(true, result);
    }
}