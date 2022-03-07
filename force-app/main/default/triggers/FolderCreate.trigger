trigger FolderCreate on Folder__c (after insert) {
  if(Trigger.isInsert && Trigger.isAfter) {
    if (System.isFuture()) {
      FolderManager.assignDocumentToFolders(Trigger.new);
    } else {
      FolderManager.batchAssignFolderToDocument(Trigger.newMap.keySet());
    }
  }
}