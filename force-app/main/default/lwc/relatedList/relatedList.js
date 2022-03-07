import { LightningElement, wire, api, track} from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';

const actions = [
    { label: 'View', name: 'view' },
];

export default class RelatedList extends NavigationMixin( LightningElement )  {

    @api columndata = [];
    @api title;
    @api titleWithCounter;
    @api objectName;
    @api set records(value) {
        this._records = JSON.parse(JSON.stringify(value));
        this.renderPageImperatively();
    }
    get records(){
        return this._records;
    }
    @api recordObjectName;
    @api newObjectEnabled;
    @api newObjectDefaultValues;

    @track error;

    @track sortedDirection;
    @track sortedBy;

    @track page = 1;
    @track items = [];
    @track pageData = [];
    @track startingRecord = 1;
    @track endingRecord = 0;
    @track pageSize = 50;
    @track totalRecordCount = 0;
    @track totalPage = 0;
    @track recordsToDisplay = [];
    @track showTable = false;

    connectedCallback() {
        this.renderPageImperatively();
    }

    renderPageImperatively() {
        this.totalRecordCount = this.records.length;
        this.totalPage = Math.ceil(Number(this.totalRecordCount)/this.pageSize);
        this.pageData = this.records.slice(0,this.pageSize);
        this.endingRecord = this.pageSize;
        this.titleWithCounter = this.title + " (" + this.totalRecordCount.toString() + ")";
        this.sortedBy = undefined;
        this.sortedDirection = undefined;
    }

    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    //clicking on next button this method will be called
    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);
        }
    }

    //this method displays records page by page
    displayRecordPerPage(page){

        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalRecordCount)
                            ? this.totalRecordCount : this.endingRecord;

        this.pageData = this.records.slice(this.startingRecord, this.endingRecord);

        this.startingRecord = this.startingRecord + 1;
    }

    sortColumns(event) {
        // serialize the data before calling sort function
        this.sortedDirection = event.detail.sortDirection;
        this.sortedBy = event.detail.fieldName;
        this.sortData(this.sortedBy, this.sortedDirection);
    }

    sortData(fieldName, direction) {
        let parseData = JSON.parse(JSON.stringify(this.records));

        if(fieldName == 'nameUrl'){
            fieldName = 'Name';
        } else if(fieldName == 'ContactAccountNameUrl'){
            fieldName = 'ContactAccountName';
        }
        /*check for null and text field type and change to lowercase*/
        const keyValue = (a) => {
            let fieldValue = a[fieldName] ? (typeof a[fieldName] === 'string' ? a[fieldName].toLowerCase() : a[fieldName]) : '';
           return fieldValue;
        }

        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;

        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';

            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });

        // set the sorted data to data table data
        this._records = parseData;
        this.page = 1;
        this.displayRecordPerPage(this.page);
    }

    handleRowAction( event ) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch ( actionName ) {
            case 'view':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: this.objectName,
                        actionName: 'view'
                    }
                });
                break;
            case 'edit':
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: row.Id,
                        objectApiName: this.objectName,
                        actionName: 'edit'
                    }
                });
                break;
            default:
        }

    }
}