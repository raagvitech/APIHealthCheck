/**
 * @ Author: Clueless Coders
 * @ Create Time: 09/12/2023
 * @ Modified by: Your name
 * @ Modified time: 09/12/2023
 * @ Description: Apex method to perform HTTP callouts
 */

public class ApiCalloutController {

//Generate new access token from user credentials
    @AuraEnabled
    public static string generateNewAccessToken(String header,String accessTokenUrl){

        HTTP http = new HTTP();
        HttpRequest request = new HttpRequest();
        request.setMethod('POST');
        request.setEndpoint(accessTokenUrl);

        String jsonBodyString = APICalloutController.getBodyString(header);
        request.setBody(jsonBodyString);
        HttpResponse response = HTTP.send(request);
        String finalResponse = response.getStatusCode() +' '+  response.getStatus() + response.getBody();
        return finalResponse;
    }

    @AuraEnabled
    public static string generateBearerToken(String EndPointUrl,String body){
        System.debug('EndPointUrl'+EndPointUrl);
        System.debug('body'+body);
        HTTP http = new HTTP();
        HttpRequest request = new HttpRequest();
        request.setMethod('POST');
        request.setEndpoint(EndPointUrl);
        String jsonBodyString = APICalloutController.getBodyString(body);
        request.setBody(jsonBodyString);
        Long startTime = DateTime.now().getTime();
        HttpResponse response = HTTP.send(request);
        Long endTime = DateTime.now().getTime();
        String finalResponse = response.getBody();
        Double timeDiff = TimeDiff.getTimeDifference(startTime,endTime);
        System.debug('timeDiff'+timeDiff);
        System.debug('finalResponse===>'+finalResponse);
        return finalResponse;
    }
//Create body string

    public static String getBodyString(String body){
        
        Map<String, Object> bodyMap = (Map<String, Object>)JSON.deserializeUntyped(body);
        String jsonBodyString = '';
        if(bodyMap.size()>0){
            Set <String> bodyKeys = new Set <String>();
            bodyKeys = bodyMap.keySet();
            List<String> keyList = new List<String>(bodyKeys);
            jsonBodyString = keyList[0] + '=' + bodyMap.get(keyList[0]);
            if(bodyMap.size()>1){
                for(Integer i=1;i<keyList.size();i++){
                    jsonBodyString = jsonBodyString + '&' + keyList[i] + '=' + bodyMap.get(keyList[i]);
                }
            }
        }
        return jsonBodyString;
    }


//HTTP callout to get response

    @AuraEnabled
    public static String httpCallout(String inputs,String header) {

        Map<String, Object> inputparamsMap = (Map<String, Object>)JSON.deserializeUntyped(inputs);
        Map<String, Object> headerMap = (Map<String, Object>)JSON.deserializeUntyped(header);

        API_Dummy__c apiDummy = new API_Dummy__c ();

        String endpoint = String.valueOf(inputparamsMap.get('url'));
        String authType = String.valueOf(inputparamsMap.get('auth'));
        String method = String.valueOf(inputparamsMap.get('method'));
        String token = String.valueOf(inputparamsMap.get('token'));
        String body = String.valueOf(inputparamsMap.get('body'));

        apiDummy.EndpointURL__c = endpoint;
        if(authType != 'None')
        {
            apiDummy.Calllout_Auth_Type__c = authType;
        }
        else {
            apiDummy.Calllout_Auth_Type__c = 'N/A';
        }
        apiDummy.Callout_Method__c = method;

        Http http = new HTTP();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(endpoint);
        request.setMethod(method);
		if(method != 'GET')
        {
            if(headerMap.size()>0){
                String jsonBodyString = ApiCalloutController.getBodyString(header);
                apiDummy.Callout_Body__c = jsonBodyString;
                request.setBody(jsonBodyString);
        	}

            if(body!=null){
                String jsonBodyString = ApiCalloutController.getBodyString(body);
                apiDummy.Callout_Body__c = jsonBodyString;
                request.setBody(jsonBodyString);
            }
        }
        if(token!=null){
            String access_token = token;
            apiDummy.Callout_Token__c = access_token;
            request.setHeader('Authorization', 'Bearer ' + access_token);
        }

        if(authType == 'Basic authentication'){
            String username = String.valueOf(headerMap.get('username'));
            String password = String.valueOf(headerMap.get('password'));
            Blob headerValue = Blob.valueOf(username + ':' + password);
            String authorizationHeader = 'BASIC ' +EncodingUtil.base64Encode(headerValue);
            request.setHeader('Authorization', authorizationHeader);

            apiDummy.Callout_UserName__c = username;
            apiDummy.Callout_Password__c = password;
            
        }
        Long startTime = DateTime.now().getTime();
        HttpResponse response = http.send(request);
        Long endTime = DateTime.now().getTime();

        apiDummy.Callout_Request_Time__c = startTime;
        apiDummy.Callout_Respose_Time__c = endTime;
        apiDummy.Diff_Filed__c = TimeDiff.getTimeDifference(startTime,endTime);

        String finalResponse = response.getStatusCode() +' '+ response.getStatus() + response.getBody();
        //apiDummy.Callout_Response__c = finalResponse;
        System.debug('apiDummy===>'+apiDummy);
        insert apiDummy;
        return finalResponse;  
    }


//HTTP callout to create new resource

