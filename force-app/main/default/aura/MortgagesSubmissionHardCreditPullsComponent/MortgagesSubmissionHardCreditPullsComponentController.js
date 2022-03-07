({
    init : function(component, _event, helper) {
        helper.getHardCreditPulls(component);
        helper.getColumns(component);
    },
    onHardCreditPullSelected: function(component, event, helper) {
        helper.selectRow(component, event);
    },
    rerunHardCreditPull: function(component, event, helper) {
        helper.requestHardCreditPull(component, 'rerunHardCreditPull');
    }
})