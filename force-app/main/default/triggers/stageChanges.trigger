trigger stageChanges on Opportunity (before update) {
  List<Opportunity> opps = new List<Opportunity>();
    
    for(Opportunity op : Trigger.new){
        Opportunity oldOpportunity = Trigger.oldMap.get(op.ID);
        
        if (op.Submission_Status__c != oldOpportunity.Submission_Status__c ) {
            if (op.Submission_Status__c == 'form_in_progress') {
                op.StageName = 'FIP';
            }
            else if (op.Submission_Status__c == 'prequal_lender_login') {
                op.StageName = 'PQLL';
            }
            else if (op.Submission_Status__c == 'completed_ineligible') {
                op.StageName = 'Completed Ineligible';
            }
            else if (op.Submission_Status__c == 'form_completed_single_lender' || op.Submission_Status__c == 'encompass_request_sent' || op.Submission_Status__c == 'full_form_completed' || op.Submission_Status__c == 'encompass_econsent_sent' ) {
                op.StageName = 'FCSL';
            }
            else if (op.Submission_Status__c == 'offer_accepted') {
                op.StageName = 'Offer Accepted';
            }
            else if (op.Submission_Status__c == 'archived') {
                op.StageName = 'Archived';
            }

    }
        
        if (op.Highlighted_Product_Status__c != oldOpportunity.Highlighted_Product_Status__c) {
            if (op.Highlighted_Product_Status__c == 'response_received' && op.Submission_Type__c != 'Personal_Loans'){
                op.StageName = 'Initial Approval';
            }
            else if (op.Highlighted_Product_Status__c == 'response_received_more_info_required' || op.Highlighted_Product_Status__c == 'response_received_lender_contact_direct'){
                op.StageName = 'Pending';
            }
            else if (op.Highlighted_Product_Status__c == 'response_received_no_offer') {
                op.StageName = 'No Offer';
            }
            else if (op.Highlighted_Product_Status__c == 'response_received_no_offer_apply_with_cosigner' || op.Highlighted_Product_Status__c == 'no_offer_lender_contact_direct') {
                op.StageName = 'No Offer Apply with Cosigner';
            }
            
            
        }
        else if (op.Lender_Status_Unifed_Text__c  != oldOpportunity.Lender_Status_Unifed_Text__c && op.StageName != 'Archived' && op.StageName != 'FCSL' && op.Submission_Status__c != 'offer_accepted' && ((op.StageName != 'No Offer' && op.StageName != 'No Offer Apply with a Cosigner') || (op.Lender_Status_Unifed_Text__c != 'pending' && op.Lender_Status_Unifed_Text__c != 'initial_approval' && op.Lender_Status_Unifed_Text__c != 'submitting_docs')) ) { 
            if (op.Lender_Status_Unifed_Text__c == 'initial_approval') {
                op.Stagename = 'Initial Approval';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'full_approval') {
                op.Stagename = 'Full Approval';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'pending_disbursement') {
                op.Stagename = 'Pending Disbursement';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'disbursed') {
                op.Stagename = 'Offer Accepted';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'expired') {
                op.Stagename = 'Expired';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'full_app_completed') {
                op.Stagename = 'Lender Doc Review';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'hard_decline') {
                op.Stagename = 'Declined';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'pending') {
                op.Stagename = 'Pending';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'pending_certification') {
                op.Stagename = 'Pending Disbursement';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'soft_decline') {
                op.Stagename = 'Declined';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'submitting_docs') {
                op.Stagename = 'Initial Approval';
                }
            else if (op.Lender_Status_Unifed_Text__c == 'withdrawn') {
                op.Stagename = 'Withdrawn';
                }
            
        }
        
        
    }
}