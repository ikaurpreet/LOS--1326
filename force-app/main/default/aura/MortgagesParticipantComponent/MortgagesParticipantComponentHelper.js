({
    incomes: function(component) {
        var columns = [
            {
                type: 'text',
                label: 'Income Type',
                fieldName: 'incomeType',
                initialWidth: 300
            },
            {
                type: 'currency',
                fieldName: 'amount',
                label: 'Amount'
            },
            {
                type: 'text',
                fieldName: 'paymentTermType',
                label: 'Payment Term'
            }
        ];
        component.set('v.columns', columns);
    },

    answers: function(component) {
        var data = component.get('v.data');
        var columns = [
            {
                type: 'text',
                label: 'Answer Type',
                fieldName: 'answerType',
                initialWidth: 300
            },
            {
                type: 'boolean',
                fieldName: 'value',
                label: 'Answer'
            },
        ];
        component.set('v.columns', columns);
    },
    address: function(component) {
        var data = component.get('v.data');
    },
    assets: function(component) {
        var columns = [
            {
                type: 'text',
                label: 'Asset Type',
                fieldName: 'assetType',
                initialWidth: 300
            },
            {
                type: 'currency',
                fieldName: 'amount',
                label: 'Amount'
            },
        ];
        component.set('v.columns', columns);
    },
    provedAssets: function(component) {
        var columns = [
            {
                type: 'text',
                label: 'Institution Name',
                fieldName: 'institutionName',
                initialWidth: 300
            },
            {
                type: 'text',
                fieldName: 'assetType',
                label: 'Asset Type'
            },
            {
                type: 'currency',
                fieldName: 'amount',
                label: 'Amount'
            }
        ];
        component.set('v.columns', columns);
    },
    realEstate: function(component) {
        var data = component.get('v.data');
        console.info(data);
        // debugger;
    }
})