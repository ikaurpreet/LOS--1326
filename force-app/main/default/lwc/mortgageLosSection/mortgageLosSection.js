import { LightningElement, api, track } from 'lwc';

/**
 * @module c-mortgage-los-section
 * @property {string} title - The section title
 * @property {string} icon - The icon-name (Salesforce Component)
*/

export default class MortgageLosSection extends LightningElement {
  @api title;
  @api icon;
  @api delAction;
  @track loadingSection = true;
  @track showingErrorMessage = false;

  startLoading = () => {
    this.loadingSection = true;
  }

  finishLoading = () => {
    this.loadingSection = false;
  }

  showErrorMessage = () => {
    this.showingErrorMessage = true;
  }

  get bodyClass(){
    return (this.loadingSection || this.showingErrorMessage) ? '' : 'slds-card__body slds-card__body_inner';
  }

  get headerClass(){
    const commomClass = 'slds-media slds-media_center slds-has-flexi-truncate slds-theme_shade slds-p-vertical_small slds-p-horizontal_medium';
    return this.loadingSection ? commomClass: `${commomClass} slds-border_bottom`;
  }
}