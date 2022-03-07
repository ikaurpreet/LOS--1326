({
    getEligibilities : function(cmp) {
        var submission = cmp.get('v.submission');
        var env = cmp.get('v.env');
        var promise = this.callServerMethod(cmp, 'getEligibilities', { submissionUuid: submission.uuid, env: env });
        promise.then((response) => {
            var data = JSON.parse(response);
            data.forEach((item) => {
                if (item.uuid) {
                    item['url'] = `/apex/MortgagesEligibilityDashboard?uuid=${item['uuid']}&env=${env}&submissionUuid=${!submission.uuid}`
                }
            });
            cmp.set("v.eligibilities", data);
        }, (errors) => {});
    },
    selectRow: function(cmp, evt) {
        var selectedRows = evt.getParam('selectedRows');
        var eligibility = selectedRows[0];
        cmp.set('v.eligibility', null);
        cmp.set('v.eligibility', eligibility);
    },
    getColumns: function(cmp) {
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
                fieldName: 'outcome',
                label: 'Outcome'
            },
            {
                type: 'text',
                fieldName: 'vertical',
                label: 'Vertical'
            },
            {
                type: 'text',
                fieldName: 'status',
                label: 'Status',
            },
            {
                type: 'boolean',
                fieldName: 'expired',
                label: 'Expired'
            },
            {
                type: 'text',
                fieldName: 'failedReasons',
                label: 'Failed reasons'
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
    }
})