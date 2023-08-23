sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/PDFViewer",
    "sap/m/Link",
    "sap/ui/core/UIComponent",
    "sap/ui/core/message/Message",
    "sap/m/MessagePopover",
    "sap/m/MessageItem",
    "sap/ui/core/Core",
    "sap/ui/core/library",
    "sap/ui/core/message/ControlMessageProcessor",
    "sap/m/StandardListItem",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "clientsapp/controller/FabiosLib/ValueHelp",
    "clientsapp/controller/FabiosLib/ApiValueHelp",
    "clientsapp/model/formatter"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (
    Controller,
	JSONModel,
	Fragment,
	MessageToast,
	MessageBox,
	PDFViewer,
	Link,
	UIComponent,
	Message,
	MessagePopover,
	MessageItem,
	Core,
	library,
	ControlMessageProcessor,
	StandardListItem,
	Filter,
	FilterOperator,
	ValueHelp,
	ApiValueHelp,
	formatter
  ) {
    "use strict";

    return Controller.extend("clientsapp.controller.View1", {
      formatter: formatter,
      onInit: function () {
        // create any data and a model and set it to the view
        var oModel = new JSONModel();
        this.getView().setModel(oModel, "valueHelpModel");
      },

      onMessagesButtonPress: function (oEvent) {
        var oMessagesButton = oEvent.getSource();
        debugger;
        if (!this._messagePopover) {
          this._messagePopover = new MessagePopover({
            items: {
              path: "/",
              template: new MessageItem({
                description: "Grêmio jogou bem!",
                type: sap.ui.core.MessageType.Error,
                title: "Baile na Arena?",
              }),
            },
          });
          oMessagesButton.addDependent(this._messagePopover);
        }

        this._messagePopover.toggle(oMessagesButton);
      },
      onCreateClient: function (oEvent) {
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
        sap.ui.core.BusyIndicator.show(0);
        var oView = this.getView();

        var cpfId = oView.byId("cpfClient").getValue();
        var phone = oView.byId("phoneClient").getValue();

        var cpfNumbers = cpfId.replace(/[.-]/g, "");
        var phoneSpace = phone.replace(/[()]/g, "");
        var phoneNumbers = phoneSpace.replace(/\s/g, "");
        debugger;
        if (cpfNumbers === "") {
          var msgCpfEmpty = oView.getModel("i18n").getProperty("cpfEmpty");
          MessageToast.show(msgCpfEmpty);
          sap.ui.core.BusyIndicator.hide();
        } else {
          var clientFragmentData = [
            {
              Id: cpfNumbers,
              Name: oView.byId("nameClient").getValue(),
              Address: oView.byId("addressClient").getValue(),
              ZipCode: oView.byId("zipcodeClient").getValue(),
              Country: oView.byId("countryClient").getValue(),
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
              MessageToast.show(createMessage);
              oModel.refresh();
              this.onCancelBtnPress();
              sap.ui.core.BusyIndicator.hide();
            }.bind(this),

            error: function (oError) {
              debugger;
              var oSapMessage = JSON.parse(oError.responseText);
              var msg = oSapMessage.error.message.value;
              MessageToast.show(msg);
              oModel.refresh();
              sap.ui.core.BusyIndicator.hide();
            },
          });
        }
      },

      onEditClient: function () {
        var oEditClient = this.getView().getModel("editClient");
        oEditClient.setProperty("/isEdit", true);
        debugger;
        var oView = this.getView();

        var oSmartTable = this.getView().byId("clientsTable").getTable();
        var aSelectedItems = oSmartTable.getSelectedItems();
        debugger;

        if (aSelectedItems.length === 1) {
          var oSelectedItem = aSelectedItems[0];
          var oContext = oSelectedItem.getBindingContext();
          var oSelectedClient = oContext.getObject();
          var sPath = oContext.getPath();
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

      onUpdateBtnPress: function () {
        var oView = this.getView();

        var oSmartTable = this.getView().byId("clientsTable").getTable();
        var aSelectedItem = oSmartTable
          .getSelectedItems()[0]
          .getBindingContext()
          .getProperty();

        var phone = oView.byId("phoneClient").getValue();

        var phoneSpace = phone.replace(/[()]/g, "");
        var phoneNumbers = phoneSpace.replace(/\s/g, "");

        var clientUpdateData = [
          {
            Id: aSelectedItem.ClientId,
            Name: oView.byId("nameClient").getValue(),
            Address: oView.byId("addressClient").getValue(),
            Phone: phoneNumbers,
            Country: oView.byId("countryClient").getValue(),
            ZipCode: oView.byId("zipcodeClient").getValue(),
          },
        ];

        var payload = {
          Action: "UPDATE",
          Payload: JSON.stringify(clientUpdateData),
        };

        var oModel = oView.getModel();
        var createMessage = oView.getModel("i18n").getProperty("updatedClient");

        oModel.create("/JsonCommSet", payload, {
          success: function (oData, oResponse) {
            MessageToast.show(createMessage);
            oModel.refresh();
            this.onCancelBtnPress();
            sap.ui.core.BusyIndicator.hide();
          }.bind(this),

          error: function (oError) {
            debugger;
            var oSapMessage = JSON.parse(oError.responseText);
            var msg = oSapMessage.error.message.value;
            MessageToast.show(msg);
            oModel.refresh();
            sap.ui.core.BusyIndicator.hide();
          },
        });
      },

      onDeleteBtnPress: function () {
        var oView = this.getView();
        var oSmartTable = this.getView().byId("clientsTable").getTable();
        var aSelectedItems = oSmartTable.getSelectedItems();
        var ClientData = [];

        sap.ui.core.BusyIndicator.show(0);
        for (var i = 0; i < aSelectedItems.length; i++) {
          var item = aSelectedItems[i].getBindingContext().getProperty();

          ClientData.push({
            Id: item.ClientId,
          });
        }

        var payload = {
          Action: "DELETE",
          Payload: JSON.stringify(ClientData),
        };

        var oModel = oView.getModel();
        var oJSONModel = new JSONModel();

        var deletedMessage = oView
          .getModel("i18n")
          .getProperty("deletedClient");

        oModel.create("/JsonCommSet", payload, {
          success: function (oData, oResponse) {
            debugger;
            var jsonPayload = oData.Payload; // Assuming this is your JSON object
            var array = JSON.parse(jsonPayload);

            oJSONModel.setData(array);
            oView.setModel(oJSONModel, "List");
            // this.updateTable(array);

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

      updateTable: function (array) {
        debugger;
        var oTable = this.getView().byId("List"); // Ensure this ID matches the one in your view
        var keys = Object.keys(array[0]); // Get keys from the first object in the array

        // Clear any previous columns
        oTable.removeAllColumns();

        // Generate new columns dynamically based on keys
        for (var i = 0; i < keys.length; i++) {
          var oColumn = new sap.m.Column({
            header: new sap.m.Label({
              text: keys[i],
            }),
          });
          oTable.addColumn(oColumn);
        }

        var oTemplate = new sap.m.ColumnListItem({
          cells: keys.map(function (key) {
            return new sap.m.Text({
              text: "{" + key + "}",
            });
          }),
        });

        oTable.bindItems({
          path: "/",
          template: oTemplate,
        });
      },

      onPrintClient: function (
        Params,
        Title = "PDF",
        FileName = "ZFSANTOS_SF_CLIENTSAPP",
        GetPDF = "X"
      ) {
        const oSmartTable = this.getView().byId("clientsTable").getTable();
        const oItems = oSmartTable.getSelectedItems();
        const client = oItems[0]?.getBindingContext()?.getProperty();

        if (oItems.length !== 1) {
          MessageToast.show(
            `Selecione ${
              oItems.length === 0 ? "ao menos um" : "somente um"
            } cliente!`
          );
          return;
        }

        var Viewer = new PDFViewer();
        var clientData = [
          {
            Id: client.ClientId,
          },
        ];
        this.getView().addDependent(Viewer);
        let oModel = this.getView().getModel();

        let sPath = oModel.createKey("/PrintSmartFormsSet", {
          Params: JSON.stringify(clientData),
          FileName,
          GetPdf: GetPDF,
        });

        let sSource = this.getView().getModel().sServiceUrl + sPath + "/$value";

        Viewer.setShowDownloadButton(false);
        Viewer.setSource(sSource);

        Viewer.setTitle(Title);
        Viewer.open();
      },

      onCancelBtnPress: function () {
        var oModel = this.getView().getModel();
        oModel.resetChanges();

        if (this.byId("openDialog")) {
          this.byId("openDialog").close();
        } else if (this.byId("editClientFragment")) {
          this.byId("editClientFragment").destroy(true);
        }
      },

      onUploadDoc: function (oEvent) {
        debugger;
        var oView = this.getView();
        if (!this.byId("uploadDialog")) {
          Fragment.load({
            id: oView.getId(),
            name: "clientsapp.view.Upload",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            oDialog.open();
          });
        } else {
          this.byId("uploadDialog").open();
        }
      },

      cancelUpldPress: function (oEvent) {
        if (this.byId("uploadDialog")) {
          this.byId("uploadDialog").destroy(true);
        }
      },

      uploadPress: function (oEvent) {},

      onValueHelpCountryRequest: function (oEvent) {
        debugger;
        var valueHelpCall = new ValueHelp();
        var oView = this.getView();
        var sEntity = "/ZFS_COUNTRIES_V2";
        var sModel = "valueHelpModel";
        var sSearchKey = "CountryName";
        var sReturnedValue = "CountryKey";
        var oFieldValueUpdate = this.byId("countryClient");
        var sValueHelpType = "Country";
        
        valueHelpCall.valueHelpRequest(
          oView,
          sEntity,
          sModel,
          sSearchKey,
          sReturnedValue,
          oFieldValueUpdate,
          sValueHelpType
        );

        var oStateClient = this.byId("stateClient")

        oStateClient.setValue("");
      },

      onApiValueHelpStateRequest: function (oEvent) {
        debugger;
        var apiValueHelpCall = new ApiValueHelp();
        var oView = this.getView();
        var sUrl = "https://countriesnow.space/api/v0.1/countries/states";
        var sModel = "valueHelpModel";
        var sMethod = "POST";
        var sContentType = "application/json";
        var sReturnedValue = "name";
        var sReturnedValue2 = "";
        var oFieldValueUpdate = this.byId("stateClient");
        var sFieldForSearch = this.byId("countryClient").getValue();
        var sValueHelpType = "State";

        apiValueHelpCall.valueHelpRequest(
          oView,
          sUrl,
          sModel,
          sMethod,
          sContentType,
          sReturnedValue,
          sReturnedValue2,
          oFieldValueUpdate,
          sFieldForSearch,
          sValueHelpType
        );

        var oStateClient = this.byId("cityClient")

        oStateClient.setValue("");
      },
      onZipCodeSearch: function () {
        var that = this;
        var oZipCodeClient = that.byId("addressClient");
        oZipCodeClient.setValue("");
        var sFieldForSearch = this.byId("zipcodeClient").getValue();
        debugger
        jQuery.ajax({
          url: `https://viacep.com.br/ws/${sFieldForSearch}/json/`,
          type: "GET",
          success: function (data) {
            debugger;
            
            oZipCodeClient.setValue(`${data.logradouro}, Nr____, ${data.bairro}`);
          },
          error: function (textStatus, errorThrown) {
            // Handle the error response
            console.error("Error:", textStatus, errorThrown);
          },
        });

      },

     
    });
  }
);
