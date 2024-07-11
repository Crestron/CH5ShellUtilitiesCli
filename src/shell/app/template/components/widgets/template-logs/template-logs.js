const templateLogsModule = (() => {
	"use strict";

	//#region "Variables"

	const LOG_SCROLL_INCREMENT_COUNTER = 200;
	let DEVICE_ID = "";
	let APP_VERSION = "";
	let CRCOMLIB_VERSION = "";
	let currentScrollIndex = 0;
	let filteredLogs = [];
	let fullLogs = [];
	let pushMessageLastIndex = -1;
	let socketConnectionOpen = false;
	let socket = null;
	let logPageOpened = false;
	let logsLoaded = false;
	let subScriptionId = null;
	let selectedLogLevels = [];
	const subsciptionList = [];
	//#endregion

	//#region "Load Page"

	/**
	 * private method for page class initialization
	 */
	let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:template-logs-import-page', (value) => {
		if (value['loaded']) {
			onInit();

			document.getElementById('loggerViewModalDialog').addEventListener('beforeShow', function (e) {
				DEVICE_ID = console.getDeviceDetails().deviceId;

				if (selectedLogLevels.length === 0) {
					selectedLogLevels = JSON.parse(JSON.stringify(Object.values(console.LOG_LEVELS)));
					for (let i = 0; i < selectedLogLevels.length; i++) {
						selectedLogLevels[i].selected = true;
					}
				}

				let loadedSubpageRefId = CrComLib.subscribeState('o', 'ch5-subpage-reference-list', (valueSRL) => {
					if (valueSRL['loaded'] && valueSRL['id'] === 'srlLogTypes') {
						const logLevels = Object.values(console.LOG_LEVELS);
						// for (let i = 0; i < logLevels.length; i++) {
						// 	CrComLib.publishEvent('s', 'LogLevels.LogLevel[' + i + '].Icon', 'logicon ' + logLevels[i].icon);
						// 	CrComLib.publishEvent('s', 'LogLevels.LogLevel[' + i + '].Label', logLevels[i].type);
						// 	CrComLib.publishEvent('s', 'LogLevels.LogLevel[' + i + '].CustomStyle', "--ch5-button--default-font-color: " + logLevels[i].color.browser + "; --ch5-button--default-selected-font-color: " + logLevels[i].color.browser + "; --ch5-button--default-pressed-font-color: " + logLevels[i].color.browser + "; --ch5-button--default-selected-border-color: " + logLevels[i].color.browser);
						// }

						// const srlLogTypes = document.getElementById("srlLogTypes");
						// const ch5ButtonsInSrlLogTypes = srlLogTypes.getElementsByTagName("ch5-button");
						// for (let i = 0; i < ch5ButtonsInSrlLogTypes.length; i++) {
						for (let i = 0; i < logLevels.length; i++) {
							// ch5ButtonsInSrlLogTypes[i].setAttribute("data-custom-type-id", logLevels[i].type);
							//ch5ButtonsInSrlLogTypes[i].setAttribute("id", "ch5ButtonsInSrlLogTypes_" + logLevels[i].type);
							CrComLib.publishEvent('s', 'LogLevels.LogLevel[' + i + '].Icon', 'logicon ' + logLevels[i].icon);
							CrComLib.publishEvent('s', 'LogLevels.LogLevel[' + i + '].Label', logLevels[i].type);
							CrComLib.publishEvent('s', 'LogLevels.LogLevel[' + i + '].CustomStyle', "--ch5-button--default-font-color: " + logLevels[i].color.browser + "; --ch5-button--default-selected-font-color: " + logLevels[i].color.browser + "; --ch5-button--default-pressed-font-color: " + logLevels[i].color.browser + "; --ch5-button--default-selected-border-color: " + logLevels[i].color.browser);
						};

						logPageOpened = true;
						getLoggerElement().addEventListener('scroll', populate);
						loadContent();
						setTimeout(() => {
							logsLoaded = true;
							getLoggerElement().classList.remove("ch5-hide-vis");
						}, 500);
						setTimeout(() => {
							CrComLib.unsubscribeState('o', 'ch5-subpage-reference-list', loadedSubpageRefId);
							loadedSubpageRefId = '';
						});
					}
				});


				for (let i = 0; i < selectedLogLevels.length; i++) {
					// subsciptionList[0] = 
					CrComLib.subscribeState('b', 'LogLevels.LogLevel[' + i + '].Selected', (v) => {
						selectedLogLevels[i].selected = v;
						templateLogsModule.filterLogsWithDebounce();
					});

				}

				document.querySelector('.ch5-modal-dialog-header').innerHTML = 'View Logs <label class="lbl-title-logs">(Panel Id: ' + DEVICE_ID + ')<label>';

				subScriptionId = CrComLib.subscribeState('b', 'console-log-new', (v) => {
					loadContent();
					scrollToBottomOfLogs(true);
				});
			});

			document.getElementById('loggerViewModalDialog').addEventListener('beforeHide', function (e) {
				getLoggerElement().innerHTML = '';
				logPageOpened = false;
				logsLoaded = false;
				CrComLib.unsubscribeState('b', 'console-log-new', subScriptionId);
				// for (let i = 0; i < subsciptionList.length; i++) {
				// 	CrComLib.unsubscribeState('b', 'LogLevels.LogLevel[' + i + '].Selected', subScriptionId);
				// }
			});

			setTimeout(() => {
				CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:template-logs-import-page', loadedSubId);
				loadedSubId = '';
			});
		}
	});

	//#end region

	function loadContent() {
		fullLogs = console.getLogs();
		filteredLogs = console.getLogs();
		filterLogs();
	}

	function clearLogs() {
		console.clearLogs();
		currentScrollIndex = 0;
		loadContent();
	}

	function getPostingObject() {
		return {
			deviceId: DEVICE_ID,
			version: APP_VERSION,
			CrComLibVersion: CRCOMLIB_VERSION,
			logs: fullLogs.filter(tempObj => parseInt(tempObj.index) > parseInt(pushMessageLastIndex))
		};
	}

	/**
	 * 
	 */
	function synchronize() {
		if (socketConnectionOpen === true) {
			try {
				socket.emit('LOG_MESSAGE_FROM_PANEL', getPostingObject());
				if (fullLogs.length > 0) {
					pushMessageLastIndex = fullLogs[fullLogs.length - 1].index;
				}
			} catch (e) {
				document.getElementById('ipAddressToPost').removeAttribute("disabled");
				document.getElementById('logBtnPostMessages').removeAttribute("disabled");
			}
		}
	}

	function isAtBottom() {
		const element = getLoggerElement(); // Or any specific scrollable element
		return element.scrollTop + element.clientHeight >= element.scrollHeight;
	}

	/**
	 * 
	 */
	function postLogs() {
		const ipAddress = document.getElementById("ipAddressToPost").value;
		if (utilsModule.isValidURL(ipAddress)) {
			document.getElementById('ipAddressToPost').setAttribute("disabled", true);
			document.getElementById('logBtnPostMessages').setAttribute("disabled", true);

			const options = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(getPostingObject())
			};

			fetch(ipAddress, options).then((res) => {
				pushMessageLastIndex = fullLogs[fullLogs.length - 1].index;
				console.log(res);
				if (socketConnectionOpen === false) {
					socketConnectionOpen = true;
					socket = new io(ipAddress);
					socket.on('GET_SCREENSHOT_FROM_PANEL', (msg) => {
						console.log("GET_SCREENSHOT_FROM_PANEL", msg);
						console.log("GET_SCREENSHOT_FROM_PANEL - DEVICE_ID", DEVICE_ID);
						if (String(msg) === DEVICE_ID) {
							html2canvas(document.body).then((canvas) => {
								// document.body.appendChild(canvas);
								// console.log(canvas.toDataURL());
								const screenShot = {
									screenshotId: utilsModule.generateOTP(),
									panelId: DEVICE_ID,
									date: new Date(),
									now: (new Date()).getTime(),
									data: canvas.toDataURL('image/jpeg').replace('image/jpeg', 'image/octet-stream')
								}
								console.log("SCREENSHOT_CONTENT", screenShot);
								socket.emit('SCREENSHOT_CONTENT', screenShot);
							});
						}
					});
					//   }); 
				}
			}).catch((error) => {
				console.error(error);
				document.getElementById('ipAddressToPost').removeAttribute("disabled");
				document.getElementById('logBtnPostMessages').removeAttribute("disabled");
			});
		}
	}

	function formatLogs() {
		const paginatedLogs = filteredLogs.slice(
			Math.max(filteredLogs.length - ((currentScrollIndex + 1) * LOG_SCROLL_INCREMENT_COUNTER), 0),
			filteredLogs.length - ((currentScrollIndex) * LOG_SCROLL_INCREMENT_COUNTER));

		let values = paginatedLogs.map((item) => {
			return getNewLog(item);
		});
		return values.join("");
	}

	function getNewLog(item) {
		const output = `
			<div class="each-list-item log_{logtype}" style='border-left: solid 5px {color}'>
				<div class="d-flex justify-content-start">
					<div class="logiconholder">
						<i style="color:{color}" class="logicon {icon}"></i>
					</div>
					<div class="text-left w-100 logmessagetext">
						{message}
					</div>
				</div>
			</div>
			`;
		const itemIndex = item["index"];

		let returnVal = utilsModule.replaceAll(output, "{logtype}", item['logLevel'].type);
		returnVal = utilsModule.replaceAll(returnVal, "{icon}", item['logLevel'].icon);
		returnVal = utilsModule.replaceAll(returnVal, "{color}", item.logLevel.color.browser.toLowerCase());
		returnVal = utilsModule.replaceAll(returnVal, "{message}", (itemIndex + 1) + ") "
			+ item["date"] + ": " + evaluateValue(item["value"], itemIndex));
		return returnVal;
	}

	/**
	 * 
	 * @param {*} value 
	 */
	function evaluateValue(value, itemIndex) {
		try {
			let output = "";
			if (Array.isArray(value)) {
				for (let i = 0; i < value.length; i++) {
					if (Array.isArray(value[i])) {
						output += '<div class="log-item-object" data-input-index=' + itemIndex +
							' onclick="templateLogsModule.processAndRenderObject(this, ' + itemIndex + ', ' + i + ')">View Array</div>';
					} else if (utilsModule.isObject(value[i])) {
						output += '<div class="log-item-object" data-input-index=' + itemIndex +
							' onclick="templateLogsModule.processAndRenderObject(this, ' + itemIndex + ', ' + i + ')">View Object</div>';
					} else {
						output += value[i] + " ";
					}
				}
			} else if (utilsModule.isObject(value)) {
				output += '<div class="log-item-object" data-input-index=' + itemIndex +
					' onclick="templateLogsModule.processAndRenderObject(this, ' + itemIndex + ', -1)">View Object</div>';
			} else {
				output += value + " ";
			}
			return output;
		} catch (e) {
			return "$$: " + typeof value + " ," + ((value instanceof Function) + ", " + (value.constructor === Object));
		}
	}

	function processAndRenderObject(object, itemIndex, localIndex) {
		const value = console.getFullLogs()[itemIndex].value;
		if (value !== "" && value.length > 0) {
			if (localIndex !== -1) {
				createArrayObjectContainer(object, value[localIndex]);
			} else {
				createArrayObjectContainer(object, value);
			}
		}
	}

	const filterLogsWithDebounceMethod = utilsModule.debounce(() => {
		filterLogs();
	}, 500);

	function filterLogsWithDebounce() {
		filterLogsWithDebounceMethod();
	}
	/**
	 * 
	 */
	function filterLogs() {
		// setTimeout(() => {
		if (logPageOpened === true) {
			const input = (document.getElementById("logFilter") ? document.getElementById("logFilter").value : "").trim().toLowerCase();
			// const selectedLogLevels = [];
			const logLevels = Object.values(console.LOG_LEVELS);

			// const srlLogTypes = document.getElementById("srlLogTypes");
			// if (srlLogTypes) {
			// 	const ch5ButtonsInSrlLogTypes = srlLogTypes.getElementsByTagName("ch5-button");
			// 	if (ch5ButtonsInSrlLogTypes && ch5ButtonsInSrlLogTypes.length > 0) {
			// 		for (let i = 0; i < ch5ButtonsInSrlLogTypes.length; i++) {
			// 			if (ch5ButtonsInSrlLogTypes[i].getAttribute("selected") === "true") {
			// 				selectedLogLevels.push(ch5ButtonsInSrlLogTypes[i].getAttribute("data-custom-type-id"));
			// 			}
			// 		}
			// 	} else {
			// 		for (let i = 0; i < logLevels.length; i++) {
			// 			selectedLogLevels.push(logLevels[i].type);
			// 		}
			// 	}
			// } else {
			// 	for (let i = 0; i < logLevels.length; i++) {
			// 		selectedLogLevels.push(logLevels[i].type);
			// 	}
			// }
			// const srlLogTypes = document.querySelectorAll("#srlLogTypes > [data-custom-type-id]")
			// if (srlLogTypes.length > 0) {
			// 	Array.from(srlLogTypes).forEach(function (el) {
			// 		//  console.log(el.getAttribute("theChildsAttribute"))

			// 		for (let i = 0; i < logLevels.length; i++) {
			// 			const selectedTypeOption = srlLogTypes.getElementById("srlLogTypes");
			// 			if (selectedTypeOption) {
			// 				if (selectedTypeOption.getAttribute("selected") === "true") {
			// 					selectedLogLevels.push(logLevels[i].type);
			// 				}
			// 			} else {
			// 				// Used for hidden tab cases
			// 				selectedLogLevels.push(logLevels[i].type);
			// 			}
			// 		}
			// 	});
			// } else {
			// 	for (let i = 0; i < logLevels.length; i++) {
			// 		selectedLogLevels.push(logLevels[i].type);
			// 	}
			// }

			const selectedLevelsMap =  selectedLogLevels.filter((item) => item.selected).map((item) => item.type);
			filteredLogs = fullLogs.filter((tempObj) => {
				return ((tempObj.mergedValue.toLowerCase().indexOf(input) !== -1) && selectedLevelsMap.includes(tempObj.logLevel.type));
			});
			currentScrollIndex = 0;

			const objDiv = getLoggerElement();
			objDiv.innerHTML = formatLogs();

			const logTypeCountObj = console.getLogTypeCountDetails();
			for (let i = 0; i < logLevels.length; i++) {
				CrComLib.publishEvent('s', 'LogLevels.LogLevel[' + i + '].Label', logLevels[i].type + " (<b>" +
					logTypeCountObj[logLevels[i].type] + "</b>)");
			}

			// document.getElementById("logDisplayNoOfLogs").innerHTML = fullLogs.length;
			scrollToBottomOfLogs(false);
		}
		synchronize();
		// }, 100);
	}

	function scrollToBottomOfLogs(showToast) {
		if (isAtBottom() || logsLoaded === false) {
			scrollToBottomOnly();
		} else {
			if (showToast) {
				showToastMessage();
			}
		}
	}

	function scrollToBottomOnly() {
		setTimeout(() => {
			const objDiv = getLoggerElement();
			objDiv.scrollTop = objDiv.scrollHeight;
		}, 500);
	}
	function scrollToBottomAndClose() {
		scrollToBottomOnly();
		hideToastAsap();
	}
	/**
	 * 
	 */
	function populate() {
		const scrollTop = getLoggerElement().scrollTop;
		if (scrollTop < 100 && logPageOpened) {
			currentScrollIndex += 1;
			// if (filteredLogs.length - ((currentScrollIndex + 1) * LOG_SCROLL_INCREMENT_COUNTER) >= 0) {
			if (currentScrollIndex > console.getCurrentLogCounter() && console.getCurrentLogCounter() >= 0) {
				getLoggerElement().insertAdjacentHTML("afterbegin", formatLogs());
			}
		}
	}

	function showDetails() {
		document.getElementById('overlayClassLogDisplayOpen').classList.add('is-open');
		document.getElementById('overlayClassLogDisplayClose').classList.add('is-open');
	}

	function showToastMessage() {
		const templateToastMsgNewLog = document.getElementById("templateToastMsgNewLog");
		if (!templateToastMsgNewLog.classList.contains("show-toast")) {
			templateToastMsgNewLog.classList.add("show-toast");
		}
		hideToastMessage();
	}

	const hideToastMessage = utilsModule.debounce(() => {
		hideToastAsap();
	}, 3000);

	function hideToastAsap() {
		const templateToastMsgNewLog = document.getElementById("templateToastMsgNewLog");
		templateToastMsgNewLog.classList.remove("show-toast");
	}
	function hideDetails() {
		document.getElementById('overlayClassLogDisplayOpen').classList.remove('is-open');
		document.getElementById('overlayClassLogDisplayClose').classList.remove('is-open');
	}

	function getLoggerElement() {
		return document.getElementById('divLogContent');
	}

	function createArrayObjectContainer(obj, input) {
		const jsonData = input;
		obj.parentElement.insertAdjacentHTML("beforeend", "<pre class='logcontent'>" + JSON.stringify(jsonData, null, 2) + "</pre>");
		obj.remove();
	}

	/**
	 * Initialize Method
	 */
	function onInit() {
		serviceModule.addEmulatorScenario("./app/template/components/widgets/template-logs/template-logs-emulator.json");
	}

	/**
	 * Function to manage show/hide of content below fields when keyboard is up
	 */
	function onLoggerTextboxOnFocus() {
		// document.getElementById('log-display-page').classList.add('typing');
	}

	/**
	 * Function to manage show/hide of content below fields when keyboard is up
	 */
	function onLoggerTextboxOnBlur() {
		// document.getElementById('log-display-page').classList.remove('typing');
	}

	function captureScreenshot() {
		html2canvas(document.body).then(function (canvas) {
			// document.body.appendChild(canvas);
			console.log(canvas.toDataURL());
		});
	}

	/**
	 * All public method and properties are exported here
	 */
	return {
		scrollToBottomAndClose,
		clearLogs,
		captureScreenshot,
		postLogs,
		filterLogsWithDebounce,
		showDetails,
		loadContent,
		hideDetails,
		onLoggerTextboxOnFocus,
		onLoggerTextboxOnBlur,
		processAndRenderObject
	};

	// END::CHANGEAREA

})();
