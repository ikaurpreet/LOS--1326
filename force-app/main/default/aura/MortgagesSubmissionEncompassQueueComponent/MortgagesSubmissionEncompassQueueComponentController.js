({
    init: function(cmp, event, helper) {
        helper.getQueueMessages(cmp);
        helper.getColumns(cmp);
    },
    onRowAction: function(cmp, event, helper) {
        var row = event.getParam('row'),
            messageId = row.messageId,
            queue = row.queue;
        
        if (confirm(`Are you sure that you need to remove '${messageId}' from '${queue}' queue?`)) {
            helper.removeMessage(cmp, row.messageId, row.queue);
        }
    }
})