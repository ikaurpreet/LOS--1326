import { LightningElement, api, track, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe, MessageContext } from 'lightning/messageService';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';
import ACCOUNT_ID from '@salesforce/schema/Opportunity.AccountId';
import ACCOUNT_NAME from '@salesforce/schema/Opportunity.Account.Name';
import COSIGNER_ID from '@salesforce/schema/Opportunity.Cosigner__c';
import COSIGNER_FIRST_NAME from '@salesforce/schema/Opportunity.Cosigner_First_Name__c';
import COSIGNER_LAST_NAME from '@salesforce/schema/Opportunity.Cosigner_Last_Name__c';
import PROPERTY_ADDRESS from '@salesforce/schema/Opportunity.Full_Property_Address__c';
import OWNER_ID from '@salesforce/schema/Opportunity.OwnerId';
import OWNER_NAME from '@salesforce/schema/Opportunity.Owner.Name';
import LENDER from '@salesforce/schema/Opportunity.Lender__c';
import LENDER_LOAN_NUMBER from '@salesforce/schema/Opportunity.External_ID__c';
import ENCOMPASS_LOAN_NUMBER from '@salesforce/schema/Opportunity.Encompass_Loan_Number__c';
import STAGE from '@salesforce/schema/Opportunity.StageName';
import LOCK_DATE from '@salesforce/schema/Opportunity.Lock_Loan_Date__c';
import LOCK_EXPIRATION_DATE from '@salesforce/schema/Opportunity.Lock_Expiration_Date__c';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import getTesterHeaderAccess from '@salesforce/apex/GetRelatedRecordsLOC.getTesterHeaderAccess';
import submissionUpdateChannel from '@salesforce/messageChannel/SubmissionUpdateChannel__c';
import { loadScript } from 'lightning/platformResourceLoader';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { prettyFloatDisplay, applyMoneyMaskValue, SectionId } from 'c/util';

import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY, ELIGIBILITY_STATUS_QUERY, ELIGIBILITY_RESULT_QUERY } from './queries.js'

const LONG_DATE_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' },
    SHORT_DATE_FORMAT = { year: '2-digit', month: '2-digit', day: '2-digit' };

/* Renders the header for LOS application. */
export default class MortgageLosHeader extends NavigationMixin(LightningElement) {
    @api recordId;

    @track opportunity;
    @track dob = 'Loading, please wait';
    @track ssn = 'Loading, please wait';
    @track loanAmount = 'Loading, please wait';
    @track graphqlInfoCss = 'value gray';

    @track ltv = 'Loading, please wait';
    @track dti = 'Loading, please wait';
    @track rate = 'Loading, please wait';
    @track fico = 'Loading, please wait';
    @track eligibilityGraphqlInfoCss = 'value gray';
    @track isTesterProfile = false;

    dayjsInitialized = false;

    @wire(MessageContext)
    messageContext;

    @wire(getTesterHeaderAccess, { submissionUuid: '$opportunity.id' }) // https://salesforce.stackexchange.com/questions/260135/lwc-handling-multiple-dependents-wire-methods
    wireGetTesterHeaderAccess({ error, data }) {
        if (data && data == "has_access") {
            this.isTesterProfile = true;
            getEligibilityStatus(this.opportunity, this.recordId, this.eligibilityStatusCallback.bind(this));
            return;
        }
        if (error) console.error(error);
    }

    @wire(getRecord, {
        recordId: '$recordId', fields: [
            SUBMISSION_UUID,
            SUBMISSION_TYPE,
            ACCOUNT_ID,
            ACCOUNT_NAME,
            COSIGNER_ID,
            COSIGNER_FIRST_NAME,
            COSIGNER_LAST_NAME,
            PROPERTY_ADDRESS,
            OWNER_ID,
            OWNER_NAME,
            LENDER,
            LENDER_LOAN_NUMBER,
            ENCOMPASS_LOAN_NUMBER,
            STAGE,
            LOCK_DATE,
            LOCK_EXPIRATION_DATE,
        ]
    })
    initializeHeader({ data }) {
        if (data) {
            this.opportunity = data;
            getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
        }
    };

    connectedCallback() {
        if (!this.submissionSubscription) {
            this.submissionSubscription = subscribe(
                this.messageContext,
                submissionUpdateChannel,
                (message) => this.handleChannelMessage(message),
            );
        }
    }

    renderedCallback() {
        if (this.dayjsInitialized) return;
        loadScript(this, Dayjs + '/package/dayjs.min.js').then(() => {
            this.dayjsInitialized = true;
        }).catch(error => {
            console.error(error);
        });
    }

