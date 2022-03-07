({
    getHardCreditPullDetails: function(cmp) {
        var hardCreditPull = cmp.get('v.hardCreditPull');
        if (!hardCreditPull.uuid) {
            alert('No hard credit pull UUID');
            return;
        }

        cmp.set('v.error', null);
        cmp.set('v.loading', true);
        var env = cmp.get('v.env');
        var operationName = 'mortgagesSalesforceHardCreditPull';
        var payload = {
            operationName: operationName,
            query: 'query ' + operationName +'($uuid: ID!) {'
                + operationName +'(uuid: $uuid) {'
                + 'uuid,'
                + 'vendorOrderIdentifier,'
                + 'status,'
                + 'outcome,'
                + 'description,'
                + 'failedReasons,'
                + 'error,'
                + 'errorMessage,'
                + 'createdAt,'
                + 'order {'
                + 'request,'
                + 'response'
                + '},'
                + 'retrieve {'
                + 'request,'
                + 'response'
                + '}'
                + '}'
                + '}',
            variables: {
                uuid: hardCreditPull.uuid
            }
        };

        var promise = this.callServerMethod(cmp, 'request', { env: env, jsonBody: JSON.stringify(payload)});
        promise.then(response => {
            var data = JSON.parse(response).data[operationName];
            cmp.set('v.hardCreditPull', data);
        }, errors => {
            const [ error ] = errors;
            cmp.set('v.error', error.message);
        })
    },
    initControls: function(cmp) {
        cmp.set('v.sourceTypes', [
            {'label': 'Request', 'value': 'request'},
            {'label': 'Response', 'value': 'response'}
        ]);
        cmp.set('v.requestTypes', [
            {'label': 'Order', 'value': 'order'},
            {'label': 'Retrieve', 'value': 'retrieve'}
        ]);
        cmp.set('v.sourceType', null);
        cmp.set('v.requestType', null);
    },
    tabChanged: function(cmp) {
        this.selectTab(cmp, cmp.get('v.selectedTab'));
    },
    selectTab: function(cmp, tab) {
        tab = tab.replace(/^\w/, c => c.toUpperCase());
        var method = this[`select${tab}`];
        if (method) {
            method.bind(this)(cmp);
        }
    },
    buildSource: function(cmp) {
        var selectedSource = cmp.get('v.sourceType');
        var selectedRequest = cmp.get('v.requestType');
        var hardCreditPull = cmp.get('v.hardCreditPull');
        
        if (selectedRequest == null || selectedSource == null) {
            cmp.set('v.previewReady', false);
            cmp.set('v.previewSource', null);
            cmp.set('v.previewName', null);
            return false
        }

        try {
            var previewSource = hardCreditPull[selectedRequest][selectedSource];
            var previewName = `${hardCreditPull.uuid}-${selectedRequest}-${selectedSource}.xml`
            cmp.set('v.previewSource', this.formatXml(this.eraseEmbeddedContent(previewSource)));
            cmp.set('v.previewName', previewName);
            cmp.set('v.previewReady', true);
        } catch (error) {
            cmp.set('v.previewReady', false);
            cmp.set('v.error', error);
        }
    },
    formatXml: function(xml) {
        let formatted = ''
        let indent= '';
        const tab = '  ';// 2 spaces
        xml.split(/>\s*</).forEach(function(node) {
            if (node.match( /^\/\w/ )) indent = indent.substring(tab.length);// decrease indent by one 'tab'
            formatted += indent + '<' + node + '>\r\n';
            if (node.match( /^<?\w[^>]*[^\/]$/ )) indent += tab;// increase indent
        });
        return formatted.substring(1, formatted.length-3);
    },
    eraseEmbeddedContent: function(str) {
      return str.replace(/<html[^>]*>(?:(?!<\/html>)[^])*<\/html>/g,'');
    },
})