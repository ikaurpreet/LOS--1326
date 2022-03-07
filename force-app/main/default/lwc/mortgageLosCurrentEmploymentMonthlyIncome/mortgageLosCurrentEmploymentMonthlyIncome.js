import { api, track } from 'lwc';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import CoBorrowerSR from '@salesforce/resourceUrl/CoBorrower';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION } from './mutations.js';
import { default as editMode } from './templates/edit.html';
import { default as viewMode } from './templates/view.html';
import { isAbleToEdit, getFullAddress, SectionId } from 'c/util'
import Employment2yrAlertChannel from '@salesforce/messageChannel/Employment2yrAlertChannel__c';
import { subscribe } from 'lightning/messageService'
import BaseComponent from 'c/baseComponent';

const emptyEmployment = {
  uuid: null,
  address: { addressLine1: '' },
  key: null,
  fullAddress: '',
  employerName: '',
  position: '',
  startedOn: '',
  endDate: null,
  isEmployerPartyToTransaction: null,
  hasOwnershipShare: null,
  employerType: null,
  businessPhone: '',
  currentlyWorking: true,
  workExperience: {
    years: null,
    months: null
  },
  grossMonthlyIncomeSummary: {
    base: 0,
    bonuses: 0,
    commissions: 0,
    other: 0,
    overtime: 0,
    total: 0
  },
  delete: false
};

export default class MortgageLosCurrentEmploymentMonthlyIncome extends BaseComponent {
  @api role;
  @api showBothParticipants;
  @api isEditing = false;
  @track employments = {
    borrower: [],
    coBorrower: []
  }
  @track didMeetTimeRequirement = {
    borrower: null,
    coBorrower: null
  }
  @track allEmployments;
  borrowerIconUrl = BorrowerSR;
  coBorrowerIconUrl = CoBorrowerSR
  borrowerId;
  coBorrowerId;
  dayjsInitialized = false;
  editClass = isAbleToEdit
  subscription = null;

  /**
   * Implmentation of "virtual" method to retrieve initial data set
   */
  loadSubmissionData() {
    this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
  }

  renderedCallback() {
    if (this.dayjsInitialized) {
      return;
    }
    loadScript(this, Dayjs + '/package/dayjs.min.js').then(() => {
      this.dayjsInitialized = true;
    }).catch(error => {
      console.log(error);
    });
  }

  connectedCallback() {
    this.handleSubscribe();
  }

  handleSubscribe() {
    if (this.subscription) {
      return;
    }
    this.subscription = subscribe(this.messageContext, Employment2yrAlertChannel, (message) => {
      this.didMeetTimeRequirement.borrower = this.metTimeRequirement([...message.borrowerEmployments, ...this.employments.borrower]);
      this.didMeetTimeRequirement.coBorrower = this.metTimeRequirement([...message.coBorrowerEmployments, ...this.employments.coBorrower]);
    });
  }

  calcTimeInEmployment = (employment, period) => {
    if (employment.startedOn && this.dayjsInitialized) {
      const endDate = employment.endDate ? dayjs(employment.endDate) : dayjs();
      return endDate.diff(dayjs(employment.startedOn), period, true);
    }
    return 0;
  }

  isCurrent = (employment, employments) => {
    return employments[0].uuid === employment.uuid;
  }

  getTitle = (role, employment, employments) => {
    if (role === 'borrower') {
      return this.isCurrent(employment, employments) ? "Current Employment - Borrower" : "Additional Current Employment - Borrower";
    } else {
      return this.isCurrent(employment, employments) ? "Current Employment - Co-Borrower" : "Additional Current Employment - Co-Borrower"
    }
  }

  calcTimeInCurrentEmployment = (employments) => {
    let timeInEmployments = 0;
    employments.filter(e => !e.endDate).forEach(employment => {
      timeInEmployments += this.calcTimeInEmployment(employment, 'month');
    });
    return timeInEmployments;
  }

  calcTimeInEmployments = (employments) => {
    let timeInEmployments = 0;
    employments.forEach(employment => {
      timeInEmployments += this.calcTimeInEmployment(employment, 'year');
    });
    return timeInEmployments;
  }

  metTimeRequirement(employments) {
    const currentEmploymentTime = this.calcTimeInCurrentEmployment(employments);
    const totalEmploymentTime = this.calcTimeInEmployments(employments);
    if (currentEmploymentTime > 0 && totalEmploymentTime >= 2) {
      return true;
    }
    return false;
  }

  set currentAndPreviousEmployments(value) {
    this.allEmployments = value;
  }

  get currentAndPreviousEmployments() {
    return this.allEmployments;
  }

  updateAllEmployments = (employment, role) => {
    const employmentIndex = this.currentAndPreviousEmployments[role].employments.findIndex(original => original.uuid === employment.uuid);
    this.currentAndPreviousEmployments[role].employments[employmentIndex] = employment;
    const newEmployements = [...this.currentAndPreviousEmployments[role].employments];
    this.currentAndPreviousEmployments = { ...this.currentAndPreviousEmployments, [role]: { ...this.currentAndPreviousEmployments[role], employments: newEmployements } };
  }