    submissionCallback({ ssn, dob, loanAmount, graphqlInfoCss }) {
        this.ssn = ssn;
        this.dob = dob;
        this.loanAmount = loanAmount ? applyMoneyMaskValue(loanAmount) : 'N/A';
        this.graphqlInfoCss = graphqlInfoCss;
    };

    eligibilityStatusCallback(error = false, { createdAt, status } = {}) {
        if (!this.dayjsInitialized) return window.setTimeout(() => this.eligibilityStatusCallback(error, { createdAt, status }), 100);

        if (error) this.eligibilityResultCallback(true);

        const createdTime = dayjs(createdAt);
        const endTime = dayjs();
        const elapsedTime = endTime.diff(createdTime, 'second', true);

        if (isToKeepPolling(status, elapsedTime)) {
            window.setTimeout(
                () => getEligibilityStatus(this.opportunity, this.recordId, this.eligibilityStatusCallback.bind(this)),
                5000,
            );
        }

        else getEligibilityResult(this.opportunity, this.recordId, this.eligibilityResultCallback.bind(this));
    }

    eligibilityResultCallback(error = false, { borrowerLtv, dti, rate, borrowerCreditScore } = {}) {
        if (error) {
            this.ltv = 'Error, refresh to view';
            this.dti = 'Error, refresh to view';
            this.rate = 'Error, refresh to view';
            this.fico = 'Error, refresh to view';
            this.eligibilityGraphqlInfoCss = 'value red';
            return;
        }
        this.ltv = borrowerLtv ? `${prettyFloatDisplay(borrowerLtv)}%` : 'N/A';
        this.dti = dti ? `${prettyFloatDisplay(dti)}%` : 'N/A';
        this.rate = `${parseFloat(parseFloat(rate).toFixed(3))}%` || 'N/A';
        this.fico = borrowerCreditScore || 'N/A';
        this.eligibilityGraphqlInfoCss = 'value';
    }

    handleEligibilityTrigger() {
        this.ltv = 'Loading, please wait';
        this.dti = 'Loading, please wait';
        this.rate = 'Loading, please wait';
        this.fico = 'Loading, please wait';
        this.eligibilityGraphqlInfoCss = 'value gray';
        getEligibilityStatus(this.opportunity, this.recordId, this.eligibilityStatusCallback.bind(this));
    }

    handleUpdateLoan(data) {
      this.loanAmount = (data?.selectedProduct?.totalLoanAmount)
        ? applyMoneyMaskValue(data.selectedProduct.totalLoanAmount)
        : 'N/A';
    }

    handleChannelMessage(message) {
        if (message.oppId !== this.opportunity.id) return;

        if (message.sectionId === SectionId.ELIGIBILITY_TRIGGER) this.handleEligibilityTrigger(message);
        if (message.sectionId === SectionId.LOAN_INFORMATION) this.handleUpdateLoan(message.result);
    }

    openAccount() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: getFieldValue(this.opportunity, ACCOUNT_ID),
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    };

    openCosigner() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: getFieldValue(this.opportunity, COSIGNER_ID),
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    };

    openOwner() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: getFieldValue(this.opportunity, OWNER_ID),
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    };

    get accountName() {
        return getFieldValue(this.opportunity, ACCOUNT_NAME);
    };

    get cosignerName() {
        return `${getFieldValue(this.opportunity, COSIGNER_FIRST_NAME)} ${getFieldValue(this.opportunity, COSIGNER_LAST_NAME)}`;
    };

    get cosigned() {
        return !!getFieldValue(this.opportunity, COSIGNER_FIRST_NAME);
    };

    get propertyAddress() {
        return getFieldValue(this.opportunity, PROPERTY_ADDRESS);
    };

    get ownerName() {
        return getFieldValue(this.opportunity, OWNER_NAME);
    };

    get lender() {
        return getFieldValue(this.opportunity, LENDER);
    };

    get lenderLoanNumber() {
        return getFieldValue(this.opportunity, LENDER_LOAN_NUMBER);
    };

    get encompassLoanNumber() {
        return getFieldValue(this.opportunity, ENCOMPASS_LOAN_NUMBER);
    };

    get stage() {
        return getFieldValue(this.opportunity, STAGE);
    };

    get lockDate() {
        return lockDate(getFieldValue(this.opportunity, LOCK_DATE));
    };

    get lockDateCSS() {
        return lockDateCSS(getFieldValue(this.opportunity, LOCK_EXPIRATION_DATE));
    };

    get lockExpirationDate() {
        return lockExpirationDate(getFieldValue(this.opportunity, LOCK_EXPIRATION_DATE));
    };

    get lockExpirationDateCSS() {
        return lockExpirationDateCSS(getFieldValue(this.opportunity, LOCK_EXPIRATION_DATE));
    };
}

