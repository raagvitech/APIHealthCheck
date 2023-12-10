import { LightningElement,api, track } from 'lwc';

export default class ResponseBody extends LightningElement {
    @api apiName;
    @api statusCode;
    @api body;
    @track showPopup = false;
    get getStatusCodeCardClass() {
        return this.isStatusCode200 ? 'successCard' : 'failureCard';
    }
    get isStatusCode200() {
        return this.statusCode === 200;
    }
    get textareaValue() {
        return `API Name : ${this.apiName}`;
    }
    get StatusCode(){
        return `Status Code : ${this.statusCode}`;
    }
    openPopup(){
        console.log('clicked')
        this.showPopup = true;
    }
    closePopup() {
        this.showPopup = false;
    }

}