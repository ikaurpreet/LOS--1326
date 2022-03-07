({
    init : function(cmp, evt, helper) {
        helper.getColumns(cmp);
        helper.initialSearch(cmp);
    },
    reload: function(cmp, evt, helper) {
        helper.initialSearch(cmp);
    },
    loadMore: function(cmp, evt, helper) {
        helper.loadMore(cmp);
    },
    onProductSelected: function(cmp, evt, helper) {
        var onlyBest = cmp.get('v.test');
        helper.selectProduct(cmp, evt)
    },
    onlyBestHandle: function(cmp, evt, helper) {
        var onlyBest = cmp.get('v.onlyBest');
        cmp.set('v.onlyBest', !onlyBest);
        helper.initialSearch(cmp);
    },
    lenderHandle: function(cmp, evt, helper) {
        var lender = cmp.find('lender').get('v.value');
        cmp.set('v.lender', lender);
        helper.initialSearch(cmp);
    },
    loanTypeHandle: function(cmp, evt, helper) {
        var lender = cmp.find('loan-type').get('v.value');
        cmp.set('v.loanType', lender);
        helper.initialSearch(cmp);
    },
    handleKeyUp: function(cmp, evt, helper) {
        var isEnterKey = evt.keyCode === 13;
        if (isEnterKey) {
            helper.initialSearch(cmp);
        }
    },
    updateColumnSorting: function(cmp, evt, helper) {
        var fieldName = evt.getParam('fieldName');
        var sortDirection = evt.getParam('sortDirection');
        cmp.set("v.sortBy", fieldName);
        cmp.set("v.sortDirection", sortDirection);
        helper.initialSearch(cmp);
    },
    handleProductAction: function(cmp, evt, helper) {
        var compEvent = cmp.getEvent("productAction");
        compEvent.setParam('product', cmp.get('v.product'));
        compEvent.fire();
    }
})