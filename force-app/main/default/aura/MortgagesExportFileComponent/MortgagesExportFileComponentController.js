({
    init : function(_cmp, _event, _helper) {
     
    },
    onRequestTypeChange: function(cmp, event, _helper) {
        const value = event.getSource().get('v.value')
        const exportButton = cmp.find('btn-export')
        exportButton.set('v.disabled', !value)
    },
    onSubmit: function (cmp, _event, helper) {
        helper.fetchMortgageMismoDocument(cmp)
    }
})