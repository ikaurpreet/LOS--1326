({
    init:function(cmp) {
        this.initControls(cmp);
        this.search(cmp);
    },
    search: function(cmp) {
        var service = cmp.get('v.service');
        var source = cmp.get('v.source');
        
        if (service === 'pointserv') {
            this.searchDocsApi(cmp);
        } else if (service === 'mortech' && source === 'submission') {
            this.loadMortechData(cmp);
        } else if (service == 'lenderIntegration' && source === 'submission') {
            this.loadLenderIntegrationData(cmp);
        } else {
            this.searchMortgagesApi(cmp);
        }
    },
    searchDocsApi: function(cmp) {
        cmp.set('v.request', null);
        cmp.set("v.requests", null);
        var submission = cmp.get('v.submission')
        var env = cmp.get('v.env')
        cmp.set('v.source', 'submission');
        var variables = { submissionUuid: submission.uuid };
        cmp.set('v.noRequests', null);
        cmp.set('v.request', null);

        var query = {
            variables: variables,
            operationName: 'pointservAudit',
            query: `query pointservAudit($submissionUuid: String) {
                pointservAudit(submissionUuid: $submissionUuid) {
                uuid
                name
                responseSize
                requestSize
              }
            }`
        }
        var promise = this.callServerMethod(cmp, 'request', { env: env, jsonBody: JSON.stringify(query) });
        promise.then((response) => {
            var returnValue = JSON.parse(response);
            var data = returnValue.data.pointservAudit;
            if (data !== null && data.length > 0) {
                data.forEach((item) => {
                    item.requestText = item.request || '';
                    item.responseText = item.response || '';
                })
                cmp.set('v.request', data[0]);
                cmp.set("v.requests", data);
                window.setTimeout(
                    $A.getCallback(() => {
                        this.loadPointservData(cmp);
                    }), 100
                );
            } else {
                cmp.set('v.noRequests', true);
            }
        }, () => {});
    },
    searchMortgagesApi: function(cmp) {
        var service = cmp.get('v.service');
        var submission = cmp.get('v.submission')
        var env = cmp.get('v.env')
        var source = cmp.get('v.source');
        var variables = { service: service };
        cmp.set('v.noRequests', null);
        cmp.set('v.request', null);
        if(source === 'user') {
            variables.userUuid = submission.borrower.profile.userUuid;
        } else {
            variables.submissionUuid = submission.uuid;
        }

        var query = {
            variables: variables,
            operationName: 'mortgagesSalesforceAuditThirdParty',
            query: `query mortgagesSalesforceAuditThirdParty($userUuid: ID, $submissionUuid: ID, $service: String!) {
                mortgagesSalesforceAuditThirdParty(userUuid: $userUuid, submissionUuid: $submissionUuid, service: $service) {
                name
                response
                request
              }
            }`
        }
        var promise = this.callServerMethod(cmp, 'request', { env: env, jsonBody: JSON.stringify(query) });
        promise.then((response) => {
            var returnValue = JSON.parse(response);
            var data = returnValue.data.mortgagesSalesforceAuditThirdParty;
            if (data !== null && data.length > 0) {
                data.forEach((item) => {
                    item.uuid = item.name;
                    item.requestText = JSON.stringify(item.request, null, '  ');
                    item.responseText = JSON.stringify(item.response, null, '  ');
                })
                cmp.set('v.request', data[0]);
                cmp.set("v.requests", data)
            } else {
                cmp.set('v.noRequests', true);
            }
        }, () => {});
    },
    loadPointservData: function(cmp) {
        var request = cmp.get('v.request')
        var source = cmp.get('v.sourceType');
        var size = request[`${source}Size`];
        var capitalizeSource = `${source[0].toUpperCase()}${source.slice(1)}`;
        // If source size more then 1mb, download it directly from s3
        if (size === null) {
            request[`${source}Text`] = `${capitalizeSource} not exist`;
            cmp.set('v.request', request);
            return;
        }
        if (size > 1048576) {
            this.loadS3Source(cmp);
        } else {
            this.loadGraphqlSource(cmp)
        }
    },
    loadGraphqlSource: function(cmp) {
        var orderUuid = cmp.get('v.request').uuid;
        var source = cmp.get('v.sourceType');
        var env = cmp.get('v.env')
        var variables = { orderUuid: orderUuid };
        var query = {
            variables: variables,
            operationName: 'pointservAudit',
            query: `query pointservAudit($orderUuid: String) {
                pointservAudit(orderUuid: $orderUuid) {
                ${source}
              }
            }`
        }
        var promise = this.callServerMethod(cmp, 'request', { env: env, jsonBody: JSON.stringify(query) });
        promise.then((response) => {
            var returnValue = JSON.parse(response);
            var data = returnValue.data.pointservAudit;
            if (data !== null && data.length > 0) {
                var request = cmp.get('v.request')
                request[source] = data[0][source];
                request[`${source}Text`] = data[0][source];
                cmp.set('v.request', request);
            }
        }, (error) => {});
    },
    loadS3Source: function(cmp) {
        var source = cmp.get('v.sourceType');
        var request = cmp.get('v.request');
        var capitalizeSource = `${source[0].toUpperCase()}${source.slice(1)}`;
        if(confirm(`${capitalizeSource} is to large to display. Do you want to download ${source} file to your hard drive?`)) {
            var orderUuid = cmp.get('v.request').uuid;
            var source = cmp.get('v.sourceType');
            var env = cmp.get('v.env')
            var variables = { orderUuid: orderUuid, type: source };
            var query = {
                variables: variables,
                operationName: 'pointservIssueAuthorization',
                query: `mutation pointservIssueAuthorization($orderUuid: ID!, $type: String!) {
                    pointservIssueAuthorization(orderUuid: $orderUuid, type: $type) 
                  }`
            }
            var promise = this.callServerMethod(cmp, 'request', { env: env, jsonBody: JSON.stringify(query) });
            promise.then((response) => {
                var returnValue = JSON.parse(response);
                var data = returnValue.data.pointservIssueAuthorization;
                var request = cmp.get('v.request');
                request[`${source}Text`] = `${capitalizeSource} downloaded!`
                cmp.set('v.request', request);
                window.open(data);
            }, () => {});
        } else {
            request[`${source}Text`] = `${capitalizeSource} file to large!`;
            cmp.set('v.request', request);
            
        }
    },
    loadLenderIntegrationData: function(cmp, field) {
        var submission = cmp.get('v.submission');
        var env = cmp.get('v.env');
        var query = {
            variables: { submissionUuid: submission.uuid },
            operationName: 'getMortgagesDeclineLenderRequestsResponses',
            query: `query getMortgagesDeclineLenderRequestsResponses($submissionUuid: ID!) { getMortgagesDeclineLenderRequestsResponses(submissionUuid: $submissionUuid) { uuid, request, response } }`
        };
        
        var promise = this.callServerMethod(cmp, 'request', { env: env, jsonBody: JSON.stringify(query) });
        promise.then((response) => {
            var returnValue = JSON.parse(response);
            var data = returnValue.data.getMortgagesDeclineLenderRequestsResponses;
            data.forEach((item) => {
                item.name = item.uuid + '-lenderIntegration'
                item.requestText = JSON.stringify(item.request, null, '  ');
                item.responseText = JSON.stringify(item.response, null, '  ');
            })
            cmp.set('v.noRequests', null);
            cmp.set('v.request', data[0]);
            cmp.set("v.requests", data);
        }, (errors) => {
            var error_msg = errors[0].message;
            if (error_msg.includes("Couldn\'t find any LenderApiRequest")) { 
                this.requests_not_found(cmp);
            } else {
                const error = errors[0];
                reject(error);
            }
        });
    },
    loadMortechData: function(cmp, field) {
        var submission = cmp.get('v.submission');
        var env = cmp.get('v.env');
        var query = {
            variables: { submissionUuid: submission.uuid },
            operationName: 'getMortgagesDeclineMortechRequestsResponses',
            query: `query getMortgagesDeclineMortechRequestsResponses($submissionUuid: ID!) { getMortgagesDeclineMortechRequestsResponses(submissionUuid: $submissionUuid) { uuid, request, response } }`
        };
        
        var promise = this.callServerMethod(cmp, 'request', { env: env, jsonBody: JSON.stringify(query) });
        promise.then((response) => {
            var returnValue = JSON.parse(response);
            var data = returnValue.data.getMortgagesDeclineMortechRequestsResponses;
            data.forEach((item) => {
                item.name = item.uuid + '-mortech'
                item.requestText = JSON.stringify(item.request, null, '  ');
                item.responseText = JSON.stringify(item.response, null, '  ');
            })
            cmp.set('v.noRequests', null);
            cmp.set('v.request', data[0]);
            cmp.set("v.requests", data);
        }, (errors) => {
            var error_msg = errors[0].message;
            if (error_msg.includes("Couldn\'t find any Execution")) { 
                this.requests_not_found(cmp);
            } else {
                const error = errors[0];
                reject(error);
            }
        });
    },
    changeRequest: function(cmp, requestName) {
        var requests = cmp.get('v.requests');
        var service = cmp.get('v.service');
        requests.forEach((request) => {
            if(request.uuid === requestName) {
                cmp.set('v.request', request);
                if (service === 'pointserv') {
                    this.loadPointservData(cmp);
                }
            }
        })
    },
    initControls: function(cmp) {
        cmp.set('v.sources', [{'label': 'User', 'value': 'user'}, {'label': 'Submission', 'value': 'submission'}])
        cmp.set('v.services', [
            {'label': 'USPS', 'value': 'usps'}, 
            {'label': 'House Canary', 'value': 'house_canary', disabled: true }, 
            {'label': 'Spruce', 'value': 'spruce'},
            {'label': 'PointServ', 'value': 'pointserv'},
            {'label': 'Mortech', 'value': 'mortech'},
            {'label': 'OLP Lender Integration', 'value': 'lenderIntegration'}
        ]);
        cmp.set('v.sourceTypes', [{'label': 'Request', 'value': 'request'}, {'label': 'Response', 'value': 'response'}]);
    },
    requests_not_found: function(cmp) {
        cmp.set('v.error', null);      // hide the Red Error message
        cmp.set('v.noRequests', true); // show 'Requests not found' message
        cmp.set('v.request', null);    // hide the Requests list box
        cmp.set('v.requests', null);   // hide the JSON/XML box
    }
})