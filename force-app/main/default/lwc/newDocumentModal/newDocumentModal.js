import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import requestNewDocument from '@salesforce/apex/MortgagesTasksController.requestNewDocument';
import getConditionTypeDocuments from '@salesforce/apex/MortgagesTasksController.getConditionTypeDocuments';
import getConditionInstructions from '@salesforce/apex/MortgagesTasksController.getConditionInstructions';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import OPPORTUNITY_OBJECT from '@salesforce/schema/Opportunity';
import BORROWER_FIRST_NAME_FIELD from '@salesforce/schema/Opportunity.First_Name__c';
import BORROWER_LAST_NAME_FIELD from '@salesforce/schema/Opportunity.Last_Name__c';
import COBORROWER_FIRST_NAME_FIELD from '@salesforce/schema/Opportunity.Cosigner_First_Name__c';
import COBORROWER_LAST_NAME_FIELD from '@salesforce/schema/Opportunity.Cosigner_Last_Name__c';

/* Enables the Loan Offer to request a new document to the borrower and/or co-borrower. */
export default class NewDocumentModal extends LightningElement {
    @api isOpened = false; // Modal exibition control
    @api hideButton = false;
    @api instructionsErrorMessage = null;
    @api instructionsValidity = null;

    // Form values
    @api ownerValue = 'borrower';
    @api categoryValue;
    nameValue = null;
    documentId = null;
    instructionsValue = null;
    rawInstructionsValue = null;
    reasonValue = null;
    documentNameOptions = null;
    instructionTextFormats = ['color'];

    instructionsLabel = 'Upload Instructions';

    // Form control
    onlyBorrower = false;
    ownerDisabled = false;
    loading = false;

    @api recordId;
    accountObject = OPPORTUNITY_OBJECT;

    @wire(getRecord, {recordId: '$recordId', fields: [
        BORROWER_FIRST_NAME_FIELD,
        BORROWER_LAST_NAME_FIELD,
        COBORROWER_FIRST_NAME_FIELD,
        COBORROWER_LAST_NAME_FIELD
    ]})
    record;

    @track hasRendered = true;
    
    renderedCallback() {
        this.hideRichTextEditorToolbar();
        this.updateInstructionsOwnerText();
        if (this.hasRendered) {
            this.categoryValue && this.conditionNameOptions();
            this.hasRendered = false;
        }
    }

    hideRichTextEditorToolbar() {
        let element = this.template.querySelector('lightning-input-rich-text');

        if (!element) {
            setTimeout(() => {
                this.hideRichTextEditorToolbar()
            }, 100);

            return;
        }

        const style = document.createElement('style');
        style.innerText = '.slds-rich-text-editor__toolbar {display: none;}';
        element.appendChild(style);
    }

    get ownerOptions() {
        const borrowerFirstName = getFieldValue(this.record.data, BORROWER_FIRST_NAME_FIELD),
            borrowerLastName = getFieldValue(this.record.data, BORROWER_LAST_NAME_FIELD),
            coborrowerFirstName = getFieldValue(this.record.data, COBORROWER_FIRST_NAME_FIELD),
            coborrowerLastName = getFieldValue(this.record.data, COBORROWER_LAST_NAME_FIELD);

        this.onlyBorrower = !(coborrowerFirstName && coborrowerLastName);
        this.ownerDisabled = this.onlyBorrower;
        if (!this.onlyBorrower) {
            return [
                { label: `Borrower (${borrowerFirstName} ${borrowerLastName})`, value: 'borrower' },
                { label: `Co-borrower (${coborrowerFirstName} ${coborrowerLastName})`, value: 'co_borrower' },
                { label: `Both (${borrowerFirstName} + ${coborrowerFirstName})`, value: 'both' }
            ];
        } else {
            return [
                { label: `Borrower (${borrowerFirstName} ${borrowerLastName})`, value: 'borrower' }
            ];
        }
    }

    get categoryOptions() {
        return [
            { label: 'Income', value: 'w2Paystub' },
            { label: 'Assets', value: 'asset' },
            { label: 'Property', value: 'property' },
            { label: 'Other', value: 'other' }
        ];
    }

