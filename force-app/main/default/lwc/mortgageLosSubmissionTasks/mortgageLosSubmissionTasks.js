import { LightningElement, wire, api, track } from 'lwc';
import gettasksheets from '@salesforce/apex/GetRelatedRecordsLOC.gettasksheets';
import getCustomTasksOpenOpp from '@salesforce/apex/GetRelatedRecordsLOC.getCustomTasksOpenOpp';
import getCustomTasks from '@salesforce/apex/GetRelatedRecordsLOC.getCustomTasks';
import getThirdPartyTasks from '@salesforce/apex/GetRelatedRecordsLOC.getThirdPartyTasks';
import getSubmissionTasks from '@salesforce/apex/GetRelatedRecordsLOC.getSubmissionTasks';
import getUserTimeZone from '@salesforce/apex/GetRelatedRecordsLOC.getUserTimeZone';
import { getUrlTable } from 'c/util';
import { getUserTimeZoneUtil } from 'c/util';

const actions = [
    { label: 'View', name: 'view' },
];


export default class MortgageLOSSubmissionTasks extends LightningElement {

    @track customTasksOpenOppColumns = [
        {
            label: 'Custom Task Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: 'Status',
            fieldName: 'Status__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Created Date',
            fieldName: 'CreatedDate',
            type: 'date',
            typeAttributes: {
                month: "2-digit",
                day: "2-digit",
                year: 'numeric',
                hour: "2-digit",
                minute: "2-digit",
            },
            sortable: true
        },
        {
            label: 'Owner Name',
            fieldName: 'Owner_Name__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Due Date',
            fieldName: 'Due_Date__c',
            type: 'date-local',
            typeAttributes: {
                month: "2-digit",
                day: "2-digit"
            },
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];

    @track customTasksColumns = [
        {
            label: 'Custom Task Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: 'Created Date',
            fieldName: 'CreatedDate',
            type: 'date',
            typeAttributes: {
                month: "2-digit",
                day: "2-digit",
                year: 'numeric',
                hour: "2-digit",
                minute: "2-digit"
            },
            sortable: true
        },
        {
            label: 'Status',
            fieldName: 'Status__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Due Date',
            fieldName: 'Due_Date__c',
            type: 'date-local',
            typeAttributes: {
                month: "2-digit",
                day: "2-digit"
            },
            sortable: true
        },
        {
            label: 'Owner Name',
            fieldName: 'Owner_Name__c',
            type: 'text',
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];

    @track thirdPartyTasksColumns = [
        {
            label: 'Custom Task Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: '3rd Party Company',
            fieldName: 'Title_Company__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Status',
            fieldName: 'Status__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Ordered Date',
            fieldName: 'Ordered_Date__c',
            type: 'date-local',
            typeAttributes: {
                month: "2-digit",
                day: "2-digit"
            },
            sortable: true
        },
        {
            label: 'Received Date',
            fieldName: 'Received_Date__c',
            type: 'date-local',
            typeAttributes: {
                month: "2-digit",
                day: "2-digit"
            },
            sortable: true
        },
        {
            label: 'Most Recent Comment',
            fieldName: 'Most_Recent_Comment_Long__c',
            type: 'text',
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];

    @track submissionTaskColumns = [
        {
            label: 'Submission Task Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: 'Type',
            fieldName: 'Type__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Status',
            fieldName: 'Status__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Last Modified Date',
            fieldName: 'LastModifiedDate',
            type: 'date',
            typeAttributes: {
                month: "2-digit",
                day: "2-digit",
                year: 'numeric',
                hour: "2-digit",
                minute: "2-digit"
            },
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];
    @track taskSheetColumns = [
        {
            label: 'Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];

    @api recordId;
    @track showCustomTasksOpenOpp = false;
    @track customTasksOpenOpp = [];
    @track showCustomTasks = false;
    @track customTasks = [];
    @track showSubmissionTasks = false;
    @track submissionTasks = []
    @track showTasksheets = false;
    @track taskSheets = [];
    @track showThirdPartyTasks = false;
    @track thirdPartyTasks = [];
    @track timezone;

    connectedCallback() {
        getUserTimeZone()
            .then(result => {
                this.timeZone = JSON.stringify(result);
            })
            .catch(error => {
                this.timeZone = undefined;
            });
    }

    @wire(gettasksheets, { oppId: '$recordId' })
    wiredtasksheets({
        error,
        data
    }) {
        if (data) {
            this.taskSheets = getUrlTable(data);
            this.error = undefined;
            this.showTasksheets = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    @wire(getCustomTasksOpenOpp, { oppId: '$recordId' })
    wiredCustomTasksOpenOpp({
        error,
        data
    }) {
        if (data) {
            this.customTasksOpenOpp = getUrlTable(data);
            this.customTasksOpenOppColumns[2].typeAttributes["time-zone"] = this.timezone;
            this.error = undefined;
            this.showCustomTasksOpenOpp = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    @wire(getCustomTasks, { oppId: '$recordId' })
    wiredCustomTasks({
        error,
        data
    }) {
        if (data) {
            this.customTasks = getUrlTable(data);
            this.customTasksColumns[1].typeAttributes["time-zone"] = this.timezone;
            this.error = undefined;
            this.showCustomTasks = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    @wire(getThirdPartyTasks, { oppId: '$recordId' })
    wiredThirdPartyTasks({
        error,
        data
    }) {
        if (data) {
            this.thirdPartyTasks = getUrlTable(data);
            this.error = undefined;
            this.showThirdPartyTasks = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    @wire(getSubmissionTasks, { oppId: '$recordId' })
    wiredSubmissionTasks({
        error,
        data
    }) {
        if (data) {
            this.submissionTasks = getUrlTable(data);
            this.submissionTaskColumns[3].typeAttributes["time-zone"] = this.timezone;
            this.error = undefined;
            this.showSubmissionTasks = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

}