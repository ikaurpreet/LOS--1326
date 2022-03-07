({
    init: function(component, _event, helper) {
        component.set("v.isFinalStatus", helper.isFinalStatus(component));
        helper.setQaEnvName(component);
    },
    
    handleSectionToggle: function(component, event, helper) {
        let opened = component.get('v.tabsOpened') || [];
        if (opened.indexOf('salesforce') === -1 && event.getParam('openSections').indexOf('salesforce') !== -1) {
            helper.fetchStats(component);
        }
        debugger;
        component.set('v.tabsOpened', event.getParam('openSections'));
    },

    sync: function(component, event, helper) {
        helper.salesforceSync(component)
    },

    moveToPrequal: function(component, event, helper) {
        helper.fireSubmissionEvent(component, 'moveToPrequal');
    },

    moveToPreApprovalDashboard: function(component, event, helper) {
        helper.fireSubmissionEvent(component, 'moveToPreApprovalDashboard');
    },

    archive: function(component, event, helper) {
        helper.archive(component);
    },

    unArchive: function(component, event, helper) {
        helper.unArchive(component, false);
    },

    rerunEligibility: function(component, event, helper) {
        helper.fireSubmissionEvent(component, 'rerunEligibility');
    },

    requestImpersonationHandler: function(component, event, helper) {
        helper.requestImpersonation(component);
    },
    showJobResults: function(component, event) {
        var selectedRows = event.getParam('selectedRows');
        setTimeout(() => {
            alert(selectedRows[0].results);
        }, 1);
    },
    refreshJobs: function(component, event, helper) {
        helper.fetchStats(component);
    }
})