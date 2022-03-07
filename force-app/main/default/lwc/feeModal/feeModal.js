import { LightningElement,track } from 'lwc';
export default class FeeModal extends LightningElement {
    @track isModalOpen = true;
    @track isOpen = false;
    @track isSecondModalOpen = false;
    @track feeValue;
    @track paidBy='Borrower';
    @track paidTo='Lender';
    @track payableAt='POC';
    @track checkboxValue=['APR'];
    @track month;
    @track amountPerDay;
    @track totalAmount;
    @track cushion;
    @track dueDate1;
    @track clickedButtonTitle;
    get options() {
        return [
            { label: 'Homeowner\'s Insurance', value: 'HomeownerInsurance' },
            { label: 'Flood Insurance Reserve', value: 'FloodInsuranceReserve' },
        ];
    }
    get paidByOptions() {
        return [
            { label: 'Borrower', value: 'Borrower' },
            { label: 'Lender', value: 'Lender' },
        ];
    }
    get paidToOptions() {
        return [
            { label: 'Borrower', value: 'Borrower' },
            { label: 'Lender', value: 'Lender' },
        ];
    }
    get payableAtOptions() {
        return [
            { label: 'POC', value: 'POC' },
            { label: 'Money Transfer', value: 'MoneyTransfer' },
        ];
    }
    get checkboxOptions() {
        return [
            { label: 'APR', value: 'APR' },
        ];
    }

    handleClick(event) {
        this.clickedButtonTitle = event.target.title;
    }
    handleDueDateChange(event) {
        this.dueDate1 = event.detail.value;
    }
    handleCushionChange(event) {
        this.cushion = event.detail.value;
    }
    handleMonthChange(event) {
        this.month = event.detail.value;
        this.totalAmount=this.amountPerDay*this.month;
    }
    handleAmount(event) {
        this.amountPerDay = event.detail.value;
        this.totalAmount=this.amountPerDay*this.month;
    }
    handleChange(event) {
        this.value = event.detail.value;
        this.feeValue=event.detail.value;
    }
    handlePaidBy(event) {
        this.paidBy=event.detail.value;
    }
    handlePaidTo(event) {
        this.paidTo=event.detail.value;
    }
    handlePayableAt(event) {
        this.payableAt=event.detail.value;
    }
    handleCheckboxChange(event) {
        this.checkboxValue=event.detail.value;
    }
    submitDetails() {
        this.isSecondModalOpen = true;
        this.isModalOpen = false;
    }
    closeSecondModal() {
        this.isModalOpen = true;
        this.isSecondModalOpen = false;
    }
}