import { LightningElement,api, track } from 'lwc';
import httpCallout from '@salesforce/apex/ApiCalloutController.httpCallout';
import createNewRemoteSiteRec from '@salesforce/apex/MetadataAPIUtility.createNewRemoteSiteRec';
import generateBearerToken from '@salesforce/apex/ApiCalloutController.generateBearerToken';
import getApiRecords from '@salesforce/apex/ApiCalloutController.getApiRecords';

export default class ApiHealthCheck extends LightningElement {
 RequestBodyModal = false;
 @track token = ''
 status = ''
 url = ''
 fetchedData
 basicAuth = false
 oAuth = false
 bearerToken = false
 response = false
 remoteUrlPresent = false;
 accessFullname = 'None'
 accessremoteUrl = 'None'

 headerValues = new Object();

 inputparams = {auth:'None',method:'GET'}

 keysarray = []
 valuesarray = []

 @track jsonBodyValue = ''

    @api response = [
        {apiName : 'Demo1',statusCode : 200 , body : 'Demo'},
        {apiName : 'Demo2',statusCode : 102 , body : 'Demo'},
        {apiName : 'Demo3',statusCode : 103 , body : 'Demo'},
        {apiName : 'Demo1',statusCode : 101 , body : 'Demo'},
        {apiName : 'Demo1',statusCode : 200 , body : 'Demo'}
    ]
    //Handle selecting HTTP method
    methodValue = 'GET';
    get methodOptions() {
        return [
            {label: 'GET', value: 'GET'},
            {label: 'POST', value: 'POST'},
            {label: 'PUT', value: 'PUT'},
            {label: 'DELETE', value: 'DELETE'}
        ]
    }

    handleMethodChange(event) {
        this.methodValue = event.target.value
        this.inputparams.method = this.methodValue
        if(this.methodValue == 'GET' || this.methodValue == 'DELETE'){
            this.keysarray = []
            this.valuesarray = []
            this.jsonBodyValue = ''
            this.inputparams.body = undefined
        }
    }
 
    
    //Handle URL change

    onUrlChange(event) {
        this.url = event.target.value
        this.inputparams.url = this.url
    }

    //handle Body Change
    handleBody(event) {
        this.jsonBodyValue = event.target.value
        console.log('body',this.jsonBodyValue)
    }

    //Handle selecting authorization type

    authvalue = 'None';
    get authOptions() {
        return [
            { label: 'None', value: 'None' },
            { label: 'Basic authentication', value: 'Basic authentication' },
            { label: 'OAuth 2.0', value: 'OAuth 2.0' },
            { label: 'Bearer token', value: 'Bearer token' }
        ];
    }

    handleAuthChange(event) {
        this.authvalue = event.detail.value;
        this.inputparams.auth = this.authvalue
        this.basicAuth = (this.authvalue == 'Basic authentication');
        this.oAuth = (this.authvalue == 'OAuth 2.0')
        this.bearerToken = (this.authvalue == 'Bearer token')
    }

    //Handle adding header values for OAuth 2.0 and Basic auth

    usernameChange(event) {
        this.username = event.target.value
        this.headerValues.username=this.username;
    }
       
    passwordChange(event) {
        this.password = event.target.value
        this.headerValues.password=this.password;
    }

    grantTypeChange(event) {
        this.grantType = event.target.value
        this.headerValues.grant_type=this.grantType;
    }
    clientIdChange(event) {
        this.clientId = event.target.value
        this.headerValues.client_id=this.clientId;
    }
    clientSecretChange(event) {
        this.clientSecret = event.target.value
        this.headerValues.client_secret=this.clientSecret;
    }
    accessTokenUrlChange(event) {
        this.tokenUrl = event.target.value
    }

    bearerTokenValueChange(event) {
        this.token = event.target.value
        this.inputparams.token = this.token
    }
    

    //Handle entering body detils in the form

    clearBody()
    {
        this.jsonBodyValue = ''
        this.inputparams.body = undefined
    }

    //Handle done button click

    handleSaveDetails()
    {
        console.log('<===In handleVerifyDetails===>');
        //Verify whether url is valid
        function isValidHttpUrl(string) {
            try{
                const newUrl = new URL(string);
                return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
            }catch (err) {
                return false;
            }
        }
        if(isValidHttpUrl(this.url)==true) {
            console.log('222')
            this.response = true
            this.fetchedData = ''

            //Create a new remote site settings based on input

            var pathArray = this.url.split( '/' );
            var protocol = pathArray[0];
            var host = pathArray[2];
            var baseurl = protocol + '//' + host;
            const remoteUrl = baseurl
            const fullname = baseurl.replace(/[^a-zA-Z ]/g, "")
        

            if(this.authvalue == 'OAuth 2.0') {
                var accesspathArray = this.tokenUrl.split( '/' );
                var accessprotocol = accesspathArray[0];
                var accesshost = accesspathArray[2];
                var accessbaseurl = accessprotocol + '//' + accesshost;
                this.accessremoteUrl = accessbaseurl
                this.accessFullname = this.accessremoteUrl.replace(/[^a-zA-Z ]/g, "")

            } else {
                this.accessremoteUrl = 'None'
                this.accessFullname = 'None'
            }

            createNewRemoteSiteRec({remoteSiteName:fullname,RemoteSiteUrl:remoteUrl,accessTokenUrl:this.accessremoteUrl,accessTokenFullname:this.accessFullname})
            .then(result=>{
                console.log('result',result)
            })
            .catch(error=>{
                console.log('error',error.message)
                this.error = error.message;
                alert(JSON.stringify(error.body.message))
            })
        } 
        else {
            alert('Invalid URL')
        }

    }

