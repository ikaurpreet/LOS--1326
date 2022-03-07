({
    init : function(cmp, evt, helper) {
        helper.getColumns(cmp);
        helper.initEnvs(cmp);
        // helper.initialSearch(cmp);
    },

    handleKeyUp: function (cmp, evt, helper) {
        var isEnterKey = evt.keyCode === 13;
        if (isEnterKey) {
            helper.initialSearch(cmp);
        }
    },

    reload: function(cmp, evt, helper) {
        helper.initialSearch(cmp);
    },

    onChangeEnv: function(cmp, evt, helper) {
        helper.initialSearch(cmp);
    },
    
    onChangeVertical: function(cmp, evt, helper) {
        helper.initialSearch(cmp);
    },

    onChangeStatus: function(cmp, evt, helper) {
        helper.initialSearch(cmp);
    },

    loadMore: function(cmp, evt, helper) {
        helper.loadMore(cmp);
    },

    handleRowAction: function(cmp, evt, helper) {
        var row = evt.getParam('row');
        var recordId = evt.getParam('action').recordId;
        
        cmp.find("nav").navigate({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                actionName: 'view'
            }
        });
    },
    updateColumnSorting: function(cmp, evt, helper) {
        var fieldName = evt.getParam('fieldName');
        var sortDirection = evt.getParam('sortDirection');
        cmp.set("v.sortBy", fieldName);
        cmp.set("v.sortDirection", sortDirection);
        helper.initialSearch(cmp);
    }
})