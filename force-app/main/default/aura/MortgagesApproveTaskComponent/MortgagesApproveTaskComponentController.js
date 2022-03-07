({
    handleApprove: function(cmp, evt, helper) {
        helper.approve(cmp);
    },
    handleCancel: function(cmp, evt, helper) {
        $A.get("e.force:closeQuickAction").fire()
    }
})