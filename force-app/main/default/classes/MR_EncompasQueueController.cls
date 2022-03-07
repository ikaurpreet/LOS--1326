public with sharing class MR_EncompasQueueController {
    public MortgagesSubmission subject { get; private set; }
    public String errorMessage { get; set; }
    public String messageId { get; set; }
    public String queue { get; set; }
    public MortgagesEncompassClient client { get; set; }
    public List<MortgagesEncompassClient.EncompassQueueMessage> forward { get; set; }
    public List<MortgagesEncompassClient.EncompassQueueMessage> backward { get; set; }
    
    public void setSubject(MortgagesSubmission subject) {
        if (this.subject == null) { 
            this.subject = subject;
            this.client = new MortgagesEncompassClient(this.subject.graphqlClient);    
            system.debug('Set subject: ' + subject.uuid);
            this.init();
        }   
    }

    public void removeMessage() {
        String removedBy = System.userInfo.getUserEmail(); 
        this.errorMessage = null;
        try {
            String status = client.removeQueueMessage(subject.uuid, messageId, queue, removedBy);
            system.debug('Message ' + messageId + ' removed with status ' + status);
            this.init();
        } catch(Exception ex) {
            this.errorMessage = ex.getMessage();
        }
    }
    
    public void init() {
        try {
            if (queue == null || queue == 'backward') {
                this.backward = client.getQueueMessages(this.subject.uuid, 'backward');
                system.debug('Backward messages: ' + this.backward.size());
            }
            if (queue == null || queue == 'forward') {
                this.forward = client.getQueueMessages(this.subject.uuid, 'forward');
                system.debug('Forward messages: ' + this.backward.size());
            }
            this.messageId = null;
            this.queue = null;
        } catch(Exception ex) {
            this.errorMessage = ex.getMessage();
        }
    }
}