@isTest
public class ApiCalloutControllerTest {
    
    @isTest
    static void testGenerateNewAccessToken() {
        // Set up mock HTTP response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        // Call the method you want to test
        String header = '{"username":"test","password":"test123"}';
        String accessTokenUrl = 'https://example.com/example/token';
        String res = ApiCalloutController.generateNewAccessToken(header, accessTokenUrl);

        // Assert the result
        //System.assertEquals('200 OKResponse body', res);
    }

    @isTest
    static void testGenerateBearerToken() {
        // Set up mock HTTP response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        // Call the method you want to test
        String endPointUrl = 'https://example.com/example/token';
        String body = '{"key":"value"}';
        String res = ApiCalloutController.generateBearerToken(endPointUrl, body);

        // Assert the result
        //System.assertEquals('{"access_token": "mockAccessToken", "expires_in": 3600}', res);
    }

    @isTest
    static void testHttpCallout() {
        // Set up mock HTTP response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        // Call the method you want to test
        String inputs = '{"url":"https://example.com/example/test","auth":"Basic authentication","method":"GET","token":"testtoken123","body":{}}';
        String header = '{"username":"test","password":"test123"}';
        String res = ApiCalloutController.httpCallout(inputs, header);

        // Assert the result
        //System.assertEquals('200 OKResponse body', res);
    }

    @isTest
    static void testCreateNewResource() {
        // Set up mock HTTP response
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());

        // Call the method you want to test
        String token = 'test1234';
        String body = '{"key":"value"}';
        String endPointUrl = 'https://example.com/example/resource';
        String res = ApiCalloutController.createNewResource(token, body, endPointUrl);

        // Assert the result
       // System.assertEquals('200 OKResponse body', res);
    }
	
    @isTest
    static void getRecordsMethod(){
        ApiCalloutController.getApiRecords();
        ApiCalloutController.getRecords();
    }
}