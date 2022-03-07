public with sharing class LeadRelationshipManagerAsync {
    public static Boolean stopRecursion = false;
    public static Integer MIN_BATCH_SIZE = 40;

    public static void processLeads(Set<ID> lead_ids) {
        if (stopRecursion) {
            return;
        }
        List<Set<ID>> ranges = generateRanges(lead_ids);
        for (Set<ID> range : ranges) {
            asyncProcessLeads(range);
        }
    }

    @future
    public static void asyncProcessLeads(Set<ID> lead_ids) {
        stopRecursion = true;
        LeadRelationshipManager.leadToLead(lead_ids);
        LeadRelationshipManager.leadToAccount(lead_ids);
    }

    public static void leadToLead(Set<ID> lead_ids) {
        //processLeads(lead_ids);
        //return;
        if (stopRecursion) {
            return;
        }
        lead_ids.addAll(LeadRelationshipManager.needLeadToLead(100));
        List<Set<ID>> ranges = generateRanges(lead_ids);
        for (Set<ID> range : ranges) {
            asyncLeadToLead(range);
        }
    }

    @future
    public static void asyncLeadToLead(Set<ID> lead_ids) {
        system.debug('LeadToLead');
        stopRecursion = true;
        LeadRelationshipManager.leadToLead(lead_ids);
    }

    public static void leadToAccount(Set<ID> lead_ids) {
        //return;
        if (stopRecursion) {
            return;
        }
        lead_ids.addAll(LeadRelationshipManager.needLeadToAccount(100));
        List<Set<ID>> ranges = generateRanges(lead_ids);
        for (Set<ID> range : ranges) {
            asyncLeadToAccount(range);
        }
    }

    @future
    public static void asyncLeadToAccount(Set<ID> lead_ids) {
        system.debug('LeadToAccount');
        stopRecursion = true;
        LeadRelationshipManager.leadToAccount(lead_ids);
    }

    public static void accountToLead(Set<ID> account_ids) {
        if (stopRecursion) {
            return;
        }
        List<Set<ID>> ranges = generateRanges(account_ids);
        for (Set<ID> range : ranges) {
            asyncAccountToLead(range);
        }
    }

    @future
    public static void asyncAccountToLead(Set<ID> ids) {
        system.debug('AccountToLead');
        stopRecursion = true;
        LeadRelationshipManager.accountToLead(ids);
    }

    public static void opportunityToAccount(Set<ID> oppotunity_ids) {
        if (stopRecursion) {
            return;
        }
        List<Set<ID>> ranges = generateRanges(oppotunity_ids);
        for (Set<ID> range : ranges) {
            asyncOpportunityToAccounts(range);
        }
    }

    @future
    public static void asyncOpportunityToAccounts(Set<ID> opportunity_ids) {
        system.debug('OpportunityToAccounts');
        stopRecursion = true;
        LeadRelationshipManager.opportunityToAccount(opportunity_ids);
    }

    public static void convertLead(Set<ID> lead_ids) {
        //return;
        if (stopRecursion) {
            return;
        }
        lead_ids.addAll(LeadConverter.needConvert(100));
        List<Set<ID>> ranges = generateRanges(lead_ids);
        for (Set<ID> range : ranges) {
            asyncConvert(range);
        }
    }

    @future
    public static void asyncConvert(Set<ID> lead_ids) {
        system.debug('asyncConvert');
        stopRecursion = true;

        List<Lead> leads;
        Integer retry = 0;
        while (leads == null && retry != 5) {
            try {
                leads = LeadConverter.loadConvert(lead_ids);
            } catch (Exception ex) {
                retry++;
                wait(5000);
            }
        }
        if (leads != null) {
            LeadConverter.process(leads);
        }
    }


    public static void wait(Integer millisec) {
        if (millisec == null || millisec < 0) {
            millisec = 0;
        }

        Long startTime = DateTime.now().getTime();
        Long finishTime = DateTime.now().getTime();

        while ((finishTime - startTime) < millisec) {
            finishTime = DateTime.now().getTime();
        }
    }


    public static Integer batchSize(Integer size) {
        Integer per_transaction = (Integer) (size / 49.0).round(RoundingMode.UP);
        return per_transaction > MIN_BATCH_SIZE ? per_transaction : MIN_BATCH_SIZE;
    }

    public static List<Set<ID>> generateRanges(Set<ID> ids) {
        return generateRanges(ids, batchSize(ids.size()));
    }

    public static List<Set<ID>> generateRanges(Set<ID> ids, Integer size) {
        List<Set<ID>> ranges = new List<Set<ID>>();
        Set<ID> partition = new Set<ID>();
        for (ID id : ids) {
            partition.add(id);
            if (partition.size() == size) {
                ranges.add(partition.clone());
                if (ranges.size() == 50) {
                    return ranges;
                }
                partition.clear();
            }
        }
        if (!partition.isEmpty()) {
            ranges.add(partition);
        }
        return ranges;
    }
}