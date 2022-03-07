import { LightningElement, api, track } from 'lwc';

export default class MortgageLosUrlaParticipant extends LightningElement {
    @api recordId;
    @api role;
    @api showBothParticipants;
    @api participantUuid;

    @track participantInfoLabel;

    connectedCallback() {
        this.participantInfoLabel = 'Borrower Info'
        if(this.role === 'coBorrower')
            this.participantInfoLabel = 'Co-Borrower Info'
    }
}