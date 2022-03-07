import { api, track } from 'lwc';
import { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY } from './queries.js';
import BaseComponent from 'c/baseComponent';
import { SectionId } from 'c/util';

export default class MortgageLosMonthlyIncomeSummary extends BaseComponent {
  @api role;
  @api showBothParticipants;
  @track incomes = {
    borrower: {},
    coBorrower: {},
    totals: {}
  }

  get showBorrower() {
    return this.role === "borrower" || this.showBothParticipants;
  }

  get showCoBorrower() {
    return this.role === "coBorrower" || this.showBothParticipants;
  }

  get borrowerTdClass() {
    return this.showBorrower === false ? 'disable-td' : null;
  }

  get coBorrowerTdClass() {
    return this.showCoBorrower === false ? 'disable-td' : null;
  }

  /**
   * Implmentation of "virtual" method to retrieve initial data set
   */
  loadSubmissionData() {
    this.getSubmission(this.submissionCallback.bind(this), { REFINANCE_SUBMISSION_QUERY, PURCHASE_SUBMISSION_QUERY });
  }

  connectedCallback() {
    this.registerSubscription(
      [SectionId.CURRENT_EMPLOYMENT, SectionId.OTHER_INCOME],
      this.loadSubmissionData
    );
  }

  submissionCallback(result) {
    if (result) {
      this.incomes.borrower = result.borrower.grossMonthlyIncomeSummary

      if (!result.coBorrower) {
        this.incomes.coBorrower = {
          base: null,
          overtime: null,
          bonuses: null,
          commissions: null,
          other: null,
          total: null
        }
        this.incomes.totals = result.borrower.grossMonthlyIncomeSummary
      } else {
        this.incomes.coBorrower = result.coBorrower.grossMonthlyIncomeSummary
        this.incomes.totals = {
          base: (this.showCoBorrower ? this.incomes.coBorrower.base : 0) + (this.showBorrower ? this.incomes.borrower.base : 0),
          overtime: (this.showCoBorrower ? this.incomes.coBorrower.overtime : 0) + (this.showBorrower ? this.incomes.borrower.overtime : 0),
          bonuses: (this.showCoBorrower ? this.incomes.coBorrower.bonuses : 0) + (this.showBorrower ? this.incomes.borrower.bonuses : 0),
          commissions: (this.showCoBorrower ? this.incomes.coBorrower.commissions : 0) + (this.showBorrower ? this.incomes.borrower.commissions : 0),
          other: (this.showCoBorrower ? this.incomes.coBorrower.other : 0) + (this.showBorrower ? this.incomes.borrower.other : 0),
          otherSources: (this.showCoBorrower ? this.incomes.coBorrower.otherSources : 0) + (this.showBorrower ? this.incomes.borrower.otherSources : 0),
          total: (this.showCoBorrower ? this.incomes.coBorrower.total : 0) + (this.showBorrower ? this.incomes.borrower.total : 0),
        }
      }
      this.sectionController.showContent();
    } else {
      this.sectionController.showError();
    }
  }
}