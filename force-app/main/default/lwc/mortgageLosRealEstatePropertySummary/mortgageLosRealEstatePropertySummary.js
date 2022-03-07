import { LightningElement, api } from 'lwc';
import { getTradelineText, getFullAddress, ownershipTypes, getOptionLabelFromValues } from 'c/util'

export default class MortgageLosRealEstatePropertySummary extends LightningElement {
  @api properties = [];

  get processedProperties() {
    return this.properties.map(property => ({
      ...property,
      ownership: getOptionLabelFromValues(ownershipTypes, property.ownership),
      fullAddress: getFullAddress({
        addressLine1: property.addressLine1,
        unit: property.addressUnit,
        city: property.addressCity,
        stateCode: property.addressStateCode,
        zipCode: property.addressZipCode,
      }),
      primaryTradelines: Array.isArray(property.tradelines)
        ? property.tradelines
          .filter(tradeline => tradeline.type === 'primary')
          .map(tradeline => ({ uuid: tradeline.uuid, text: getTradelineText(tradeline) }))
        : null,
      secondaryTradelines: Array.isArray(property.tradelines)
        ? property.tradelines
          .filter(tradeline => tradeline.type !== 'primary')
          .map(tradeline => ({ uuid: tradeline.uuid, text: getTradelineText(tradeline) }))
        : null,
    }));
  }
}