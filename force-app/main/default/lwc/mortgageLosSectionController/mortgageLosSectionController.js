import { LightningElement, track, api } from 'lwc';

/**
 * This component is used for controlling when show or hide it's content
 * @module c-mortgage-los-section-controller
 * @external MortgageLosSectionController
 * @property {boolean} uncontrolled - Used in case the child component won't control when to show the content (will always show)
*/

export default class MortgageLosSectionController extends LightningElement {
    @track
    loadingContent = true;

    @track
    showingError = false;

    @api
    uncontrolled;

    @api
    showContent() {
        this.loadingContent = false;
        this.handleSectionReady();
    }

    @api
    hideContent() {
        this.loadingContent = true;
        this.handleSectionLoad();
    }

    @api
    showError() {
        this.handleSectionReady();
        this.handleSectionError();
        this.showingError = true;
    }

    connectedCallback() {
        if (this.uncontrolled) {
            this.showContent();
        }
    }

    get showSectionContent() {
        return !(this.loadingContent || this.showingError);
    }

    /**
     * handleSectionLoad
     * @property {Function} handleSectionLoad Dispatch Event to render Spinner component in the Section Component
    */
    handleSectionLoad() {
        this.dispatchEvent(new CustomEvent("sectioncontroller__loading", { bubbles: true, composed: true }));
    }

    /**
     * @property {Function} handleSectionReady Dispatch Event to hide Spinner component in the Section Component
    */
    handleSectionReady() {
        this.dispatchEvent(new CustomEvent("sectioncontroller__ready", { bubbles: true, composed: true }));
    }

    /**
     * @property {Function} handleSectionError Dispatch Event to render an Error Alert in the Section Component
    */
    handleSectionError() {
        this.dispatchEvent(new CustomEvent("sectioncontroller__error", { bubbles: true, composed: true }));
    }
}