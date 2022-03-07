({
    initData: function(cmp) {
        var eligibility = cmp.get('v.eligibility');
        var uuid = cmp.get('v.uuid');
        if (uuid === undefined && eligibility && eligibility.uuid !== null) {
            uuid = eligibility.uuid
        }
        if (uuid) {
            var promise = this.getEligibility(cmp, uuid);
            promise.then((eligibility) => {
                cmp.set('v.eligibility', eligibility);
            });
        }
    },
    selectTab: function(cmp, tab) {
        tab = tab.replace(/^\w/, c => c.toUpperCase());
        var method = this[`select${tab}`]
        if (method) {
            method.bind(this)(cmp);
        }
    },
    tabChanged: function(cmp) {
        this.selectTab(cmp, cmp.get('v.selectedTab'));
    },
    selectHardKnockoutRules: function(cmp) {
        this.loadField(cmp, 'hardKnockoutRules');
        var detailsColumns = [
            ['Type', 'participantType'], 
            ['Criterion', 'criterion'],
            ['Outcome', 'outcome'],
            ['Rule', 'rule'],
            ['Rule Outcome', 'ruleOutcome'],
            ['Name', 'name'],
            ['Value', 'value'],
            ['Threshold', 'threshold']
        ]
        cmp.set('v.columns', this.generateTextColumns(detailsColumns));
    },
    getEligibility: function(cmp, uuid) {
        return new Promise((resolve, reject) => {
            cmp.set('v.error', null);
            var env = cmp.get('v.env');
            var promise = this.callServerMethod(cmp, 'getEligibility', { uuid: uuid, env: env });
            promise.then((response) => {
                var data = JSON.parse(response);
                if (data.declineReasons) {
                    data.borrowerDeclineReasons = data.declineReasons.borrower ? data.declineReasons.borrower.reasons.join(', ') : ''
                    data.coBorrowerDeclineReasons = data.declineReasons.co_borrower ? data.declineReasons.co_borrower.reasons.join(', ') : ''
                }
                resolve(data);
            }, (errors) => {
                const error = errors[0];
                reject(error);
            });
        });
    },
    loadField: function(cmp, field, role) {
        var eligibility = cmp.get('v.eligibility');
        var finalField = field
        if (role) {
            var finalField = `${field}${role}`;
        }
        if (eligibility[finalField] != null) { return Promise.resolve(eligibility[finalField]); }
        var promise = this.getEligibilityField(cmp, field, role);
        promise.then(function(data) {
            eligibility[finalField] = data;
            cmp.set('v.eligibility', eligibility);
        });
        return promise;
    },
    copySource: function(cmp) {
        var eligiblity = cmp.get('v.eligibility');
        var copyDataToClipboard = (e) => {
            e.preventDefault();
            e.clipboardData.setData("text/plain", eligiblity.sourceResults);
        }
        document.addEventListener("copy", copyDataToClipboard);
        try {
            document.execCommand("copy");
        } catch (exception) {
            console.error("Copy to clipboard failed");
        } finally {
            document.removeEventListener("copy", copyDataToClipboard);
        }
    },
    getEligibilityField: function(cmp, field, role) {
        return new Promise((resolve, reject) => {
            cmp.set('v.error', null);
            var eligibility = cmp.get('v.eligibility');
            var env = cmp.get('v.env');
            var action = cmp.get("c.getEligibilityField")
            var finalField = field
            if (role) {
                finalField = `${field}(role:${role})`
            }
            var promise = this.callServerMethod(cmp, 'getEligibilityField', { uuid: eligibility.uuid, env: env, field: finalField });
            promise.then((response) => {
                var data = JSON.parse(response);
                resolve(data[field]);
            }, (errors) => {
                const error = errors[0];
                reject(error);
            });
        });
    },
    generateTextColumns: function(columns) {
        return columns.map((item) => {
            return {
                label: item[0],
                fieldName: item[1],
                type: item[2] || 'text'
            }
        })
    },
    selectFicoScores: function(cmp) {
        this.loadField(cmp, 'ficoScores');
        var detailsColumns = [
            ['Participant Type', 'participantType'], 
            ['Bureau', 'bureau'],
            ['Score', 'fico', 'number'],
            ['No Hit', 'nohit'],
            ['Frozen', 'frozen'],
        ]
        cmp.set('v.columns', this.generateTextColumns(detailsColumns));
    },
    selectTradelines: function(cmp) {
        this.loadField(cmp, 'tradelines');
        var detailsColumns = [
            ['Date Opened', 'date_opened'], 
            ['Monthly', 'monthly_payment', 'number'],
            ['Cur Balance', 'current_balance', 'number'],
            ['Subscriber Name', 'subscriber_name'],
            ['Account Type', 'account_type'],
        ]
        cmp.set('v.columns', this.generateTextColumns(detailsColumns));
    },
    selectParticipantTradeLines: function(cmp) {
        var detailsColumns = [
            ['Type', 'type'], 
            ['Acct', 'account_number'],
            ['Cur Bal', 'current_balance'],
            ['Last Access', 'last_accessed_date'],
            ['Sched Monthly', 'scheduled_monthly_payment'],
            ['Port Type', 'portfolio_type'],
            ['Account Type', 'account_type'],
            ['Institution', 'financial_institution'],
            ['Opened', 'date_opened'],
            ['Closed', 'date_closed'],
        ]
        cmp.set('v.columns', this.generateTextColumns(detailsColumns));
        var bureau = cmp.get('v.bureau');
        var participantRole = cmp.get('v.participantRole');
        var eligibility = cmp.get('v.eligibility');
        if (bureau && participantRole) {
            this.loadField(cmp, `${bureau}TradeLines`, participantRole).then((data) => {
                eligibility.participantTradeLines = data;
                cmp.set('v.eligibility', eligibility);
            })
        }
    },
    selectDetails: function(cmp) {
        
    },
    selectRateRules: function(cmp) {
        this.loadField(cmp, 'rateRules');
        var detailsColumns = [
            ['Lender', 'lender'], 
            ['Name', 'name'],
            ['Outcome', 'outcome'],
            ['Filter Outcome', 'closing_cost_filter_outcome'],
        ]
        cmp.set('v.columns', this.generateTextColumns(detailsColumns));
    },
    toggleSourceView: function(cmp) {
        cmp.set('v.sourceFull', !cmp.get('v.sourceFull'));
    },  
    niceBytes: function(x) {
        const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        if(x === 1) return '1 byte';

        let l = 0, n = parseInt(x, 10) || 0;

        while(n >= 1024 && ++l){
            n = n/1024;
        }
        //include a decimal point and a tenths-place digit if presenting 
        //less than ten of KB or greater units
        return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
    },
    selectSources: function(cmp) {
        var source = cmp.get('v.source');
        var eligibility = cmp.get('v.eligibility');
        eligibility.sourceResults = null;
        eligibility.sourceResultsPreview = null;
        cmp.set('v.eligibility', eligibility);
        cmp.set('v.sourceFull', false);
        if (source === 'bureauResponse' || source === 'bureauDetails') {
            cmp.set('v.sourceType', null);
            cmp.set('v.sourceWithType', false);
            cmp.set('v.sourceWithBureau', true);
            if (!eligibility.withCoBorrower) {
                cmp.set('v.participantRole', 'borrower');
            }
            var bureau = cmp.get('v.bureau');
            var suffix = source === 'bureauResponse' ? 'Response' : 'Details';
            var participantRole = cmp.get('v.participantRole');
            if (!bureau || !participantRole) { return; }
            this.loadField(cmp, `${bureau}${suffix}`, participantRole).then((data) => {
                var sourceName = '';
                if (suffix === 'Details') {
                    eligibility.sourceResults = JSON.stringify(JSON.parse(data), null, 2);
                    sourceName = `${source}-${participantRole}-${eligibility.uuid}-details.json`
                } else {
                    eligibility.sourceResults = data
                    sourceName = `${bureau}-${participantRole}-${eligibility.uuid}-response.xml`
                }
                var previewLines = eligibility.sourceResults.split('\n').slice(0, 40);
                eligibility.sourceResultsPreview = previewLines.join('\n');
                cmp.set('v.sourceName', sourceName.toLowerCase());
                cmp.set('v.sourceSize', this.niceBytes(eligibility.sourceResults.length));
                cmp.set('v.eligibility', eligibility);
            })
        } else {
            cmp.set('v.bureau', null);
            cmp.set('v.sourceWithType', true);
            cmp.set('v.sourceWithBureau', false);
            var sourceType = cmp.get('v.sourceType');
            if (source && sourceType) {
                this.loadField(cmp, `${source}${sourceType}`).then((data) => {
                    var sourceName = '';
                    if (source === 'eligibility' || source === 'optimalBlue') {
                        eligibility.sourceResults = JSON.stringify(JSON.parse(data), null, 2);
                        sourceName = `${source}-${sourceType}-${eligibility.uuid}.json`
                    } else {
                        eligibility.sourceResults = data
                        sourceName = `${source}-${sourceType}-${eligibility.uuid}.xml`
                    }
                    var previewLines = eligibility.sourceResults.split('\n').slice(0, 40);
                    eligibility.sourceResultsPreview = previewLines.join('\n');
                    cmp.set('v.sourceName', sourceName.toLowerCase());
                    cmp.set('v.sourceSize', this.niceBytes(eligibility.sourceResults.length));
                    cmp.set('v.eligibility', eligibility);
                })
            }
        }
    },
    initControls: function(cmp) {
        cmp.set('v.bureaus', [{'label': 'Transunion', 'value': 'transunion'}, {'label': 'Experian', 'value': 'experian'}, {'label': 'Equifax', 'value': 'equifax'}])
        cmp.set('v.bureau', null);

        cmp.set('v.sources', [
            {'label': 'Eligiblity', 'value': 'eligibility'}, 
            {'label': 'Optimal Blue', 'value': 'optimalBlue'},
            {'label': 'Closing Corp', 'value': 'closingCorp'},
            {'label': 'Bureau Details', 'value': 'bureauDetails'},
            {'label': 'Bureau Response', 'value': 'bureauResponse'}
        ])
        cmp.set('v.source', null);

        cmp.set('v.sourceTypes', [{'label': 'Response', 'value': 'Response'}, {'label': 'Request', 'value': 'Request'}]);
        cmp.set('v.sourceType', null)

        cmp.set('v.participantRoles', [{'label': 'Borrower', 'value': 'borrower'}, {'label': 'Co Borrower', 'value': 'coBorrower'}])
        cmp.set('v.participantRole', 'borrower');
    },


    download: function(cmp) {
        var eligiblity = cmp.get('v.eligibility');
        var name = cmp.get('v.sourceName');
        var file = new File([eligiblity.sourceResults], name, {type: "text/plain"});
        saveAs(file);
    },
    dataUrlToBlob: function(data) {
        var mx= data.length,
            i= 0,
            myBlob = (window.Blob || window.MozBlob || window.WebKitBlob || toString),
            uiArr= new Uint8Array(mx);

        for(i;i<mx;++i) uiArr[i]= data.charCodeAt(i);

        return new myBlob([uiArr], {type: 'text/html'});
    }
})