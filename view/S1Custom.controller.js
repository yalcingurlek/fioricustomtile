/*global hcm window*/
jQuery.sap.require("sap.ca.scfld.md.controller.BaseFullscreenController");
jQuery.sap.require("hcm.myleaverequest.utils.Formatters");
jQuery.sap.require("hcm.myleaverequest.utils.UIHelper");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("hcm.myleaverequest.utils.DataManager");
jQuery.sap.require("hcm.myleaverequest.utils.ConcurrentEmployment");
jQuery.sap.require("hcm.myleaverequest.utils.CalendarTools");
jQuery.sap.require("sap.ca.ui.dialog.factory");
jQuery.sap.require("sap.ca.ui.dialog.Dialog");
jQuery.sap.require("sap.m.MessageToast");
jQuery.support.useFlexBoxPolyfill = false;
jQuery.sap.require("sap.ca.ui.model.format.FileSizeFormat");
jQuery.sap.require("sap.ca.ui.message.message");
jQuery.sap.require("sap.ui.thirdparty.sinon");
sap.ui.controller("hcm.myleaverequest.HCM_LRQ_CREExtension.view.S1Custom", {

	onInit: function () {

		// FIX: arabic grid formatting
		this.getView().byId("LRS4_TXT_BOOKEDDAYS").getParent().setHSpacing(0);

		//i307878 - overriding standard InputBase method UI Control, in order to solve bug in SAUI5 release 1.28.26 related to error message
		//displayed on attachment input field that displays text "invalid entry" even though user has selected a valid file
		sap.m.InputBase.prototype.closeValueStateMessage = function () {
			if (this._popup) {
				this._popup.close();
			}
		};
	},
	_leaveTypeDependantSettings: function (l) {
		var c = l;
		var C;

		var lblNote = this.byId("LRS4_LBL_NOTE");
		if (l.AbsenceTypeCode === "0700" || l.AbsenceTypeCode === "0710" || l.AbsenceTypeCode === "0720") {
			l.AllowedDurationMultipleDayInd = true;
		}

		this.sLeaveType = l;

		if (l && l.AllowedDurationPartialDayInd) {
			if (this.timeInputElem && this.byId("LRS4_FELEM_ABSENCE") && c) {
				this.timeInputElem.setVisible(c.RecordInClockTimesAllowedInd);

				this.byId("LRS4_FELEM_ABSENCE").setVisible(c.RecordInClockHoursAllowedInd);

			}
		} else {
			if (this.timeInputElem && this.byId("LRS4_FELEM_ABSENCE")) {
				this.timeInputElem.setVisible(false);
				this.byId("LRS4_FELEM_ABSENCE").setVisible(false);
			}
		}
		if (l) {
			//i307878-check if the note field should be visible and required. If yes, put the field label as required
			this.note.setValueState("None");
			if (l.NoteVisibleInd && l.NoteMandatory) {
				lblNote.setRequired(true);
			} else {
				lblNote.setRequired(false);
			}
			//i307878-check if the attachment is required. If yes, change the placeholder text accordingly
			var oHelper = hcm.myleaverequest.utils.UIHelper.getControllerInstance();
			if (l.AttachmentMandatory) {
				this.byId("fileUploader").setPlaceholder(oHelper.resourceBundle.getText("LR_ATTACHMENT_MAND"));
			} else {
				this.byId("fileUploader").setPlaceholder(oHelper.resourceBundle.getText("LR_ATTACHMENT"));
			}
			this.byId("LR_FELEM_APPROVER").setVisible(l.ApproverVisibleInd);
			this.byId("LRS4_APPROVER_NAME").setEnabled(!l.ApproverReadOnlyInd);
			if (this.changeMode && this.oChangeModeData.ApproverEmployeeID) {
				C = new sap.ui.core.CustomData({
					"key": "ApproverEmployeeID",
					"value": this.oChangeModeData.ApproverEmployeeID
				});
				this.byId("LRS4_APPROVER_NAME").setValue(this.oChangeModeData.ApproverEmployeeName);
			} else {
				var a = l.ApproverPernr !== "" ? l.ApproverName : c.MultipleApprovers.results[0].Pernr;
				var b = l.ApproverName !== "" ? l.ApproverPernr : c.MultipleApprovers.results[0].Name;
				C = new sap.ui.core.CustomData({
					"key": "ApproverEmployeeID",
					"value": a
				});
				this.byId("LRS4_APPROVER_NAME").setValue(b);
			}
			this.byId("LRS4_APPROVER_NAME").removeAllCustomData();
			this.byId("LRS4_APPROVER_NAME").addCustomData(C);
			this.byId("LRS4_FELEM_NOTE").setVisible(l.NoteVisibleInd);
			this.byId("LRS4_FELEM_FILEATTACHMENTS").setVisible(l.AttachmentEnabled);
			this.timeFrom.setValue("");
			this.timeTo.setValue("");
			this.byId("LRS4_ABS_HOURS").setValue("");
			this.note.setValue("");
			this.byId("fileUploader").setValue("");

			//i307878 - check if the selected leave type is sick leave (code 0110) or exceptional leave (0160). If yes, hide the remaining days area
			if (l.AbsenceTypeCode == '0110' || l.AbsenceTypeCode == '0160') {
				this.getView().byId("LRS4_TXT_REMAININGDAY").setVisible(false);
			} else {
				this.getView().byId("LRS4_TXT_REMAININGDAY").setVisible(true);
			}

			//Exam Leave add check box and not send without click
			if (l.AbsenceTypeCode === "0170") {
				this.getView().byId("LRS4_FELEM_Checkbox").setVisible(true);
			} else {
				this.getView().byId("LRS4_FELEM_Checkbox").setVisible(false);
			}
		}

		//i307878-force hidding absence hours field
		this.byId("LRS4_FELEM_ABSENCE").setVisible(false);

		var A = new sap.ui.model.json.JSONModel();
		var g = this.byId("LRS4_FR_ADDN_FIELDS_GRID");
		g.destroyContent();
		if (l.AdditionalFields && l.AdditionalFields.results.length > 0) {
			A.setData(l.AdditionalFields.results);
			g.setModel(A);
			var v = new sap.ui.layout.VerticalLayout({
				width: "100%",
				content: [
					new sap.m.Label({
						width: "100%",
						text: "{FieldLabel}",
						layoutData: new sap.ui.layout.ResponsiveFlowLayoutData({
							linebreak: true,
							baseSize: "100%"
						}),
						required: "{path:'Required',formatter:'hcm.myleaverequest.utils.Formatters.isRequired'}"
					}),
					new sap.m.Input({
						width: "100%",
						layoutData: new sap.ui.layout.ResponsiveFlowLayoutData({
							linebreak: true,
							baseSize: "100%"
						}),
						customData: new sap.ui.core.CustomData({
							"key": "FieldName",
							"value": "{Fieldname}"
						})
					})
				]
			});
			g.bindAggregation("content", "/", v);
		} else {
			g.removeAllContent();
			g.destroyContent();
		}
		try {
			if (l.MultipleApproverFlag === false) {
				if (l.AddDelApprovers && this.byId("LR_APPROVER").getContent()[1].getItems().length < 2) {
					var B = new sap.m.Button({
						icon: "sap-icon://add",
						width: "38px",
						customData: new sap.ui.core.CustomData({
							"key": "Level",
							"value": 1
						}),
						enabled: l.AddDelApprovers,
						press: this.handleAdd,
						layoutData: new sap.m.FlexItemData({
							growFactor: 1
						})
					});
					this.byId("LR_APPROVER").getContent()[1].insertItem(B, 1);
					this.byId("LR_APPROVER").getContent()[1].rerender();
				}
				this.byId("LRS4_FR_MUL_APP_GRID").removeAllContent();
				var L = 2,
					j;
				if (this.changeMode) {
					if (this.oChangeModeData.MultipleApprovers.results.length > 0) {
						for (j = 1; this.oChangeModeData.MultipleApprovers.results && j < this.oChangeModeData.MultipleApprovers.results.length; j++) {
							this._addContentToGrid(L++, this.oChangeModeData.MultipleApprovers.results[j], false);
						}
					} else {
						this.byId("LRS4_FR_MUL_APP_GRID").removeAllContent();
					}
				} else {
					if (l.MultipleApprovers.results.length > 0) {
						for (j = 1; l.MultipleApprovers && j < l.MultipleApprovers.results.length; j++) {
							this._addContentToGrid(L++, l.MultipleApprovers.results[j], false);
						}
					} else {
						this.byId("LRS4_FR_MUL_APP_GRID").removeAllContent();
					}
				}
			}
		} catch (e) {
			jQuery.sap.log.warning("falied to process Multiple Approvers" + e.message, "_leaveTypeDependantSettings",
				"hcm.myleaverequest.view.S1");
		}
	},
	//i307878 - add the check on the note field
	onSendClick: function () {
		if (this._checkNoteMandatory("sendButton") && this.checkAttachmentMandatory("sendButton")) {
			if (this.sLeaveType.AbsenceTypeCode === "0170") {
				var check = this.byId("examCheck").getSelected();
				if (check === true) {
					this.submit(true);
					this.byId("examCheck").setValueState("None");
				} else {
					this.byId("examCheck").setValueState("Error");
				}
			} else {
				this.submit(true);
			}
		}
	},
	//i307878 - overriding check attachment mandatory
	checkAttachmentMandatory: function (origin) {
		var _this = hcm.myleaverequest.utils.UIHelper.getControllerInstance();
		if (_this.leaveType.AttachmentMandatory && _this.byId("fileUploader").getValue() === "" && _this.byId("fileupload").aItems.length ===
			0) {
			_this.byId("fileUploader").setValueState("Error");
			_this.byId("fileUploader").focus();
			if (origin === "sendButton") {
				return false;
			}
		} else {
			_this.byId("fileUploader").setValueState("None");

			if (origin === "sendButton") {
				return true;
			}
		}
	},

	//i307878 - afuntion added to check if the note field contains a value
	_checkNoteMandatory: function (o) {
		var result = true;
		var lblNote = this.byId("LRS4_LBL_NOTE");
		var c = hcm.myleaverequest.utils.UIHelper.getControllerInstance();
		//check if note field label is set as required. If yes, check is a value is provided
		if (lblNote.getRequired()) {
			var sNoteVal = this.note.getValue();
			sNoteVal = sNoteVal.trim();
			if (sNoteVal === "") {
				this.note.setValueState("Error");
				this.note.setValueStateText(c.resourceBundle.getText("LRS4_TXA_NOTE_MANDATORY"));
				this.note.focus();
				if (o === "sendButton") {
					result = false;
				}
			} else {
				this.note.setValueState("None");
				this.note.setValueStateText("");
				if (o === "sendButton") {
					result = true;
				}
			}
		} else {
			result = true;
		}

		return result;

	},

	extHookOnSubmitLRCsuccess: function (oResult, oMsgHeader) {
		//Navigate to history if LR was changed
		if (this.changeMode && !this.bSimulation) {
			var contextPath = {
				EmployeeID: oResult.EmployeeID,
				RequestID: oResult.RequestID,
				ChangeStateID: oResult.ChangeStateID,
				LeaveKey: oResult.LeaveKey,
				FromChangeView: true
			};
			this.oRouter.navTo("detail", {
				from: "change",
				contextPath: JSON.stringify(contextPath)
			}, false);
		}
		return {
			oResult: oResult,
			oMsgHeader: oMsgHeader
		};
	},
	uploadFileAttachments: function (successCallback, objResponseData, objMsg) {
		var _this = hcm.myleaverequest.utils.UIHelper.getControllerInstance();
		_this.objectResponse = objResponseData;
		var oFileUploader = _this.byId("fileUploader");
		_this.ResponseMessage = objMsg;
		if (!_this.bSimulation && _this.leaveType.AttachmentEnabled && oFileUploader.getValue()) {
			var oUrl = "/LeaveRequestCollection(EmployeeID='',RequestID='" + objResponseData.RequestID +
				"',ChangeStateID=1,LeaveKey='')/Attachments";
			oUrl = _this.oDataModel.sServiceUrl + oUrl; //appending application service URL (shouldn't e hardcoded)
			oFileUploader.setUploadUrl(oUrl);
			oFileUploader.removeAllHeaderParameters();
			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "slug",
				value: encodeURIComponent(oFileUploader.getValue()) //file name encoded FA 2419918 FA 2539036
			}));
			oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "x-csrf-token",
				value: _this.oDataModel.getSecurityToken()
			}));
			oFileUploader.setSendXHR(true);
			if (oFileUploader.getValue()) {
				oFileUploader.upload();
			}
		} else {
			_this.onSubmitLRCsuccess(_this.objectResponse, _this.ResponseMessage);
		}
		// FA 2387125<<
		// var oUploadCollection = _this.byId("fileupload");
		// var cFiles = oUploadCollection.getItems().length;
		// if (cFiles > 0) {
		//  oUploadCollection.setUploadUrl(oUrl);
		//  oUploadCollection.upload();
		// }
		// FA 2387125>>
	},
	extHookTapOnDate: function () {
		// Place your hook implementation code here 
		if (this.leaveType.AbsenceTypeCode === "0700" || this.leaveType.AbsenceTypeCode === "0710" || this.leaveType.AbsenceTypeCode ===
			"0720") {
			this.timeFrom.setEnabled(true);
			this.timeTo.setEnabled(true);
			this.byId("LRS4_ABS_HOURS").setEnabled(true);
		}
	},
	extHookCallDialog: function (__oConfirmationDialog) {
		// Place your hook implementation code here 
		if (this.leaveType.AbsenceTypeCode === "0700" || this.leaveType.AbsenceTypeCode === "0710" || this.leaveType.AbsenceTypeCode ===
			"0720") {
			if (this.cale.getSelectedDates().length > 1) {
				var s = this.cale.getSelectedDates();
				var weekend = 0;
				  for (var num = 0 ;num < s.length ;num++) {				
					if (s[num].includes("Fri") || s[num].includes("Sat")) {
					  weekend = weekend + 1;
					}
				  }
				
				var startendDate = this._getStartEndDate(this.cale.getSelectedDates());
				var startDate = hcm.myleaverequest.utils.Formatters.DATE_YYYYMMdd(startendDate.startDate);
				var endDate = hcm.myleaverequest.utils.Formatters.DATE_YYYYMMdd(startendDate.endDate);
				__oConfirmationDialog.getContent()[1].mAggregations.formContainers[0].mAggregations.formElements[1].mAggregations.fields[0].setText(
					startDate);
				__oConfirmationDialog.getContent()[1].mAggregations.formContainers[0].mAggregations.formElements[2].mAggregations.fields[0].setText(
					endDate);
				var beginTime = this.timeFrom.getValue()
				var endTime = this.timeTo.getValue()
				var hours = this.parseTime(beginTime, endTime, this.cale.getSelectedDates().length - weekend) + " " + this.resourceBundle.getText("LR_LOWERCASE_HOURS");
				__oConfirmationDialog.getContent()[1].mAggregations.formContainers[0].mAggregations.formElements[3].mAggregations.fields[0].setText(
					hours);
			}
		}
		return __oConfirmationDialog;
	},
	parseTime: function (beginDate, endDate, length) {
		var begin = beginDate.split(':');
		var beginTotal = parseInt(begin[0]) * 60 + parseInt(begin[1]);

		var end = endDate.split(':');
		var endTotal = parseInt(end[0]) * 60 + parseInt(end[1]);

		var submit = (endTotal - beginTotal) * length;
		var perc = Math.floor(100 * ((submit % 60)/60)) ;
		if(perc < 10){
			perc = '0' + perc;
		}

		return Math.floor(submit / 60) + "." + perc;

	}

});