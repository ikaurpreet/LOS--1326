import { LightningElement, api, wire, track } from 'lwc';
import { getFieldValue, getRecord } from 'lightning/uiRecordApi';
import getOpportunityDetails from '@salesforce/apex/GetRelatedRecordsLOC.getOpportunityDetails';
import SUBMISSION_UUID from '@salesforce/schema/Opportunity.mortgage_Submission_UUID__c';
import SUBMISSION_TYPE from '@salesforce/schema/Opportunity.Submission_Type__c';
import ID from '@salesforce/schema/Opportunity.Id';
import queryWithMap from '@salesforce/apex/GraphQLProxyController.queryWithMap';
import mutateWithMap from '@salesforce/apex/GraphQLProxyController.mutateWithMap';
import { REFINANCE_SUBMISSION_QUERY, VPAELIG_SUBMISSION_QUERY } from './queries.js';
import { INCOME_MUTATION_QUERY, ASSET_MUTATION_QUERY, RERUN_MUTATION_QUERY, PUSH_MUTATION_QUERY } from './mutations.js';
import { moneyMask } from 'c/inputMaskUtils';

export default class HomePurchaseVpa extends LightningElement {
    @api role;
    @api recordId;
    @api showBothParticipants;
    @track assets;
    @track incomes;
    @track zipCode;
    @track occupancyType;
    @track propertyType;
    @track vpaStatus;
    @track isAssetsEdited = false;
    @track isIncomesEdited = false;
    @track showElig = false;
    @track showEligError = false;
    @track opportunity;
    @track loanAmount;
    @api uuid;
    @track sumAssets;
    @track sumIncomes;

    get showBorrower() {
        return this.role === "Borrower";
    }

    get showCoBorrower() {
        return this.role === "coBorrower";
    }

    get assetsSectionController() {
        return this.template.querySelector('c-mortgage-los-section-controller[data-id=assetssection]');
    }

    get incomeSectionController() {
        return this.template.querySelector('c-mortgage-los-section-controller[data-id=incomesection]');
    }

    get propertySectionController() {
        return this.template.querySelector('c-mortgage-los-section-controller[data-id=propertysection]');
    }

    get eligibilitySectionController() {
        return this.template.querySelector('c-mortgage-los-section-controller[data-id=eligibilities]');
    }

    submissionCallback(result) {
        if (result) {
            let allAssets = []
            let allIncomes = [];
            this.borrowerIncomeSources = [];
            this.coBorrowerIncomeSources = [];
            if ((this.showCoBorrower || this.showBothParticipants) && result.hasOwnProperty("coBorrower")) {
                allAssets = allAssets.concat(result.coBorrower.provedAssets.map((asset) => {
                    return {
                        owner: (asset.jointAccount.length > 0) ? 'Both' : 'Co-Borrower',
                        role: 'coBorrower',
                        ...asset,
                    };
                }));
                allIncomes = allIncomes.concat(result.coBorrower.incomes.map((income) => {
                    return {
                        key: `co-borrower-${income.incomeType}`,
                        role: 'coBorrower',
                        ...income,
                    };
                }));
            }
            if (this.showBorrower || this.showBothParticipants) {
                allAssets = allAssets.concat(result.borrower.provedAssets.map((asset) => {
                    return {
                        owner: (asset.jointAccount.length > 0) ? 'Both' : 'Borrower',
                        role: 'borrower',
                        ...asset,
                    };
                }));
                allIncomes = allIncomes.concat(result.borrower.incomes.map((income) => {
                    return {
                        key: `borrower-${income.incomeType}`,
                        role: 'borrower',
                        ...income,
                    };
                }));
            }
            this.assets = allAssets;
            this.incomes = allIncomes;
            this.purchaseProperty = result.purchaseProperty;
            this.zipCode = this.purchaseProperty.address.zipCode;
            this.occupancyType = this.purchaseProperty.occupancyType;
            this.propertyType = this.purchaseProperty.propertyType;
            this.vpaStatus = result.vpa.status;
            this.calcSumAssets();
            this.calcSumIncomes();
            this.assetsSectionController.showContent();
            this.incomeSectionController.showContent();
            this.propertySectionController.showContent();
            this.isIncomesEdited = false;
            this.isAssetsEdited = false;
        } else {
            this.assetsSectionController.showError();
            this.incomeSectionController.showError();
            this.propertySectionController.showError();
        }
    }

    showEligibilities(records) {
        if (records) {
            this.showElig = true;
            this.loanAmount = records[0].maxLoanAmount;
            this.propertySectionController.showContent();
        } else {
            this.showElig = true;
            this.showEligError = false;
        }
    }

    onDoubleClickAssetsEdit() {
        this.isAssetsEdited = true;
    }

    onDoubleClickIncomesEdit() {
        this.isIncomesEdited = true;
    }

    handleAssetsCancel() {
        this.isAssetsEdited = false;
    }

    handleIncomesCancel() {
        this.isIncomesEdited = false;
    }

    handleIncomesSave() {
        this.isIncomesEdited = false;
        this.incomeSectionController.hideContent();
        updateParticipant(this.opportunity,
            this.recordId,
            this.mutationCallback.bind(this),
            {
                "submissionUuid": this.uuid,
                "participantRole": this.incomes[0].role,
                "verifiedAmounts": this.prepareIncomes(this.incomes)
            },
            "incomes"
        );
    }

