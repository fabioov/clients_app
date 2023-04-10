sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, Fragment, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("clientsapp.controller.View1", {
      onInit: function () {},

      onCreateClient: function (oEvent) {
        var oEditClient = this.getView().getModel("editClient");
        oEditClient.setProperty("/isEdit", false);
        var oView = this.getView();
debugger
        if (!this.byId("openDialog")) {
          Fragment.load({
            id: oView.getId(),
            name: "clientsapp.view.Edit",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            oDialog.open();
          });
        } else {
          this.byId("openDialog").open();
        }
      },

      onSaveBtnPress: function () {
        sap.ui.core.BusyIndicator.show(0);
        var oView = this.getView();

        var cpfId = oView.byId("cpfClient").getValue();
        var phone = oView.byId("phoneClient").getValue();

        var cpfNumbers = cpfId.replace(/[.-]/g, "");
        var phoneSpace = phone.replace(/[()]/g, "");
        var phoneNumbers = phoneSpace.replace(/\s/g, "");

        var clientFragmentData = [
          {
            Id: cpfNumbers,
            Name: oView.byId("nameClient").getValue(),
            Address: oView.byId("addressClient").getValue(),
            Phone: phoneNumbers,
          },
        ];

        var payload = {
          Action: "CREATE",
          Payload: JSON.stringify(clientFragmentData),
        };

        var oModel = oView.getModel();
        var createMessage = oView.getModel("i18n").getProperty("addedClient");

        oModel.create("/JsonCommSet", payload, {
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show(createMessage);
            oModel.refresh();
          }.bind(this),

          error: function (oError) {
            var oSapMessage = JSON.parse(oError.responseText);
            var msg = oSapMessage.error.message.value;
            MessageToast.show(msg);
            this.byId("openDialog").destroy(true);
            oModel.refresh();
          },
        });
      },

      onEditClient: function () {
        var oEditClient = this.getView().getModel("editClient");
        oEditClient.setProperty("/isEdit", true);

        var oView = this.getView();
        debugger;
        var oSmartTable = this.getView().byId("clientsTable").getTable();
        var aSelectedItems = oSmartTable.getSelectedItems();

        if (aSelectedItems.length === 1) {
          var oSelectedItem = aSelectedItems[0];
          var oContext = oSelectedItem.getBindingContext();
          var sPath = oContext.getPath();
          var oSelectedItemData = oContext.getModel().getProperty(sPath);
          oView.bindElement(sPath);

          if (!this.byId("editClientFragment")) {
            Fragment.load({
              id: oView.getId(),
              name: "clientsapp.view.Edit",
              controller: this,
            }).then(function (oDialog) {
              oView.addDependent(oDialog);
              oDialog.open();
            });
          } else {
            this.byId("editClientFragment").open();
          }
        } else if (aSelectedItems.length > 1) {
          MessageToast.show("Somente 1 cliente pode ser editado por vez.");
        } else {
          MessageToast.show("Selecione ao menos uma linha.");
        }
      },

      onUpdateBtnPress: function () {},

      onDeleteBtnPress: function () {
        var oView = this.getView();
        var oSmartTable = this.getView().byId("clientsTable").getTable();
        var aSelectedItems = oSmartTable.getSelectedItems();
        var ClientData = [];

        sap.ui.core.BusyIndicator.show(0);
        for (var i = 0; i < aSelectedItems.length; i++) {
          var item = aSelectedItems[i];
          var context = item.getBindingContext();
          var obj = context.getProperty(null, context);

          ClientData.push({
            Id: obj.ClientId,
          });
        }

        var payload = {
          Action: "DELETE",
          Payload: JSON.stringify(ClientData),
        };

        var oModel = oView.getModel();
        var deletedMessage = oView
          .getModel("i18n")
          .getProperty("deletedClient");

        oModel.create("/JsonCommSet", payload, {
          success: function (oData, oResponse) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show(deletedMessage);
            oModel.refresh();
          }.bind(this),

          error: function (oError) {
            var oSapMessage = JSON.parse(oError.responseText);
            var msg = oSapMessage.error.message.value;
            MessageToast.show(msg);
            sap.ui.core.BusyIndicator.hide();
            oModel.refresh();
          },
        });
      },

      onCancelBtnPress: function () {
        var oModel = this.getView().getModel();
        oModel.resetChanges();

        if (this.byId("openDialog")) {
          this.byId("openDialog").destroy(true);
        } else if (this.byId("editClientFragment")) {
          this.byId("editClientFragment").destroy(true);
        }
      },
    });
  }
);
