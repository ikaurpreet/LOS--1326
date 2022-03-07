({
    init: function(cmp) {
        var env = cmp.get('v.env');
        var submissionUuid = cmp.get('v.submissionUuid');
        var recordId = cmp.get('v.recordId');
        if (env && submissionUuid) {
            this.getTasks(cmp);
        }
        if (recordId) {
            this.initByRecordId(cmp);
        }
    },
    initByRecordId: function(cmp) {
        var recordId = cmp.get('v.recordId');
        cmp.set('v.loading', true);
        var promise = this.callServerMethodWithoutLoading(cmp, 'getSubmissionUuidAndEnv', { opportunityId: recordId })
        promise.then((response) => {
            var data = JSON.parse(response);
        
            if(data.uuid && data.env) {
                cmp.set('v.submissionUuid', data.uuid);
                cmp.set('v.env', data.env);
                this.getTasks(cmp);
            } else {
                cmp.set('v.loading', false);
            }
        }, (errors) => {
            cmp.set('v.loading', false);
        });
    },
    getTasks: function(cmp) {
        var submissionUuid = cmp.get('v.submissionUuid');
        var env = cmp.get('v.env');
        cmp.set('v.loading', true);
        var promise = this.callServerMethod(cmp, 'getTasks', { submissionUuid: submissionUuid, env: env })
        promise.then((response) => {
            var data = JSON.parse(response);
            cmp.set("v.tasks", data);
        }, (errors) => {})
    },
    getColumns: function(cmp) {
        var columns = [
            {
                type: 'text',
                fieldName: 'title',
                label: 'Title',
            },
            {
                type: 'text',
                fieldName: 'description',
                label: 'Description',
            },
            {
                type: 'text',
                fieldName: 'type',
                label: 'Type',
            },
            {
                type: 'text',
                fieldName: 'participantRole',
                label: 'Participant Role'
            },
            {
                type: 'text',
                fieldName: 'group',
                label: 'Group'
            },
            {
                type: 'text',
                fieldName: 'status',
                label: 'Status',
            },
            // {
            //     type: 'date',
            //     fieldName: 'createdAt',
            //     label: 'Created At',
            //     initialWidth: 200,
            //     typeAttributes: {
            //         year: "numeric",
            //         month: "long",
            //         day: "2-digit",
            //         hour: "2-digit",
            //         minute: "2-digit"
            //     },
            // },
            {
                type: 'date',
                fieldName: 'updatedAt',
                label: 'Updated At',
                initialWidth: 200,
                typeAttributes: {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit"
                },
            },
            {
                type: 'action',
                fixedWidth: 100,
                typeAttributes: { rowActions: this.getActions.bind(this, cmp) },
                label: 'Actions'
            }
        ];
        cmp.set('v.columns', columns);
    },
    downloadDocument: function(cmp, taskUuid) {
        var env = cmp.get('v.env');
        var promise = this.callServerMethod(cmp, 'generateDownloadUrl', { taskUuid: taskUuid, env: env })
        promise.then((response) => {
            this.download(data);
            console.info(data)
        }, (errors) => {});
    },
    download: function(dataurl) {
        var a = document.createElement("a");
        a.href = dataurl;
        a.click();
    },
    getActions: function(cmp, row, doneCallback) {
        var actions = []
        if (row.group == 'document' && (row.status == 'submitted' || row.status == 'resubmitted' || row.status == 'completed')) {
            actions.push({
                'label': 'Download Document',
                'recordId': row.uuid
            });
        }
        doneCallback(actions);
    }
})