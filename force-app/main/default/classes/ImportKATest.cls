@isTest
private class ImportKATest {
/*    
    
    private static final String ARTICLE_TYPE_SUFFIX = 'kav';    
    private enum ArticleStatus{Archived, Draft, Online}
    private static String LANGUAGE = 'Language';

    
    private static ImportKA.KAToImportResult createKaToImport(String soId, String kaid, String lang, boolean isMaster){
        ImportKA.KAToImportResult kaToImp = new ImportKA.KAToImportResult();
        kaToImp.id = soId;
        kaToImp.knowledgeArticleId = kaid;
        kaToImp.language = lang;
        kaToImp.isMaster = isMaster;
        return kaToImp;        
    }
    
    
    static testMethod void createDraftFromArchive(){

        Map<String, Schema.SObjectType> artTypes = getArticleTypes();
        
        if(artTypes.size() > 0){
            
            // Master Article
            Sobject objToIns = artTypes.values().get(0).newSObject();
            List<String> lstLangs = getLanguagesForArticleType(objToIns.getSObjectType());
            String lang = lstLangs.get(0);
            
            objToIns.put('Title', 'test for WS createDraftFromArchive');
            objToIns.put('Summary', 'Test summary field');
            objToIns.put('UrlName', 'test-for-WS-createDraftFromArchive');
            objToIns.put('Language', lang);
            insert objToIns;            
            
            String query = 'SELECT Id, KnowledgeArticleId, PublishStatus' + 
                           ' FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                           ' WHERE Id = \'' + objToIns.get('Id') + '\' limit 1';
            
            Sobject sobDb = Database.query(query);
            List<ImportKA.KAToImportResult> lstKAToImp = new List<ImportKA.KAToImportResult>();                 
            lstKAToImp.add(createKaToImport('', String.valueOf(sobDb.get('KnowledgeArticleId')), lang, true));
                                                
            lstKAToImp = ImportKA.publishAndArchiveArticles(lstKAToImp); // Consume WS publish article and archived                     
            system.assertEquals(null, lstKAToImp.get(0).error); // Asserts no errors were found. 
            
            query = 'SELECT Id, KnowledgeArticleId FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                    ' WHERE PublishStatus = \'' + String.valueOf(ArticleStatus.Archived) + '\' AND Language = \'' + lang + '\' limit 1';                            
            
            Sobject sobDbArchived = Database.query(query);
            system.debug(sobDbArchived != null);       
            
            // Test with invalid data
            lstKAToImp.get(0).knowledgeArticleId = '000'; // will throw exception Invalid ID and catch the corresponding error and sent via KAToImportResult's error property.
            lstKAToImp = ImportKA.createDraftFromArchive(lstKAToImp); // Consume WS publish article and archived                        
            system.assertNotEquals(null, lstKAToImp.get(0).error); // Asserts no errors were found.                                                                        
        }
        
    }    
    
    
    static testMethod void publishAndArchiveArticles(){

        Map<String, Schema.SObjectType> artTypes = getArticleTypes();
        
        if(artTypes.size() > 0){
            
            // Master Article
            Sobject objToIns = artTypes.values().get(0).newSObject();
            List<String> lstLangs = getLanguagesForArticleType(objToIns.getSObjectType());
            String lang = lstLangs.get(0);
            
            objToIns.put('Title', 'test for archived articles');
            objToIns.put('Summary', 'Test summary field');
            objToIns.put('UrlName', 'test-for-archived-articles');
            objToIns.put('Language', lang);
            insert objToIns;            
            
            String query = 'SELECT Id, KnowledgeArticleId, PublishStatus' + 
                           ' FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                           ' WHERE Id = \'' + objToIns.get('Id') + '\' limit 1';
            
            Sobject sobDb = Database.query(query);
            List<ImportKA.KAToImportResult> lstKAToImp = new List<ImportKA.KAToImportResult>();                 
            lstKAToImp.add(createKaToImport('', String.valueOf(sobDb.get('KnowledgeArticleId')), lang, true));
                                                
            lstKAToImp = ImportKA.publishAndArchiveArticles(lstKAToImp); // Consume WS publish article and archived                     
            system.assertEquals(null, lstKAToImp.get(0).error); // Asserts no errors were found. 
            
            query = 'SELECT Id, KnowledgeArticleId FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                    ' WHERE PublishStatus = \'' + String.valueOf(ArticleStatus.Archived) + '\' AND Language = \'' + lang + '\' limit 1';                            
            Sobject sobDbArchived = Database.query(query);
            system.debug(sobDbArchived != null);       
            
            lstKAToImp = ImportKA.createDraftFromArchive(lstKAToImp);
            
            query = 'SELECT PublishStatus' + 
                   ' FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                   ' WHERE Id = \'' + lstKAToImp.get(0).id + '\' limit 1';
            
            Sobject sobDbDrftFromArch = Database.query(query);          
            system.assertEquals(String.valueOf(ArticleStatus.Draft), sobDbDrftFromArch.get('PublishStatus'));
                        
            // time to call WS with invalid data
            List<ImportKA.KAToImportResult> lstKAToImpWithErrors = new List<ImportKA.KAToImportResult>();                   
            lstKAToImpWithErrors.add(createKaToImport('', '0101', lang, true));         
            lstKAToImp = ImportKA.publishAndArchiveArticles(lstKAToImpWithErrors); // will throw exception Invalid ID and catch the corresponding error and sent via KAToImportResult's error property.                     
            system.assertNotEquals(null, lstKAToImpWithErrors.get(0).error); // Asserts no errors were found.
        }
        
    }
    
    
    static testMethod void unpublishOnlineArticle(){        

        Map<String, Schema.SObjectType> artTypes = getArticleTypes();
        
        if(artTypes.size() > 0){
            
            // Master Article
            Sobject objToIns = artTypes.values().get(0).newSObject();
            List<String> lstLangs = getLanguagesForArticleType(objToIns.getSObjectType());
            String lang = lstLangs.get(0);
            
            objToIns.put('Title', 'test WS unpublishOnlineArticle');
            objToIns.put('Summary', 'Test summary field');
            objToIns.put('UrlName', 'test-WS-unpublishOnlineArticle');
            objToIns.put('Language', lang);
            insert objToIns;            
            
            String query = 'SELECT Id, KnowledgeArticleId, PublishStatus' + 
                           ' FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                           ' WHERE Id = \'' + objToIns.get('Id') + '\' limit 1';
                                                                        
            Sobject sobDb = Database.query(query);          
            system.assertEquals(String.valueOf(ArticleStatus.Draft), sobDb.get('PublishStatus')); // Asserts the status is Draft
                        
            List<ImportKA.KAToImportResult> lstKAToImp = new List<ImportKA.KAToImportResult>();                 
            lstKAToImp.add(createKaToImport('', String.valueOf(sobDb.get('KnowledgeArticleId')), lang, true));
                                    
            lstKAToImp = ImportKA.publishDraft(lstKAToImp); // Consumes WS publishDraft
                                                    
            query = 'SELECT Id, KnowledgeArticleId FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                    ' WHERE PublishStatus = \'' + String.valueOf(ArticleStatus.Online) + '\' AND Language = \'' + lang + '\' limit 1';
                            
            Sobject sobDbOnline = Database.query(query);            
            system.assert(sobDbOnline != null);         
            
            lstKAToImp = ImportKA.unpublishOnlineArticle(lstKAToImp); // Consumes WS unpublishOnlineArticle         
            
            query = 'SELECT Id, KnowledgeArticleId, PublishStatus' + 
                   ' FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                   ' WHERE Id = \'' + lstKAToImp.get(0).id + '\' limit 1';
            
            Sobject sobDbDraft = Database.query(query);                        
            system.assertEquals(String.valueOf(ArticleStatus.Draft), sobDbDraft.get('PublishStatus')); // Asserts the status is Draft                       
            
            // time to call WS with invalid data
            List<ImportKA.KAToImportResult> lstKAToImpWithErrors = new List<ImportKA.KAToImportResult>();                   
            lstKAToImpWithErrors.add(createKaToImport('', '0101', lang, true));         
            lstKAToImp = ImportKA.unpublishOnlineArticle(lstKAToImpWithErrors); // will throw exception Invalid ID and catch the corresponding error and sent via KAToImportResult's error property.                        
            system.assertNotEquals(null, lstKAToImpWithErrors.get(0).error); // Asserts no errors were found.           
            
            // Now it's time translations
            if(lstLangs.size() > 1){
                
                // Master must be published for creating translation and allow it to be published. 
                KbManagement.PublishingService.publishArticle(String.valueOf(sobDbDraft.get('KnowledgeArticleId')), false);
                 
                String langTrans = lstLangs.get(1);
                // Creates translation first                        
                String transId = KbManagement.PublishingService.submitForTranslation(String.valueOf(sobDbDraft.get('KnowledgeArticleId')), langTrans, UserInfo.getUserId(), null); 
                // Publish translation                                  
                ImportKa.publishDraft(new List<ImportKA.KAToImportResult>{createKaToImport(transId,'',langTrans, false)});                                                                                              
                
                query = 'SELECT Id, KnowledgeArticleId FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                        ' WHERE PublishStatus = \'' + String.valueOf(ArticleStatus.Online) + '\' AND Language = \'' + langTrans + '\' limit 1';
                                
                Sobject sobDbOnlineTrans = Database.query(query);   
                system.assert(sobDbOnlineTrans != null);                                
                                
                List<ImportKA.KAToImportResult> lstKAWithTrans = new List<ImportKA.KAToImportResult>();                 
                lstKAWithTrans.add(createKaToImport('', String.valueOf(sobDbDraft.get('KnowledgeArticleId')), langTrans, false));
                
                // Consumes WS unpublishOnlineArticle for article's translation
                lstKAWithTrans = ImportKA.unpublishOnlineArticle(lstKAWithTrans);
                
                query = 'SELECT Id FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                        ' WHERE PublishStatus = \'' + String.valueOf(ArticleStatus.Draft) + '\' AND Language = \'' + langTrans + '\' limit 1';          
                
                Sobject sobjtrans = Database.query(query);              
                system.assert(sobjtrans != null);
                system.assertEquals(null, lstKAWithTrans.get(0).error); // Asserts no errors were found.                
            }                   
        }
                            
    }
        
    
    
    static testMethod void publishDraft(){      

        Map<String, Schema.SObjectType> artTypes = getArticleTypes();
        
        if(artTypes.size() > 0){
            
            Sobject objToIns = artTypes.values().get(0).newSObject();
            String lang = getLanguagesForArticleType(objToIns.getSObjectType()).get(0);
            
            objToIns.put('Title', 'test WS publishDraft');
            objToIns.put('Summary', 'Test summary field');
            objToIns.put('UrlName', 'test-WS-publishDraft');
            objToIns.put('Language', lang);
            insert objToIns;            
            
            String query = 'SELECT Id, KnowledgeArticleId, PublishStatus' + 
                           ' FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                           ' WHERE Id = \'' + objToIns.get('Id') + '\' limit 1';
                           
            Sobject sobDb = Database.query(query);
            system.assertEquals(String.valueOf(ArticleStatus.Draft), sobDb.get('PublishStatus')); // Asserts the status is Draft
                        
            List<ImportKA.KAToImportResult> lstKAToImp = new List<ImportKA.KAToImportResult>();                 
            lstKAToImp.add(createKaToImport('', String.valueOf(sobDb.get('KnowledgeArticleId')), lang, true));
                                    
            lstKAToImp = ImportKA.publishDraft(lstKAToImp); // Consumes WS publishDraft
                                                    
            query = 'SELECT Id FROM ' + objToIns.getSObjectType().getDescribe().getName() +
                    ' WHERE PublishStatus = \'' + String.valueOf(ArticleStatus.Online) + '\' AND Language = \'' + lang + '\' limit 1';
                            
            Sobject sobDbOnline = Database.query(query);            
            system.assert(sobDbOnline != null);         
            
            // time to call WS with invalid data
            List<ImportKA.KAToImportResult> lstKAToImpWithErrors = new List<ImportKA.KAToImportResult>();                   
            lstKAToImpWithErrors.add(createKaToImport('', '0101', lang, true));         
            lstKAToImp = ImportKA.publishDraft(lstKAToImpWithErrors); // will throw exception Invalid ID and catch the corresponding error and sent via KAToImportResult's error property.                      
            system.assertNotEquals(null, lstKAToImpWithErrors.get(0).error); // Asserts no errors were found.           
        }
                            
    }
    
    

    private static Map<String, Schema.SObjectType> getArticleTypes(){

        Map<String, Schema.SObjectType> artTypes = new Map<String, Schema.SObjectType>();                               
        for(Schema.SObjectType sobj : Schema.getGlobalDescribe().values()){
            DescribeSObjectResult sobjDesc = sobj.getDescribe();            
            if(sobjDesc.getName().endsWith(ARTICLE_TYPE_SUFFIX)){
                artTypes.put(sobjDesc.getName(), sobj);             
            }
        }                   
        return artTypes;
    }        
    
    

    private static List<String> getLanguagesForArticleType(Schema.SObjectType objType){     
        List<String> langs = new List<String>();        
        Schema.Sobjectfield langField = objType.getDescribe().fields.getMap().get(LANGUAGE);            
        if(langField != null){
            for (PicklistEntry p : langField.getDescribe().getPicklistValues()) {               
                langs.add(p.getValue());  
            }
        }   
        return langs;
    }       
    
    
*/    
}