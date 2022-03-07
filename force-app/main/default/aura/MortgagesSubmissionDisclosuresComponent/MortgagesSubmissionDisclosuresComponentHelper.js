({
    getUserEvents: function (cmp) {
        var submission = cmp.get('v.submission');
        var submissionUuid = submission.uuid;
        var userUuid = submission.borrower.profile.userUuid;
        var env = cmp.get('v.env');

        cmp.set('v.error', null);
        var promise = this.callServerMethod(cmp, 'getUserEvents', { env, submissionUuid, userUuid, eventType: 'acceptance' });
        promise.then((response) => {
            var data = this.formatUserEvents(JSON.parse(response));
            var correctedData = data.split('\n').slice(0, 40).join('\n');
            cmp.set("v.disclosureUserEvents", data);
            cmp.set("v.disclosureUserEventsPreview", correctedData);
        }, (errors) => {
            cmp.set('v.disclosureUserEvents', null);
        })
    },
    download: function (cmp) {
        var userEvents = cmp.get('v.disclosureUserEvents');
        var name = 'userEvents.csv';
        let headers = {
            userUuid: 'User uuid',
            userName: 'User name',
            submissionUuid: 'Submission uuid',
            slug: 'Slug',
            ip: 'IP',
            createdAt: 'Created at',
            disclosureContent: 'Disclosure content'
        };

        this.exportCSVFile(headers, JSON.parse(userEvents), name);
    },
    toggleSourceView: function (cmp) {
        cmp.set('v.sourceFull', !cmp.get('v.sourceFull'));
    },
    copySource: function (cmp) {
        var disclosureUserEvents = cmp.get('v.disclosureUserEvents');
        var copyDataToClipboard = (e) => {
            e.preventDefault();
            e.clipboardData.setData("text/plain", disclosureUserEvents);
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
    formatUserEvents: function (data) {
        const result = data.reduce((acc, item) => {
            let result = {};
            let submissionUuid = item.meta.find(meta => meta.key == 'submissionUUID');
            let firstName = item.meta.find(meta => meta.key == 'firstName');
            let lastName = item.meta.find(meta => meta.key == 'lastName');
            result['userUuid'] = item.userUuid;
            result['userName'] = `${firstName.value} ${lastName.value}`;
            result['submissionUuid'] = submissionUuid.value;
            result['slug'] = item.disclosure.slug;
            result['ip'] = item.ip;
            result['createdAt'] = item.createdAt;
            result['disclosureContent'] = item.disclosure.textContent;
            acc.push(result);
            return acc;
        }, []);
        return JSON.stringify(result, null, 4);
    },
    exportCSVFile: function (headers, items, fileTitle) {
        if (headers) {
            items.unshift(headers);
        }

        var csv = this.convertToCSV(items);
        var file = new File([csv], fileTitle, {type: "text/plain"});
        saveAs(file);
    },
    convertToCSV: function (objArray) {
        return objArray.map((element, index) => {
            const userUuid = element.userUuid;
            const userName = element.userName;
            const submissionUuid = element.submissionUuid;
            const slug = element.slug;
            const ip = element.ip;
            const createdAt = element.createdAt;
            let disclosureContent = element.disclosureContent;

            if (index != 0) {
                if (disclosureContent != null) {
                    const removedFormatting = disclosureContent.replace(/[\t|\n]+/g, '');
                    disclosureContent = `"${removedFormatting.replace(/\"/g, '""')}"`;
                } else {
                    disclosureContent = '';
                }
            }

            const result = [userUuid, userName, submissionUuid, slug, submissionUuid, ip, createdAt, disclosureContent];
            return result.join(',');
        }).join('\r\n');
    }
})