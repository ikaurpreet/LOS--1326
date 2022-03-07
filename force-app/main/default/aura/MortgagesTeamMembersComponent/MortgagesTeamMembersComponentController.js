({
    init: function(cmp, event, helper) {
        helper.getColumns(cmp);
        helper.init(cmp);
    },

    handleRowAction: function (cmp, event, helper) {
        var action = event.getParam('action');
        var row = event.getParam('row');
        helper.sync(cmp, row)
    },

    handleHeaderAction: function(cmp, event, helper) {
    }
})