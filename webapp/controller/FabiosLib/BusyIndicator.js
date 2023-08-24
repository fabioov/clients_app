sap.ui.define(["sap/ui/base/ManagedObject", "sap/ui/core/BusyIndicator"], function (ManagedObject, BusyIndicator) {
    "use strict";
  
    return ManagedObject.extend("clientsapp.controller.FabiosLib.BusyIndicator", {
      _sTimeoutId: null,
  
      showBusyIndicator: function (iDuration, iDelay) {
        debugger;
        BusyIndicator.show(iDelay);
  
        if (iDuration && iDuration > 0) {
          if (this._sTimeoutId) {
            clearTimeout(this._sTimeoutId);
            this._sTimeoutId = null;
          }
  
          this._sTimeoutId = setTimeout(function () {
            this.hideBusyIndicator();
          }.bind(this), iDuration);
        }
      },
  
      hideBusyIndicator: function () {
        BusyIndicator.hide();
      },
    });
  });
  