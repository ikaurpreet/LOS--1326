({
    initEnvs: function(cmp) {
        this.callServerMethod(cmp, 'getEnvs').then((data) => {
             var envs = JSON.parse(data)
             cmp.set('v.envs', envs);
             cmp.set('v.env', envs[0]);
             this.initConfigs(cmp)
        }); 
    },
    initConfigs: function(cmp) {
        cmp.set('v.error', null);
        var env = cmp.get('v.env');
        var promise = this.callServerMethod(cmp, 'getApplicationConfig', { env: env });
        promise.then((response) => {
            var returnValue = JSON.parse(response);
            console.info(returnValue.states);
            cmp.set('v.states', returnValue.states.sort(this.compareByName));
        }, (errors) => {});
    },
    
    init: function (cmp) {
        this.initEnvs(cmp);
    },

    onChangeStatus: function (cmp, evt) {
        var stateCode = evt.getSource().get("v.name");
        var approved = evt.getSource().get("v.value");
        var actionName = approved ? 'enable' : 'disable'
        if (window.confirm(`Are you sure you want to ${actionName} ${stateCode} state?`)) {
            this.updateStateConfig(cmp, stateCode, approved)
        } else {
            evt.getSource().set("v.value", !approved)
        }
    },

    compareByName: function (a, b) {
        if (a.name < b.name) {
            return -1;
        }
        if (a.name > b.name) {
            return 1;
        }
        return 0;
    },

    updateStateConfig: function (cmp, stateCode, approved) {
        cmp.set('v.error', null);
        var env = cmp.get('v.env');
        var promise = this.callServerMethod(cmp, 'updateStateConfig', { env: env, stateCode, approved });
        promise.then((response) => {
            var returnValue = JSON.parse(response);
            console.info(returnValue.states);
        }, (errors) => {
            this.init(cmp)
        });
    }
})