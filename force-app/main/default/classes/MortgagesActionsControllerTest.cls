@isTest
private class MortgagesActionsControllerTest {
    @isTest
    static void getSubmissioName() {
        Opportunity opportunity = MortgagesTestFactory.createOpportunity('test', 'id1', 'uuid1', 'fullFormInProgress', 'FIP', 'refinance', null);
        String name = MortgagesActionsController.getSubmissioName(opportunity.Id);
        
        System.assertEquals('MortgageRefi - 123', name, 'Opportunity name did not match expected value');
    }
}