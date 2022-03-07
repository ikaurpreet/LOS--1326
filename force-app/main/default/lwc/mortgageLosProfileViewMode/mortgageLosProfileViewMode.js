import { LightningElement, api } from 'lwc';
import { getMaritalLabel, getSuffixLabel, getCitizenLabel } from 'c/util';
import Dayjs from '@salesforce/resourceUrl/dayjs';
import { loadScript } from 'lightning/platformResourceLoader';

/**
 * Participant Form - View Mode
 * @module c-mortgage-los-profile-view-mode
 * @property {Object} participant - The participant object
 * @property {string} sectionSubtitle - The title of the section
 * @property {string} iconUrl - The icon to use in the title
 * @property {function} handleEdit - The callback function to change to Edit mode
 */

export default class MortgageLosProfileViewMode extends LightningElement {
  @api participant;
  @api sectionSubtitle;
  @api iconUrl;
  @api handleEdit;

  dayjsInitialized = false;

  renderedCallback() {
      if (this.dayjsInitialized) return;
      loadScript(this, Dayjs + '/package/dayjs.min.js').then(() => {
          this.dayjsInitialized = true;
      });
  }

  get maritalCurrentLabel() {
    return getMaritalLabel(this.participant.maritalType.value);
  }

  get suffixCurrentLabel() {
    return getSuffixLabel(this.participant.suffixType.value);
  }

  get citizenCurrentLabel() {
    return getCitizenLabel(this.participant.citizenship.value)
  }

  get DOBFormatted() {
    return dayjs(this.participant.dob.value).format('MM/DD/YYYY');
  }
}