// IE .find bug Polyfill TODO: remove after central fix
if (!Array.prototype.find) {
	Object.defineProperty(Array.prototype, 'find', {
		enumerable: false,
		configurable: false,
		value: function(predicate) {
			'use strict';
			if (this == null) {
				throw new TypeError('Array.prototype.find called on null or undefined');
			}
			if (typeof predicate !== 'function') {
				throw new TypeError('predicate must be a function');
			}
			var list = Object(this);
			var length = list.length >>> 0;
			var thisArg = arguments[1];
			var value;

			for (var i = 0; i < length; i++) {
				value = list[i];
				if (predicate.call(thisArg, value, i, list)) {
					return value;
				}
			}
			return undefined;
		}
	});
}

jQuery.sap.declare("hcm.myleaverequest.HCM_LRQ_CREExtension.Component");
// use the load function for getting the optimized preload file if present
sap.ui.component.load({
	name: "hcm.myleaverequest",
	// Use the below URL to run the extended application when SAP-delivered application is deployed on SAPUI5 ABAP Repository
	url: "/sap/bc/ui5_ui5/sap/HCM_LRQ_CRE" // we use a URL relative to our own component
		// extension application is deployed with customer namespace
});
this.hcm.myleaverequest.Component.extend("hcm.myleaverequest.HCM_LRQ_CREExtension.Component", {
	metadata: {
		version: "1.0",
		config: {
			"sap.ca.i18Nconfigs": {
				"bundleName": "hcm.myleaverequest.HCM_LRQ_CREExtension.i18n.i18n"
			},
			"sap.ca.serviceConfigs": [{
				"name": "My Leave Request",
				"serviceUrl": "/sap/opu/odata/sap/Z_EXT_HCM_LR_CRE_SRV/",
				"isDefault": true,
				"mockedDataSource": "./localService/metadata.xml"
			}]
		},
		customizing: {
			"sap.ui.controllerExtensions": {
				"hcm.myleaverequest.view.S1": {
					"controllerName": "hcm.myleaverequest.HCM_LRQ_CREExtension.view.S1Custom"
				},
				"hcm.myleaverequest.view.S6B": {
					"controllerName": "hcm.myleaverequest.HCM_LRQ_CREExtension.view.S6BCustom"
				},
				"hcm.myleaverequest.view.S3": {
					"controllerName": "hcm.myleaverequest.HCM_LRQ_CREExtension.view.S3Custom"
				}
			},
			"sap.ui.viewReplacements": {
				"hcm.myleaverequest.view.S3": {
					"viewName": "hcm.myleaverequest.HCM_LRQ_CREExtension.view.S3Custom",
					"type": "XML"
				},
				"hcm.myleaverequest.view.S1": {
					"viewName": "hcm.myleaverequest.HCM_LRQ_CREExtension.view.S1Custom",
					"type": "XML"
				}
			}
		}
	}
});