  get showExtraBorrowerTitle() {
    return this.employments.borrower.filter(employment => !employment.delete).length === 0;
  }

  get showExtraCoBorrowerTitle() {
    return this.employments.coBorrower.filter(employment => !employment.delete).length === 0;
  }

  get showBorrower() {
    return this.role === "borrower" || this.showBothParticipants;
  }

  get showCoBorrower() {
    return this.role === "coBorrower" || this.showBothParticipants;
  }

  get showMetTwoYearMessageForBorrower() {
    return this.showBorrower && this.didMeetTimeRequirement.borrower
  }

  get showDidNotMeetTwoYearMessageForBorrower() {
    return this.showBorrower && !this.didMeetTimeRequirement.borrower
  }

  get showMetTwoYearMessageForCoBorrower() {
    return this.showCoBorrower && this.didMeetTimeRequirement.coBorrower
  }

  get showDidNotMeetTwoYearMessageForCoBorrower() {
    return this.showCoBorrower && !this.didMeetTimeRequirement.coBorrower
  }

  handleEdit = () => {
    this.isEditing = true;
  }

  moneyToFloat(moneyString) {
    return moneyString ? parseFloat(moneyString.toString().replaceAll(',', '')) : 0;
  }

  calculateTotalMonthlyIncome(summary) {
    return (this.moneyToFloat(summary.base) +
      this.moneyToFloat(summary.bonuses) +
      this.moneyToFloat(summary.commissions) +
      this.moneyToFloat(summary.other) +
      this.moneyToFloat(summary.overtime)).toFixed(2);
  }

  handleInputChange = (value, inputName, role, employmentId) => {
    this.employments[role].forEach((employment, index) => {
      if (employment.uuid == employmentId) {
        employment = { ...employment, [inputName]: value }
        this.employments[role][index] = employment;
        this.updateAllEmployments(employment, role);
      }
    });
    if (this.showBorrower) {
      this.didMeetTimeRequirement.borrower = this.metTimeRequirement(this.currentAndPreviousEmployments.borrower.employments);
    }
    if (this.showCoBorrower) {
      this.didMeetTimeRequirement.coBorrower = this.metTimeRequirement(this.currentAndPreviousEmployments.coBorrower.employments);
    }
  }

  handleAddressInputChange = (value, inputName, role, employmentId) => {
    this.employments[role].forEach((employment, index) => {
      if (employment.uuid == employmentId) {
        const address = { ...employment.address, [inputName]: value };
        employment = { ...employment, address };
        this.employments[role][index] = employment;
      }
    });
  }

  handleSummaryInputChange = (value, inputName, role, employmentId) => {
    this.employments[role].forEach((employment, index) => {
      if (employment.uuid == employmentId) {
        let grossMonthlyIncomeSummary = { ...employment.grossMonthlyIncomeSummary, [inputName]: value };
        grossMonthlyIncomeSummary = { ...grossMonthlyIncomeSummary, total: this.calculateTotalMonthlyIncome(grossMonthlyIncomeSummary) }
        employment = { ...employment, grossMonthlyIncomeSummary };
        this.employments[role][index] = employment;
      }
    });
  }

  handleCancel = () => {
    this.sectionController.hideContent();
    this.isEditing = false;
    this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
  }

  mutationCallback(result) {
    if (result) {
      const currentBorrowerList = this.employments.borrower.filter(e => !e.delete);
      const currentCoBorrowerList = this.employments.coBorrower.filter(e => !e.delete);
      const newBorrowerList = result.borrower ? result.borrower.employments.filter(e => !e.endDate) : [];
      const newCoBorrowerList = result.coBorrower ? result.coBorrower.employments.filter(e => !e.endDate) : [];
      if ((newBorrowerList.length < currentBorrowerList.length) || (newCoBorrowerList.length < currentCoBorrowerList.length)) {
        this.publishMessage(SectionId.PREVIOUS_EMPLOYMENT, result);
      }
      this.publishMessage(SectionId.CURRENT_EMPLOYMENT, result);
    }
    this.submissionCallback(result);
  }

  deleteEmployment = (employmentKey, role) => {
    this.employments[role].find((employment, index) => {
      if (employment.key == employmentKey && employment.uuid) {
        employment = { ...employment, delete: true };
        this.employments[role][index] = employment;
      } else if (employment.key == employmentKey && !employment.uuid) {
        this.employments[role] = this.employments[role].filter(employment => {
          return employment.key != employmentKey
        });
      }
    });
  }

