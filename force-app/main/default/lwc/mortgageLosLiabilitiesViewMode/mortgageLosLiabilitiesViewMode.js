import { LightningElement, api, track } from 'lwc';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';
import { liability, moneyToFloat } from "c/util";
import { moneyMask } from 'c/inputMaskUtils';

export default class MortgageLosLiabilitiesViewMode extends LightningElement {
  dayjsInitialized = false;

  @track allLiabilities;
  @track openedModal;
  @track currentLiability;
  @track deletingLiability;
  @track importingLiabilities;
  @track isDeleting;
  @api role;
  @api save;
  @api borrowerUuid;
  @api coborrowerUuid;
  @api runImportLiabilities;

  @api
  get liabilities() {
    return this.allLiabilities;
  }

  set liabilities(value) {
    this.allLiabilities = value;
  }

  get showTable() {
    return this.allLiabilities && this.allLiabilities.length > 0;
  }

  get participant() {
    return this.role == 'borrower' ? 'Borrower' : 'Co-Borrower';
  }

  get modal() {
    return this.openedModal;
  }

  set modal(value) {
    this.openedModal = value;
  }

  handleAddModalClicked = () => {
    this.currentLiability = { ...liability };
    this.modal = true;
  }

  handleEditModalClicked = (liability) => {
    this.currentLiability = { ...liability.detail };
    this.modal = true;
  }

  handleCurrentLiabilityChange = (key, value) => {
    this.currentLiability[key] = value;
  }

  handleCloseModalCliked = (liability) => {
    if (liability.detail) {
      this.handleSaveLiabilities();
    } else {
      this.currentLiability = null;
      this.modal = false;
    }
  }

  handleDelete = (event) => {
    const deleting = event.target.getAttribute('data-details');
    this.deletingLiability = this.liabilities.find(liability => liability.uuid === deleting);
    this.isDeleting = true;
  }

  handleCloseDeleteModal = (event) => {
    const liability = event.detail;
    if (liability) {
      this.save({ ...this.prepareLiability(liability), delete: true });
    }
    this.isDeleting = false;
    this.deletingLiability = null;
  }

  handleCloseImportModal = (event) => {
    const importAgain = event.detail;
    if (importAgain) {
      this.runImportLiabilities()
    }
    this.importingLiabilities = false;
  }

  handleOpenImportModal = () => {
    this.importingLiabilities = true;
  }

  prepareLiability(liability) {
    return {
      uuid: liability.uuid,
      participantUuid: liability.whose === "borrower" ? this.borrowerUuid : (liability.whose === "co_borrower" ? this.coborrowerUuid : this.borrowerUuid),
      whose: liability.whose,
      accountNumber: liability.accountNumber,
      accountType: liability.accountType,
      companyName: liability.companyName,
      unpaidBalance: liability.unpaidBalanceWithMask ? moneyToFloat(moneyMask(liability.unpaidBalanceWithMask)) : null,
      monthlyPayment: liability.monthlyPaymentWithMask ? moneyToFloat(moneyMask(liability.monthlyPaymentWithMask)) : null,
      monthsLeft: liability.monthsLeft ? parseInt(liability.monthsLeft) : null,
      paidOff: liability.paidOff,
      paidOffAmount: liability.paidOffAmountWithMask ? moneyToFloat(moneyMask(liability.paidOffAmountWithMask)) : null,
      excludeDti: liability.excludeDti,
      resubordinated: liability.resubordinated,
      currentLienPosition: liability.resubordinated ? parseInt(liability.currentLienPosition) : null,
      proposedLienPosition: liability.resubordinated ? parseInt(liability.proposedLienPosition) : null,
      delete: !!liability.delete
    };
  }

  handleSaveLiabilities = () => {
    const form = this.template.querySelector('c-mortgage-los-liabilities-modal');
    if (form.validate) {
      const variables = this.prepareLiability(this.currentLiability);
      this.save(variables);
      this.currentLiability = null;
      this.modal = false;
    }
  }

  get humanLiabilityImportDate() {
    if (this.dayjsInitialized && this.showTable) {
      return dayjs.utc(this.allLiabilities[0].createdAt).local().format("MM/DD/YY [at] h:mm A z");
    }
    return '';
  }

  renderedCallback() {
    this.loadDayjs();
  }

  loadDayjs = () => {
    if (this.dayjsInitialized) {
      return;
    }
    Promise.all([
      loadScript(this, Dayjs + '/package/dayjs.min.js'),
      loadScript(this, Dayjs + '/package/plugin/utc.js'),
      loadScript(this, Dayjs + '/package/plugin/timezone.js'),
      loadScript(this, Dayjs + '/package/plugin/advancedFormat.js'),
    ]).then(() => {
      this.dayjsInitialized = true;
      dayjs.extend(dayjs_plugin_utc);
      dayjs.extend(dayjs_plugin_timezone);
      dayjs.extend(dayjs_plugin_advancedFormat);
    });
  }
}