({
    getHardCreditPulls: function(cmp, uuid) {
        cmp.set('v.loading', true);
        cmp.set('v.error', null);
        var env = cmp.get('v.env');
        var recordLimits = 10;
        var defaultOffset = 0;
        var submissionUuid = cmp.get('v.submissionUuid');
        var participantType = cmp.get('v.participantType');
        var operationName = 'mortgagesSalesforceHardCreditPulls';
        var payload = {
            operationName: operationName,
            query: 'query ' + operationName +'($submissionUuid: ID!, $limit: Int, $offset: Int) {'
                    + operationName +'(submissionUuid: $submissionUuid, limit: $limit, offset: $offset) {'
                      + 'reportType,'
                      + 'borrower {'
                        + 'uuid,'
                        + 'status,'
                        + 'outcome,'
                        + 'description,'
                        + 'error,'
                        + 'createdAt'
                      + '},'
                      + 'coBorrower {'
                        + 'uuid,'
                        + 'status,'
                        + 'outcome,'
                        + 'description,'
                        + 'error,'
                        + 'createdAt'
                    + '}'
                    + '}'
                  + '}',
            variables: {
                submissionUuid: submissionUuid,
                limit: recordLimits,
                offset: defaultOffset
            }
        }
    
        var promise = this.callServerMethod(cmp, 'request', { env: env, jsonBody: JSON.stringify(payload)})
        promise.then((response) => {
            var queryResponse = JSON.parse(response);
            console.log('Response:', queryResponse);
            var data = queryResponse.data[operationName];
            cmp.set('v.hardCreditPulls', data[participantType]);
            cmp.set('v.reportType', data.reportType);
        }, (errors) => {
            console.error(errors);
        });
    },
    getColumns: function(cmp) {
        var columns = [
            {
                type: 'text',
                label: 'Uuid',
                fieldName: 'uuid',
                initialWidth: 300
            },
            {
                type: 'text',
                fieldName: 'status',
                label: 'Status'
            },
            {
                type: 'text',
                fieldName: 'outcome',
                label: 'Outcome',
            },
            {
                type: 'text',
                fieldName: 'description',
                label: 'Description',
            },
            {
                type: 'text',
                fieldName: 'error',
                label: 'Error',
            },
            {
                type: 'date',
                fieldName: 'createdAt',
                label: 'Created At',
                initialWidth: 200,
                typeAttributes: {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                }
            }
        ];
        cmp.set('v.columns', columns);
    },
    selectRow: function(cmp, event) {
        var selectedRows = event.getParam('selectedRows');
        var hardCreditPull = selectedRows[0];
        cmp.set('v.hardCreditPull', null);
        cmp.set('v.hardCreditPull', hardCreditPull);
    },
    requestHardCreditPull: function(cmp, event) {
        if (window.confirm("Do you really want to request hard credit pull for this submission?")) {
            const button = cmp.find('rerun-hard-credit-pull');
            button.set('v.disabled', true);
            cmp.set('v.error', null);
            cmp.set('v.success', null);
            cmp.set('v.loading', event);
            const submissionUuid = cmp.get('v.submissionUuid');
            const type = cmp.get('v.participantType');
            const env = cmp.get('v.env');
            const operationName = 'mortgagesSalesforceRerunHardCreditPull';

            const payload = {
                operationName: operationName,
                query: `mutation ${operationName}($input: SalesforceHardCreditPullRerunTypeInput) { ${operationName}(input: $input) }`,
                variables: {
                    input: {
                        submissionUuid: submissionUuid,
                        type: this.camelToSnakeCase(type)
                    }
                }
            };

            const promise = this.callServerMethod(cmp, 'request', { env: env, jsonBody: JSON.stringify(payload)})
            promise.then((_response) => {
                cmp.set('v.success', "Request has been sent. Please wait ~1 min for new run to be completed.");
                setTimeout(() => {
                    this.getHardCreditPulls(cmp);
                    cmp.set('v.success', null);
                    button.set('v.disabled', false);
                }, 20 * 1000); //20 sec
            }, (error) => {
                console.error(error);
                cmp.set('v.error', error.message);
                button.set('v.disabled', false);
            });
        }
    },
   camelToSnakeCase: function(value) {
     return value.replace(/(.)([A-Z][a-z]+)/, '$1_$2').replace(/([a-z0-9])([A-Z])/, '$1_$2').toLowerCase();
    }
})