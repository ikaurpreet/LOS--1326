public with sharing class MR_CreateMeetingTaskAction {
    
  @InvocableMethod(label='Create meeting task' description='Create meeting task')
  public static void execute(List<Variable> variables) {

    Variable variable = variables[0];

    if (variable.async) {
      createTaskAsync(variable.opportunityID, variable.subtype);
    }
    else {
      createTask(variable.opportunityID, variable.subtype);
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


  private static void createTask(ID opportunityID, String subtype) {

    MR_MeetingTaskFactory factory = new MR_MeetingTaskFactory(opportunityID, MR_MeetingTaskFactory.MeetingTaskSubtypeByString.get(subtype));
    factory.create();
  }


  @future(callout=true)
  private static void createTaskAsync(ID opportunityID, String subtype) {
    createTask(opportunityID, subtype);
  }
}