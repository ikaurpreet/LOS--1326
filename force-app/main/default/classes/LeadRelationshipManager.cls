public class LeadRelationshipManager {
    public static Set<ID> needLeadToLead(Integer size) { 
            Set<ID> ids = new Set<ID> {};
            Map<String, ID> lead_relations = new Map<String, ID> ();
            for(Lead lead: [SELECT ID, Cosigner_or_Borrower_ID__c FROM Lead 
                                        WHERE SubmissionType__c != NULL AND 
                                          Cosigner_Borrower__c = NULL AND 
                                          Cosigner_or_Borrower_ID__c != NULL AND
                                          IsConverted = false AND
                                          SystemModStamp = LAST_N_DAYS:1 
                                          
                                    ORDER BY CreatedDate DESC 
                                    LIMIT :size]) {
                lead_relations.put(lead.Cosigner_or_Borrower_ID__c, lead.ID);
        }
        for(Lead lead: [SELECT ID, Participant_Id__c FROM Lead WHERE Participant_ID__c in: lead_relations.keySet()]) {
            if (lead_relations.containsKey(lead.ID)) {
                ids.add(lead_relations.get(lead.Participant_Id__c));    
            }
        }
        return ids;
    }
    public static List<Lead> loadLeadToLead(Set<Id> lead_ids) {
            return [SELECT Id, 
                    FirstName, 
                    LastName, 
                    Email, 
                    Zip_Code__c, 
                    User_Role__c,
                    DOB__c, 
                    Phone, 
                    Has_Account__c, 
                    current_address_state__c, 
                    Cosigner_or_Borrower_ID__c, 
                    User_ID__c, 
                    Submission_ID__c, 
                    IsConverted,  
                    Status, 
                    participant_id__c, 
                    Cosigner_Borrower__c,
                    RecordType.Name
                    FROM Lead WHERE SystemModStamp = LAST_N_DAYS:1 AND SubmissionType__c != NULL AND Cosigner_Borrower__c = NULL AND Cosigner_or_Borrower_ID__c != NULL AND id in: lead_ids
                    FOR UPDATE];
    }
    public static void leadToLead(Set<Id> lead_ids) {
            List<Lead> leads;
            try {
                leads = loadLeadToLead(lead_ids);
            } catch (Exception ex) { return; }
        LeadRelationshipManager.borrower_or_cosigner(leads);
    }
    public static void accountToLead(Set<ID> account_ids) {
            List<Account> accounts = [SELECT Id, user_id__c, PersonEmail FROM Account WHERE IsPersonAccount = TRUE AND id in: account_ids];
            LeadRelationshipManager.leads(accounts);
    }
    public static Set<ID> needLeadToAccount(Integer size) { 
            return new Map<ID, Lead>([SELECT ID FROM Lead WHERE SystemModStamp = LAST_N_DAYS:1 AND SubmissionType__c != NULL AND Email != NULL AND Has_Account__c = NULL ORDER BY CreatedDate DESC LIMIT :size]).keySet();
    }
    public static List<Lead> loadLeadToAccount(Set<ID> lead_ids) {
            return [SELECT Id, 
                FirstName, 
                LastName, 
                Email, 
                Zip_Code__c, 
                DOB__c, 
                Phone, 
                Has_Account__c, 
                current_address_state__c, 
                Cosigner_or_Borrower_ID__c, 
                User_ID__c, 
                Submission_ID__c, 
                IsConverted,  
                Status, 
                participant_id__c, 
                Cosigner_Borrower__c 
                FROM Lead WHERE SystemModStamp = LAST_N_DAYS:1 AND SubmissionType__c != NULL AND Email != NULL AND Has_Account__c = NULL AND id in: lead_ids
                FOR UPDATE];
    }
    public static void leadToAccount(Set<ID> lead_ids) {
            List<Lead> leads;
            try {
                leads = loadLeadToAccount(lead_ids);
        } catch (Exception ex) { return; }                              
        system.debug(leads.size());
            LeadRelationshipManager.leadToAccount(leads);
    }
    public static void opportunityToAccount(Set<ID> opportunity_ids) {
            List<Opportunity> opportunities = [SELECT Id, Cosigner_Id__c, Cosigner__c FROM Opportunity WHERE id in: opportunity_ids];
            LeadRelationshipManager.accounts(opportunities);
    }
    public static void borrower_or_cosigner(List<Lead> source) {
        System.debug('LeadRelationshipManager.borrower_or_cosigner(Lead)');
        Map<String, String> lead_relations = new Map<String, String>();
        
        
        for(Lead lead : source) {
            if (!String.isBlank(lead.Cosigner_or_Borrower_ID__c) && lead.Cosigner_Borrower__c == null) {
                lead_relations.put(lead.id, lead.Cosigner_or_Borrower_ID__c);
            }
         }

        Map<String,String> related_leads = new Map<String, String>();
        for(Lead lead : [SELECT id, participant_id__c FROM Lead WHERE participant_id__c in :lead_relations.values()]) {
            related_leads.put(lead.participant_id__c, lead.id);
        }
        List<Lead> update_leads = new List<Lead>();
        for(Lead lead : source) {
            String related_lead = related_leads.get(lead.Cosigner_or_Borrower_ID__c);
            
            if(!String.isEmpty(related_lead)) {
                lead.Cosigner_Borrower__c = related_lead;
                update_leads.add(lead);
            }
        }
        update update_leads;
    }
    public static Account build_account(Lead lead) {
        Account account = new Account();
        account.FirstName = lead.FirstName;
        account.LastName = lead.LastName;
        account.PersonEmail = lead.Email;
        account.Person_Email__c = lead.Email;
        account.User_Id__c = lead.User_ID__c;
        account.Zip_Code__c = lead.Zip_Code__c;
        account.DOB__c = lead.DOB__c;
        account.Phone = lead.Phone;
        account.current_address_state__c = lead.current_address_state__c;
        return account;
    }
    
    public static void record_types(List<Lead> leads) {
        System.debug('LeadRelationshipManager.record_types(Lead)');
        Map<String, String> types = new Map<String, String>();
        Map<String,Lead> related_leads = new Map<String, Lead>();
        for(RecordType type: [SELECT Id, DeveloperName, SobjectType FROM RecordType WHERE SobjectType = 'Lead']) {
            types.put(type.DeveloperName, type.id);
        }
              
        for(Lead lead: leads) {
            String type = lead.SubmissionType__c;
            if (!types.containsKey(type)) { continue; }
            lead.RecordTypeId = types.get(type);
        }        
    }
    
    public static void record_types(List<Opportunity> source) {
        System.debug('LeadRelationshipManager.record_types(Opportunity)');
        Map<String, String> types = new Map<String, String>();
        for(RecordType type: [SELECT Id, DeveloperName, Name FROM RecordType WHERE SObjectType='Opportunity']) {
            types.put(type.DeveloperName, type.Id);
            types.put(type.Name, type.Id);
        }
        
        for(Opportunity item: source) {
            String type = item.Submission_Type__c;
            if (!types.containsKey(type)) { continue; }
            item.RecordTypeId = types.get(type); 
        }
    }

    public static void leadToAccount(List<Lead> source) {
        Set<String> emails = new Set<String>();
        Set<String> user_ids = new Set<String>();
        for(Lead lead : source) {
            if (!String.isBlank(lead.email) && lead.Has_Account__c == null) {
                emails.add(lead.email);
                if (lead.user_id__c != null) { user_ids.add(lead.user_id__c); }
            }
         }
         
        Map<String, String> email_accounts = new Map<String, String>();
        Map<String, String> user_ids_accounts = new Map<String, String>();
        for(Account account: [SELECT id, 
                                        user_id__c, 
                                        PersonEmail, 
                                        Person_Email__c 
                                        FROM Account 
                                        WHERE PersonEmail in :emails 
                                        OR    Person_Email__c in:emails
                                        OR    User_Id__c in:user_ids]) {
                String email = account.Person_Email__c != NULL ? account.Person_Email__c : account.PersonEmail;
            email_accounts.put(email, account.id);
            if(account.user_id__c != null) { user_ids_accounts.put(account.user_id__c, account.id); } 
        }
        List<Lead> update_leads = new List<Lead>();
        Map<String, List<Lead>> lead_relation = new Map<String, List<Lead>>();
        Map<String, Account> accounts = new Map<String, Account>();

        for(Lead lead : source) {
                String user_id = lead.user_id__c;
                String email   = lead.email; 
                String account_id;
                if (user_id != null && user_ids_accounts.containsKey(user_id)) {
                    account_id = user_ids_accounts.get(user_id);
                } else if (email_accounts.containsKey(email)) {
                    account_id = email_accounts.get(email);
                }
            
            if(lead.Has_Account__c == null) {
                    if(account_id != null) {
                    lead.Has_Account__c = account_id;
                    } else {
                    accounts.put(email, build_account(lead));
                    }
                    if (!lead_relation.containsKey(email)) {
                        lead_relation.put(email, new List<Lead>{});
                    }
                    lead_relation.get(email).add(lead);
                    update_leads.add(lead);
            }
        }
        
        if (!accounts.isEmpty()) {
            try {
                    // upsert accounts.values() Person_Email__c;
            } catch(DmlException ex) {
                    // upsert accounts.values() Person_Email__c;
            }
            system.debug(accounts);
            for(String email: accounts.keySet()) {
                    List<Lead> leads = lead_relation.get(email);
                    system.debug(accounts.get(email));
                    for(Lead lead: leads) {
                        lead.Has_Account__c = accounts.get(email).Id;
                    }
            }
        }
        
        if(!update_leads.isEmpty()) {
                update update_leads;    
        }
    }
    
    public static void leads(List<Account> source) {       
       Map<String, String> accounts_emails = new Map<String, String>();
       for(Account account: source) {
           accounts_emails.put(account.PersonEmail, account.id);
       }
       
       List<Lead> leads = [SELECT Id, Has_Account__C, User_id__c, email FROM Lead WHERE Has_Account__c = NULL and email in :accounts_emails.keySet() FOR UPDATE];
       
       for(Lead lead: leads) {
           if(accounts_emails.containsKey(lead.email)) {
               lead.Has_Account__c = accounts_emails.get(lead.email);
           }
       }
       
       update leads;
    }
    
    public static void accounts(List<Opportunity> source) {
       Map<String, String> relations = new Map<String, String>();
       for(Opportunity opp: source) {
           if(!String.isBlank(opp.Cosigner_Id__c) && opp.Cosigner__c == NULL) {
               relations.put(opp.id, opp.Cosigner_Id__c);
           }
       }
       
       List<Opportunity> opportunities = [SELECT id, Cosigner_Id__c FROM Opportunity WHERE id in : relations.keySet()];
       
       Map<String, Lead> leads = new Map<String, Lead>();
       for (Lead lead : [SELECT id, ConvertedAccountId, Has_Account__c, Participant_ID__c, User_id__c FROM Lead where Participant_ID__c in :relations.values()]) {
           leads.put(lead.Participant_ID__c, lead);
       }
       
       for (Opportunity opp: opportunities) {
           String lead_id = relations.get(opp.id);
           Lead lead = leads.get(lead_id);
           if (lead == null) { continue; }
           opp.Cosigner__c = lead.Has_Account__c != NULL ? lead.Has_Account__c : lead.ConvertedAccountId;
       }
       update opportunities;
    }
    
    public static void check_if_lead_converted(List<Opportunity> source) {
        Map<String, Opportunity> submission_relations = new Map<String, Opportunity>();
        for(Opportunity item : source) {
            submission_relations.put(item.submission_id__c, item);
        }

        Set<String> convert_statuses = new Set<String>{ 'FIP', 'PQLL', 'Converted' };
        Map<String, Lead> leads = new Map<String, Lead>();
        for(Lead lead: [SELECT Id, Status, Submission_Id__c, IsConverted FROM Lead WHERE submission_id__c in :submission_relations.keySet() and User_Role__c =: LeadConverter.OPPORTUNITY_OWNER]) {
            leads.put(lead.Submission_Id__c, lead);
        }

        for(Opportunity opp: source) {
            Lead lead = leads.get(opp.Submission_Id__c);
            if(lead == null) {
                opp.addError('Lead not exist');              
            } else if(!convert_statuses.contains(lead.Status)) {
                opp.addError('Lead not converted');
            }
        }
    }
    
    
     public static void check_if_lead_converted(List<Lead> source) {
        Map<String, Lead> leads = new Map<String, Lead>();

        for(Lead lead: source) {
            leads.put(lead.participant_id__c, lead);
        }
        List<Lead> converted = [SELECT Participant_Id__c FROM Lead WHERE IsConverted = true AND Participant_ID__c in: leads.keySet()];

        for(Lead lead: converted) {
            lead source_lead = leads.get(lead.Participant_Id__c);
            source_lead.addError('Lead already converted', true);
        }
    }
     public static void convertLead(Set<ID> lead_ids) {
        //return;
        lead_ids.addAll(LeadConverter.needConvert(100));
        
    }
    
    public static String guid() {
            Blob b = Crypto.GenerateAESKey(128);
        String h = EncodingUtil.ConvertTohex(b);
        String guid = h.SubString(0,8)+ '-' + h.SubString(8,12) + '-' + h.SubString(12,16) + '-' + h.SubString(16,20) + '-' + h.substring(20);
        return guid;
    }
}