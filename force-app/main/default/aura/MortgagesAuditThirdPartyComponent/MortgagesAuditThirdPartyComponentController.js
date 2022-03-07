({
    init:function(cmp, _event, helper) {
        helper.init(cmp);
    },
    handleChange: function(cmp, _event, helper) {
        helper.search(cmp);
    },
    requestHandle:function(cmp, event, helper) {
        helper.changeRequest(cmp, cmp.find('request').get('v.value'));
    },
    handleChangeSourceType:function(cmp, event, helper) {
        var service = cmp.get('v.service');
        if (service == 'pointserv') {
            helper.loadPointservData(cmp);
        }
    }  
})