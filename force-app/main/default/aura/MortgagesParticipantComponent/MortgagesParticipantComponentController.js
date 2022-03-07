({
    init : function(component, event, helper) {
        var cmp = component.get('v.component');
        switch(cmp) {
            case 'incomes':
                helper.incomes(component);
                break;
            case 'answers':
                helper.answers(component);
                break;
            case 'address':
                helper.address(component);
                break;
            case 'assets':
                helper.assets(component);
                break;
            case 'provedAssets': 
                helper.provedAssets(component);
                break;
            case 'realEstate':
                helper.realEstate(component);
                break;
            default:
                console.info('test');
        }
    }
})