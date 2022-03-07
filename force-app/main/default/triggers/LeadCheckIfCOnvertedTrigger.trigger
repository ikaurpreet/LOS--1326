trigger LeadCheckIfCOnvertedTrigger on Lead (before insert) {
      // DEACTIVATED TRIGGERS STILL COUNT TOWARD CODE COVERAGE, SO I COMMENTED OUT THE CODE
   
    //Find Leads to run trigger on
    // List<Lead> submissionLeads = new List<Lead>();
    // for (Lead lead : Trigger.new) {
    //     if(lead.recordTypeId != '01261000000oQBP') {
    //         submissionLeads.add(lead);
    //     }
    // }
    
    // LeadRelationshipManager.check_if_lead_converted(submissionLeads);
}