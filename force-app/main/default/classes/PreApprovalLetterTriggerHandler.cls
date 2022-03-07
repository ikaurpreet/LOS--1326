public class PreApprovalLetterTriggerHandler {
    public static void updateLead(List<Pre_approval_Letter__c> newRecords, Map<id, Pre_approval_Letter__c> oldMap){
        Set<String> subId = new Set<String>();
      	List<Pre_approval_Letter__c> toUpdateLead = new List<Pre_approval_Letter__c>();
        for(Pre_approval_Letter__c p : newRecords){
            if(p.Submission_uuid__c  != null && 
               (oldmap==null || (oldmap!=null && (oldMap.get(p.Id)==null || (oldMap.get(p.Id) != null && p.Submission_uuid__c != oldMap.get(p.Id).Submission_uuid__c))))){
               		subId.add(p.Submission_uuid__c); 
               		toUpdateLead.add(p);
               }
        }
        if(subId.size() > 0){
            List<Lead> leads = new List<Lead>([Select id, mortgage_Submission_UUID__c, User_Role__c  from Lead where mortgage_Submission_UUID__c  
                                               IN : subId and User_Role__c='borrower']);
            Map<String, Lead> subidOppMap = new Map<String, Lead>();
            for(Lead o : leads){
            	subidOppMap.put(o.mortgage_Submission_UUID__c , o);  
            }
            for(Pre_approval_Letter__c p : toUpdateLead){
                if(subidOppMap.containsKey(p.Submission_uuid__c))
                    p.Lead__c = subidOppMap.get(p.Submission_uuid__c).id;
            }
        }
            
    }
    
    public static void updateOnOppInsert(List<Opportunity> opps){
    	Map<String,Id> subId = new Map<String,Id>();
        for(Opportunity o : opps){
            subId.put(o.mortgage_Submission_UUID__c, o.Id);
        }
        List<Pre_approval_Letter__c> letters = [Select id, Submission_uuid__c, Opportunity__c from Pre_approval_Letter__c where Submission_uuid__c IN : subId.keySet()];
        if(letters != null && letters.size()>0){
            for(Pre_approval_Letter__c p : letters){
                p.Opportunity__c = subId.get(p.Submission_uuid__c);
            }
            update letters;
        }
    }
}