({
    init: function(cmp, evt, helper) {
        helper.initData(cmp);
        helper.initControls(cmp);
    },
    onTabSelected: function(cmp, evt, helper) {
        var tab = evt.getSource();
        var id = tab.get('v.id')
        helper.selectTab(cmp, id);
    },
    handleChange: function(cmp, evt, helper) {
        helper.tabChanged(cmp);
    },
    copySourceHandler: function(cmp, evt, helper) {
        helper.copySource(cmp);
    },
    downloadHandler: function(cmp, evt, helper) {
        helper.download(cmp);
    },
    toggleSourceViewHandler: function(cmp, evnt, helper) {
        helper.toggleSourceView(cmp);
    }
})