({  
    initEnvs: function(cmp) {
       this.callServerMethod(cmp, 'getEnvs').then((data) => {
            var envs = JSON.parse(data)
            cmp.set('v.envs', envs);
            cmp.set('v.env', envs[0]);
            this.initialSearch(cmp)
       }); 
    },
    initialSearch: function(cmp, query) {
        // Clear values
        cmp.set('v.offset', 0);
        cmp.set('v.error', null);
        cmp.set("v.submissions", null);
        cmp.set('v.disableLoading', false);
        cmp.set('v.totalCount', null);

        var query = cmp.find('enter-search').get('v.value');
        var limit = cmp.get('v.limit') || 20;
        var offset = 0;
        
        cmp.set('v.pageLoading', true);
        var promise = this.search(cmp, query, limit, offset);
        
        promise.then(function(data) {
            cmp.set("v.submissions", data);
            cmp.set('v.pageLoading', false);
            if (data.length < limit) {
                cmp.set('v.disableLoading', true);
            }
        });

        promise.catch(function(error) {
            cmp.set("v.submissions", null);
            cmp.set('v.pageLoading', false);
        })
    },
    
    search: function(cmp, query, limit, offset) {
        var self = this;
        return new Promise(function(resolve, reject) {
            var env = cmp.find('env').get('v.value');
            var vertical = cmp.find('vertical').get('v.value');
            var status = cmp.find('status').get('v.value');
            var sortBy = cmp.get('v.sortBy');
            var sortDirection = cmp.get('v.sortDirection');
            var order = `${sortBy}:${sortDirection}`;
            var promise = self.callServerMethod(cmp, 'search', { query: query, status: status, env: env, vertical: vertical, order, limitRecords: limit, offsetRecords: offset });
            promise.then(function(response){
                var returnValue = JSON.parse(response);
                var data = returnValue.items;
                cmp.set('v.totalCount', returnValue.totalCount);
                data.forEach((item) => {
                    item.borrowerName = `${item.borrower.profile.firstName} ${item.borrower.profile.lastName}`;
                    item.email = item.borrower.profile.email;
                    item['url'] = `/apex/MortgagesSubmission?uuid=${item['uuid']}&env=${env}&vertical=${item['vertical']}&status=${item['status']}`;
                });
                resolve(data);
            });
            promise.catch(reject);
        })
        
    },

    loadMore: function(cmp) {
        if (cmp.get('v.disableLoading')) {
            return;
        }
        var query = cmp.find('enter-search').get('v.value');
        var limit = cmp.get('v.limit');
        var offset = cmp.get('v.offset') + limit;
        cmp.set('v.tableLoading', true);
        var promise = this.search(cmp, query, limit, offset);
        
        promise.then(function(data) {
            if (data.length > 0) {
                var submissions = cmp.get("v.submissions");
                submissions = submissions.concat(data);
                cmp.set('v.offset', offset);
                cmp.set("v.submissions", submissions);
            }
            
            if (data.length < limit) {
                cmp.set('v.disableLoading', true);
            }

            cmp.set('v.tableLoading', false);
        });

        promise.catch(function(error) {
            cmp.set('v.error', error.message);
            cmp.set("v.submissions", null);
            cmp.set('v.tableLoading', false);
        });
    },
    getSalesforceActions: function(cmp, row, doneCallback) {
        var actions = []
        if (row.opportunityId) {
            actions.push({
                'label': 'View Opportunity',
                'recordId': row.opportunityId
            });
        }

        if (row.borrowerLeadId) {
            actions.push({
                'label': 'View Borrower Lead',
                'recordId': row.borrowerLeadId
            });
        }

        if (row.coBorrowerLeadId) {
            actions.push({
                'label': 'View Co-Borrower Lead',
                'recordId': row.coBorrowerLeadId
            });
        }

        doneCallback(actions);
    },
    getColumns : function(cmp) {
        var columns = [
            {
                type: 'url',
                fieldName: 'url',
                label: 'Uuid',
                initialWidth: 300,
                typeAttributes: { target: '_self', label: { fieldName: 'uuid' } }
            },
            {
                type: 'text',
                fieldName: 'borrowerName',
                label: 'Borrower Full Name',
                sortable: true
            },
            {
                type: 'email',
                fieldName: 'email',
                label: 'Borrower Email',
                sortable: true
            },
            {
                type: 'text',
                fieldName: 'vertical',
                label: 'Vertical'
            },
            {
                type: 'text',
                fieldName: 'status',
                label: 'Status'
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
                },
                sortable: true
            },
            {
                type: 'action',
                typeAttributes: { rowActions: this.getSalesforceActions.bind(this, cmp) },
                label: 'Salesforce'
            }
        ];
        var statuses = [{"label":"created","value":"created"},{"label":"propertyResearchingRates","value":"propertyResearchingRates"},{"label":"propertyMadeOffer","value":"propertyMadeOffer"},{"label":"propertySignedContract","value":"propertySignedContract"},{"label":"prequalFormInProgress","value":"prequalFormInProgress"},{"label":"fullFormInProgress","value":"fullFormInProgress"},{"label":"fullFormCompleted","value":"fullFormCompleted"},{"label":"propertyFoundHome","value":"propertyFoundHome"},{"label":"preApprovalEligibilityInProgress","value":"preApprovalEligibilityInProgress"},{"label":"preApprovalApproved","value":"preApprovalApproved"},{"label":"preApprovalDecline","value":"preApprovalDecline"},{"label":"preApprovalCompletedError","value":"preApprovalCompletedError"},{"label":"prequalEligibilityInProgress","value":"prequalEligibilityInProgress"},{"label":"prequalResponseReceived","value":"prequalResponseReceived"},{"label":"prequalCompletedNoOffers","value":"prequalCompletedNoOffers"},{"label":"prequalCompletedError","value":"prequalCompletedError"},{"label":"encompassRequestSent","value":"encompassRequestSent"},{"label":"encompassEconsentSent","value":"encompassEconsentSent"},{"label":"mortgageInProcessing","value":"mortgageInProcessing"},{"label":"mortgageAwaitingApproval","value":"mortgageAwaitingApproval"},{"label":"mortgageFinalReview","value":"mortgageFinalReview"},{"label":"offerAccepted","value":"offerAccepted"},{"label":"initialProcessing","value":"initialProcessing"},{"label":"brokerProcessing","value":"brokerProcessing"},{"label":"submittedToLender","value":"submittedToLender"},{"label":"initialApproval","value":"initialApproval"},{"label":"clearedToClose","value":"clearedToClose"},{"label":"closingDisclosureSent","value":"closingDisclosureSent"},{"label":"closedLoan","value":"closedLoan"},{"label":"applicationDenied","value":"applicationDenied"},{"label":"applicationWithdrawn","value":"applicationWithdrawn"},{"label":"fileClosedForIncompleteness","value":"fileClosedForIncompleteness"},{"label":"archived","value":"archived"},{"label":"partnersPrequalFormInProgress","value":"partnersPrequalFormInProgress"}];
        cmp.set('v.statuses', statuses);
        cmp.set('v.columns', columns);
    }
})