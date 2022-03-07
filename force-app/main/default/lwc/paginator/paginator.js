import { LightningElement, api, track} from 'lwc';

export default class Paginator extends LightningElement {
    @api records;
    @api totalrecordcount;
    @track page = 1; 
    @track items = []; 
    @track data = []; 
    @track startingRecord = 1;
    @track endingRecord = 0; 
    @track pageSize = 5; 
    @track totalPage = 0;
    recordsToDisplay = [];


    connectedCallback() {
        this.totalPage = Math.ceil(Number(this.totalrecordcount) / this.pageSize); 
        this.displayRecordPerPage(this.page);
    }

    previousHandler() {
        if (this.page > 1) {
            this.page = this.page - 1;
            this.displayRecordPerPage(this.page);
        }
    }

    nextHandler() {
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1;
            this.displayRecordPerPage(this.page);            
        }             
    }

    displayRecordPerPage(page){
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);

        this.endingRecord = (this.endingRecord > this.totalrecordcount) 
                            ? this.totalrecordcount : this.endingRecord; 

        this.recordsToDisplay = this.records.slice(this.startingRecord, this.endingRecord);

        this.startingRecord = this.startingRecord + 1;
        this.dispatchEvent(new CustomEvent('paginatorchange', {detail: this.recordsToDisplay}));
    }   
    
    @api
    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.records));

        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };

        // cheking reverse direction 
        let isReverse = direction === 'asc' ? 1: -1;

        // sorting data 
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';

            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });

        // set the sorted data to data table data
        this.records = parseData;
        this.page = 1;
        this.displayRecordPerPage(this.page); 

    }   

}