    handleOwnerChange(event) {
        this.ownerValue = event.detail.value;
        this.updateInstructionsOwnerText();
    }

    updateInstructionsOwnerText() {
        const borrowerFirstName = getFieldValue(this.record.data, BORROWER_FIRST_NAME_FIELD),
        borrowerLastName = getFieldValue(this.record.data, BORROWER_LAST_NAME_FIELD),
        coborrowerFirstName = getFieldValue(this.record.data, COBORROWER_FIRST_NAME_FIELD),
        coborrowerLastName = getFieldValue(this.record.data, COBORROWER_LAST_NAME_FIELD);

        switch(this.ownerValue) {
            case 'borrower':
                this.instructionsLabel = `Upload Instructions for ${borrowerFirstName} ${borrowerLastName}`;
                break;
            case 'both':
                this.instructionsLabel = `Upload Instructions for ${borrowerFirstName} and ${coborrowerFirstName}`;
                break;
            case 'co_borrower':
                this.instructionsLabel = `Upload Instructions for ${coborrowerFirstName} ${coborrowerLastName}`;
                break;
        }
    }

    handleCategoryChange(event) {
        this.categoryValue = event.detail.value;
        this.clearComboboxValue();
        this.conditionNameOptions();
        this.hideDocumentCustomNameInput();
        this.clearInstructions();
    }

    handleInstructionsChange(event) {
        this.instructionsErrorMessage = null;
        this.instructionsValue = event.detail.value;
        this.validateInstructions();
    }

    handleReasonChange(event) {
        this.reasonValue = event.detail.value;
    }

    clearModalFields() {
        this.ownerValue = 'borrower';
        this.categoryValue = null;
        this.reasonValue = null;
        this.clearComboboxValue();
        this.clearInstructions();
        this.hideDocumentCustomNameInput();
        this.loading = false;
    }

    openModal() {
        this.isOpened = true
    }

    closeModal() {
        this.clearModalFields()
        const closeEvent = new CustomEvent('close');
        this.dispatchEvent(closeEvent);
        this.isOpened = false
    }

    requestDocument() {
        this.loading = true;
        const isFormValid = [...this.template.querySelectorAll('lightning-input, lightning-combobox, lightning-radio-group')]
            .reduce((validSoFar, inputField) => {
                inputField.reportValidity();
                return validSoFar && inputField.checkValidity();
            }, true);
        
        if (isFormValid && this.validateInstructions()) {
            const description = this.instructionsValue ? this.removeHtmlTagsFromText(this.instructionsValue) : '';
            const metadata = {
                display_order: [
                    {
                        title: 'Document Name'
                    },
                    {
                        upload_instructions: 'Upload Instructions'
                    }
                ],
                upload_instructions: description,
                reason_value: this.reasonValue
            };
            
            requestNewDocument({
                opportunityId: this.recordId,
                type: this.categoryValue,
                title: this.nameValue,
                participantRole: this.ownerValue,
                description,
                metadata
            }).then(() => {
                const event = new ShowToastEvent({
                    title: 'New document requested.',
                    message: 'The new document request was sent to the user.',
                    variant: 'success',
                    mode: 'dismissable'
                });
                this.dispatchEvent(event);

                setTimeout(this.closeModal.bind(this), 2000);
            }).catch(error => {
                this.loading = false;

                console.log(error);

                const evt = new ShowToastEvent({
                    title: `There was an error creating task ${this.nameValue}.`,
                    message: `Please try again later.`,
                    variant: 'error',
                  });
                this.dispatchEvent(evt);
            })
        } else {
            this.loading = false;
        }
    }

    conditionNameOptions() {
        this.fechDocumentNames().then((documents) => {
            const fetchedOptions = documents.map(document => Object.assign({label: document.name, value: document.id }));
            this.documentNameOptions = [{ label: 'Custom document name', value: 'customName' }, ...fetchedOptions];
        });
    }

