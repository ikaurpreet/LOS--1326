@isTest
private class MortgagesSubmissionTest {
    @isTest
    static void initialize() {
        MortgagesSubmission submission = new MortgagesSubmission();
        submission.uuid = 'uuid';
        submission.env = MortgagesConstants.Env.TEST;
        submission.vertical = MortgagesConstants.Vertical.HomePurchase;
        submission.status = 'FIP';
        System.assertEquals(true, submission.isPurchase);
        submission.vertical = MortgagesConstants.Vertical.MortgageRefi;
        System.assertEquals(true, submission.isRefinance);
    }

    @isTest
    static void createFromLead() {
        String uuid = 'uuid_lead';
        String vertical = 'refinance';
        String env = 'stage';
        String status = 'submissionStatus';

        Lead lead = new Lead(mortgage_Submission_UUID__c = uuid,
                Full_Submission_Status__c = status,
                User_Role__c = 'borrower',
                Submission_ID__c = 'uuid_submission',
                Participant_ID__c = env + '_id',
                LastName = 'LastName',
                SubmissionType__c = vertical);
        insert lead;

        insert createMortgagesStageSettings();

        MortgagesSubmission submission = MortgagesSubmission.create(lead);

        System.assertEquals(submission.uuid, uuid);
        System.assertEquals(submission.vertical, MortgagesConstants.Vertical.MortgageRefi);
        System.assertEquals(submission.env, MortgagesConstants.Env.TEST);
        // System.assertNotEquals(submission.graphqlClient, null);
        // System.assertNotEquals(submission.settings, null);
        System.assertEquals(submission.status, status);
    }

    @isTest
    static void createFromOpportunity() {
        String vertical = 'refinance';
        String env = 'stage';
        String status = 'submissionStatus';
        String submissionUuid = 'submission_uuid';
        String submissionId = 'submissionId';
        String opportunityStage = 'FIP';
        Opportunity opportunity = MortgagesTestFactory.createOpportunity(env, submissionId, submissionUuid, status, opportunityStage, vertical, null);

        insert createMortgagesStageSettings();

        MortgagesSubmission submission = MortgagesSubmission.create(opportunity);

        System.assertEquals(submission.uuid, submissionUuid);
        System.assertEquals(submission.vertical, MortgagesConstants.Vertical.MortgageRefi);
        System.assertEquals(submission.env, MortgagesConstants.Env.TEST);
        // System.assertNotEquals(submission.graphqlClient, null);
        // System.assertNotEquals(submission.settings, null);
        System.assertEquals(submission.status, status);
    }

    @isTest
    static void knownSubmissionStatuses() {
        Map<String, MortgagesSubmission.Status> supportedStatuses = new Map<String, MortgagesSubmission.Status> {
            'initial_processing' => MortgagesSubmission.Status.initial_processing,
            'broker_processing' => MortgagesSubmission.Status.broker_processing,
            'submitted_to_lender' => MortgagesSubmission.Status.submitted_to_lender,
            'initial_approval' => MortgagesSubmission.Status.initial_approval,
            'cleared_to_close' => MortgagesSubmission.Status.cleared_to_close,
            'closing_disclosure_sent' => MortgagesSubmission.Status.closing_disclosure_sent,
            'closed_loan' => MortgagesSubmission.Status.closed_loan,
            'archived' => MortgagesSubmission.Status.archived,
            'application_denied' => MortgagesSubmission.Status.application_denied,
            'application_withdrawn' => MortgagesSubmission.Status.application_withdrawn,
            'file_closed_for_incompleteness' =>MortgagesSubmission.Status.file_closed_for_incompleteness
        };
        for(String status : supportedStatuses.keySet()) {
            MortgagesSubmission.Status actual = MortgagesSubmission.status(status);
            System.assertEquals(supportedStatuses.get(status), actual);
        }
    }

    @isTest
    static void failIfUnknownStatus() {
        String errorMessage = null;
        try {
            MortgagesSubmission.status('unknown_status');
            System.assert(false, 'Exception was expected at this point.');
        } catch (System.IllegalArgumentException e) {
            errorMessage = e.getMessage();
        }
        System.assert(errorMessage.contains('Unknown submission status "unknown_status".'));
    }

    @isTest
    static void configuredGraphQlSubmissionStatuses() {
        Map<MortgagesSubmission.Status, String> graphQlSubmissionStatuses = new Map<MortgagesSubmission.Status, String> {
            MortgagesSubmission.Status.initial_processing =>'initialProcessing',
            MortgagesSubmission.Status.submitted_to_lender =>'submittedToLender',
            MortgagesSubmission.Status.initial_approval =>'initialApproval',
            MortgagesSubmission.Status.broker_processing =>'brokerProcessing',
            MortgagesSubmission.Status.cleared_to_close =>'clearedToClose',
            MortgagesSubmission.Status.closed_loan =>'closedLoan',
            MortgagesSubmission.Status.closing_disclosure_sent =>'closingDisclosureSent',
            MortgagesSubmission.Status.archived =>'archived',
            MortgagesSubmission.Status.application_denied =>'applicationDenied',
            MortgagesSubmission.Status.application_withdrawn =>'applicationWithdrawn',
            MortgagesSubmission.Status.file_closed_for_incompleteness =>'fileClosedForIncompleteness'
        };

        for (MortgagesSubmission.Status applicationStatus : graphQlSubmissionStatuses.keySet()) {
            String actualGraphQlStatus = MortgagesSubmission.graphQlSubmissionStatus(applicationStatus);
            System.assertEquals(graphQlSubmissionStatuses.get(applicationStatus), actualGraphQlStatus);
        }
    }

    static MortgagesStageSettings__c createMortgagesStageSettings() {
        MortgagesTestFactory.createDefaultClientCredentials();
        return new MortgagesStageSettings__c(
                Client_Id__c = 'clientId',
                Client_Secret__c = 'Client_Secret__c',
                GraphQL_Url__c = 'GraphQL_Url__c',
                Token_Url__c = 'Token_Url__c'
        );
    }
}