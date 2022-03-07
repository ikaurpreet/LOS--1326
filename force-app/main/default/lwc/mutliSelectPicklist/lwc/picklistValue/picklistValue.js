import { LightningElement, api } from 'lwc';

export default class PicklistValue extends LightningElement {
    
    @api
    selected = false;
    
    @api
    label;
    
    @api
    value;


    handleSelect(_e) {
        //this.selected = true;
        
        if(this.selected){
            this.selected = false;
        }else{
            this.selected = true;
        } 
        
    }
}