import { LightningElement, api } from 'lwc';

/**
 * Used for show usefull information
 * @module c-mortgage-los-help-text
 * @property {string} icon - The Icon that goes in the left
*/

export default class MortgageLosHelpText extends LightningElement {
    @api icon;
}