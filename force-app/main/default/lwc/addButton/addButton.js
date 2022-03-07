import { LightningElement, api } from 'lwc';

export default class AddButton extends LightningElement {
    @api clickHandler
    @api title
}