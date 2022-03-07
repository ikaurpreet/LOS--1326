global class  SchedulePreviewDocumensCleaner implements Schedulable{
    public static void schedule() {
        Set<String> times = new Set<String> { '0', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55' };
        for(String item: times) {
            System.schedule('SchedulePreviewDocumensCleaner' + item, '0 ' + item + ' * * * ?', new SchedulePreviewDocumensCleaner());
        }
    }
    public static void abort() {
        Set<String> times = new Set<String> { '0', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55' };
        for(String item: times) {
            List<CronJobDetail> detail = [SELECT id FROM CronJobDetail WHERE name =: 'SchedulePreviewDocumensCleaner' + item];
            if (detail.size() == 0) { continue; }
            List<CronTrigger> job = [select id from CronTrigger WHERE CronJobDetailId =: detail[0].id];
            if (job.size() == 0) { continue; }
            System.abortJob(job[0].id);
        }
    }
    global void execute(SchedulableContext SC) {
      DataStorageCleaner.clearPreviewDocuments();
   }
}