/*global hcm window*/
sap.ui.controller("hcm.myleaverequest.HCM_LRQ_CREExtension.view.S6BCustom", {
	
	onInit : function() {
		this.getView().byId("LRS6B_NOTESICNTAB").setTooltip(this.resourceBundle.getText("LR_NOTE"));
		this.getView().byId("LRS6B_ATTACH_ICNTAB").setTooltip(this.resourceBundle.getText("LR_ATTACHMENTS"));
		this.getView().byId("LRS6B_ADDN_ICNTAB").setTooltip(this.resourceBundle.getText("LR_INFO"));
	},

	_handleRouteMatched: function(oEvent) {
		if (oEvent.getParameter("name") === "detail") {
			var contextPathJSON = JSON.parse(oEvent.getParameter("arguments").contextPath);
			if (contextPathJSON.FromChangeView === false) {

				var _this = this;
				var contextPath = "/LeaveRequestCollection(EmployeeID='" + contextPathJSON.EmployeeID + "',RequestID='" + contextPathJSON.RequestID +
					"',ChangeStateID=" + contextPathJSON.ChangeStateID + ",LeaveKey='" + encodeURIComponent(contextPathJSON.LeaveKey) + "')";
				this.oView.bindElement(contextPath);

				var curntLeaveRequest = this.oView.getBindingContext().oModel.getObject(contextPath);

				_this.currntObj = curntLeaveRequest;
				hcm.myleaverequest.utils.DataManager.setCachedModelObjProp("ConsolidatedLeaveRequests", [_this.currntObj]);

				var cntrlObjectHeader = _this.byId("LRS6B_HEADER");
				var cntrlNotesTab = _this.byId("LRS6B_ICNTABBAR");

				var lblOrigDate = _this.byId("LRS6B_LBL_ORIGINAL_DATE");
				var hdrStartDate = _this.byId("LRS6B_HEADER_START_DATE");
				var hdrEndDate = _this.byId("LRS6B_HEADER_END_DATE");
				var lblChngedDate = _this.byId("LRS6B_LBL_CHANGED_DATE");
				var hdrNewStartDate = _this.byId("LRS6B_NEW_HEADER_START_DATE");
				var hdrNewEndDate = _this.byId("LRS6B_NEW_HEADER_END_DATE");
				var hdrStatus = _this.byId("LRS6B_HEADER_STATUS");
				var hdrStatus2 = _this.byId("LRS6B_HEADER_STATUS2");
				if (_this.currntObj.Notes === "") {
					cntrlNotesTab.setVisible(false);
				} else {
					cntrlNotesTab.setVisible(true);
				}
				cntrlObjectHeader.setTitle(curntLeaveRequest.AbsenceTypeName);
				cntrlObjectHeader.setNumber(hcm.myleaverequest.utils.Formatters.DURATION(this.currntObj.WorkingDaysDuration, this.currntObj.WorkingHoursDuration));
				cntrlObjectHeader.setNumberUnit(hcm.myleaverequest.utils.Formatters.DURATION_UNIT(this.currntObj.WorkingDaysDuration, this.currntObj
					.WorkingHoursDuration));

				lblOrigDate.setVisible(hcm.myleaverequest.utils.Formatters.SET_RELATED_VISIBILITY(curntLeaveRequest.aRelatedRequests));
				hdrStartDate.setText(hcm.myleaverequest.utils.Formatters.DATE_ODATA_EEEdMMMyyyyLong(curntLeaveRequest.StartDate));
				hdrEndDate.setText(hcm.myleaverequest.utils.Formatters.FORMAT_ENDDATE_LONG(_this.resourceBundle.getText("LR_HYPHEN"),
					curntLeaveRequest.WorkingDaysDuration, curntLeaveRequest.StartTime, curntLeaveRequest.EndDate, curntLeaveRequest.EndTime));
				lblChngedDate.setVisible(hcm.myleaverequest.utils.Formatters.SET_RELATED_VISIBILITY(curntLeaveRequest.aRelatedRequests));
				hdrNewStartDate.setVisible(hcm.myleaverequest.utils.Formatters.SET_RELATED_START_DATE_VISIBILITY(curntLeaveRequest.aRelatedRequests));
				hdrNewStartDate.setText(hcm.myleaverequest.utils.Formatters.FORMAT_RELATED_START_DATE_LONG(curntLeaveRequest.aRelatedRequests));
				hdrNewEndDate.setVisible(hcm.myleaverequest.utils.Formatters.SET_RELATED_END_DATE_VISIBILITY(curntLeaveRequest.aRelatedRequests));
				hdrNewEndDate.setText(hcm.myleaverequest.utils.Formatters.FORMAT_RELATED_END_DATE_LONG(_this.resourceBundle.getText("LR_HYPHEN"),
					curntLeaveRequest.aRelatedRequests));
				hdrStatus.setText(curntLeaveRequest.StatusName);
				hdrStatus.setState(hcm.myleaverequest.utils.Formatters.State(curntLeaveRequest.StatusCode));
				hdrStatus2.setText(hcm.myleaverequest.utils.Formatters.FORMATTER_INTRO(curntLeaveRequest.aRelatedRequests));
				hdrStatus2.setState("Error");
				_this.byId("LRS6B_NOTESICNTAB").setVisible(false);
				_this.byId("S6B_NOTES_LIST").destroyItems();
				_this.byId("LRS6B_ATTACH_ICNTAB").setVisible(false);
				_this.byId("S6B_FILE_LIST").destroyItems();
				if (curntLeaveRequest.Notes) {
					var oDataNotes = hcm.myleaverequest.utils.Formatters._parseNotes(curntLeaveRequest.Notes);
					if (oDataNotes.NotesCollection) {
						_this.byId("LRS6B_NOTESICNTAB").setVisible(true);
						_this.byId("LRS6B_ICNTABBAR").setVisible(true);
						_this.byId("LRS6B_NOTESICNTAB").setCount(oDataNotes.NotesCollection.length);
						var oNotesModel = new sap.ui.model.json.JSONModel(oDataNotes);
						_this.byId("S6B_NOTES_LIST").setModel(oNotesModel, "notes");
					} else {
						_this.byId("LRS6B_NOTESICNTAB").setVisible(false);
						_this.byId("LRS6B_ICNTABBAR").setVisible(false);
					}
				}
				if (curntLeaveRequest.AttachmentDetails) {
					var oDataFiles = hcm.myleaverequest.utils.Formatters._parseAttachments(curntLeaveRequest.AttachmentDetails, curntLeaveRequest.RequestID,
						_this.oDataModel);
					if (oDataFiles.AttachmentsCollection) {
						_this.byId("LRS6B_ATTACH_ICNTAB").setCount(oDataFiles.AttachmentsCollection.length);
						_this.byId("LRS6B_ATTACH_ICNTAB").setVisible(true);
						_this.byId("LRS6B_ICNTABBAR").setVisible(true);
						var attachmentsModel = new sap.ui.model.json.JSONModel(oDataFiles);
						_this.byId("S6B_FILE_LIST").setModel(attachmentsModel, "files");
					} else {
						_this.byId("LRS6B_ATTACH_ICNTAB").setVisible(false);
					}
				}
				var combinedPromise = $.when(hcm.myleaverequest.utils.DataManager.getAbsenceTypeCollection());
				combinedPromise.done(function(leaveTypeColl) {
					_this.handleAdditionalFields(curntLeaveRequest, leaveTypeColl);
				});
				_this.byId("LRS6B_ICNTABBAR").rerender();
				_this._initState();
			}
		}
	},
	onChange: function() {
		var reqId = this.currntObj.RequestID;
		hcm.myleaverequest.utils.UIHelper.setIsChangeAction(true);
		if (reqId === "") {
			reqId = this.currntObj.LeaveKey;
		}
		if (reqId !== "") {
			this.oRouter.navTo("change", {
				requestID: reqId
			});
		} else {
			jQuery.sap.log.warning("curntLeaveRequest is null", "_handleRouteMatched", "hcm.myleaverequest.view.S6B");
		}
	}
});