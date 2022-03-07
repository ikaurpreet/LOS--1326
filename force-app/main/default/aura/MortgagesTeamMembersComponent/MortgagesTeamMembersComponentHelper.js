({
    init: function (cmp) {
        var mortgageTeamMemberCount = 100;
        cmp.set('v.error', null);
        var env = cmp.get('v.env');
        var promise = this.callServerMethod(cmp, 'search', { env: env, query: null, role: null, order: null, orderDirection: null, limitRecords: mortgageTeamMemberCount, offsetRecords: null });
        promise.then((response) => {
            var returnValue = JSON.parse(response);
            returnValue.forEach(function(record){
                record.salesforceNameLinkName = '/'+record.salesforceId;
            });
            console.log('MortgageTeamMembers:', returnValue);
            cmp.set('v.members', returnValue);
        }, (errors) => {});
    },

    getColumns : function(cmp) {
        var columns = [
            {label: 'Sync?', fieldName: 'shouldSync', type: 'boolean', initialWidth: 60, cellAttributes: { alignment: 'center'}},
            {label: 'Name', fieldName: 'salesforceNameLinkName', type: 'url', typeAttributes: {
                 label: { fieldName: 'salesforceName' }, target:'_blank'}},
            {label: 'Role', fieldName: 'role', type: 'text', initialWidth: 110},
            {label: 'UserId', fieldName: 'userId', type: 'text', initialWidth: 100},
            {label: 'NMLS #', fieldName: 'nmls', type: 'number', initialWidth: 80},
            {label: 'Email', fieldName: 'email', type: 'email', initialWidth: 240},
            {label: 'Branch', fieldName: 'branch', type: 'text', initialWidth: 100},
            {label: 'Phone', fieldName: 'phone', type: 'phone', initialWidth: 120},
            {label: 'Calendly Link', fieldName: 'calendlyLink', type: 'url', typeAttributes: {
                 tooltip: { fieldName: 'calendlyLink' } } },
            {label: 'Licensed States', fieldName: 'licensedStates', type: 'text', typeAttributes: {
                tooltip: { fieldName: 'licensedStates' } } },
            {label: 'Action', type: 'action', initialWidth: 100, typeAttributes: {
                 rowActions: this.getSalesforceActions.bind(this, cmp) } },    
        ];
        cmp.set('v.columns', columns);
    },

    getSalesforceActions: function(cmp, row, doneCallback) {
        var actions = []
        if (row.shouldSync) {
            actions.push({
                'label': 'Sync',
                'recordId': row.salesforceId
            });
        }

        doneCallback(actions);
    },

    sync: function(cmp, row) {
        cmp.set('v.error', null);
        var env = cmp.get('v.env');
        var members = cmp.get('v.members');
        var selectedRow = row;
        var promise = this.callServerMethod(cmp, 'createOrUpdate', {memberUuid: row.salesforceId, env: env});
        promise.then((response) => {
            // TODO: Workaround to update Sync sign after success pushing to Mortgage
            members.forEach(function(item) {
                if(item.salesforceId == selectedRow.salesforceId)
                    item.shouldSync = false;
            });
            cmp.set('v.members', members);
        }, (errors) => {});
        return selectedRow;
    },
})