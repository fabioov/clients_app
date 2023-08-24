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

  return ManagedObject.extend("clientsapp.controller.FabiosLib.ApiValueHelp", {
    _sModel: null,
    _sMethod: null,
    _sContentType: null,
    _sUrl: null,
    _oView: null,
    _sReturnedValue: null,
    _oFieldValueUpdate: null,
    _sFieldForSearch: null,
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
          controller: this
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
      sUrl,
      sModel,
      sMethod,
      sContentType,
      sReturnedValue,
      oFieldValueUpdate,
      sFieldForSearch,
      sValueHelpType
    ) {
      this._sModel = sModel;
      this._sMethod = sMethod;
      this._sContentType = sContentType;
      this._sUrl = sUrl;
      this._oView = oView;
      this._sReturnedValue = sReturnedValue;
      this._oFieldValueUpdate = oFieldValueUpdate;
      this._sFieldForSearch = sFieldForSearch;
      this._sValueHelpType = sValueHelpType;

      var busyIndicator = new BusyIndicator();

      var requestData = {
        iso2: this._sFieldForSearch,
      };

      busyIndicator.showBusyIndicator(1000, 1);
      jQuery.ajax({
        url: this._sUrl,
        type: this._sMethod,
        contentType: this._sContentType,
        data: JSON.stringify(requestData),
        success: function (oData) {
          var oModel = this._oView.getModel(this._sModel);
          var sModelSetName = "/" + this._sModel;
          oModel.setProperty(sModelSetName, oData.data.states);
          busyIndicator.hideBusyIndicator();
          this._openValueHelpDialog();
        }.bind(this),
        error: function (jqXHR, textStatus, errorThrown) {
          console.error("Error:", textStatus, errorThrown);
          busyIndicator.hideBusyIndicator();
        },
      });
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

      this._sStateKey = oSelectedItem.getBindingContext(this._sModel).getProperty(this._sReturnedValue);
      this._oFieldValueUpdate.setValue(this._sStateKey);
      this.readValueHelpData();
    },

    readValueHelpData: function () {
      var requestData = {
        iso2: this._sFieldForSearch,
      };

      var busyIndicator = new BusyIndicator();
      busyIndicator.showBusyIndicator(500, 0);

      jQuery.ajax({
        url: this._sUrl,
        type: this._sMethod,
        contentType: this._sContentType,
        data: JSON.stringify(requestData),
        success: function (oData) {
          var oModel = this._oView.getModel(this._sModel);
          var sModelSetName = "/" + this._sModel;

          var aFilteredData = oData.data.states.filter(function (item) {
            return item[this._sReturnedValue].toLowerCase().includes(this._sValue.toLowerCase());
          }.bind(this));

          oModel.setProperty(sModelSetName, aFilteredData);
          busyIndicator.hideBusyIndicator();
        }.bind(this),
        error: function (jqXHR, textStatus, errorThrown) {
          console.error("Error:", textStatus, errorThrown);
          busyIndicator.hideBusyIndicator();
        },
      });
    },
  });
});
