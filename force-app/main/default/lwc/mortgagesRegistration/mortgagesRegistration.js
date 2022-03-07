import {LightningElement, api, track} from 'lwc';
import loginToLendersPortal from '@salesforce/apex/MortgagesRegistrationController.loginToLendersPortal';
import mortgagesRegistrationTaskCreate
    from '@salesforce/apex/MortgagesRegistrationController.mortgagesRegistrationTaskCreate';
import mortgagesRegistrationFindTask
    from '@salesforce/apex/MortgagesRegistrationController.mortgagesRegistrationFindTask';
import mortgagesRegistrationFireTaskEvent
    from '@salesforce/apex/MortgagesRegistrationController.mortgagesRegistrationFireTaskEvent';
import mortgagesRegistrationUpdateTask
    from '@salesforce/apex/MortgagesRegistrationController.mortgagesRegistrationUpdateTask';


export default class MortgagesRegistration extends LightningElement {
    @api submission;
    @api tasksheet;

    @track isModalOpen;
    @track task;
    @track loading;
    @track polling;
    @track error;

    @track accountId;
    @track username;
    @track password;

    @track taskEvent;

    get loadingCondition() {
        return this.polling || this.loading;
    }


    connectedCallback() {
        this.getTask();
    }


    loginAndPorocessRegistration() {
        this.closeModal()

        this.loading = true;
        this.error = null;

        this.accountId = this.template.querySelector('lightning-input.accountId').value;
        this.username = this.template.querySelector('lightning-input.username').value;
        this.password = this.template.querySelector('lightning-input.password').value;

        const promise = loginToLendersPortal({
            accountId: this.accountId,
            username: this.username,
            password: this.password
        });
        promise.then((response) => {
            var response = JSON.parse(response)

            if (!response.success) {
                var error = response.errors[0]
                this.error = {exceptionType: error.errorCode, message: error.errorDescription};
                this.loading = false;
                return;
            }

            this.updateToken(response.data.token)

        }, (error) => {
            this.error = error.body;
            this.loading = false;
        });
    }


    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    getTask() {
        console.log('getTask');
        this.loading = true;
        this.error = null;
        var promise = mortgagesRegistrationFindTask({submissionUuid: this.submission.uuid})
        promise.then((response) => {
            this.task = JSON.parse(response);
            this.loading = false;
        }, (error) => {
            if (error.body.message != "Couldn't find Task") {
                this.error = error.body;
            }
            this.loading = false;
        });
    }

    closeError() {
        this.error = null;
    }

    updateToken(token) {
        this.loading = true;
        this.error = null;
        const promise = mortgagesRegistrationUpdateTask({
            submissionUuid: this.submission.uuid,
            token: token
        })
        promise.then((response) => {
            this.task = JSON.parse(response);
            this.loading = false;
            // process with event if it is present
            if (this.taskEvent){
                this.fireTaskEvent(this.taskEvent)
            }

        }, (error) => {
            this.error = error.body;
            this.loading = false;
        });
    }

    createTask(){
        console.log('create task')

        this.loading = true;
        this.error = null;

        const lender = this.submission.selectedProduct.loanProductInfo.lender.slug

        const promise = mortgagesRegistrationTaskCreate({
            submissionUuid: this.submission.uuid,
            vertical: this.submission.vertical,
            lender: lender
        })
        promise.then((response) => {
            this.task = JSON.parse(response);
            this.loading = false;
            console.log('success', JSON.parse(response))
        }, (error) => {
            this.error = error.body;
            this.loading = false;
        });
    }

    processEvent(event){
        this.taskEvent = event.currentTarget.dataset.id
        this.fireTaskEvent(this.taskEvent)
    }

    fireTaskEvent(taskEvent){
        this.loading = true;
        this.error = null;

        console.log('fireEvent', taskEvent);

        const promise = mortgagesRegistrationFireTaskEvent({
            submissionUuid: this.submission.uuid,
            event: taskEvent
        })
        promise.then((response) => {
            this.task = JSON.parse(response);
            console.log('success', this.task)

            this.pullTask();
            this.taskEvent = null
        }, (error) => {
            if(error.body.message == 'NeedTokenFetch') {
                this.openModal()
                this.loading = false;
            }
            this.error = error.body;
            this.loading = false;
        });
    }

    pullTask(){
        this.polling = true
        const myLoop = () => {
            setTimeout(() => {
                console.log('iteration');
                this.getTask()
                console.log(this.task.status);
                let status = this.task.status;

                if (status!= 'in_progress'){
                    console.log('finish_polling')
                    this.polling = false;
                }   else{
                    myLoop();
                }
            }, 10000)
        }
        myLoop();

    }
}