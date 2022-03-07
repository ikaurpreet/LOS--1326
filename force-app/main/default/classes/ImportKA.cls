/**
 * This class contains some services for import knowledge articles from Heroku.
 */

global with sharing class ImportKA {
/*
    
    
    global with sharing class KAToImportResult{        

        webservice String id {get;set;}
        webservice String knowledgeArticleId {get;set;}
        webservice String language {get;set;}
        webservice boolean isMaster {get;set;}    
        webservice String error {get;set;}    
    }
    
    

    Webservice static List<KAToImportResult> createDraftFromArchive(List<KAToImportResult> lstKAToImport){        
        for(KAToImportResult kaToImport : lstKAToImport){
            try{
                kaToImport.id = KbManagement.PublishingService.editArchivedArticle(kaToImport.knowledgeArticleId);
            }catch(Exception e){                
                // It's possible the KA was removed.
                kaToImport.knowledgeArticleId = '';
                kaToImport.error = e.getMessage();
            }
        }                
        return lstKAToImport;
    }
    
    


    Webservice static List<KAToImportResult> publishAndArchiveArticles(List<KAToImportResult> lstKAToImport){        
        for(KAToImportResult kaToImport : lstKAToImport){
            try{            
                KbManagement.PublishingService.publishArticle((Id)kaToImport.knowledgeArticleId, true);
                KbManagement.PublishingService.archiveOnlineArticle((Id)kaToImport.knowledgeArticleId, null); // Archives an online version of an article and archived immediately.
            }catch(Exception e){                
                kaToImport.knowledgeArticleId = '';
                kaToImport.error = e.getMessage();
            }             
        }
        
        return lstKAToImport;
    }
    
    
 
    Webservice static List<KAToImportResult> unpublishOnlineArticle(List<KAToImportResult> lstKAToImport){
        for(KAToImportResult kaToImport : lstKAToImport){
            try{
                if(kaToImport.isMaster){
                    //Creates a draft article from the online version and returns the new draft master version ID of the article 
                    kaToImport.id = KbManagement.PublishingService.editOnlineArticle((Id)kaToImport.knowledgeArticleId, false);    
                }else{
                    //Creates a draft version of the online translation for a specific language and returns the new draft master version ID of the article.
                    kaToImport.id = KbManagement.PublishingService.editPublishedTranslation((Id)kaToImport.knowledgeArticleId, kaToImport.language, false);                
                } 
            }catch(Exception e){                
                kaToImport.knowledgeArticleId = '';
                kaToImport.error = e.getMessage();
            }                           
        }    
        return lstKAToImport;
    }
    
            

    Webservice static List<KAToImportResult> publishDraft(List<KAToImportResult> lstKAToImport){        
        for(KAToImportResult kaToImport : lstKAToImport){
            try{
                if(kaToImport.isMaster){
                    KbManagement.PublishingService.publishArticle((Id)kaToImport.knowledgeArticleId, true);         
                }else{
                    KbManagement.PublishingService.completeTranslation((Id)kaToImport.id);                             
                }
            }catch(Exception e){                
                kaToImport.knowledgeArticleId = '';
                kaToImport.error = e.getMessage();
            }               
        }
        return lstKAToImport;
    }
    
        
*/
}