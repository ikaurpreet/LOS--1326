public with sharing class MR_SubmitMeetingTaskAction {

  @InvocableMethod(label='Submit meeting task' description='Submit meeting task')
  public static void execute(List<Variable> variables) {
    Variable variable = variables[0];

    if (variable.async) {
      callAsync(variable.opportunityId, variable.subtype);
    }
    else {
      call(variable.opportunityId, variable.subtype);
    }
  }

  public class Variable {
    @InvocableVariable(label='Opportunity record ID' description='Record ID of Opportunity object' required=true)
    public ID opportunityId;

    @InvocableVariable(label='Meeting Task Subtype' description='Meeting Task Subtype' required=true)
    public String subtype;

    @InvocableVariable(label='Run async' description='Run action asynchronously' required=false)
    public Boolean async = false;
  }

  private static void call(Id opportunityID, String subtype) {
    MR_MeetingTaskFactory factory = new MR_MeetingTaskFactory(opportunityID, MR_MeetingTaskFactory.MeetingTaskSubtypeByString.get(subtype));
    factory.submit();
  }

  @future(callout=true)
  private static void callAsync(Id opportunityID, String subtype) {
    call(opportunityId, subtype);
  }
}