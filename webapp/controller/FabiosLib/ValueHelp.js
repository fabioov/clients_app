sap.ui.define(
  [
    "sap/ui/base/ManagedObject",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "clientsapp/model/formatter"
  ],
  function (ManagedObject,
	Filter,
	FilterOperator,
	Fragment,
	MessageToast,
	formatter) {
    "use strict";

    return ManagedObject.extend("clientsapp.controller.FabiosLib.ValueHelp", {
      formatter: formatter,
      onInit: function () {},

      valueHelpRequest: function (
        oView,
        sEntity,
        sModel,
        sSearchKey,
        sReturnedValue,
        oFieldValueUpdate,
        sValueHelpType
      ) {
        this._oODataModel = oView.getModel();
        this._sSearchKey = sSearchKey;
        this._sModel = sModel;
        this._sEntity = sEntity;
        this._oView = oView;
        this._sReturnedValue = sReturnedValue;
        this._oFieldValueUpdate = oFieldValueUpdate;

        this._sValueHelpType = sValueHelpType;

        if (!this._pValueHelpDialog) {
          this._pValueHelpDialog = Fragment.load({
            id: oView.getId(),
            name: "clientsapp.view.ValueHelpDialog",
            controller: this,
          }).then(function (oDialog) {
            oView.addDependent(oDialog);
            return oDialog;
          });
        }

        this._pValueHelpDialog.then(
          function (oDialog) {
            this._oODataModel.read(sEntity, {
              success: function (oData, oResponse) {
                var oModel = oView.getModel(sModel);
                var sModelSetName = "/" + sModel;

                oModel.setProperty(sModelSetName, oData.results);
              }.bind(this),
              error: function (err) {
                console.error(
                  "Error occurred during ODataModel read operation:",
                  err
                );
                MessageToast.show(
                  "An error occurred while fetching data. Please try again later."
                );
              },
            });

            oDialog.open();
            oDialog
              .getModel(this._sModel)
              .setProperty("/sValueHelpType", this._sValueHelpType);
          }.bind(this)
        );
      },

      onValueHelpSearch: function (oEvent) {
        this._sValue = oEvent.getParameter("value");

        this.readValueHelpData();
      },

      onValueHelpClose: function (oEvent) {
        var oDialog = oEvent.getSource();
        oDialog.destroy();
        var oSelectedItem = oEvent.getParameter("selectedItem");

        if (!oSelectedItem) {
          return;
        }

        this._sCountryKey = oSelectedItem
          .getBindingContext(this._sModel)
          .getProperty(this._sReturnedValue);

          this._sCountryName = oSelectedItem
          .getBindingContext(this._sModel)
          .getProperty("CountryName");

        this._oFieldValueUpdate.setValue(this._sCountryKey);

        this.readValueHelpData();
      },

      readValueHelpData: function () {
        var searchKey;
        if (this._sValue) {
          searchKey = this._sValue;
        } else {
          searchKey = this._sCountryKey;
        }

        this._oODataModel.read(this._sEntity, {
          success: function (oData, oResponse) {
            debugger;
            var oModel = this._oView.getModel(this._sModel);
            var sModelSetName = "/" + this._sModel;
            oModel.setProperty(sModelSetName, oData.results);

            var aFilteredData = oData.results.filter(
              function (item) {
                return item[this._sSearchKey]
                  .toLowerCase()
                  .includes(searchKey.toLowerCase());
              }.bind(this)
            );
            oModel.setProperty(sModelSetName, aFilteredData);
          }.bind(this),
          error: function (err) {
            console.error(
              "Error occurred during ODataModel read operation:",
              err
            );
            MessageToast.show(
              "An error occurred while fetching data. Please try again later."
            );
          },
        });
      },
    });
  }
);
