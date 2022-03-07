import { LightningElement, track, api, wire } from 'lwc';
import getMasterRelatedCustomTasks from '@salesforce/apex/MortgagesCustomTasksManager.getMasterRelatedCustomTasks';
import { subscribe, MessageContext } from 'lightning/messageService';
// import SPRUCEMC from '@salesforce/messageChannel/SpruceMessageChannel__c';
import updateTaskDocumentReviewStatus from '@salesforce/apex/MortgagesCustomTasksManager.updateTaskDocumentReviewStatus';

export default class MortgagesCustomTasksList extends LightningElement {
    @wire(MessageContext)
    messageContext;
    @api recordId;

    @track error;
    @track loading = false;
    @track title = '3rd Party Tasks';
    @track statusOptions = [
        { label: 'Open', value: 'Open' },
        { label: 'Awaiting docs', value: 'Awaiting docs' },
        { label: 'New docs available', value: 'New docs available' },
        { label: 'Completed', value: 'Completed' }
    ];
    @track gridColumns = [
        { label: 'Custom Task Name' },
        { label: '3rd Party Company' },
        { label: 'API Status' },
        { label: 'Ordered Date' },
        { label: 'Task Sheet Status' },
        { label: 'Most Recent Comment' },
    ];
    @track gridData;

    connectedCallback() {
        this.subscribeOnMasterTaskChanges();
        this.loadSubTasks();
    }

    subscribeOnMasterTaskChanges() {
        // subscribe(
        //     this.messageContext,
        //     SPRUCEMC, (message) => {
        //         if (message.recordId == this.recordId) {
        //             this.loadSubTasks();
        //         }
        //     });
    }

    loadSubTasks() {
        this.loading = true;
        getMasterRelatedCustomTasks({ recordId: this.recordId })
            .then(result => {
                console.log("Custom TASKS:");
                console.log(result);
                const customTasks = JSON.parse(result);
                this.gridData = this.addLinkProperty(customTasks);
                this.loading = false;
            })
            .catch(this.handleError.bind(this));
    }

    handleError(error) {
        if(!this.handleAuthError(error.body)) {
            this.error = error.body.message;
            this.loading = false;
        }
    }
    @track authErrorMessage;
    @track authId;

    authClickHandler() {
        window.open('/' + this.authId + '/e', 'Enter Login Details', 'width=900,height=600');
        this.authId = null;
        this.authErrorMessage = 'Please, refresh page';
    }

    handleAuthError(error) {
        switch(error.exceptionType) {
            case 'MortgagesNamedCredentialsGraphQLClient.TokenExpiredException':
                this.authErrorMessage = 'Your session is expired, please walk through sign-in process';
                this.authId = error.message;
                break;
            case 'MortgagesNamedCredentialsGraphQLClient.NoTokenException':
                this.authErrorMessage = 'Your session was not found, please create it by going through the sign-in process';
                this.authId = error.message;
                break;
            case 'MortgagesNamedCredentialsGraphQLClient.NoExternalSourceException':
                this.authErrorMessage = 'Your authentication settings was not found, please create it going through the sign-in process';
                this.authId = error.message;
                break;
            case 'MortgagesNamedCredentialsGraphQLClient.NoNamedCredentialsException':
                this.authErrorMessage = error.message;
                break;
            default:
                return false;
        }
        return true;
    }

    handleStatusChange(event) {
        event.preventDefault();
        console.log('Changing status event');
        console.log(event.target.dataset.itemId);
        console.log(event.detail.value);
        const taskId = event.target.dataset.itemId;
        const status = event.detail.value;
        if (!taskId || !status) {
            console.error('TaskID or Status wasn\'t provided');
            return;
        }
        this.loading = true;
        updateTaskDocumentReviewStatus({ status, recordId: taskId })
            .then(() => {
                this.loading = false;
                console.log('Document review status updated: ' + status);
            })
            .catch((err) => {
                console.log(err);
                this.error = err;
                this.loading = false;
            });
    }

    addLinkProperty(customTasks) {
        for (const task of customTasks) {
            task.link = '/' + task.id;
        }
        return customTasks;
    }
}