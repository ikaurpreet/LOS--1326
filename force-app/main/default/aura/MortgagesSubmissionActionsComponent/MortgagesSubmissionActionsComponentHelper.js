({
    salesforceSync : function(component) {
        var submission = component.get('v.submission');
        var record = component.find("record").get("v.value")
        var env = component.get('v.env');
        component.set('v.buttonLoading', 'sync');
        var schemaName;
        var mode = 'sync';
        var id = submission.uuid;
        var mutationName = 'mortgageSalesforceSync'
        if (record === 'Opportunity') {
            schemaName = submission.vertical === 'refinance' ? 'Modern::Opportunity::Refinance' : 'Modern::Opportunity::Purchase';
        }
        if (record === 'Participants') {
            schemaName = 'Modern::Participant'
            id = submission.uuid
            mode = 'multisync'
        }
        if (record === 'CoBorrower') {
            schemaName = 'Modern::CoBorrower'
            id = submission.uuid
            mode = 'multisync'
        }
        if (record === 'Account') {
            schemaName = 'Modern::Account'
            id = submission.borrower.profile.userUuid
        }
        if (record === 'Documents') {
            schemaName = 'Document'
            id = submission.uuid
            mode = 'multisync'
            mutationName = 'docSalesforceSync'
        }
        if (record === 'Tasks') {
            schemaName = 'Task'
            id = submission.uuid
            mode = 'multisync'
            mutationName = 'taskSalesforceSync'
        }
        if (record === 'Leads') {
            schemaName = 'Legacy::Lead'
            id = submission.uuid
            mode = 'multisync'
        }
        var variables = {
            ids: [id],
            schemaName: schemaName,
            mode: mode
        }
        var query = {
            variables: variables,
            operationName: mutationName,
            query: `mutation ${mutationName}($ids: [ID!]!, $schemaName: String!, $mode: String!) {
                ${mutationName}(ids: $ids, schemaName: $schemaName, mode: $mode) {
                    uuid
                    createdAt
                    completedAt
                    ids
                    schemaName
                    mode
                    results
                    status
                }
            }`
        }
        var promise = this.callServerMethodWithoutLoading(component, 'graphql', { env: env, jsonBody: JSON.stringify(query) });

        promise.then((response) => {
            var data = JSON.parse(response);
            component.set('v.buttonLoading', null);
            this.fetchStats(component);
        }, (error) => {
            component.set('v.buttonLoading', null);
        });
    },

    fetchStats: function(component) {
        var fields = `
            uuid
            createdAt
            completedAt
            ids
            schemaName
            mode
            results
            status
        `;
        var queryDefinition = `query salesforceStats($submissionUuids: [ID!]!, $userUuids: [ID!]!) {
            refinance: mortgageSalesforceSyncStats(ids: $submissionUuids, schemaName: "Modern::Opportunity::Refinance", mode: "sync") {
                ${fields}
            }
            purchase: mortgageSalesforceSyncStats(ids: $submissionUuids, schemaName: "Modern::Opportunity::Purchase", mode: "sync") {
                ${fields}
            }
            lead: mortgageSalesforceSyncStats(ids: $submissionUuids, schemaName: "Legacy::Lead", mode: "multisync") {
                ${fields}
            }
            tasks: taskSalesforceSyncStats(ids: $submissionUuids, schemaName: "Task", mode: "multisync") {
                ${fields}
            }
            docs: docSalesforceSyncStats(ids: $submissionUuids, schemaName: "Document", mode: "multisync") {
                ${fields}
            }
            participants: mortgageSalesforceSyncStats(ids: $submissionUuids, schemaName: "Modern::Participant", mode: "multisync") {
                ${fields}
            }
            coBorrower: mortgageSalesforceSyncStats(ids: $submissionUuids, schemaName: "Modern::CoBorrower", mode: "multisync") {
                ${fields}
            }
            account: mortgageSalesforceSyncStats(ids: $userUuids, schemaName: "Modern::Account", mode: "sync") {
                ${fields}
            }
          }
        `;
        var submission = component.get('v.submission');
        var env = component.get('v.env');
        var variables = { submissionUuid: submission.uuid, userUuid: submission.borrower.profile.userUuid, submissionUuids: [submission.uuid], userUuids: [submission.borrower.profile.userUuid] };
        var query = {
            variables: variables,
            operationName: 'salesforceStats',
            query: queryDefinition
        };
        var promise = this.callServerMethodWithoutLoading(component, 'graphql', { env: env, jsonBody: JSON.stringify(query) });
        component.set('v.jobsLoading', true);

        promise.then((response) => {
            var data = JSON.parse(response);
            var jobs = [].concat(...Object.values(data.data)).sort((a,b) => {
                return Date.parse(b.createdAt) - Date.parse(a.createdAt)
            });
            component.set('v.jobs', jobs);
            this.getJobsColumns(component);
            component.set('v.jobsLoading', false);
        }, (error) => {
            component.set('v.jobsLoading', false);
        });
    },
    getJobsColumns : function(cmp) {
        var columns = [
            {
                type: 'text',
                fieldName: 'uuid',
                label: 'Uuid',
            },
            {
                type: 'text',
                fieldName: 'schemaName',
                label: 'Schema Name',
            },
            {
                type: 'date',
                fieldName: 'createdAt',
                label: 'Created At',
                typeAttributes: {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                },
                sortable: true
            },
            {
                type: 'date',
                fieldName: 'completedAt',
                label: 'Completed At',
                typeAttributes: {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                },
                sortable: true
            },
            {
                type: 'text',
                fieldName: 'status',
                label: 'Status'
            }
        ];
        cmp.set('v.jobsColumns', columns);
    },
    setQaEnvName: function(component) {
        var env = component.get('v.env');
        var promise = this.callServerMethod(component, 'qaEnvName', { env: env });

        promise.then((qaEnvName) => {
            component.set('v.qaEnvName', qaEnvName);
        }, (errors) => {
            var error = errors[0];
            var message = error.message;
            if (error.stackTrace) {
                message = `${message}\n${error.stackTrace}`;
            }
            this.showErrorMessage(component, message, 5000);
            component.set('v.qaEnvName', '');
        });
    },

    requestImpersonation: function(component) {
        var submission = component.get('v.submission');
        var env = component.get('v.env');
        component.set('v.buttonLoading', 'requestImpersonation');
        var promise = this.callServerMethodWithoutLoading(component, 'requestImpersonation', { userUuid: submission.borrower.profile.userUuid, env: env });
        promise.then((response) => {
            var impersonate = JSON.parse(response);
            var env_prefix = '';
            if (env !== 'PRODUCTION') {
                env_prefix = component.get('v.qaEnvName') + '.qa.';
            }

            impersonate.url = 'https://'+ env_prefix + 'credible.com/impersonation?uuid=' + impersonate.uuid + '&impersonatee=' + impersonate.impersonatee;
            component.set('v.impersonate', impersonate);
            component.set('v.buttonLoading', null);
        }, (errors) => {
            var error = errors[0];
            var message = error.message;
            if (error.stackTrace) {
                message = `${message}\n${error.stackTrace}`;
            }
            this.showErrorMessage(component, message, 5000);
            component.set('v.buttonLoading', null);
        });
    },
    fireSubmissionEvent: function(component, event) {
        var submission = component.get('v.submission');
        var env = component.get('v.env');
        component.set('v.buttonLoading', event);
        var promise = this.callServerMethodWithoutLoading(component, 'fireSubmissionEvent', { uuid: submission.uuid, env: env, event: event });
        promise.then((response) => {
            this.showInfoMessage(component, `Submission event ${event} fired`, 5000);
            component.set('v.buttonLoading', null);
        }, (errors) => {
            var error = errors[0];
            var message = error.message;
            if (error.stackTrace) {
                message = `${message}\n${error.stackTrace}`;
            }
            this.showErrorMessage(component, message, 5000);
            component.set('v.buttonLoading', null);
        });
    },
    clearMessages: function(component) {
        component.set('v.error', null);
        component.set('v.message', null);
    },
    showInfoMessage: function(component, message, timeout) {
        component.set('v.message', message);
        setTimeout(() => component.set('v.message', null), timeout);
    },
    showErrorMessage: function(component, message, timeout) {
        if(!component.get('v.authId')) {
            component.set('v.error', message);
            setTimeout(() => component.set('v.error', null), timeout);
        }
    },
    archive: function(component) {
        component.set('v.error', null);
        if (window.confirm("Do you really want to archive submission?")) {
            var submission = component.get('v.submission');
            var env = component.get('v.env');
            component.set('v.buttonLoading', 'archive');
            var promise = this.callServerMethodWithoutLoading(component, 'archiveSubmission', { uuid: submission.uuid, env: env});
            promise.then((response) => {
                this.showInfoMessage(component, `Submission archived`, 5000);
                component.set('v.buttonLoading', null);
                component.set("v.submission.status", "archived");
                component.set("v.isFinalStatus", true);
            }, (errors) => {
                var error = errors[0];
                var message = error.message;
                if (error.stackTrace) {
                    message = `${message}\n${error.stackTrace}`;
                }
                this.showErrorMessage(component, message, 10000);
                component.set('v.buttonLoading', null);
            });
        }
    },
    unArchive: function(component) {
        var submission = component.get('v.submission');
        var env = component.get('v.env');

        if (!(window.confirm(`Are you sure to update submission status from '${submission.status}' to '${submission.previousNonArchivedStatus}'?`)))
            return;

        component.set('v.buttonLoading', 'unarchive');
        var promise = this.callServerMethodWithoutLoading(component, 'unarchiveSubmission', { uuid: submission.uuid, env: env});
        promise.then((response) => {
            this.showInfoMessage(component, `Submission status was updated successfully`, 5000);
            component.set('v.buttonLoading', null);
            component.set("v.isFinalStatus", false);
        }, (errors) => {
            var error = errors[0];
            if (error.stackTrace) {
                console.log(`${error.message}\n${error.stackTrace}`);
            }
            this.showErrorMessage(component, error.message, 10000);
            component.set('v.buttonLoading', null);
        });
    },


    isFinalStatus: function(component) {
        var submission = component.get('v.submission');
        return [
            'applicationWithdrawn',
            'fileClosedForIncompleteness',
            'closedLoan',
            'applicationDenied',
            'archived',
            'offerAccepted'
        ].includes(submission.status);
    }
})