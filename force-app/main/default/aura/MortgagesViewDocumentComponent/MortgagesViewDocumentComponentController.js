({
    init:function(cmp, evt, helper) {
        helper.findUploadedDocument(cmp);
    },
    downloadDocumentHandler:function(cmp, evt, helper) {
        helper.downloadDocument(cmp);
    },
    downloadDocumentDirectly:function(cmp, evt, helper) {
        helper.downloadDocumentDirectly(cmp);
    },
    closeDownloadFileModal:function(cmp, evt, helper) {
        helper.closeDownloadFileModal(cmp);
    },
})