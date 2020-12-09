/*global hcm window*/
sap.ui.controller("hcm.myleaverequest.HCM_LRQ_CREExtension.view.S3Custom", {

	onInit: function() {
		this.oRouter.attachRouteMatched(this._handleDetailRouteMatched, this);
		this.masterListCntrl.attachEvent("updateFinished", function() {
			var that = this;
			this.oBus.publish("Master", "InitialLoadFinished");
			if(this.selectedRequestIDFromChange) {
					var list = this.getList();
					var items = list.getItems();
					items.forEach(function(item) {
						if(item.getBindingContext().getProperty("RequestID") === that.selectedRequestIDFromChange) {
							list.setSelectedItem(item, true);
							that.loadDetailView(item);					
						}
					});
					this.selectedRequestIDFromChange = null;
			}
		}, this);
	},
	_handleDetailRouteMatched: function(oEvent) {
		if (oEvent.getParameter("name") === "detail") {
			var contextPathJSON = JSON.parse(oEvent.getParameter("arguments").contextPath);
			if(contextPathJSON.FromChangeView === true) {
				this.selectedRequestIDFromChange = contextPathJSON.RequestID;
			}
		}
	},
	_initData: function() {
		var _this = this;
		_this.setMasterListItems();
		if (_this._searchField !== "") {
			_this.applySearchPattern(_this._searchField);
		}
	},
	selectFirstItem: function() {
		var oList = this.getList();
		var aItems = oList.getItems();
		if (aItems.length) {
			oList.setSelectedItem(aItems[0], true);
			this.loadDetailView(aItems[0]);
		}		
	},
	loadDetailView: function(item) {
		var bReplace = jQuery.device.is.phone ? false : true;
		var contextPath = {
			EmployeeID : item.getBindingContext().getProperty("EmployeeID"),
			RequestID : item.getBindingContext().getProperty("RequestID"),
			ChangeStateID : item.getBindingContext().getProperty("ChangeStateID"),
			LeaveKey : item.getBindingContext().getProperty("LeaveKey"),
			FromChangeView : false
		};
		this.oRouter.navTo("detail", {
			from: "master",
			contextPath: JSON.stringify(contextPath)
		}, bReplace);
	},
	// Overwrite Scaffholding that the Item Not Found View is not displayed
	noItemFoundForContext : function() {
		return null;
	},
	onItemSelect: function(event) {
	    if(event.getParameters().listItem) {
	        this.loadDetailView(event.getParameters().listItem);
	    } else { // Workaround for mobile devices - listItem undefined
	        this.loadDetailView(event.getSource());
	    }
	},
	setListItem: function(oItem) {
		this.loadDetailView(oItem);
	},
	setMasterListItems: function() {
		var _this = this;
		_this.masterListCntrl.bindItems({
			path: "/LeaveRequestCollection",
			parameters: {
				expand: "MultipleApprovers"
			},
			filters: [new sap.ui.model.Filter("EmployeeID", sap.ui.model.FilterOperator.EQ, hcm.myleaverequest.utils.UIHelper.getPernr())],
			template: this._getObjectListItemTemplate()
		});
		if (_this._fnRefreshCompleted) {
			_this._fnRefreshCompleted();
		}
		if (!jQuery.device.is.phone && !_this._isInitialized) {
			_this.registerMasterListBind(_this.masterListCntrl);
			_this._isInitialized = true;
		}
	},
	_getObjectListItemTemplate: function() {
		var _this = this;
		var objectListItem = new sap.m.ObjectListItem({
			type: "{device>/listItemType}",
			title: "{AbsenceTypeName}",
			number: "{parts:[{path:'WorkingDaysDuration'},{path:'WorkingHoursDuration'}], formatter:'hcm.myleaverequest.utils.Formatters.DURATION'}",
			numberUnit: "{parts:[{path:'WorkingDaysDuration'},{path:'WorkingHoursDuration'}], formatter:'hcm.myleaverequest.utils.Formatters.DURATION_UNIT'}",
			attributes: [
				new sap.m.ObjectAttribute({
					text: "{path:'StartDate', formatter:'hcm.myleaverequest.utils.Formatters.DATE_ODATA_EEEdMMMyyyy'}"
				}),
				new sap.m.ObjectAttribute({
					text: "{parts:[{path:'i18n>LR_HYPHEN'},{path:'WorkingDaysDuration'},{path:'StartTime'},{path:'EndDate'},{path:'EndTime'}], formatter: 'hcm.myleaverequest.utils.Formatters.FORMAT_ENDDATE'}"
				})
			],
			firstStatus: new sap.m.ObjectStatus({
				text: "{StatusName}",
				state: "{path:'StatusCode', formatter:'hcm.myleaverequest.utils.Formatters.State'}"
			}),
			secondStatus: new sap.m.ObjectStatus({
				state: "Error",
				text: "{path:'aRelatedRequests', formatter:'hcm.myleaverequest.utils.Formatters.FORMATTER_INTRO'}"
			}),
			press: jQuery.proxy(_this.onItemSelect, _this)
		});
		return objectListItem;
	}
});