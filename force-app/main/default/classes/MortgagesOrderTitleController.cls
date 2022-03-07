public with sharing class MortgagesOrderTitleController{
	public static MortgagesApiClient mortgagesApiClient{ get; set; }

	public static MortgagesApiClient getMortgagesApiClient(String env){
		if (mortgagesApiClient != null){
			return mortgagesApiClient;
		}
		mortgagesApiClient = MortgagesApiClientFactory.createUserFactory(env).createMortgagesApiClient();
		return mortgagesApiClient;
	}

	@AuraEnabled
	public static String getSubmission(String recordId){
		Custom_Task__c task = [SELECT Opportunity__c
		                       FROM Custom_Task__c
		                       WHERE id = :recordId];
		Opportunity opp = [SELECT id
		                   FROM Opportunity
						   WHERE id = :task.Opportunity__c];
		MortgagesSubmission submisison = MortgagesSubmission.create(opp);
		system.debug(submisison.uuid);
		system.debug(submisison.env);
		return JSON.serialize(submisison);
	}

	@AuraEnabled
	public static Document__c getDocumentByUuid(String uuid, String env){
    String externalId = getPrefix(MortgagesUtilities.getEnvironment(env.toLowerCase())) + uuid;
		List<Document__c> documents = [SELECT Id, Name, Filename__c FROM Document__c WHERE External_ID__c = :externalId LIMIT 1];
                                      
    return documents[0];
	}

	@AuraEnabled
	public static String getAllDocuments(String recordId) {
		Custom_Task__c customTask = [SELECT Opportunity__c
		                       FROM Custom_Task__c
                               WHERE id = :recordId];
        return MortgagesSubmissionDocuments.fetchOnlyDocuments(customTask.Opportunity__c);
    }
    
	@AuraEnabled
	public static String createInitialOrder(String submissionUuid, String env){
		MortgagesApiClient.OrderType order = getMortgagesApiClient(env).createInitialSpruceOrder(submissionUuid);
		System.debug(order.uuid);
		System.debug(order.status);
		return order.uuid;
	}

	@AuraEnabled
	public static void createSpruceOrder(String submissionUuid, String recordId, String env){
		MortgagesApiClient.OrderType localOrder = getMortgagesApiClient(env).getSpruceOrder(submissionUuid);
		Custom_Task__c masterTask = [SELECT Status__c, Name, Opportunity__c, Ordered_Date__c
		                             FROM Custom_Task__c
		                             WHERE id = :recordId];
		List<Custom_Task__c> associatedTasks = [SELECT Status__c, Ordered_Date__c
		                                        FROM Custom_Task__c
		                                        WHERE Master_3rd_Party_Task__c = :recordId];

		try{
			getMortgagesApiClient(env).createSpruceOrder(submissionUuid);
			for (Custom_Task__c item : associatedTasks){
				item.Status__c = 'Awaiting docs';
				update item;
			}
			masterTask.Status__c = 'Awaiting 3rd Party';
		} catch (DmlException e){
			System.debug(e);
		}
		FolderManager.createCustomTaskFolder(masterTask, localOrder.uuid);
		update masterTask;
    }
    
    @AuraEnabled
    public static void submitSpruceDocument(String orderUuid, String documentId, String documentType, String env) {
		Document__c document = [SELECT External_ID__c FROM Document__c WHERE Id = :documentId];
		String documentUuid = MortgagesUtilities.unprefixify(document.External_ID__c);
		System.debug(documentUuid);
		getMortgagesApiClient(env).addSpruceDocument(
			orderUuid, 
			documentUuid,
			documentType);
	}
	
	@AuraEnabled
    public static void removeSpruceDocument(String orderUuid, String documentType, String env) {
		getMortgagesApiClient(env).removeSpruceDocument(
			orderUuid, 
			documentType);
    }

	@AuraEnabled
	public static String request(String env, String jsonBody){
		return GraphQLProxyController.request(env, jsonBody);
	}

	private static String getPrefix(MortgagesConstants.ENV env) {
			String envName = env.name().toLowerCase();
			if (envName == 'production') {
					return 'mort_';
			} else {
					return '';
			}
	}
}