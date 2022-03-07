global class MortgagesUtilities {
    public class SubjectObjectNotFoundException extends Exception {}
    public static MortgagesConstants.Env getEnvironment(ID identifier) {
        List<Opportunity> opportunities = [SELECT Submission_Id__c FROM Opportunity WHERE id=: identifier LIMIT 1];
        if (opportunities.size() > 0) {
            return getEnvironment(opportunities[0]);
        }

        List<Lead> leads = [SELECT Participant_ID__c FROM Lead where id=: identifier LIMIT 1];
        if (leads.size() > 0) {
            return getEnvironment(leads[0]);
        }

        List<Account> accounts = [SELECT User_id__c from Account where id=: identifier];
        if (accounts.size() > 0) {
            return getEnvironment(accounts[0]);
        }

        throw new SubjectObjectNotFoundException('Subject object "' + identifier + '" not found in opportunities, leads and accounts');
    }

    public static Map<String, Map<String, String>> getSubmissionSalesforceIds(Set<String> submissionUuids) {
        List<Opportunity> opportunities = [SELECT ID, mortgage_Submission_uuid__c FROM Opportunity WHERE mortgage_Submission_uuid__c in :submissionUuids];
        List<Lead> leads = [SELECT ID, mortgage_Submission_uuid__c, User_Role__c FROM Lead WHERE Mortgage_Submission_Uuid__c in :submissionUuids];

        Map<String, Map<String, String>> groupIds = new Map<String, Map<String, String>>();

        for(Opportunity opp: opportunities) {
            String uuid = opp.Mortgage_Submission_Uuid__c;
            if (!groupIds.containsKey(uuid)) {
                groupIds.put(uuid, new Map<String, String>());
            }
            groupIds.get(uuid).put('opportunity', opp.id);
        }

        for(Lead lead: leads) {
            String uuid = lead.Mortgage_Submission_Uuid__c;
            if (!groupIds.containsKey(uuid)) {
                groupIds.put(uuid, new Map<String, String>());
            }
            groupIds.get(uuid).put(lead.User_Role__c, lead.id);
        }

        return groupIds;
    }

    public static Boolean isMortgage(Opportunity opp) {
        String name = opp.name;
        return name.contains(MortgagesConstants.PURCHASE_PREFIX) || name.contains(MortgagesConstants.REFINANCE_PREFIX);
    }

    public static MortgagesConstants.Env getEnvironment(Account account) {
        return getEnvironment(account.user_id__c);
    }

    public static MortgagesConstants.Env getEnvironment(Lead lead) {
        return getEnvironment(lead.Participant_ID__c);
    }

    public static MortgagesConstants.Env getEnvironment(Opportunity opp) {
        return getEnvironment(opp.Submission_Id__c);
    }

    public static MortgagesConstants.Env getEnvironment(String prefixable) {
        prefixable = ClientCredentialsSettings.getDefaultName().toLowerCase() + prefixable;

        if (prefixable.contains('production')) {
            return MortgagesConstants.Env.PRODUCTION;
        } else {
            return MortgagesConstants.Env.TEST;
        }
    }

    public static String unprefixify(String id) {
        return id.replaceFirst('(stage|develop|uat|qak8s|local|test|mort)_', '');
    }

    public static String getPrefix(MortgagesConstants.Env env) {
        String envName = env.name().toLowerCase();
        if (envName == 'production') {
            return '';
        } else {
            return envName + '_';
        }
    }
}