    handleDocumentChange(event) {
        const documentId = event.detail.value;
        if (documentId == 'customName') {
            this.showDocumentCustomNameInput();
            this.rawInstructionsValue = null;
            this.instructionsValue = '';
            this.nameValue = '';
        } else {
            this.hideDocumentCustomNameInput();
            getConditionInstructions({id: documentId}).then((instruction) => {
                this.nameValue = this.documentNameOptions.find(opt => opt.value === documentId).label;
                this.rawInstructionsValue = instruction;
                this.instructionsValue = this.markTextRed(instruction);
            });
        }
    }

    handleCustomDocumentNameChange(event) {
        this.nameValue = event.detail.value;
    }

    fechDocumentNames() {
        switch(this.categoryValue) {
            case 'w2Paystub':
                return getConditionTypeDocuments({type: "Income"});
            case 'asset':
                return getConditionTypeDocuments({type: "Assets"});
            case 'property':
                return getConditionTypeDocuments({type: "Property"});
            case 'other':
                return getConditionTypeDocuments({type: "Other"});
        }
    }

    markTextRed(text) {
        if(text) {
            return text.replace(/\[(.*?)\]/g, '<span style="color: red;">$&</span>');
        }

        return '';
    }

    removeHtmlTagsFromText(text) {
        const unhtmlized = text.replaceAll(/<[^>]+>/gm, '');
        const txt = document.createElement("textarea");
        txt.innerHTML = unhtmlized;
        return txt.value;
    }

    validateInstructions() {
        // regext selects all matches of [text] and __ values
        const pattern = /\[(.*?)\]|(_{2,})/gm;
        const unHtmlizedInstructions = this.removeHtmlTagsFromText(this.instructionsValue || '');
        const matchesPattern = unHtmlizedInstructions.match(pattern) || [];
        
        if (!this.instructionsValue) {
            this.instructionsValidity = false;
            this.instructionsErrorMessage = 'Complete this field';
        // when condition have instructions that no need to edit
        } else if ((unHtmlizedInstructions == this.rawInstructionsValue) 
                   && matchesPattern.length == 0
                   && this.instructionsValue !== '') {
            this.instructionsValidity = true;
            
        // when condition have instructions that needed to edit
        } else if ((unHtmlizedInstructions == this.rawInstructionsValue) && matchesPattern.length > 0) {
            this.instructionsValidity = false;
            this.instructionsErrorMessage = 'Symbols [] and __ are not allowed';
        // when condition have instructions that edited not correctly
        }  else if ((unHtmlizedInstructions != this.rawInstructionsValue) && matchesPattern.length > 0) {
            this.instructionsValidity = false;
            this.instructionsErrorMessage = 'Symbols [] and __ are not allowed';
            // when condition have too long instructions that are correct
        } else if ((unHtmlizedInstructions != this.rawInstructionsValue) && matchesPattern.length == 0 && unHtmlizedInstructions.length > 250) {
            this.instructionsValidity = false;
            this.instructionsErrorMessage = `Instructions is too long, it should be 250 symbols, instead ${unHtmlizedInstructions.length}`;
            // when condition have instructions that edited correctly
        }   else if ((unHtmlizedInstructions != this.rawInstructionsValue) && matchesPattern.length == 0) {
            this.instructionsValidity = true;
        }

        return this.instructionsValidity;
    }

    showDocumentCustomNameInput() {
        const element = this.template.querySelector(`lightning-input`);
        const style = element.style;
        if (style) {
            style.display = 'block';
        }
    }

    hideDocumentCustomNameInput() {
        const element = this.template.querySelector(`lightning-input`);
        const style = element.style;
        if (style) {
            style.display = 'none';
        }
    }

    clearComboboxValue() {
        this.nameValue = null;
        this.documentId = null;
        const element = this.template.querySelector(`lightning-combobox`);
        element.value = null;
        element.options = null;
        this.documentNameOptions = null;
    }

    clearInstructions() {
        this.instructionsValue = '';
        this.rawInstructionsValue = null;
        this.instructionsErrorMessage = null;
    }
}