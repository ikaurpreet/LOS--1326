import { LightningElement, api, track } from 'lwc';
import alert from './alert.html';
import modal from './modal.html';
import authError from './auth-error.html';

export default class MortgagesError extends LightningElement {
  @api error;
  @api variant = 'alert';
  @api authErrorMessage;
  @api authId;
  @track isOpen = true;

  render() {
    if (this.authErrorMessage) {
      return authError;
    } else if(this.variant === 'alert') {
      return alert;
    } else if (this.variant === 'modal') {
      return modal;
    }
  }

  get fieldErrors() {
    if (this.error.fieldErrors) {
      const fieldErrors = Object.entries(this.error.fieldErrors).map((item) => { 
        return { field: item[0], messages: item[1].map((i) => { return i.message }) }
      });
  
      return fieldErrors;
    } 
  }

  authClickHandler() {
    window.open('/' + this.authId + '/e', 'Enter Login Details', 'width=900,height=600');
    this.authId = null;
    this.authErrorMessage = 'Please, refresh page';
  }

  connectedCallback() {
    this.handleAuthError(this.error);
  }

  handleAuthError(error) {
    switch(error.exceptionType) {
        case 'MortgagesNamedCredentialsGraphQLClient.TokenExpiredException':
            this.authErrorMessage = 'Your session is expired, please walk through sign-in process';
            this.authId = error.message;
            break;
        case 'MortgagesNamedCredentialsGraphQLClient.NoTokenException':
            this.authErrorMessage = 'Your session was not found, please create it by going through the sign-in process';
            this.authId = error.message;
            break;
        case 'MortgagesNamedCredentialsGraphQLClient.NoExternalSourceException':
            this.authErrorMessage = 'Your authentication settings was not found, please create it going through the sign-in process';
            this.authId = error.message;
            break;
        case 'MortgagesNamedCredentialsGraphQLClient.NoNamedCredentialsException':
            this.authErrorMessage = error.message;
            break;
        default:
            return false;
    }
    return true;
  }

  get isModal() {
    return this.variant === 'modal';
  }

  get isAlert() {
    return this.variant === 'alert';
  }

  close() {
    const closeEvent = new CustomEvent('close');
    this.dispatchEvent(closeEvent);
  }
}