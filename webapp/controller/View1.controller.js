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
        debugger;

        var oEditClient = this.getView().getModel("editClient");
        oEditClient.setProperty("/isEdit", false);
        var oView = this.getView();

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
        MessageToast.show("Botão está funcionando!");
      },

      onEditClient: function () {
        var oEditClient = this.getView().getModel("editClient");
        oEditClient.setProperty("/isEdit", true);

        var oView = this.getView();
debugger
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
      } else if ( aSelectedItems.length > 1 ) {

        MessageToast.show("Somente 1 cliente pode ser editado por vez.");

      }
      
      else {
        MessageToast.show("Selecione ao menos uma linha.");
    }
      },

      onDeleteBtnPress() {
        var oView = this.getView();
        var oSmartTable = this.getView().byId("clientsTable").getTable();
        var SelectedItem = oSmartTable
          .getModel()
          .getProperty(oSmartTable._aSelectedPaths.toString());

        if (oSmartTable._aSelectedPaths.length < 1) {
          MessageToast.show("Selecione pelo menos uma linha");
        } else {
          var ClientData = [
            {
              ClientId: SelectedItem.ClientId,
              ClientName: SelectedItem.Client,
              ClientAddress: SelectedItem.ClientAddress,
              ClientPhone: SelectedItem.ClientPhone,
            },
          ];
          var payload = {
            Action: "DELETECAR",
            Payload: JSON.stringify(ClientData),
          };

          var oModel = oView.getModel();
          oModel.create("/JsonCommSet", payload, {
            success: function (oData, oResponse) {
              MessageToast.show("Perfect!");
              oModel.refresh();
            }.bind(this),

            error: function (oError) {
              var oSapMessage = JSON.parse(oError.responseText);
              var msg = oSapMessage.error.message.value;
              MessageToast.show(msg);
              oModel.refresh();
            },
          });
        }
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