  prepareEmployment(employments) {
    return employments.map(employment => {
      employment.address = employment.address ? {
        addressLine1: employment.address.addressLine1,
        city: employment.address.addressLine1 ? employment.address.city : '',
        unit: employment.address.addressLine1 ? employment.address.unit : '',
        stateCode: employment.address.addressLine1 ? employment.address.stateCode : '',
        zipCode: employment.address.addressLine1 ? employment.address.zipCode : '',
      } : null;
      return {
        uuid: employment.uuid,
        position: employment.position,
        employerName: employment.employerName,
        address: employment.address,
        isEmployerPartyToTransaction: employment.isEmployerPartyToTransaction,
        hasOwnershipShare: employment.hasOwnershipShare,
        employerType: employment.employerType,
        incomes: [
          { incomeType: "balanceEmploymentIncome", amount: this.moneyToFloat(employment.grossMonthlyIncomeSummary.base), paymentTermType: 'perMonth', delete: false },
          { incomeType: "overtime", amount: this.moneyToFloat(employment.grossMonthlyIncomeSummary.overtime), paymentTermType: 'perMonth', delete: false },
          { incomeType: "bonuses", amount: this.moneyToFloat(employment.grossMonthlyIncomeSummary.bonuses), paymentTermType: 'perMonth', delete: false },
          { incomeType: "commissions", amount: this.moneyToFloat(employment.grossMonthlyIncomeSummary.commissions), paymentTermType: 'perMonth', delete: false },
          { incomeType: "other", amount: this.moneyToFloat(employment.grossMonthlyIncomeSummary.other), paymentTermType: 'perMonth', delete: false }
        ],
        businessPhone: employment.businessPhone,
        startedOn: employment.startedOn,
        endDate: employment.endDate,
        delete: employment.delete || false
      }
    })
  }

  addAditionalBorrowerCurrentEmployment = () => {
    this.handleEdit();
    this.employments.borrower.push({ ...emptyEmployment, key: Math.random() });
  }

  addAditionalCoBorrowerCurrentEmployment = () => {
    this.handleEdit();
    this.employments.coBorrower.push({ ...emptyEmployment, key: Math.random() });
  }

  handleSaveClick = () => {
    const sections = this.template.querySelectorAll('c-mortgage-los-current-employment-monthly-income-edit-mode');
    let validForm = true;
    sections.forEach(section => {
      validForm = validForm * section.validate;
    });

    if (validForm) {
      this.sectionController.hideContent();
      this.isEditing = false;
      let variables = {};
      if (this.showBorrower) {
        variables["borrower"] = {
          "uuid": this.borrowerId,
          "employments": this.prepareEmployment(this.employments.borrower)
        };
      }
      if (this.showCoBorrower) {
        variables["coBorrower"] = {
          "uuid": this.coBorrowerId,
          "employments": this.prepareEmployment(this.employments.coBorrower)
        };
      }
      this.updateParticipant(
        this.mutationCallback.bind(this),
        variables,
        { REFINANCE_SUBMISSION_MUTATION, PURCHASE_SUBMISSION_MUTATION }
      );
    }
  }

  setEmployment(employment) {
    const address = employment.address || { addressLine1: '' };
    return {
      uuid: employment.uuid,
      key: employment.uuid,
      address: address,
      fullAddress: getFullAddress(address),
      employerName: employment.employerName,
      position: employment.position,
      startedOn: employment.startedOn,
      endDate: employment.endDate,
      isEmployerPartyToTransaction: employment.isEmployerPartyToTransaction,
      hasOwnershipShare: employment.hasOwnershipShare,
      employerType: employment.employerType,
      businessPhone: employment.businessPhone,
      workExperience: {
        years: Math.floor(employment.workExperience / 12),
        months: employment.workExperience % 12
      },
      grossMonthlyIncomeSummary: {
        base: employment.grossMonthlyIncomeSummary.base.toFixed(2),
        bonuses: employment.grossMonthlyIncomeSummary.bonuses.toFixed(2),
        commissions: employment.grossMonthlyIncomeSummary.commissions.toFixed(2),
        other: employment.grossMonthlyIncomeSummary.other.toFixed(2),
        overtime: employment.grossMonthlyIncomeSummary.overtime.toFixed(2),
        total: (employment.grossMonthlyIncomeSummary.total).toFixed(2)
      },
      currentlyWorking: !employment.endDate
    }
  }

  submissionCallback(result) {
    if (result) {
      if (this.showBorrower) {
        this.borrowerId = result.borrower.uuid;
        this.employments.borrower = result.borrower.employments.filter(e => !e.endDate).map((employment) => {
          return this.setEmployment(employment);
        })
        this.didMeetTimeRequirement.borrower = this.metTimeRequirement(result.borrower.employments);
      }
      if (this.showCoBorrower) {
        this.coBorrowerId = result.coBorrower.uuid;
        this.employments.coBorrower = result.coBorrower.employments.filter(e => !e.endDate).map((employment) => {
          return this.setEmployment(employment);
        })
        this.didMeetTimeRequirement.coBorrower = this.metTimeRequirement(result.coBorrower.employments)
      }
      this.currentAndPreviousEmployments = result;
      this.sectionController.showContent();
    } else {
      this.sectionController.showError();
    }
  }

  render() {
    return this.isEditing ? editMode : viewMode;
  }

}