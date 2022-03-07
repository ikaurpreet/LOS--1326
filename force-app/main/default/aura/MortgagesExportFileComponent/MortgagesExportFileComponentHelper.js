({
    fetchMortgageMismoDocument: function (cmp) {
        const { uuid } = cmp.get('v.submission')
        const env = cmp.get('v.env')
        const query = {
            variables: { submissionUuid: uuid },
            operationName: 'mortgageMismoDocument',
            query: `query mortgageMismoDocument($submissionUuid: ID!) {
                mortgageMismoDocument(submissionUuid: $submissionUuid)
            }`
        }

        cmp.set('v.error', null);

        const promise = this.callServerMethod(cmp, 'request', { env: env, jsonBody: JSON.stringify(query) })
        promise.then(function(response) {
            response = JSON.parse(response);
            cmp.set('v.document', {
                name: `${uuid}.xml`,
                body: response.data.mortgageMismoDocument
            });
        }).catch(function(errors) {
            const error = errors[0] || errors
            cmp.set('v.document', null);
            cmp.set('v.error', error.message);
            console.error(errors);
        });
    }
})