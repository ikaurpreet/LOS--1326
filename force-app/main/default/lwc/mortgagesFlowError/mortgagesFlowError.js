import { LightningElement, api } from 'lwc';

const ERROR_PATTERN = /An Apex error occurred: (.*): (.*)/;

export default class MortgagesFlowError extends LightningElement {
  @api error;

  connectedCallback() {
    this.parseError();
  }

  parseError() {
    const matches = this.error.match(ERROR_PATTERN);
    this.error = { exceptionType: matches[1], message: matches[2] };
  }
}