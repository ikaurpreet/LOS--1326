({
    findUploadedDocument: function(cmp) {
        var recordId = cmp.get('v.recordId');
        var sObjectName = cmp.get('v.sObjectName');
        var action = sObjectName == 'Submission_Task__c' ? 'findSubmissionTaskUploadedDocument' : 'findDocument';
        var promise = this.callServerMethod(cmp, action, { id: recordId })
        promise.then(function(document){
            document = JSON.parse(document);
            if (document) {
                cmp.set('v.file', document);
                cmp.set('v.fileId', document.fileId);
            } else {
                cmp.set('v.documentNotFound', true);
            }
        });
        promise.catch(function(errors) {
            console.info(errors);
        })
    },
    downloadDocument: function(cmp) {
        var document = cmp.get('v.file');
        var promise = this.callServerMethod(cmp, 'downloadDocument', { documentId: document.id });

        promise.then(function(fileId){
            cmp.set('v.fileId', fileId);
            $A.get('e.lightning:openFiles').fire({
                recordIds: [fileId]
            });
        }).catch((errors) => {
            if (errors && errors[0] && errors[0].message.includes('Exceeded max size limit')) {
                cmp.set("v.error", null);
                cmp.set("v.isDownloadFileModalOpen", true);
            } else {
                console.info(errors);
            }
        })
    },
    closeDownloadFileModal: function(cmp) {
        cmp.set("v.isDownloadFileModalOpen", false);
    },  
    downloadDocumentDirectly: function(cmp) {
        var document = cmp.get('v.file');
        this.callServerMethod(cmp, 'generateDirectDownloadURL', { documentId: document.id })
        .then(url => {
            window.open(url);
            cmp.set("v.isDownloadFileModalOpen", false);
        })
        .catch(error => console.log(error));
    },
})