sap.ui.define([
	"sap/ui/base/ManagedObject"
], function(
	ManagedObject
) {
	"use strict";

	return ManagedObject.extend("clientsapp.controller.FabiosLib.HttpClient", {
        request: function (url, method, contentType, requestData) {
            const FETCH_OPTIONS = {
              method: method,
              headers: {
                "Content-Type": contentType,
              },
              body: JSON.stringify(requestData),
            };
      
            return fetch(url, FETCH_OPTIONS)
              .then((response) => response.json())
              .catch((error) => {
                logger.error(`Error: ${error}`);
                throw error;
              });
          },
	});
});