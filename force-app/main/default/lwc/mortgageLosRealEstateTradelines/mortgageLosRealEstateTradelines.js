import { LightningElement, api, track } from 'lwc';
import { isAbbleToEdit, getTradelineText, MODE } from 'c/util';

import { default as viewMode } from './templates/view.html';
import { default as editMode } from './templates/edit.html';

export default class MortgageLosRealEstateTradelines extends LightningElement {
  @api property;
  @api tradelines = [];
  @api mode;
  @api label;
  @api handleEdit;

  @track status;

  editClass = isAbbleToEdit;

  render() {
    return this.mode === MODE.EDIT ? editMode : viewMode;
  }

  // #############
  // #           #
  // # View mode #
  // #           #
  // #############

  get hasTradelines () {
    return this.tradelinesWithText.length > 0;
  }

  get tradelinesWithText() {
    return ((Array.isArray(this.tradelines) && this.tradelines.length > 0))
    ? this.tradelines.map(tradeline => ({ uuid: tradeline.uuid, text: getTradelineText(tradeline) }))
    : [];
  }

  // #############
  // #           #
  // # Edit mode #
  // #           #
  // #############

  handleToggle(event) {
    this.dispatchEvent(new CustomEvent('edittradelinetoggle', {
      bubbles: true,
      composed: true,
      detail: {
        tradelineUuid: event.target.getAttribute('data-id'),
        checked: event.target.checked,
        propertyUuid: this.property.uuid,
        propertyId: this.property.id,
      },
    }));
  }

  get hasEditingTradelines() {
    return this.editingTradelines.length > 0;
  }

  get editingTradelines() {
    return (Array.isArray(this.tradelines) && this.tradelines.length > 0)
    ? this.tradelines
      .filter(tradeline =>
        (this.property.uuid && this.property.uuid === tradeline.propertyUuid)
        || (this.property.id && this.property.id === tradeline.propertyId)
        || (!tradeline.propertyUuid && !tradeline.propertyId)
      )
      .map(tradeline => ({ ...tradeline, checked: !!tradeline.propertyUuid || !!tradeline.propertyId, text: getTradelineText(tradeline) }))
    : [];
  }
}