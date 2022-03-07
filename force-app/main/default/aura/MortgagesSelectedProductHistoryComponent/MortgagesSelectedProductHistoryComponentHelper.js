({
    getSelectedProductHistory: function(cmp, uuid) {
        var env = cmp.get('v.env');
        var submissionUuid = cmp.get('v.submission').uuid;
        var promise = this.callServerMethod(cmp, 'getSelectedProductHistory', { env: env, uuid: submissionUuid});
        promise.then((response) => {
            var productHistory = JSON.parse(response);
            console.log('Response:', productHistory);
            var fields = [
                'loanProductInfo',
                'loanType',
                'loanTerm',
                'cashOutAmount',
                'loanBalance',
                'subordinateMortgage',
                'totalLoanAmount',
                'principalInterest',
                'monthlyTaxes',
                'monthlyInsurance',
                'pmiMonthlyPayment',
                'monthlyHomeownersFee',
                'monthlyPayment',
                'lenderFees',
                'appraisalFee',
                'thirdPartyFees',
                'payOffForPreviousLoan',
                'prepaidForNewLoan',
                'escrowDeposit',
                'rolledCost',
                'totalClosingCost'
            ]

            var results = fields.map((name) => {
                var {dashboardProduct, rateLockProduct, finalProduct} = productHistory

                if (name === 'loanProductInfo') {
                    var item = {
                        name: name,
                        dashboardProduct: dashboardProduct ? (dashboardProduct[name] && dashboardProduct[name].lender.name) : '—',
                        rateLockProduct: rateLockProduct ? (rateLockProduct[name] && rateLockProduct[name].lender.name) : '—',
                        finalProduct: finalProduct ? (finalProduct[name] && finalProduct[name].lender.name) : '—'
                    }
                    return item
                } else if (name === 'subordinateMortgage') {
                    var item = {
                        name: name,
                        dashboardProduct: dashboardProduct ? (dashboardProduct[name] && dashboardProduct[name].subordinateMortgageBalance.toString() || '0') : '—',
                        rateLockProduct: rateLockProduct ? (rateLockProduct[name] && rateLockProduct[name].subordinateMortgageBalance.toString() || '0') : '—',
                        finalProduct: finalProduct ? (finalProduct[name] && finalProduct[name].subordinateMortgageBalance.toString() || '0') : '—'
                    }
                    return item
                } else {
                    var item = {
                        name: name,
                        dashboardProduct: dashboardProduct ? (dashboardProduct[name] && dashboardProduct[name].toString() || '0') : '—',
                        rateLockProduct: rateLockProduct ? (rateLockProduct[name] && rateLockProduct[name].toString() || '0') : '—',
                        finalProduct: finalProduct ? (finalProduct[name] && finalProduct[name].toString() || '0') : '—'
                    }
                    return item
                }
            })
            cmp.set('v.productHistory', results);
        }, () => {})
    },

    getColumns : function(cmp) {
        var columns = [
            {
                type: 'text',
                fieldName: 'name',
                label: 'Titles',
            },
            {
                type: 'text',
                fieldName: 'dashboardProduct',
                label: 'Dashboard Product',
            },
            {
                type: 'text',
                fieldName: 'rateLockProduct',
                label: 'Rate lock requested product',
            },
            {
                type: 'text',
                fieldName: 'finalProduct',
                label: 'Final Product',
            },
        ];
        cmp.set('v.columns', columns);
    }
})