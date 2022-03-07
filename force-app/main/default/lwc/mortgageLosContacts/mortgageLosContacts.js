import { LightningElement, wire, api, track } from 'lwc';
import getContactRoles from '@salesforce/apex/GetRelatedRecordsLOC.getContactRoles';
import getTitleHolders from '@salesforce/apex/GetRelatedRecordsLOC.getTitleHolders';
import getSpouses from '@salesforce/apex/GetRelatedRecordsLOC.getSpouses';
import getLenderContacts from '@salesforce/apex/GetRelatedRecordsLOC.getLenderContacts';
import { getUrlTable } from 'c/util';
import { refreshApex } from '@salesforce/apex';

const actions = [
    { label: 'View', name: 'view' },
];

export default class MortgageLosContacts extends LightningElement {
    @track contactrolecolumns = [
        {
            label: 'Contact Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: 'Role',
            fieldName: 'Role',
            type: 'text',
            sortable: true
        },
        {
            label: 'Title',
            fieldName: 'ContactTitle',
            type: 'text',
            sortable: true
        },
        {
            label: 'Primary',
            fieldName: 'IsPrimary',
            type: 'boolean',
            sortable: true
        },
        {
            label: 'Phone',
            fieldName: 'ContactPhone',
            type: 'phone',
            sortable: true

        },
        {
            label: 'Email',
            fieldName: 'ContactEmail',
            type: 'text',
            sortable: true

        },
        {
            label: 'Account Name',
            fieldName: 'ContactAccountNameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'ContactAccountName' } },
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];

    @track titleholdercolumns = [
        {
            label: 'Title Holder Name',
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
            label: 'Email',
            fieldName: 'Email__c',
            type: 'text',
            sortable: true

        },
        {
            label: 'Phone',
            fieldName: 'Phone__c',
            type: 'phone',
            sortable: true

        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];

    @track spousecolumns = [
        {
            label: 'Spouse Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: 'Email',
            fieldName: 'Email__c',
            type: 'text',
            sortable: true
        },
        {
            label: 'Phone',
            fieldName: 'Phone__c',
            type: 'phone',
            sortable: true

        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];

    @track contactcolumns = [
        {
            label: 'Name',
            fieldName: 'nameUrl',
            type: 'url',
            typeAttributes: { label: { fieldName: 'Name' } },
            sortable: true
        },
        {
            label: 'Email',
            fieldName: 'Email',
            type: 'text',
            sortable: true
        },
        {
            label: 'Phone',
            fieldName: 'Phone',
            type: 'phone',
            sortable: true

        },
        {
            label: 'Title',
            fieldName: 'Title',
            type: 'text',
            sortable: true

        },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        }

    ];

    @api recordId;
    @track contactroles = [];
    @track showContactRoles = false;
    @track titleholders = [];
    @track showTitleHolders = false;
    @track spouses = [];
    @track showSpouses = false;
    @track contacts = [];
    @track showContacts = false;

    @track titleHolderNewObjectEnabled = true;
    @track titleHolderNewObjectDefaultValues;

    wiredTitleHolderResults;

    connectedCallback() {
        this.titleHolderNewObjectDefaultValues = {
            'Opportunity__c': this.recordId
        }
    }

    @wire(getContactRoles, { oppId: '$recordId' })
    wiredContactRoles({
        error,
        data
    }) {
        if (data) {
            data.forEach(contactRole => {
                const newcontactRole = {
                    Id: contactRole.Id,
                    nameUrl: '/' + contactRole.ContactId,
                    Name: contactRole.Contact.Name,
                    Role: contactRole.Role,
                    ContactTitle: contactRole.Contact.Title,
                    IsPrimary: contactRole.IsPrimary,
                    ContactPhone: contactRole.Contact.Phone,
                    ContactEmail: contactRole.Contact.Email,
                    ContactAccountName: contactRole.Contact.Account ? contactRole.Contact.Account.Name : null,
                    ContactAccountNameUrl: contactRole.Contact.Account ? '/' + contactRole.Contact.Account.Id : null
                }
                this.contactroles.push(newcontactRole);
            });
            this.error = undefined;
            this.showContactRoles = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    @wire(getTitleHolders, { oppId: '$recordId' })
    wiredTitleHolders(result) {
        this.wiredTitleHolderResults = result;
        const { data, error } = result;
        if (data) {
            this.titleholders = getUrlTable(data);
            this.error = undefined;
            this.showTitleHolders = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    @wire(getSpouses, { oppId: '$recordId' })
    wiredSpouses({
        error,
        data
    }) {
        if (data) {
            this.spouses = getUrlTable(data);
            this.error = undefined;
            this.showSpouses = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    @wire(getLenderContacts, { oppId: '$recordId' })
    wiredContacts({
        error,
        data
    }) {
        if (data) {
            this.contacts = getUrlTable(data);
            this.error = undefined;
            this.showContacts = true;
        } else if (error) {
            console.log(error);
            this.error = error;
        }
    }

    @api
    refreshTitleHolders() {
        refreshApex(this.wiredTitleHolderResults)
    }

}