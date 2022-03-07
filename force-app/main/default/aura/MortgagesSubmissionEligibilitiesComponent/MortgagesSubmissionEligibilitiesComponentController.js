({
    init: function (cmp, _evt, helper) {
        helper.getEligibilities(cmp);
        helper.getColumns(cmp);
    },
    onEligibilitySelected: function(cmp, evt, helper) {
        helper.selectRow(cmp, evt);
    },
})