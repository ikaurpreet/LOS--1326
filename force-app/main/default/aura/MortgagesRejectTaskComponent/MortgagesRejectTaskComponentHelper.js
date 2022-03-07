({
    reject: function(cmp) {
        var descCmp = cmp.find('description');
        var descValue = descCmp.get('v.value');
        var taskId = cmp.get('v.recordId');
        var errors = [];
        cmp.set('v.error', null);
       
        if (!descValue || descValue === '') { 
            errors.push({message:"Enter description of rejection"});
        } 

        if (descValue && descValue.length > 255) {
            errors.push({message:"A maximum of 255 characters are allowed in a description."});
        }

        if (errors.length > 0) {
            descCmp.set("v.errors", errors);
            return;
        }

        var successHandler = (data) => {
            $A.get("e.force:closeQuickAction").fire();
            var resultsToast = $A.get("e.force:showToast"); 
            
            resultsToast.setParams({ 
                "type": "success", 
                "title": "Task",             
                "message": "Rejected with description '" + descValue + "'", 
            }); 
            resultsToast.fire();

            $A.get('e.force:refreshView').fire();
        }
        this.callServerMethod(cmp, 'reject', { taskId: taskId, description: descValue }, successHandler);
    }
})