    handleAssetsSave() {
        this.isAssetsEdited = false;
        this.assetsSectionController.hideContent();
        updateParticipant(this.opportunity,
            this.recordId,
            this.mutationCallback.bind(this),
            {
                "submissionUuid": this.uuid,
                "participantRole": this.assets[0].role,
                "verifiedAmounts": this.prepareAssets(this.assets)
            },
            "assets"
        );
    }

    handleReRun() {
        this.incomeSectionController.hideContent();
        this.assetsSectionController.hideContent();
        this.propertySectionController.hideContent();
        updateParticipant(this.opportunity,
            this.recordId,
            this.mutationCallback.bind(this),
            {
                "submissionUuid": this.uuid,
            },
            "rerun"
        );
    }

    handlePushToDashboard() {
        updateParticipant(this.opportunity,
            this.recordId,
            this.mutationCallback.bind(this),
            {
                "submissionUuid": this.uuid,
            },
            "pushtodashboard"
        );
    }

    mutationCallback = (result, type) => {
        if (type === 'rerun' || type === 'pushtodashboard') {
            if (result) {
                getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
                getEligibilities(this.opportunity, this.recordId, this.showEligibilities.bind(this))
            } else {
                this.showEligError = true;
            }
        } else {
            getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
        }
    }

    mutationCallbackRerun = (result) => {
        if (result) {
            getSubmission(this.opportunity, this.recordId, this.submissionCallback.bind(this));
        }
    }

    prepareAssets(assets) {
        return assets.map(asset =>
            ({
                uuid: asset.uuid,
                amount: parseFloat(asset.provedAmount)
            })
        );
    }
    prepareIncomes(incomes) {
        return incomes.map(income =>
            ({
                incomeType: income.incomeType,
                amount: parseFloat(income.provedAmount)
            })
        );
    }

    calcSumAssetsEvt(event) {
        const element = this.assets.find(ele => ele.uuid === event.target.dataset.id);
        element.provedAmount = event.target.value;
        this.assets = [...this.assets];
        this.calcSumAssets();
    }

    calcSumIncomesEvt(event) {
        const element = this.incomes.find(ele => ele.key === event.target.dataset.id);
        element.provedAmount = event.target.value;
        this.incomes = [...this.incomes];
        this.calcSumAssets();
    }

    calcSumAssets() {
        const sumAssets = this.assets.map(item => item.provedAmount >= 0 ? item.provedAmount : item.amount).reduce((prev, curr) => prev + curr, 0);
        this.sumAssets = `$${moneyMask(sumAssets.toFixed(2))}`;
    }

    calcSumIncomes() {
        var sumIncomes = 0;
        for (let income of this.incomes) {
            var yearincome = 0;
            let amt = income.provedAmount >= 0 ? income.provedAmount : income.amount;
            if (amt > 0) {
                if (income.paymentTermType === 'Weekly')
                    yearincome = amt * 52;
                else if (income.paymentTermType === 'Monthly')
                    yearincome = amt * 12;
                else
                    yearincome = amt
            }
            sumIncomes = parseFloat(sumIncomes) + parseFloat((yearincome / 12));
            sumIncomes = Number(sumIncomes).toFixed(2);
        }
        this.sumIncomes = `$${moneyMask(sumIncomes)}`;
    }


    @wire(getOpportunityDetails, { uuid: '$uuid' })
    initialize({ error, data }) {
        if (data) {
            console.log("Opp>>" + JSON.stringify(data));
            var opportunity = data;
            this.opportunity = data;
            this.recordId = opportunity.Id;
            this.role = 'Borrower';
            getSubmission(opportunity, this.recordId, this.submissionCallback.bind(this));
        } else {
            console.log("error: " + JSON.stringify(error));
            console.log("No data");
        }
    };
}

const getSubmission = (opportunity, recordId, submissionCallback) => {
    const submissionUuid = opportunity.mortgage_Submission_UUID__c;
    const submissionType = opportunity.Submission_Type__c;
    let gqlQuery = REFINANCE_SUBMISSION_QUERY;

    const promise = queryWithMap({ identifier: recordId, query: gqlQuery, variables: { submissionUuid } });
    promise.then(data => {
        const result = JSON.parse(data);
        submissionCallback(result);
    }).catch(error => {
        console.log(error);
        submissionCallback(null);
    })
}

const getEligibilities = (opportunity, recordId, showEligibilities) => {
    const submissionUuid = opportunity.mortgage_Submission_UUID__c;
    const submissionType = opportunity.Submission_Type__c;
    const gqlQuery = VPAELIG_SUBMISSION_QUERY;

    const promise = queryWithMap({ identifier: recordId, query: gqlQuery, variables: { submissionUuid } });
    promise.then(data => {
        const result = JSON.parse(data);
        showEligibilities(result);
    }).catch(error => {
        submissionCallback(null);
    })
}

const updateParticipant = (opportunity, recordId, mutationCallback, variables, type) => {
    const submissionType = getFieldValue(opportunity, SUBMISSION_TYPE);
    let gqlQuery = null;
    if (type === 'incomes')
        gqlQuery = INCOME_MUTATION_QUERY;
    else if (type === 'assets')
        gqlQuery = ASSET_MUTATION_QUERY;
    else if (type === 'rerun')
        gqlQuery = RERUN_MUTATION_QUERY;
    else if (type === 'pushtodashboard')
        gqlQuery = PUSH_MUTATION_QUERY;


    const promise = mutateWithMap({ identifier: recordId, query: gqlQuery, variables: variables });
    promise.then(data => {
        const result = JSON.parse(data);
        mutationCallback(result, type);
    }).catch(error => {
        console.log(error);
        mutationCallback(null, null);
    })
}