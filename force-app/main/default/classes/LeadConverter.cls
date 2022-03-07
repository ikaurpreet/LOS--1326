public class LeadConverter {
    public static final String OPPORTUNITY_OWNER = 'borrower'; // Role for which opportunity created
    public static final Set<String> convert_statuses = new Set<String>{ 'FIP', 'PQLL' };
    public static Boolean isRetry = false;
    
    
    public static List<Lead> loadConvert(Set<Id> lead_ids) {
        return [SELECT Id, 
                        Status, 
                        Email, 
                        User_Role__c, 
                        IsConverted, 
                        RecordType.Name, 
                        Has_Account__c, 
                        submission_id__c, 
                        User_id__c 
                        FROM Lead WHERE SystemModStamp = LAST_N_DAYS:1 AND
                                        Has_Account__c != null AND 
                                        IsConverted = false AND 
                                        Status in :convert_statuses 
                                        AND id in: lead_ids 
                        FOR UPDATE];
    }
    public static void convert(Set<Id> lead_ids) {
            List<Lead> leads;
            try {
                leads = loadConvert(lead_ids);
            } catch (Exception ex) { return; }
            LeadConverter.process(leads);
    }
    
    public static Set<ID> needConvert(Integer size) { 
            return new Map<ID, Lead>([SELECT ID FROM Lead WHERE SystemModStamp = LAST_N_DAYS:1 AND Has_Account__c != null AND IsConverted = false AND Status in :convert_statuses LIMIT :size]).keySet();
    }
    
    public static void process(List<Lead> source) {
            Set<ID> retry              = new Set<ID>();
        List<String> lead_ids      = new List <String>();
        Set<String> emails         = new Set<String>();
        Set<String> user_ids       = new Set<String>();
        Set<String> submission_ids = new Set<String>();
        List<Lead>  leads          = new List<Lead>();
        //Filter leads that ready for convert
        for(Lead lead: source) {
            if (convert_statuses.contains(lead.Status) && !lead.IsConverted) {
                leads.add(lead); 
                submission_ids.add(lead.submission_id__c);
                if (!String.isEmpty(lead.email)) {
                        emails.add(lead.email);
                }
                if(!String.isEmpty(lead.user_id__c)) {
                        user_ids.add(lead.user_id__c);
                }
            }
        }
        
        // Exit if no leeds for convert
        if(leads.isEmpty()) { return; } 
        system.debug('Lead for convert: ' + leads.size());
        system.debug(leads);
        
        system.debug('Retrieve related accounts');
        Map<String, String> email_accounts = new Map<String, String>();
        Map<String, String> user_ids_accounts = new Map<String, String>();
        Integer size = user_ids.size() + emails.size();
        for(Account account: [SELECT id, 
                                        user_id__c, 
                                        PersonEmail, 
                                        Person_Email__c 
                                        FROM Account 
                                        WHERE PersonEmail in :emails 
                                        OR    Person_Email__c in:emails
                                        OR    User_Id__c in:user_ids
                                        LIMIT :size]) {
                String email = account.Person_Email__c != NULL ? account.Person_Email__c : account.PersonEmail;
            email_accounts.put(email, account.id);
            if(account.user_id__c != null) { user_ids_accounts.put(account.user_id__c, account.id); } 
        }
        
        system.debug('Account related to leads');
        system.debug(email_accounts);
        system.debug(user_ids_accounts);
        
        system.debug('Retrieve already exist opportunities');
        Map<String, String> opportunities = new Map<String, String>();
        for(Opportunity opp: [SELECT ID, Submission_Id__c FROM Opportunity WHERE Submission_Id__c in: submission_ids]) {
            opportunities.put(opp.Submission_Id__c, opp.ID);
        }
        
        if(!opportunities.isEmpty()) {
                system.debug('Already exist opportunities');
                system.debug(opportunities);
        }

        LeadStatus lead_status = [SELECT Id, MasterLabel FROM LeadStatus WHERE IsConverted=true Limit 1];
        
        // Build
        List<Database.LeadConvert> mass_lead_convert = new List<Database.LeadConvert>();
        for(Lead lead: leads) {
            String record_type_name = lead.RecordType.Name;
            String submission_id = lead.submission_id__c;
            String user_role = lead.User_Role__c;
            String email     = lead.email;
            String user_id   = lead.user_id__c;
            String role      = lead.User_Role__c;
            String head      = lead.Id + ': ';
            Database.LeadConvert lead_convert = new Database.LeadConvert();
            String account_id;
                
                if (user_id != null && user_ids_accounts.containsKey(user_id)) {
                    account_id = user_ids_accounts.get(user_id);
                    system.debug(head + 'Account id ' + account_id + ' find by user_id');
                } else if (email_accounts.containsKey(email)) {
                    account_id = email_accounts.get(email);
                    system.debug(head + 'Account id ' + account_id + ' find by email');
                }
            
            lead_convert.setConvertedStatus(lead_status.MasterLabel);
            lead_convert.setLeadId(lead.Id); 
            
            if (account_id != NULL) {
                lead_convert.setAccountId(account_id);
            } else {
                    system.debug(head + 'Account not found');
            }

            lead_convert.setDoNotCreateOpportunity(true);
            
            // if (user_role == OPPORTUNITY_OWNER) {
            //         if (!opportunities.containsKey(submission_id)) {
            //             String name = record_type_name + ' - ' + submission_id;
            //             system.debug(head + 'Create opportunity with name: ' + name);
            //             lead_convert.setOpportunityName(name);
            //         } else {
            //             lead_convert.setDoNotCreateOpportunity(true);
            //             system.debug(head + 'Opportunity already exist - ' + opportunities.get(submission_id));
            //         }
            // } else {
            //         lead_convert.setDoNotCreateOpportunity(true);
            //         system.debug(head + 'Lead is not owner, user_role: ' + user_role);
            // }
            
            try {
                    Database.LeadConvertResult results = Database.convertLead(lead_convert);
                    system.debug(head + 'Successfully converted');
            } catch(DmlException ex) {
                    system.debug(head + 'Convert exception start');
                    if(ex.getNumDml() > 1) {
                        for (Integer i = 0; i < ex.getNumDml(); i++) {
                        system.debug(head + 'Message[' + i + '] - ' + ex.getDmlMessage(i)); 
                    }
                    } else {
                        system.debug(head + 'Message - ' + ex.getMessage());
                    } 
                    system.debug(head + 'Stack trace - ' + ex.getStackTraceString());
                    system.debug(head + 'Convert exception end');
                    retry.add(lead.id);
            }     
        }
        if (!retry.isEmpty()) {
                if(isRetry) { return; }
                isRetry = true;
                List<Lead> retry_leads = loadConvert(retry);
                system.debug('Retry');
                system.debug(retry);
                process(retry_leads);
        }
    }
}