    handleVerifyDetails()
    {
        console.log('<===In handleVerifyDetails===>');
        if(this.remoteUrlPresent == false)
        {
            this.handleSaveDetails();
            this.remoteUrlPresent = true;
        }
        if(this.remoteUrlPresent == true)
        {
            if(this.authvalue == 'OAuth 2.0')
            {
                console.log('<===In handleVerifyDetails===>OAuth 2.0===>');
                generateNewAccessToken({header:JSON.stringify(this.headerValues),accessTokenUrl:this.tokenUrl})  
                .then(result=>{
                    this.responseval = result
                    this.responseBody = this.responseval.slice(this.responseval.indexOf('{'))
                    this.jsonresponsebody = JSON.parse(this.responseBody)
                    this.accesstoken = this.jsonresponsebody['access_token']
                    this.inputparams.token = this.accesstoken

                    //If method is POST or PUT to create new resource

                    if(this.methodValue == 'POST' || this.methodValue == 'PUT')
                    {
                        createNewResource({token:this.accesstoken,body:this.inputparams.body,endPointUrl:this.inputparams.url})
                        .then(result=>{
                            this.fetchedData = result;
                        })
                        .catch(error =>{
                            this.error = error.message;
                            alert(JSON.stringify(error.body.message))
                        })
                            //Else other methods        
                    }
                    else
                    {
                        httpCallout({inputs:JSON.stringify(this.inputparams),header:JSON.stringify(this.headerValues)})
                        .then(result=>{
                            this.fetchedData = result;
                        })
                        .catch(error =>{
                            this.error = error.message;
                            alert(JSON.stringify(error.body.message))
                        })  
                    }
                })
                .catch(error =>{
                    this.error = error.message;
                    console.log('Catch<===In handleVerifyDetails===>OAuth 2.0===>',this.error);
                    alert(JSON.stringify(error.body.message))
                })           
            }
            else if(this.authvalue == 'Bearer token')
            {
                console.log('<===In handleVerifyDetails===>Bearer token===>');
                console.log('endPointUrl=====>',this.inputparams.url);
                console.log('body======>',this.jsonBodyValue);
                console.log('Method====>',this.inputparams.method);
                console.log('this.token====>',this.token);
                if(this.token == null || this.token == '')
                {
                    generateBearerToken({EndPointUrl:this.inputparams.url,body:this.jsonBodyValue})
                    .then(result=>{
                        console.log('result==>',result)
                        var res = JSON.parse(result.slice(result.indexOf('{')))
                        this.token = res['token'];
                        console.log('this.token===>',this.token);
                        this.jsonBodyValue = '';
                    })
                    .catch(error =>{
                        console.log('Catch<===In handleVerifyDetails===>Bearer token===>');
                        this.error = error.body.message;
                        alert(JSON.stringify(error.body.message))
                    })
                }
                else
                {
                    if(this.inputparams.token == null || this.inputparams.token == null)
                    {
                        this.inputparams.token = this.token;
                    }
                    if(this.methodValue == 'POST' || this.methodValue == 'PUT')
                    {
                        console.log('this.token=====>',this.token);
                        console.log('this.inputparams.url=====>',this.inputparams.url);
                        createNewResource({token:this.token,body:this.jsonBodyValue,endPointUrl:this.inputparams.url})
                        .then(result=>{
                            this.fetchedData = result;
                            console.log('<===In handleVerifyDetails===>Bearer token===>result===>',this.fetchedData);
                        })
                        .catch(error =>{
                            this.error = error.message;
                            alert(JSON.stringify(error.body.message))
                        })
                            //Else other methods        
                    }
                    else
                    {
                        console.log('this.token=====>esle===>',this.token);
                        console.log('this.inputparams=====>',JSON.stringify(this.inputparams));
                        httpCallout({inputs:JSON.stringify(this.inputparams),header:JSON.stringify(this.headerValues)})
                        .then(result=>{
                            this.fetchedData = result;
                            console.log('<===In handleVerifyDetails===>Bearer token===>result===>2==>',this.fetchedData);
                        })
                        .catch(error =>{
                            this.error = error.message;
                            alert(JSON.stringify(error.body.message))
                        })  
                    }
                }
                
            }
            else if(this.authvalue == 'Basic authentication')
            {
                console.log('<===In handleVerifyDetails===>Basic authentication===>>');
                console.log('this.inputparams=====>',JSON.stringify(this.inputparams));
                console.log('this.header=====>',JSON.stringify(this.headerValues));
                httpCallout({inputs:JSON.stringify(this.inputparams),header:JSON.stringify(this.headerValues)})
                .then(result=>{
                    this.fetchedData = result;
                    console.log('<===In handleVerifyDetails===>None===>result===>2==>',this.fetchedData);
                })
                .catch(error =>{
                    this.error = error.message;
                    alert(JSON.stringify(error.body.message))
                })  
            }
            //If authentication is not OAuth 2.0
            else {
                console.log('<=========Final else Block=======>');
                httpCallout({inputs:JSON.stringify(this.inputparams),header:JSON.stringify(this.headerValues)})
                .then(result=>{
                    this.fetchedData =  result
                    console.log('<===In handleVerifyDetails===>Final else Block===>result===>2==>',this.fetchedData);
                })
                .catch(error =>{
                    this.error = error.message;
                    alert(JSON.stringify(error.body.message))
                })
            }
        }   
    }

    openRequestBody()
    {
        this.RequestBodyModal = true;
        console.log('recordid',this.contacts);
    }

    closePopup()
    {
        this.RequestBodyModal=false
    }
    fetchRecords(event){
        console.log('clciked fetch record')
        getApiRecords()
        .then(result=>{
            console.log('records====>',JSON.stringify(result))
        })
    }
}