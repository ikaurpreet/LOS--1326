({
    init : function(component, _event, helper) {
        helper.getHardCreditPullDetails(component);
        helper.initControls(component);
    },
    onTabSelected: function(component, event, helper) {
        var tab = event.getSource();
        var id = tab.get('v.id');
        helper.selectTab(component, id);
    },
    handleChange: function(component, _event, helper) {
        helper.tabChanged(component);
        helper.buildSource(component);
    },
    copySourceHandler: function(component, _event, helper) {
        helper.copySource(component);
    },
    downloadHandler: function(component, _event, helper) {
        helper.download(component);
    },
    toggleSourceViewHandler: function(component, _event, helper) {
        helper.toggleSourceView(component);
    }
})