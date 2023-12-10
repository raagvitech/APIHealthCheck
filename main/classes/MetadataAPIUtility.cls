/**
 * @ Author: Clueless Coders
 * @ Create Time: 09/12/2023
 * @ Modified by: Your name
 * @ Modified time: 09/12/2023
 * @ Description: Apex method to perform HTTP callouts
 */

public with sharing class MetadataAPIUtility {

//Method to check for exixsting metadatatype records

  @AuraEnabled
  public static void createNewRemoteSiteRec(String remoteSiteName,String RemoteSiteUrl,String accessTokenUrl,String accessTokenFullname){

    List<Metadata_for_store_URL__mdt> availableRemoteSites = [SELECT MasterLabel, Provider_URL__c FROM Metadata_for_store_URL__mdt WHERE Provider_URL__c =:RemoteSiteUrl];
    List<Metadata_for_store_URL__mdt> availableaccessRemoteSites = [SELECT MasterLabel, Provider_URL__c FROM Metadata_for_store_URL__mdt WHERE Provider_URL__c =:accesstokenUrl];
 
    if(RemoteSiteUrl!='None'){
      if(availableRemoteSites.size()==0){
        MetadataAPIUtility.RemoteSiteRec(remoteSiteName,RemoteSiteUrl);
      }
    }
    if(accessTokenUrl!='None'){          
      if(availableaccessRemoteSites.size()==0){
        MetadataAPIUtility.RemoteSiteRec(accessTokenFullname,accessTokenUrl);
      }
    }
    MetadataAPIUtility.remoteSite(remoteSiteName,RemoteSiteUrl,accessTokenUrl,accessTokenFullname); 
  } 


  
//Method to create new remote site settings based on user inputs

  @future(callout=true)
  public static void remoteSite(String remoteSiteName,String RemoteSiteUrl,String accessTokenUrl,String accessTokenFullname){
    if(accessTokenUrl != 'None'){ 
      MetadataService.MetadataPort service = new MetadataService.MetadataPort();
      service.SessionHeader = new MetadataService.SessionHeader_element();
      service.SessionHeader.sessionId = UserInfo.getSessionId();
      MetadataService.RemoteSiteSetting remoteSiteSettings = new MetadataService.RemoteSiteSetting();
      remoteSiteSettings.fullName = accessTokenFullname;
      remoteSiteSettings.url = accessTokenUrl;
      remoteSiteSettings.description = 'Remote site settings created from apex';
      remoteSiteSettings.isActive = true;
      remoteSiteSettings.disableProtocolSecurity = false;
      MetadataService.SaveResult[] results = service.createMetadata(
        new List<MetadataService.Metadata>{ remoteSiteSettings }
      );
      for (MetadataService.SaveResult result : results) {
        if (result.success){
        } 
      }              
    }

    if(RemoteSiteUrl != 'None'){
      MetadataService.MetadataPort service = new MetadataService.MetadataPort();
      service.SessionHeader = new MetadataService.SessionHeader_element();
      service.SessionHeader.sessionId = UserInfo.getSessionId();
      MetadataService.RemoteSiteSetting remoteSiteSettings = new MetadataService.RemoteSiteSetting();
      remoteSiteSettings.fullName = remoteSiteName;
      remoteSiteSettings.url = RemoteSiteUrl;
      remoteSiteSettings.description = 'Remote site settings created from apex';
      remoteSiteSettings.isActive = true;
      remoteSiteSettings.disableProtocolSecurity = false;
      MetadataService.SaveResult[] results = service.createMetadata(
        new List<MetadataService.Metadata>{ remoteSiteSettings }
      );
      for (MetadataService.SaveResult result : results) {
        if (result.success) {
        }
      }
    } 
  }


//Method to create new custom metadata type record based on user inputs
  
  public static void RemoteSiteRec(String name,String url){

    Metadata.CustomMetadata customMetadata = new Metadata.CustomMetadata();
    customMetadata.fullName = 'Metadata_for_store_URL__mdt.Remote_site_setting';
    customMetadata.label = name;

    Metadata.CustomMetadataValue nameField = new Metadata.CustomMetadataValue();
    nameField.field = 'Provider_Name__c';
    nameField.value = name;

    Metadata.CustomMetadataValue valueField = new Metadata.CustomMetadataValue();
    valueField.field = 'Provider_URL__c';
    valueField.value = url;

    customMetadata.values = new List<Metadata.CustomMetadataValue>{ nameField, valueField };

    Metadata.DeployContainer mdContainer = new Metadata.DeployContainer();
    mdContainer.addMetadata(customMetadata);

    Id jobId = Metadata.Operations.enqueueDeployment(mdContainer, null);

  }
}