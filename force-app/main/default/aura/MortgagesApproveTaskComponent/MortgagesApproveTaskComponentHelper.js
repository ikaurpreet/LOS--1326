({
    approve: function(cmp) {
        var taskId = cmp.get('v.recordId');
        var successHandler = () => {
            $A.get("e.force:closeQuickAction").fire();
            var resultsToast = $A.get("e.force:showToast"); 
            
            resultsToast.setParams({ 
                "type": "success", 
                "title": "Task",
                "message": "Approved"           
            }); 
            resultsToast.fire();
            
            $A.get('e.force:refreshView').fire();
        };
        this.callServerMethod(cmp, 'approve', { taskId: taskId }, successHandler)
    }
})