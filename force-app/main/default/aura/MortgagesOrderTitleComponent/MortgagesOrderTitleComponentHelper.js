({
  init: function (cmp) {
    var submission = cmp.get("v.submission");
    var recordId = cmp.get("v.recordId");
    if (!submission && recordId) {
      this.initByRecordId(cmp);
    }
  },
  initByRecordId: function (cmp) {
    var recordId = cmp.get("v.recordId");
    var promise = this.callServerMethod(cmp, "getSubmission", {
      recordId: recordId
    });
    promise.then(response => {
      var data = JSON.parse(response);
      cmp.set("v.submission", data);
      cmp.set("v.env", data.env);
      console.log('submission set');

      if (data.vertical == 'HomePurchase') {
        cmp.set("v.requiredDocumentTypes", ["1003", "BorrowersAuthorization", "PurchaseContract"])
      }

      if (data.vertical == 'MortgageRefi') {
        cmp.set("v.requiredDocumentTypes", ["1003", "BorrowersAuthorization", "MortgageStatement", "HomeownersInsurance"])
      }

      this.createInitialOrder(cmp);
    });
  },
  createInitialOrder: function (cmp) {
    var submission = cmp.get("v.submission");
    var env = cmp.get("v.env");
    var promise = this.callServerMethod(cmp, "createInitialOrder", {
      submissionUuid: submission.uuid,
      env: env
    });

    promise.then(orderUuid => {
      cmp.set("v.orderUuid", orderUuid);
      this.getAttachedDocuments(cmp);
      this.initDropdownOptions(cmp);
      $A.get('e.force:refreshView').fire();
    });

    promise.catch(error => {
      this.setError(cmp, error);
      return;
    });
  },

  getAttachedDocuments: function (cmp) {
    var submission = cmp.get("v.submission");
    var env = cmp.get("v.env");
    var query = {
      variables: { submissionUuid: submission.uuid },
      operationName: "spruceLocalOrder",
      query: `query spruceLocalOrder($submissionUuid: ID, $orderUuid: ID) {
        spruceLocalOrder(submissionUuid: $submissionUuid, orderUuid: $orderUuid) {
            status
            uuid
            spruceUuid
            documents {
              documentUuid
              documentType
              status
            }
          }
        }`
    };
    var promise = this.callServerMethod(cmp, "request", {
      env: env,
      jsonBody: JSON.stringify(query)
    });

    promise.catch(error => {
      this.setError(cmp, error);
      return;
    });

    promise.then(response => {
      var parsedResponse = JSON.parse(response);

      if (!response || (parsedResponse && parsedResponse.errors)) {
        console.error(
          "Error during spruce payload fetch",
          parsedResponse.errors
        );
        cmp.set("v.error", parsedResponse.errors[0].message);
        return;
      }

      return parsedResponse.data.spruceLocalOrder.documents;
      }).then(attachedDocuments => {
        var requiredDocumentTypes = cmp.get("v.requiredDocumentTypes");
        requiredDocumentTypes.forEach((documentType) => {
          var attachedDocument = attachedDocuments.find(document => document.documentType == documentType);

          if (attachedDocument) {
            this.buildDocumentStructure(cmp, attachedDocument, documentType);
          } else {
            this.appendDocumentToUIList(cmp, null, documentType, null, null);
          }
      });
    });
  },

  buildDocumentStructure: function (cmp, document, documentType) {
      var promise = this.callServerMethod(cmp, "getDocumentByUuid", {
        uuid: document.documentUuid,
        env: cmp.get("v.env")
      });

      promise.then(fetchedDocument => {
        var documentId = fetchedDocument.Id;
        var filename = fetchedDocument.Filename__c;
        this.appendDocumentToUIList(
          cmp,
          documentId,
          documentType,
          document.documentUuid,
          filename);
      });

      promise.catch(error => {
        this.setError(cmp, error);
        this.appendDocumentToUIList(cmp, null, documentType, null, null);
        return;
      });

      return promise;
  },

  appendDocumentToUIList: function (cmp, id, documentType, documentUuid, filename) {
    const documentLink = id ? '/lightning/r/Document__c/' + id + '/view' : '';
    var documentData = {
      id,
      documentType,
      documentUuid,
      filename,
      documentLink,
      formattedName: this.mapDocumentTypeToTitle(documentType)
    };

    var attachedDocs = cmp.get("v.attachedSpruceDocuments");
    attachedDocs.push(documentData);
    cmp.set("v.attachedSpruceDocuments", attachedDocs);
    var components = cmp.find('documentSelectCombobox');

    if ($A.util.isArray(components)) {
      components.forEach(component => {
        var comboboxDocumentType = component.get('v.name');
        if (comboboxDocumentType == documentType) {
          component.set("v.value", id);
        }
      })
    } else {
      var comboboxDocumentType = components.get('v.name');
      if (comboboxDocumentType == documentType) {
        components.set("v.value", id);
      }
    }

    return documentData;
  },

  initDropdownOptions: function (cmp) {
    var recordId = cmp.get("v.recordId");
    var promise = this.callServerMethod(cmp, "getAllDocuments", {
      recordId
    });

    promise.catch((error) => {
      console.log('initDropdownOptions error');
      this.setError(cmp, error);
      return;
    });

    promise.then(docs => {
      cmp.set("v.dropdownOptions", []);
      var parsedDocs = JSON.parse(docs);
      var fetchedDocs = parsedDocs.map((document) => {
        return { label: document.name, value: document.id }
      });
      var dropdownOptions = [{ label: '-- none ---', value: 'none' }, ...fetchedDocs];
      cmp.set("v.dropdownOptions", dropdownOptions);
    });
  },

  mapDocumentTypeToTitle: function (documentType) {
    var typeToTitle = {
      "1003": "1003",
      "BorrowersAuthorization": "Borrower's Authorization",
      "PurchaseContract": "Purchase Contract",
      "MortgageStatement": "Mortgage Statement",
      "HomeownersInsurance": "Homeowners Insurance (HOI)"
    };

    return typeToTitle[documentType];
  },

  handleDocumentChange: function (cmp, event) {
    event.preventDefault;
    var eventSource = event.getSource();
    var documentId = eventSource.get("v.value");
    var documentType = eventSource.get("v.name");
    var attachedDocs = cmp.get("v.attachedSpruceDocuments");
    var willBeAttachedDocs = cmp.get("v.willBeAttachedDocuments");
    var willBeUnAttachedDocs = cmp.get("v.willBeUnAttachedDocuments");
    var allComboboxes = cmp.find('documentSelectCombobox');
    var allLinkComponents = cmp.find('documentLink');

    if (!attachedDocs || !willBeAttachedDocs || !willBeUnAttachedDocs || !allComboboxes || !allLinkComponents) {
      var errorMessage = 'Some data is missing for document change';
      console.error(errorMessage);
      cmp.set("v.error", errorMessage);
      return;
    }
    cmp.set("v.error", null);

    var linkComponent;

    if ($A.util.isArray(allLinkComponents)) {
      allLinkComponents.forEach(component => {
        var comboboxDocumentType = component.get('v.title');
        if (comboboxDocumentType == documentType) {
          this.updateSelectedDocumentLink(component, documentId);
          linkComponent = component;
        }
      })
    } else if (allLinkComponents && allLinkComponents != null) {
      var comboboxDocumentType = allLinkComponents.get('v.title');
      if (comboboxDocumentType == documentType) {
        this.updateSelectedDocumentLink(allLinkComponents, documentId);
        linkComponent = allLinkComponents;
      }
    } else {
      this.setError(cmp, 'Link component was not found');
      return;
    }

    this.preventTwiceDocumentAssing(allComboboxes, documentType, documentId, eventSource, linkComponent);

    if (documentId == 'none') {
      var previousDocument = attachedDocs.find(document => document.documentType == documentType);
      
      if (previousDocument.documentUuid) {
        willBeUnAttachedDocs[documentType] = documentId;
        cmp.set("v.willBeUnAttachedDocuments", willBeUnAttachedDocs);
      }
      return;
    }

    var attachmentKey = Object.keys(attachedDocs).find(key => attachedDocs[key] === documentId);
    if (attachmentKey) {
      this.twiceDocumentAlert(eventSource, linkComponent);
      return;
    }

    delete willBeUnAttachedDocs[documentType];
    cmp.set("v.willBeUnAttachedDocuments", willBeUnAttachedDocs);

    willBeAttachedDocs[documentType] = documentId;
    cmp.set("v.willBeAttachedDocuments", willBeAttachedDocs);
  },

  // linkComponent needed to remove document link
  twiceDocumentAlert: function (source, linkComponent) {
    source.set("v.value", '');
    linkComponent.set("v.value", ''); 
    alert('This document has already been selected to be sent to Spruce. Please select a different document to satisfy the Spruce requirement.');
  },

  preventTwiceDocumentAssing: function (allComboboxes, documentType, documentId, eventSource, linkComponent) {
    if ($A.util.isArray(allComboboxes)) {
      var alreadyAssigned = allComboboxes.some(combobox => {
        var comboboxDocumentId = combobox.get('v.value');
        var comboboxDocumentName = combobox.get('v.name');
        if (documentId != 'none' && comboboxDocumentName != documentType && comboboxDocumentId == documentId) {
          this.twiceDocumentAlert(eventSource, linkComponent);
          return true;
        }
      });

      if (alreadyAssigned) { return; }
    }
  },

  updateSelectedDocumentLink: function(component, documentId) {
    if (documentId !== 'none') {
      component && component.set("v.value", '/lightning/r/Document__c/' + documentId + '/view');
    } else {
      component && component.set("v.value", '');
    }
  },

  submitSpruceDocs: function (cmp) {
    var documents = cmp.get("v.willBeAttachedDocuments");
    var documentPromises = [];

    var comboboxes = cmp.find('documentSelectCombobox');
    if ($A.util.isArray(comboboxes)) {
      var assignedDocuments = comboboxes.reduce((acc, combobox) => {
        var comoboxValue = combobox.get('v.value');
        if (comoboxValue && comoboxValue !== 'none') {
          acc.push(comoboxValue);
        }
        return acc;
      }, []);

      if (assignedDocuments.length != comboboxes.length) {
        alert('Please select a document for each of the Spruce requirements. Without a document selected for each type, Spruce will not be able to accept the order.');
        return;
      }
    }

    if (Object.keys(documents).length == 0) {
      this.showOrder(cmp);
      return;
    }

    Object.keys(documents).forEach((key) => {
      var promise = this.attachDocument(cmp, documents[key], key);
      documentPromises.push(promise);
    });

    Promise.all(documentPromises).then(() => {
      this.showOrder(cmp);
    });
  },

  saveSpruceDocs: function (cmp) {
    var attachedDocuments = cmp.get("v.willBeAttachedDocuments");
    var unAttachedDocuments = cmp.get("v.willBeUnAttachedDocuments");
    var documentPromises = [];

    Object.keys(attachedDocuments).forEach((key) => {
      var promise = this.attachDocument(cmp, attachedDocuments[key], key);
      documentPromises.push(promise);
    });

    Object.keys(unAttachedDocuments).forEach((key) => {
      var promise = this.removeDocument(cmp, key);
      documentPromises.push(promise);
    });

    Promise.all(documentPromises).then(() => {
      cmp.set("v.attachedSpruceDocuments", []);
      this.getAttachedDocuments(cmp);
    });
  },

  removeDocument: function (cmp, documentType) {
    var env = cmp.get("v.env");
    var orderUuid = cmp.get("v.orderUuid");

    if (!documentType) {
      return;
    }

    var promise = this.callServerMethod(cmp, "removeSpruceDocument", {
      orderUuid,
      documentType,
      env
    });

    promise.then(() => {
      var unattach = cmp.get("v.willBeUnAttachedDocuments");
      delete unattach[documentType];
      cmp.set("v.willBeUnAttachedDocuments", unattach);
    });

    promise.catch((error) => {
      this.setError(cmp, error);
    });

    return promise;
  },

  attachDocument: function (cmp, documentId, documentType) {
    var env = cmp.get("v.env");
    var orderUuid = cmp.get("v.orderUuid");
    if (!documentId || !documentType) {
      return;
    }

    var promise = this.callServerMethod(cmp, "submitSpruceDocument", {
      orderUuid,
      documentId,
      documentType,
      env
    });

    promise.then(() => {
      var attached = cmp.get("v.willBeAttachedDocuments");
      delete attached[documentType];
      cmp.set("v.willBeAttachedDocuments", attached);
    });

    promise.catch((error) => {
      this.setError(cmp, error);
      return;
    });

    return promise;
  },

  showOrder: function (cmp) {
    this.getPayload(cmp).then(() => {
      cmp.set("v.showSpruceDocuments", false);
      cmp.set("v.showPayload", true);
      $A.get('e.force:refreshView').fire();
    });
  },

  getPayload: function (cmp) {
    var submission = cmp.get("v.submission");
    var env = cmp.get("v.env");
    var query = {
      variables: { submissionUuid: submission.uuid },
      operationName: "spruceOrderPayload",
      query: `query spruceOrderPayload($submissionUuid: ID!) {
          spruceOrderPayload(submissionUuid: $submissionUuid) {
            name
            address
            loanNumber
            estimatedClosingDate
            loanAmount
            phoneNumber
            email
          }
        }`
    };
    var promise = this.callServerMethod(cmp, "request", {
      env: env,
      jsonBody: JSON.stringify(query)
    });
    promise.then(response => {
      var parsedResponse = JSON.parse(response);
      if (parsedResponse && !parsedResponse.data) {
        console.error(
          "Error during spruce payload fetch",
          parsedResponse.errors
        );
        cmp.set("v.error", parsedResponse.errors[0].message);
        return;
      }

      var data = parsedResponse.data.spruceOrderPayload;

      cmp.set("v.name", data.name);
      cmp.set("v.address", data.address);
      cmp.set("v.loanNumber", data.loanNumber);
      cmp.set("v.estimatedClosingDate", data.estimatedClosingDate);
      cmp.set("v.loanAmount", data.loanAmount);
      cmp.set("v.phoneNumber", data.phoneNumber);
      cmp.set("v.email", data.email);
    });

    promise.catch((error) => this.setError(cmp, error));
    return promise;
  },
  createOrder: function (cmp) {
    var recordId = cmp.get("v.recordId");
    var submission = cmp.get("v.submission");
    var env = cmp.get("v.env");

    var promise = this.callServerMethod(cmp, "createSpruceOrder", {
      env,
      recordId,
      submissionUuid: submission.uuid
    }, () => $A.get("e.force:closeQuickAction").fire());
    promise
      .then(response => {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
          title: "Success!",
          message: "The record has been updated successfully.",
          type: "success"
        });
        toastEvent.fire();
        $A.get('e.force:refreshView').fire();
        // var payload = { recordId: recordId };

        // Publish LMS message with payload
        // cmp.find('spruceMessageChannel').publish(payload);
      })
      .catch(response => {
        this.setError(cmp, response);
        return;
      });

    return promise;
  },
  closeModal: function (cmp) {
    cmp.set("v.willBeAttachedDocuments", {});
    cmp.set("v.error", null);
    if (cmp.get("v.showPayload")) {
      cmp.set("v.showPayload", false);
      cmp.set("v.showSpruceDocuments", true);

      $A.get('e.force:refreshView').fire();
      return;
    }

    $A.get("e.force:closeQuickAction").fire();
  },

  setError: function(cmp, error) {
    var errorMessage = error && error[0] && error[0].message;
    console.error(errorMessage);
    cmp.set("v.error", errorMessage);
  }
});