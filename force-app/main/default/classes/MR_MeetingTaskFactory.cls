public class MR_MeetingTaskFactory {

  private Opportunity opportunity { get; set; }
  private MeetingTaskSubtype subtype { get; set; }
  private MortgagesTasksApiClient taskApiClient { get; set; }

  private final Map<MeetingTaskSubtype, String> titleMap = new Map<MeetingTaskSubtype, String> {
    MeetingTaskSubtype.loanLock       => 'Lock your rate',
    MeetingTaskSubtype.thirdPartyDocs => 'Schedule appraisal',
    MeetingTaskSubtype.closing        => 'Set your closing date'
  };

  private final Map<MeetingTaskSubtype, String> descriptionMap = new Map<MeetingTaskSubtype, String> {
    MeetingTaskSubtype.loanLock       => 'Rates fluctuate daily, lock rate with your loan officer',
    MeetingTaskSubtype.thirdPartyDocs => 'Schedule a call to discuss appraisal details',
    MeetingTaskSubtype.closing        => 'Schedule a call to discuss the date you’d like to close on your loan'
  };

  private final Map<MeetingTaskSubtype, String> associateRoleMap = new Map<MeetingTaskSubtype, String> {
    MeetingTaskSubtype.loanLock       => 'loanOfficer',
    MeetingTaskSubtype.thirdPartyDocs => 'loanOfficer',
    MeetingTaskSubtype.closing        => null
  };

  public static Map<String, MeetingTaskSubtype> MeetingTaskSubtypeByString {
    get {
      if (MeetingTaskSubtypeByString == null) {
        MeetingTaskSubtypeByString = new Map<String, MeetingTaskSubtype>();

          for (MeetingTaskSubtype item : MeetingTaskSubtype.values()) {
            MeetingTaskSubtypeByString.put(item.name(), item);
          }
      }
      return MeetingTaskSubtypeByString;
    }
    private set;
  }

  public enum MeetingTaskSubtype {
    loanLock,
    thirdPartyDocs,
    closing
  }

  public class ArgumentException extends Exception {}

  public MR_MeetingTaskFactory(ID opportunityID, MeetingTaskSubtype subtype) {
    this.subtype = subtype;
    if (subtype == null) {
      throw new ArgumentException('subtype should be within ' + MeetingTaskSubtype.values().toString());
    }

    this.opportunity = [SELECT id, account.user_uuid__c, mortgage_submission_uuid__c FROM opportunity WHERE id =: opportunityID];
    String env = MortgagesUtilities.getEnvironment(opportunityID).name();
    
    this.taskApiClient = MR_Actions.resolveTasksApiClient(opportunityId);
  }

  public void create() {
    Map<String, Object> meetingTaskInput = new Map<String, Object>{
      'type'            => 'call',
      'submissionUuid'  => opportunity.mortgage_Submission_UUID__c,
      'ownerUuid'       => opportunity.Account.user_uuid__c.trim(),
      'participantRole' => 'borrower',
      'associateRole'   => associateRoleMap.get(subtype),
      'description'     => descriptionMap.get(subtype),
      'title'           => titleMap.get(subtype),
      'subtype'         => subtype
    };
  
    taskApiClient.createMeetingTask(meetingTaskInput);
  }

  public void submit() {

    Submission_Task__c task = [SELECT Uuid__c FROM Submission_Task__c WHERE Opportunity__c =: opportunity.Id AND Title__c =: titleMap.get(subtype) AND Status__c = 'started' LIMIT 1];
    
    String taskItemUuid = MortgagesUtilities.unprefixify(task.Uuid__c);

    taskApiClient.fireTaskItemEvent(taskItemUuid, 'submit');
  }
}