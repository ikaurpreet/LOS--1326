global class  ScheduleDataStorageCleaner implements Schedulable{
    global void execute(SchedulableContext SC) {
      DataStorageCleaner.cleanOpportunities(400);
      DataStorageCleaner.cleanLeads(400);
   }
}