public class EmailTriggerHandler {
    public static Boolean firstcall = false;
    private static Id homePurchaseRecordTypeId;
    private static Id reFiRecordTypeId;

    static {
        homePurchaseRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName()
            .get('HomePurchase')
            .getRecordTypeId();
        reFiRecordTypeId = Schema.SObjectType.Opportunity.getRecordTypeInfosByName()
            .get('MortgageRefi')
            .getRecordTypeId();
    }

    public static Opportunity matchOpporunity(String stringToMatchIn, Email_Opportunity_Matcher__mdt eom) {
        List<Opportunity> opps = null;
        String query = 'SELECT id, Name, Encompass_Loan_Number__c, USPS_Verified_Address__c, External_ID__c, Escrow__c, mortgage_Property_Address__c, '
            + 'Settlement_File_Number__c, Test_Opportunity__c FROM Opportunity WHERE IsClosed = FALSE AND Test_Opportunity__c = FALSE '
            + 'AND (RecordTypeId = \'' + homePurchaseRecordTypeId + '\' OR RecordTypeId = \'' + reFiRecordTypeId + '\') AND ';
        List<String> matches = new List<String>();
        Pattern p = Pattern.compile(eom.Regular_Expression_Pattern__c);
        Matcher matcher = p.matcher(stringToMatchIn);
        String likeString = '';
        while (matcher.find()) {
            if (!String.isBlank(likeString)) {
                likeString += ' AND ';
            }
            if (eom.Match_Exactly__c) {
                likeString += eom.Opportunity_Field_API_Name__c + ' = \'' + matcher.group(1) + '\'';
            } else {
                likeString += eom.Opportunity_Field_API_Name__c + ' LIKE \'%' + matcher.group(1) + '%\'';
            }
        }
        if (!String.isBlank(likeString)) {
            String finalQuery = query + likeString + ' limit 1';
            opps = Database.query(finalQuery);
            if (opps != null && !opps.isEmpty()) {
                return opps[0];
            }
        }
        return null;
    }

    public static void findOpportunity(List<EmailMessage> e) {
        Id parentId = e[0].ParentId;
        if (
            parentId != null &&
            parentId.getSobjectType() == Schema.Case.SObjectType &&
            String.isNotBlank(e[0].Subject)
        ) {

            List<Email_Opportunity_Matcher__mdt> mcs = 
                [
                    SELECT 
                        Opportunity_Field_API_Name__c,
                        Order_Number__c,
                        Match_Exactly__c,
                        Regular_Expression_Pattern__c
                    FROM
                        Email_Opportunity_Matcher__mdt
                    ORDER BY
                        Order_Number__c ASC
                ];
            for (Email_Opportunity_Matcher__mdt matcher : mcs) {
                Opportunity o = matchOpporunity(e[0].Subject, matcher);
                if (o != null) {
                    e[0].Opportunity__c = o.Id;
                    e[0].Admin_Notes_Long__c = updateAdminNotes(
                        e[0].Admin_Notes_Long__c,
                        (String)o.get(matcher.Opportunity_Field_API_Name__c),
                        matcher.Opportunity_Field_API_Name__c
                    );
                    break;
                }
            }

            if (e[0].Opportunity__c != null) {
                Case cs = new Case(
                    Id = parentId,
                    Opportunity__c = e[0].Opportunity__c
                );
                try {
                    update cs;
                } catch (Exception ex) {
                    system.debug(ex);
                }
            }
        }
    }

    static String updateAdminNotes(
        String notes,
        String addlData,
        String field
    ) {
        if (String.isNotBlank(notes)) {
            if (String.isNotBlank(addlData)) {
                notes += field + ': ' + addlData;
            }
        } else {
            if (String.isNotBlank(addlData)) {
                notes = field + ': ' + addlData;
            }
        }
        return notes;
    }
}