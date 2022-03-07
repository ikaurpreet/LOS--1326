({
  init: function (component, event, helper) {
    helper.init(component);
  },
  closeModal: function (component, event, helper) {
    console.info('test');
    helper.closeModal(component);
  },
  closeErrorModal: function (component, event, helper) {
    console.info('test2');
    $A.get("e.force:closeQuickAction").fire();
  },
  createOrder: function(component, event, helper) {
    helper.createOrder(component);
  },
  openTab: function(component, event, helper) {
    helper.openTab(component, event);
  },
  saveSpruceDocs: function(component, event, helper) {
    helper.saveSpruceDocs(component);
  },
  handleDocumentChange: function(component, event, helper) {
    helper.handleDocumentChange(component, event);
  },
  submitSpruceDocuments: function(component, event, helper) {
    event.preventDefault();
    helper.submitSpruceDocs(component);
  },
  showOrder: function(component, event, helper) {
    event.preventDefault();
    helper.showOrder(component);
  }
});