    @AuraEnabled
    public static string createNewResource(String token,String body,String endPointUrl){
        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint(endPointUrl);
        request.setMethod('POST');
        request.setHeader('Content-Type', 'application/json');
        request.setBody(body);
        request.setHeader('Authorization', 'Bearer ' + token);
        HttpResponse response = http.send(request);
        String finalResponse = response.getStatusCode() +' '+  response.getStatus() + response.getBody();
        return finalResponse;
    }

    @AuraEnabled
    public static void getApiRecords() {
        List<API_Dummy__c> listOfApiDummi = [SELECT Id,EndpointURL__c, Callout_Method__c, Callout_Body__c, Callout_Password__c, Callout_UserName__c, Callout_Request_Time__c, Callout_Response__c, Callout_Time_Diff__c, Callout_Grant_type__c, Callout_Token__c, Callout_Client_secreat__c, Callout_Client_ID__c, Calllout_Auth_Type__c  FROM API_Dummy__c];
        System.debug('listOfApiDummi=====>'+listOfApiDummi);
        for (API_Dummy__c apiDumy : listOfApiDummi) {

            Http http = new HTTP();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(apiDumy.EndpointURL__c);
            request.setMethod(apiDumy.Callout_Method__c);
            if(apiDumy.Callout_Body__c != null || apiDumy.Callout_Body__c == '')
            {
                request.setBody(apiDumy.Callout_Body__c);
            }
            request.setHeader('Authorization', 'Bearer ' + apiDumy.Callout_Token__c);

            if(apiDumy.Calllout_Auth_Type__c == 'Basic authentication') {
                Blob headerValue = Blob.valueOf(apiDumy.Callout_UserName__c + ':' + apiDumy.Callout_Password__c);
                String authorizationHeader = 'BASIC ' +EncodingUtil.base64Encode(headerValue);
                request.setHeader('Authorization', authorizationHeader);
            }
            Long startTime = DateTime.now().getTime();
            Long endTime;
            HttpResponse response = http.send(request);
            if(response != null)
            {
                endTime = DateTime.now().getTime();
            }
            Double timeDiff = TimeDiff.getTimeDifference(startTime,endTime);
            String finalResponse = response.getStatusCode() +' '+ response.getStatus() + response.getBody();
            System.debug('runCheckCalloutMethod===>finalResponse===>'+finalResponse);
            API_Health_Check__c apiHealthCheck = new API_Health_Check__c();
            apiHealthCheck.Endpoint__c = apiDumy.EndpointURL__c;
            apiHealthCheck.Callout_Response__c = finalResponse;
            apiHealthCheck.Initial_Time__c = startTime;
            apiHealthCheck.Final_Time__c = endTime;
            apiHealthCheck.Differenec_field__c = timeDiff;
            insert apiHealthCheck;
            System.debug('apiHealthCheck====>'+apiHealthCheck);
        }
    }   
    @AuraEnabled
    public static List<API_Health_Check__c> getRecords(){
        return [SELECT Id, Name, Callout_Method__c,Callout_Response__c,Callout_Time_Difference__c,Differenec_field__c,Endpoint__c FROM API_Health_Check__c LIMIT 5];
    }
}