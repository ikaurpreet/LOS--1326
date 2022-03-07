({
    getQueueMessages: function(cmp) {
        var submissionUuid = cmp.get('v.submissionUuid');
        var env = cmp.get('v.env');

        cmp.set('v.error', null);
        cmp.set('v.loading', true);
        var promise = this.callServerMethod(cmp, 'getQueueMessages', { submissionUuid: submissionUuid, env: env });
        promise.then((response) => {
            var data = JSON.parse(response);
            cmp.set("v.messages", data);
        }, () => {})
    },

    removeMessage: function(cmp, messageId, queue) {
        var submissionUuid = cmp.get('v.submissionUuid');
        var env = cmp.get('v.env');
        
        cmp.set('v.loading', true);
        cmp.set('v.error', null);
        var promise = this.callServerMethod(cmp, 'getQueueMessages', { submissionUuid: submissionUuid, env: env, messageId: messageId, queue: queue });
        promise.then((response) => {
            var data = JSON.parse(response);
            cmp.set('v.messages', data);
            cmp.set('v.message', `Message '${messageId}' removed from '${queue}' queue`)
            setTimeout(() => cmp.set('v.message', null), 5000);
        }, () => {})
    },

    getColumns: function(cmp) {
        var columns = [
            {
                type: 'text',
                fieldName: 'messageId',
                label: 'Message Id'
            },
            {
                type: 'text',
                fieldName: 'name',
                label: 'Name'
            },
            {
                type: 'text',
                fieldName: 'queue',
                label: 'Queue'
            },
            {
                label: 'Action', 
                type: 'button', 
                initialWidth: 150, 
                typeAttributes: { label: 'Remove', title: 'Remove', name: 'remove', iconName: 'utility:delete' }
            }
        ];
        cmp.set('v.columns', columns);
    }
})