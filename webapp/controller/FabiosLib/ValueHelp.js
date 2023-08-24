sap.ui.define([
  "sap/ui/base/ManagedObject",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast",
  "clientsapp/model/formatter",
  "clientsapp/controller/FabiosLib/BusyIndicator"
], function (
  ManagedObject,
  Filter,
  FilterOperator,
  Fragment,
  MessageToast,
  formatter,
  BusyIndicator
) {
  "use strict";

  return ManagedObject.extend("clientsapp.controller.FabiosLib.ValueHelp", {
    formatter: formatter,
    _oODataModel: null,
    _sSearchKey: null,
    _sModel: null,
    _sEntity: null,
    _oView: null,
    _sReturnedValue: null,
    _oFieldValueUpdate: null,
    _sValueHelpType: null,
    _pValueHelpDialog: null,

    onInit: function () {
      // Initialization code if needed
    },

    _openValueHelpDialog: function () {
      if (!this._pValueHelpDialog) {
        this._pValueHelpDialog = Fragment.load({
          id: this._oView.getId(),
          name: "clientsapp.view.ValueHelpDialog",
          controller: this,
        }).then(function (oDialog) {
          this._oView.addDependent(oDialog);
          return oDialog;
        }.bind(this));
      }

      this._pValueHelpDialog.then(function (oDialog) {
        oDialog.getModel(this._sModel).setProperty("/sValueHelpType", this._sValueHelpType);
        oDialog.open();
      }.bind(this));
    },

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

      var busyIndicator = new BusyIndicator();
      busyIndicator.showBusyIndicator(3000, 1);

      this._oODataModel.read(sEntity, {
        success: function (oData, oResponse) {
          var oModel = oView.getModel(sModel);
          var sModelSetName = "/" + sModel;
          oModel.setProperty(sModelSetName, oData.results);
          busyIndicator.hideBusyIndicator();
        }.bind(this),
        error: function (err) {
          console.error("Error occurred during ODataModel read operation:", err);
          MessageToast.show("An error occurred while fetching data. Please try again later.");
          busyIndicator.hideBusyIndicator();
        },
      });

      this._openValueHelpDialog();
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

      this._sCountryKey = oSelectedItem.getBindingContext(this._sModel).getProperty(this._sReturnedValue);
      this._sCountryName = oSelectedItem.getBindingContext(this._sModel).getProperty("CountryName");

      this._oFieldValueUpdate.setValue(this._sCountryKey);

      this.readValueHelpData();
    },

    readValueHelpData: function () {
      var searchKey = this._sValue || this._sCountryKey;

      var busyIndicator = new BusyIndicator();
      busyIndicator.showBusyIndicator(1000, 0);

      this._oODataModel.read(this._sEntity, {
        success: function (oData, oResponse) {
          var oModel = this._oView.getModel(this._sModel);
          var sModelSetName = "/" + this._sModel;

          if (searchKey) {
            var aFilteredData = oData.results.filter(function (item) {
              return item[this._sSearchKey].toLowerCase().includes(searchKey.toLowerCase());
            }.bind(this));
            
            oModel.setProperty(sModelSetName, aFilteredData);
          } else {
            oModel.setProperty(sModelSetName, oData.results);
          }

          busyIndicator.hideBusyIndicator();
        }.bind(this),
        error: function (err) {
          console.error("Error occurred during ODataModel read operation:", err);
          MessageToast.show("An error occurred while fetching data. Please try again later.");
          busyIndicator.hideBusyIndicator();
        },
      });
    },
  });
});
