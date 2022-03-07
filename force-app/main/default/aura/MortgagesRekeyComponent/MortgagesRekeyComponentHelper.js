({
  getInfo: function (cmp) {
    var submission = cmp.get("v.submission");
    var env = cmp.get("v.env");
    cmp.set("v.productActions", ["Re-key product"]);
    this.getEligibilities(cmp, submission, env);
    this.getReasonOptions(cmp);
  },
  resetFields: function (cmp) {
    cmp.set("v.reasonValue", null);
    cmp.set("v.otherValue", null);
    cmp.set("v.loading", false);
    this.resetError(cmp)
  },
  resetError: function (cmp){
    cmp.set("v.error", null);
  },
  getReasonOptions: function (cmp) {
    var promise = this.callServerMethod(cmp, 'rekeyReasons');
    promise.then((responses) => {
      var reasonOptions = this.mutateReasonsOptions(responses);
      cmp.set("v.reasonOptions", reasonOptions);
    }, (errors) => {
      var error = errors[0];
      this.throwError(cmp, error.message);
    });
  },
  mutateReasonsOptions: function (arr) {
    var options = [];

    for (var i = 0; i < arr.length; i++) {
      options.push({
        label: arr[i],
        value: arr[i],
      });
    }

    return options;
  },
  throwError: function (cmp, error) {
    if(!component.get('v.authId')) {
      var errorMessage =
      "There is an error with the re-key process. Please make an escalation case for the Systems Operations team. Error message: " +
        error;
      cmp.set("v.error", errorMessage);
      cmp.set("v.loading", null);
      cmp.set("v.isReasonChose", false);
      this.closeReasonModal(cmp);
    }
  },
  getEligibilitiesData: function (cmp, submission, env) {
    return new Promise(
      $A.getCallback((resolve, reject) => {
        var promise = this.callServerMethodWithoutLoading(cmp, 'getEligibilities', { submissionUuid: submission.uuid, env: env });
        promise.then((response) => {
          var data = JSON.parse(response);

          if (data.length === 0) resolve(data);

          var result = data.filter(function (value) {
            return (
              value.vertical === "mortgageRefinance" ||
              value.vertical === "mortgagePurchase"
            );
          });
          resolve(result);
        }, (errors) => {
          var error = errors[0];
          reject(error);
        });
      })
    )
  },
  getEligibilities: function (cmp, submission, env) {
    var self = this;
    var promise = this.getEligibilitiesData(cmp, submission, env);

    promise.then((data) => {
      var dataInfo = data[0];
      if (dataInfo.status === "completed" && dataInfo.expired === false) {
        cmp.set("v.eligibility", data[0]);
      } else if (dataInfo.status === "completed" && dataInfo.expired === true) {
        cmp.set("v.showRekeyBtn", true);
      } else if (
        ["created", "in_progress", "fetched"].includes(dataInfo.status)
      ) {
        cmp.set("v.loading", true);
        self.getEligibilitiesAfterRekey(cmp, submission, env);
      } else {
        cmp.set("v.showRekeyBtn", true);
      }
      self.resetError(cmp)
    });

    promise.catch(function (error) {
      self.throwError(cmp, error.message);
    });
  },
  getEligibilitiesAfterRekey: function (cmp, submission, env) {
    var self = this;
    var endTime = Number(new Date()) + 122000;
    function polling() {
      var promise = self.getEligibilitiesData(cmp, submission, env);

      promise.then(function (data) {
        if (data[0].status === "completed") {
          cmp.set("v.loading", null);
          cmp.set("v.eligibility", data[0]);
          cmp.set("v.showRekeyBtn", false);
          self.resetError(cmp)
        } else if (data[0].status === "failed") {
          self.throwError(cmp, data[0].failedReasons);
        } else if (Number(new Date()) < endTime) {
          setTimeout(function () {
            polling();
          }, 1000);
        } else {
          self.throwError(cmp, data[0].failedReasons);
        }
      });

      promise.catch(function (error) {
        self.throwError(cmp, error.message);
      });
    }

    polling();
  },
  fireEvent: function (cmp, eventName) {
    var submission = cmp.get("v.submission");
    var env = cmp.get("v.env");
    cmp.set("v.loading", eventName);
    var promise = this.callServerMethodWithoutLoading(cmp, 'rerunEligibility', { submissionUuid: submission.uuid, env: env });
    promise.then((response) => {
      var data = JSON.parse(response);
      this.getEligibilitiesAfterRekey(cmp, submission, env);
    }, (errors) => {
      var error = errors[0];
      this.throwError(cmp, error.message);
    })
  },

  lockOpportunity: function (cmp) {
    return new Promise(
      $A.getCallback((resolve, reject) => {
        var submission = cmp.get("v.submission");
        var reasonValue = cmp.get("v.reasonValue");
        var rekeyReasonDescription = reasonValue === 'Other Credible Service Failure' ? cmp.get("v.otherValue") : null;

        var promise = this.callServerMethod(cmp, 'lockOpportunity', {
          submissionUuid: submission.uuid,
          rekeyReason: reasonValue,
          rekeyReasonDescription: rekeyReasonDescription,
        });

        promise.then((response) => {
          var data = JSON.parse(response);
          resolve(data);
        }, (errors) => {
          var error = errors[0];
          reject(error);
        });
      })
    );
  },

  onChangeProduct: function (cmp, productId) {
    return new Promise(
      $A.getCallback((resolve, reject) => {
        var submission = cmp.get("v.submission");
        var env = cmp.get("v.env");

        var promise = this.callServerMethod(cmp, 'changeProduct', {
          submissionUuid: submission.uuid,
          env: env,
          productId: productId,
        });

        promise.then((response) => {
          var data = JSON.parse(response);
          resolve(data);
          this.resetFields(cmp);
        }, (errors) => {
          var error = errors[0];
          reject(error);
          this.resetFields(cmp);
        });
      })
    );
  },

  openReasonModal: function (cmp) {
    cmp.set("v.isModalOpen", true);
  },

  closeReasonModal: function (cmp) {
    cmp.set("v.isModalOpen", false);
  },

  changeProduct: function (cmp) {
    var self = this;
    var productId = cmp.get("v.currentProductId");
    cmp.set("v.loading", true);
    cmp.set("v.isReasonChose", true);

    var promise = this.lockOpportunity(cmp);


    promise.then(function (data) {
      if (data) {
        var changePromise = self.onChangeProduct(cmp, productId);
        changePromise.then(function(result){
          self.closeReasonModal(cmp);
          self.resetError(cmp)
        })
        changePromise.catch(function (error) {
          var errMessage = (error.pageErrors && Array.isArray(error.pageErrors)) ? error.pageErrors[0].message : error.message
          self.throwError(cmp, errMessage);
        });
      } else {
        self.throwError(cmp, "Something went wrong. Please try again later!");
      }
    });

    promise.catch(function (error) {
      self.throwError(cmp, error.message);
    });
  },
  checkModalSubmitBtnState: function (cmp) {
    var otherValue = cmp.get("v.otherValue");
    cmp.set("v.isReasonChose", !otherValue);
  },
  onOptionChange: function (cmp, value) {
    cmp.set("v.isReasonChose", false);

    if (value === "Other Credible Service Failure") {
      cmp.set("v.isOtherChecked", false);
      this.checkModalSubmitBtnState(cmp);
    } else {
      cmp.set("v.isOtherChecked", true);
    }
  },
});