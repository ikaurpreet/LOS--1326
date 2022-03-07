public with sharing class MortgageTeamMemberController {
    public static MortgagesApiClient mortgagesApiClient { get;set; }
    public static MortgagesApiClient getMortgagesApiClient(String env) {
        if (mortgagesApiClient != null) {
            return mortgagesApiClient;
        }
        return MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
    }

    public static final Map<String, String> USER_ROLES_MAP = new Map<String, String> {
        'loanOfficer' => 'Loan Officer',
        'loanProcessor' => 'Loan Processor',
        'loanCoordinator' => 'Loan Officer Coordinator',
        'loanCloser' => 'Closing Coordinator'
    };

    @AuraEnabled
    public static String search(String query, String env, String role, String order, String orderDirection, Integer limitRecords, Integer offsetRecords){
        MortgagesApiClient.MortgageTeamMemberTypePaginationType results = getMortgagesApiClient(env).getMortgageTeamMembers(query, role, order, orderDirection, limitRecords, offsetRecords);
        List<User> users = [SELECT Id, FirstName, LastName, Salesforce_Linked_Email__c, CommunityNickname, Branch__c, Mortgage_Role__c, Licensed_States_Text__c, Calendly_Link__c, NMLS__c, Phone FROM User WHERE Mortgage_Role__c IN ('Loan Officer', 'Loan Processor', 'Loan Officer Coordinator', 'Closing Coordinator')];
        List<MortgagesApiClient.MortgageTeamMemberType> aggregatedResponse = new List<MortgagesApiClient.MortgageTeamMemberType>();
    
        // Users in Salesforce (present or not in mortgage database)
        for(User user: users) {
            MortgagesApiClient.MortgageTeamMemberType member = new MortgagesApiClient.MortgageTeamMemberType();
            
            for(MortgagesApiClient.MortgageTeamMemberType mortgageMember: results.items) 
                if (mortgageMember.userId == user.CommunityNickname && USER_ROLES_MAP.get(mortgageMember.role) == user.Mortgage_Role__c)
                    member = mortgageMember;

            member.shouldSync = shouldSync(member, user);

            aggregatedResponse.add(prepareMember(member, user));
        }

        return JSON.serialize(aggregatedResponse);
    }

    @AuraEnabled
    public static String findByUserId(String userId, String env) {
        MortgagesApiClient.MortgageTeamMemberType results = getMortgagesApiClient(env).getMortgageTeamMember(userId);

        return JSON.serialize(results);
    }

    @AuraEnabled
    public static Boolean createOrUpdate(String memberUuid, String env) {
        User user = [SELECT Id, FirstName, LastName, Salesforce_Linked_Email__c, CommunityNickname, Calendly_Link__c, Branch__c, Mortgage_Role__c, Licensed_States_Text__c, NMLS__c	, Phone FROM User WHERE Id =: memberUuid LIMIT 1];
        String loanCoordinatorId = ''; // How find loanCoordinatorId ?
        MortgagesApiClient.MortgageTeamMemberType teamMember = new MortgagesApiClient.MortgageTeamMemberType(user.FirstName,
            user.LastName, user.Salesforce_Linked_Email__c, user.Mortgage_Role__c, user.CommunityNickname, salesforceNmlsToInteger(user.NMLS__c),
            user.Calendly_Link__c, user.Licensed_States_Text__c, user.Branch__c, user.Phone, loanCoordinatorId);
        
        
        Boolean results = getMortgagesApiClient(env).createOrUpdateMortgageTeamMember(teamMember);

        return results;
    }

    public static MortgagesApiClient.MortgageTeamMemberType prepareMember(MortgagesApiClient.MortgageTeamMemberType member, User user) {
        member.nmls = salesforceNmlsToInteger(user.NMLS__c);
        member.calendlyLink = user.Calendly_Link__c;
        member.role = user.Mortgage_Role__c;
        member.branch = user.Branch__c;
        member.userId = user.CommunityNickname;
        member.email = user.Salesforce_Linked_Email__c;
        member.licensedStates = user.Licensed_States_Text__c;
        member.phone = user.Phone;
        member.salesforceId = user.id;
        member.salesforceName = user.firstName + ' ' + user.lastName;

        return member;
    }
    public static Boolean shouldSync(MortgagesApiClient.MortgageTeamMemberType member, User user) {
        if (member.nmls == salesforceNmlsToInteger(user.NMLS__c) && member.branch == user.Branch__c && member.calendlyLink == user.Calendly_Link__c &&
        member.licensedStates == user.Licensed_States_Text__c && member.phone == user.Phone && member.email == user.Salesforce_Linked_Email__c)
            return false;
        else
            return true;
    }

    private static Integer salesforceNmlsToInteger(String nmls) {
        if (nmls == null)
            return null;
        else
            return Integer.valueOf(nmls); 
    }
}