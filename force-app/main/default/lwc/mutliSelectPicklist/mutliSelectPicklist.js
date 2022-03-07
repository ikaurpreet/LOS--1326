import { LightningElement, track, api } from 'lwc';

export default class MultiSelectPicklist extends LightningElement {

    @api
    values = [];

    @track
    selectedvalues = [];

    @api
    picklistlabel = 'Status';

    showdropdown;

    handleleave() {
        
        let sddcheck= this.showdropdown;

        if(sddcheck){
            this.showdropdown = false;
            this.fetchSelectedValues();
        }
    }

    connectedCallback(){
        this.values.forEach(element => element.selected 
                            ? this.selectedvalues.push(element.value) : '');
    }

    fetchSelectedValues() {
        
        this.selectedvalues = [];

        //get all the selected values
        this.template.querySelectorAll('c-picklist-value').forEach(
            element => {
                if(element.selected){
                    console.log(element.value);
                    this.selectedvalues.push(element.value);
                }
            }
        );

        //refresh original list
        const successEvent = new CustomEvent('change', { detail: this.selectedvalues });
        this.dispatchEvent(successEvent);
        this.refreshOrginalList();
    }

    refreshOrginalList() {
        //update the original value array to shown after close

        const picklistvalues = this.values.map(eachvalue => ({...eachvalue}));

        picklistvalues.forEach((element, index) => {
            if(this.selectedvalues.includes(element.value)){
                picklistvalues[index].selected = true;
            }else{
                picklistvalues[index].selected = false;
            }
        });

        this.values = picklistvalues;
    }

    handleShowdropdown(){
        let sdd = this.showdropdown;
        if(sdd){
            this.showdropdown = false;
            this.fetchSelectedValues();
        }else{
            this.showdropdown = true;
        }
    }

    get selectedmessage() {
        return this.selectedvalues.length + ' values are selected';
    }
}