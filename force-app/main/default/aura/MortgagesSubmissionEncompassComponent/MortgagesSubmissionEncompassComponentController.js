({
    init : function(component, event, helper) {
        helper.initControls(component);
        helper.getLoanRequest(component);
    },
    copySourceHandler: function(cmp, event, helper) {
        helper.copySource(cmp);
    },
    downloadHandler: function(cmp, event, helper) {
        helper.download(cmp);
    },
    toggleSourceViewHandler: function(cmp, event, helper) {
        helper.toggleSourceView(cmp);
    },
    onPayloadTypeChange: function(cmp, event, helper) {
        helper.selectPayloadType(cmp);
    }
})