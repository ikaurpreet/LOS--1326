({
  init: function (component, event, helper) {
    helper.getInfo(component);   
  },
  refresh: function (component, event, helper) {
    helper.fireEvent(component, "refresh");
  },
  changeProductHandler: function (component, event, helper) {
    var productId = event.getParam("product").id;
    event.stopPropagation();
    component.set('v.currentProductId', productId)
    helper.openReasonModal(component)
  },
  closeModel: function (component, event, helper) {
    component.set("v.isModalOpen", false);
  },

  submitDetails: function (component, event, helper) {
    helper.changeProduct(component);
  },

  handleChangeReason: function (component, event, helper) {
    var changeValue = event.getParam("value");
    helper.onOptionChange(component, changeValue);
  },
  handleChangeOther :function (component, event, helper) {
    helper.checkModalSubmitBtnState(component)
  }
});