const getSubmission = (opportunity, recordId, submissionCallback) => {
    const submissionUuid = getFieldValue(opportunity, SUBMISSION_UUID);
    const submissionType = getFieldValue(opportunity, SUBMISSION_TYPE);
    let gqlQuery = null;

    if (submissionType === 'MortgageRefi') {
        gqlQuery = REFINANCE_SUBMISSION_QUERY;
    } else if (submissionType === 'HomePurchase') {
        gqlQuery = PURCHASE_SUBMISSION_QUERY;
    } else {
        submissionCallback({
            dob: 'Not available',
            ssn: 'Not available',
            loanAmount: 'Not available',
        });
        console.error('Submission is not Mortgages Refinance nor Home Purchase.');
        return;
    }

    const promise = queryWithMap({ identifier: recordId, query: gqlQuery, variables: { submissionUuid } });
    promise.then(data => {
        const result = JSON.parse(data);

        submissionCallback({
            dob: formatDate(result.borrower.profile.dob, LONG_DATE_FORMAT),
            ssn: result.borrower.ssnLast4Digits,
            loanAmount: result.selectedProduct?.totalLoanAmount,
            graphqlInfoCss: 'value'
        })
    }).catch(error => {
        console.log(error);
        submissionCallback({
            graphqlInfoCss: 'value red',
            dob: 'Error, refresh to view',
            ssn: 'Error, refresh to view',
            loanAmount: 'Error, refresh to view',
        });
    })
},

    getEligibilityStatus = (opportunity, recordId, eligibilityStatusCallback) => {
        const submissionUuid = getFieldValue(opportunity, SUBMISSION_UUID);

        queryWithMap({ identifier: recordId, query: ELIGIBILITY_STATUS_QUERY, variables: { submissionUuid } })
            .then(data => {
                const result = JSON.parse(data);
                eligibilityStatusCallback(false, result)
            }).catch(error => {
                console.error(error);
                eligibilityStatusCallback(true);
            });
    },

    getEligibilityResult = (opportunity, recordId, eligibilityResultCallback) => {
        const submissionUuid = getFieldValue(opportunity, SUBMISSION_UUID);

        queryWithMap({ identifier: recordId, query: ELIGIBILITY_RESULT_QUERY, variables: { submissionUuid } })
            .then(data => {
                const result = JSON.parse(data);
                eligibilityResultCallback(false, result)
            }).catch(error => {
                console.error(error);
                eligibilityResultCallback(true);
            });
    },

    lockDate = (lockDate) => {
        return lockDate ? formatDate(lockDate, SHORT_DATE_FORMAT) : 'Not Locked';
    },

    lockDateCSS = (lockDate) => {
        return lockDate ? 'value' : 'value red';
    },

    lockExpirationDate = (expirationDate) => {
        if (!expirationDate) {
            return 'N/A';
        } else {
            let daysLeft = Date.parse(expirationDate) - Date.now() + 86400000; // 1000*60*60*24 - 1 day in miliseconds

            if (daysLeft < 0) {
                return `${formatDate(expirationDate, SHORT_DATE_FORMAT)} (Expired)`
            } else {
                daysLeft = Math.trunc(daysLeft / 86400000);

                if (daysLeft == 1) {
                    return `${formatDate(expirationDate, SHORT_DATE_FORMAT)} (${daysLeft} day left)`;
                } else {
                    return `${formatDate(expirationDate, SHORT_DATE_FORMAT)} (${daysLeft} days left)`;
                }
            }
        }
    },

    lockExpirationDateCSS = (expirationDate) => {
        if (!expirationDate) {
            return 'value';
        }

        let daysLeft = Date.parse(expirationDate) - Date.now();

        return daysLeft / 86400000 <= 9 ? 'value red' : 'value green'; // 1000*60*60*24 - Miliseconds to days
    },

    isToKeepPolling = (status, duration) => {
        if (isEligibilityCompleted(status)) return false;
        if (duration > 180) return false; // stop polling if it took longer than 180s (3min)

        return true;
    },

    isEligibilityCompleted = (status) => {
        if (!status) return false;
        return ['completed', 'failed'].includes(status);
    },

    formatDate = (dateString, format) => {
        if (dateString) {
            const date = Date.parse(`${dateString}T00:00:00`);
            return new Intl.DateTimeFormat('en-US', format).format(date);
        }

        return '';
    };

export {
    LONG_DATE_FORMAT,
    SHORT_DATE_FORMAT,
    lockDate,
    lockDateCSS,
    lockExpirationDate,
    lockExpirationDateCSS,
    formatDate
};