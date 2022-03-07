({
    initialSearch: function(cmp, query) {
        // Clear values
        cmp.set('v.offset', 0);
        cmp.set("v.products", null);
        cmp.set('v.disableLoading', false);
        cmp.set('v.totalCount', null);
        cmp.set('v.error', null);

        // var query = cmp.find('enter-search').get('v.value');
        var limit = cmp.get('v.limit');
        var offset = 0;
        
        cmp.set('v.pageLoading', true);
        var promise = this.search(cmp, query, limit, offset);
        
        promise.then(function(data) {
            cmp.set("v.products", data);
            cmp.set('v.pageLoading', false);
            if (data.length < limit) {
                cmp.set('v.disableLoading', true);
            }
        });

        promise.catch(function(error) {
            console.log('error', error)

            cmp.set("v.products", null);
            cmp.set('v.pageLoading', false);
        })
    },
    
    search: function(cmp, query, limit, offset) {
        var self = this;
        return new Promise((resolve, reject) => {
            var eligibility = cmp.get('v.eligibility');
            var actionName = eligibility.vertical === "mortgagePurchase"  ? "getPurchaseProducts" : "getRefinanceProducts";
            var env = cmp.get('v.env')
            var onlyBest = cmp.get('v.onlyBest');
            var sortBy = cmp.get('v.sortBy');
            var sortDirection = cmp.get('v.sortDirection');
            var order = `${sortBy}:${sortDirection}`;

            var params = { onlyBest: onlyBest, eligibilityUuid: eligibility.uuid, env: env, order: order, limitRecords: limit, offsetRecords: offset}
            
            var lender = cmp.get('v.lender');
            if (lender !== '') {
                params.lenders = [lender]
            }
            
            var loanType = cmp.get('v.loanType');
            if (loanType !== '') {
                params.loanType = loanType
            }

            var monthlyPayment = cmp.find('monthly_payment').get('v.value');
            if (monthlyPayment !== '') {
                params.monthlyPayment = monthlyPayment;
            }

            var apr = cmp.find('apr').get('v.value');
            if (apr !== '') {
                params.apr = apr;
            }

            var rate = cmp.find('rate').get('v.value');
            if (rate !== '') {
                params.rate = rate;
            }

            console.info(params);
            var promise = this.callServerMethodWithoutLoading(cmp, actionName, params);
            promise.then((response) => {
                var returnValue = JSON.parse(response);
                var data = returnValue.items;
                cmp.set('v.totalCount', returnValue.totalCount);
                data.forEach(this.processItem.bind(self));
                resolve(data);
            }, (errors) => {
                var error = errors[0]
                reject(error);
            });
        });
    },
    processItem: function(item) {
        var period = '';
        if (item.armFixedTerm && item.armSubsequentChangePeriod) {
            period = ` (${item.armFixedTerm}/${item.armSubsequentChangePeriod})`
        }
        var loanType = `${item.loanTerm} ${item.amortizationType}${period}`
        item.lenderName = item.loanProductInfo.lender.name
        item.loanType = loanType
    },
    loadMore: function(cmp) {
        if (cmp.get('v.disableLoading')) {
            return;
        }
        var query = '';
        var limit = cmp.get('v.limit');
        var offset = cmp.get('v.offset') + limit;
        cmp.set('v.tableLoading', true);
        var promise = this.search(cmp, query, limit, offset);
        
        promise.then(function(data) {
            if (data.length > 0) {
                var products = cmp.get("v.products");
                if (products) {
                    products = products.concat(data);
                }
                cmp.set('v.offset', offset);
                cmp.set("v.products", products);
            }
            
            if (data.length < limit) {
                cmp.set('v.disableLoading', true);
            }

            cmp.set('v.tableLoading', false);
        });

        promise.catch(function(error) {
            cmp.set('v.error', error.message);
            cmp.set("v.products", null);
            cmp.set('v.tableLoading', false);
        });
    },
    selectProduct: function(cmp, evt) {
        var selectedRows = evt.getParam('selectedRows');
        var product = selectedRows[0];
        cmp.set('v.product', null);
        cmp.set('v.product', product);
    },
    getColumns : function(cmp) {
        var columns = [
            {
                type: 'text',
                fieldName: 'lenderName',
                label: 'Lender',
                initialWidth: 300,
                sortable: true
            },
            {
                type: 'text',
                fieldName: 'loanType',
                label: 'Loan Type',
                sortable: true
            },
            {
                type: 'number',
                fieldName: 'rate',
                label: 'Rate',
                sortable: true
            },
            {
                type: 'number',
                fieldName: 'apr',
                label: 'APR',
                sortable: true
            },
            {
                type: 'currency',
                fieldName: 'monthlyPayment',
                label: 'Monthly',
                sortable: true
            },
            {
                type: 'boolean',
                fieldName: 'bestProduct',
                label: 'Best Product'
            }
        ];
        cmp.set('v.columns', columns);
    }
})