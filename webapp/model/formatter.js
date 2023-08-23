sap.ui.define([], function () {
  "use strict";

  return {
    valueHelpType: function (sValueHelpType) {
        debugger
      switch (this._sValueHelpType) {
        case "Country":
          return "valueHelpModel>CountryName";
        case "State":
          return "name";
        case "City":
          return "name";
        case "ZipCode":
          return "code";
      }
    },
  };
});
