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

    return ManagedObject.extend(
      "clientsapp.controller.FabiosLib.ApiValueHelp",
      {
        formatter: formatter,
        onInit: function () {},

        valueHelpRequest: function (
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
        ) {
          this._oODataModel = oView.getModel();
          this._sModel = sModel;
          this._sMethod = sMethod;

          this._sContentType = sContentType;
          this._sUrl = sUrl;
          this._oView = oView;
          this._sReturnedValue = sReturnedValue;
          this._sReturnedValue2 = sReturnedValue2;
          this._oFieldValueUpdate = oFieldValueUpdate;

          this._sFieldForSearch = sFieldForSearch;;

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
            
              var requestData = {
                iso2: this._sFieldForSearch,
              };
            
              debugger;
              jQuery.ajax({
                url: this._sUrl,
                type: this._sMethod,
                contentType: sContentType,
                data: JSON.stringify(requestData),
                success: function (oData, textStatus, jqXHR) {
                  var oModel = oView.getModel(sModel);
                  var sModelSetName = "/" + sModel;
                  debugger
                  oModel.setProperty(sModelSetName, oData.data.states);

                }.bind(this),
                error: function (jqXHR, textStatus, errorThrown) {
                  // Handle the error response
                  console.error("Error:", textStatus, errorThrown);
                },
              });

              oDialog.open();
              oDialog
                .getModel(this._sModel)
                .setProperty("/sValueHelpType", this._sValueHelpType);
                debugger
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
      }
    );
  }
);
