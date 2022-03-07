({
    init: function(cmp, event, helper) {
        helper.init(cmp);
        helper.getColumns(cmp);
        
    },
    onTaskSelected: function(cmp, event, helper) {
        var selectedRows = event.getParam('selectedRows');
        cmp.set('v.task', selectedRows[0]);
    },
    handleRowAction: function(cmp, evt, helper) {
        var row = evt.getParam('row');
        var taskUuid = evt.getParam('action').recordId;
        helper.downloadDocument(cmp, taskUuid);
    },
})