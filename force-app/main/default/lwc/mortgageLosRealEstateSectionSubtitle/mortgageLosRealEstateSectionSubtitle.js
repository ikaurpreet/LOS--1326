import { LightningElement, api } from 'lwc';
import BorrowerSR from '@salesforce/resourceUrl/Borrower';
import CoBorrowerSR from '@salesforce/resourceUrl/CoBorrower';
import { ownershipEnum } from 'c/util'

export default class MortgageLosRealEstateSectionSubtitle extends LightningElement {
  @api ownership;
  @api subtitleText;

  borrowerIconUrl = BorrowerSR;
  coBorrowerIconUrl = CoBorrowerSR

  get isSingleOwnership() {
    return this.ownership !== ownershipEnum.BOTH;
  }
}