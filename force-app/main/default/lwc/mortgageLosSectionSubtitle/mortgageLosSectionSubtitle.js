import { LightningElement, api } from 'lwc';

/**
 * The title used to describe a sub-section
 * @module c-mortgage-los-section-subtitle
 * @property {string} icon - the image src
 * @property {string} text - the label description
 */

export default class MortgageLosSectionSubtitle extends LightningElement {
  @api icon;
  @api text;
}