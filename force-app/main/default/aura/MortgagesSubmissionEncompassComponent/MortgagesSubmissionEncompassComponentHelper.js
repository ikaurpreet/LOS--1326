({
    getLoanRequest : function(cmp) {
        var submissionUuid = cmp.get('v.submissionUuid');
        var payloadType = cmp.get('v.payloadType');
        var env = cmp.get('v.env');

        cmp.set('v.error', null);
        var promise = this.callServerMethod(cmp, 'getEncompassLoanRequest', { submissionUuid: submissionUuid, env: env });
        promise.then((response) => {
            var data = JSON.parse(response); 
            var loanRequest = {
                request: JSON.stringify(JSON.parse(data.request), null, 2)
            };
            if (data.response) {
                loanRequest.response = JSON.stringify(JSON.parse(data.response), null, 2);
            }
            loanRequest.previewPayload = this.getPreviewPayload(loanRequest, payloadType);
            cmp.set("v.loanRequest", loanRequest);
            cmp.set('v.payload', loanRequest[payloadType]);
        }, (errors) => {
            cmp.set('v.payload', null);
        })
    },
    initControls: function(cmp) {
        cmp.set('v.payloadTypes', [{'label': 'Request', 'value': 'request'}, {'label': 'Response', 'value': 'response'}])
    },
    download: function(cmp) {
        var loanRequest = cmp.get('v.loanRequest');
        var payloadType = cmp.get('v.payloadType');
        var name = `payload-${payloadType}.json`
        var file = new File([loanRequest[payloadType]], name, {type: "text/plain"});
        saveAs(file);
    },
    toggleSourceView: function(cmp) {
        cmp.set('v.sourceFull', !cmp.get('v.sourceFull'));
    },
    copySource: function(cmp) {
        var loanRequest = cmp.get('v.loanRequest');
        var payloadType = cmp.get('v.payloadType');
        var copyDataToClipboard = (e) => {
            e.preventDefault();
            e.clipboardData.setData("text/plain", loanRequest[payloadType]);
        }
        document.addEventListener("copy", copyDataToClipboard);
        try {
            document.execCommand("copy");
        } catch (exception) {
            console.error("Copy to clipboard failed");
        } finally {
            document.removeEventListener("copy", copyDataToClipboard);
        }
    },
    selectPayloadType: function(cmp) {
        var loanRequest = cmp.get('v.loanRequest');
        var payloadType = cmp.get('v.payloadType');    

        loanRequest.previewPayload = this.getPreviewPayload(loanRequest, payloadType);
        cmp.set('v.loanRequest', loanRequest);
        cmp.set('v.payload', loanRequest[payloadType]);
    },
    getPreviewPayload: function(loanRequest, payloadType) {
        var payload = loanRequest[payloadType];

        return payload.split('\n').slice(0, 40).join('\n');
    }
})