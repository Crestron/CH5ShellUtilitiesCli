// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.
/* jslint es6 */
/* global CrComLib, translateModule, serviceModule, utilsModule, templatePageModule */

const templateLogsModule = (() => {
	"use strict";

	// BEGIN::CHANGEAREA - your javascript for page module code goes here         

	const LOG_SCROLL_INCREMENT_COUNTER = 200;
	let DEVICE_ID = "";
	let APP_VERSION = "";
	let CRCOMLIB_VERSION = "";
	let currentScrollIndex = 0;
	let fullLogs = [];
	let filteredLogs = [];
	let pushMessageLastIndex = -1;
	let socketConnectionOpen = false;
	let socket = null;
	let loadLogsDynamically = false;

	const parentList = `
        <ul id="myUL">
          <li><span class="caret" onclick="templateLogsModule.toggleJsonObject(this);">{title}</span>
          	<ul class="nested">
            	{nestedList}
          	</ul>
          </li>
        </ul>
        `;

	/**
	 * private method for page class initialization
	 */
	let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:template-logs-import-page', (value) => {
		if (value['loaded']) {
			setTimeout(() => {
				onInit();
				document.getElementById('loggerViewModalDialog').addEventListener('beforeShow', function (e) {
					// console.log('modal beforeShow event: ', e);
					DEVICE_ID = console.getDeviceDetails().deviceId;
					// const logLevels = Object.values(console.LOG_LEVELS);
					// for (let i = 0; i < logLevels.length; i++) {
					// 	// console.log("logLevels", logLevels[i]);
					// 	if (logLevels[i].icon && logLevels[i].icon !== "") {
					// 		document.getElementById("ch5ListLogsSelectedTypeOptionRowIcon_" + i).setAttribute("class", "logicon " + logLevels[i].icon);
					// 		document.getElementById("ch5ListLogsSelectedTypeOptionRowIcon_" + i).style.color = logLevels[i].color.browser;
					// 	}
					// 	document.getElementById("ch5ListLogsSelectedTypeOption_" + i).setAttribute("value", logLevels[i].type);
					// 	document.getElementById("ch5ListLogsSelectedTypeOptionLabel_" + i).innerHTML = logLevels[i].type;
					// }
					document.getElementById('loggerViewModalDialog').setAttribute('title', 'View Logs (Panel Id: ' + DEVICE_ID + ')');
					// document.getElementById("logDisplayDeviceUniqueId").innerHTML = DEVICE_ID;

					getLoggerElement().addEventListener('scroll', populate);

					showLogs();
				});

				setTimeout(() => {
					CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:template-logs-import-page', loadedSubId);
					loadedSubId = '';
				});
			}, 1000);
		}
	});

	/**
	 * 
	 */
	function showLogs() {
		if (loadLogsDynamically === false) {
			reload();
			loadLogsDynamically = true;
		}
	}

	/**
	 * 
	 * @param {*} id 
	 */
	function toggleJsonObject(id) {
		id.parentElement.querySelector(".nested").classList.toggle("active");
		id.classList.toggle("caret-down");
	}

	/**
	 * 
	 */
	function clearLogs() {
		console.clearLogs();
		currentScrollIndex = 0;
		loadContent();
	}

	/**
	 * 
	 */
	function loadContent() {
		const logs = console.getFullLogs();
		fullLogs = logs;
		filteredLogs = logs; //JSON.parse(JSON.stringify(logs));
		filterLogs();
	}

	/**
	 * 
	 */
	function reload() {
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


	function generateOTP() {
		// Declare a digits variable which stores all digits 
		const digits = '0123456789';
		let OTP = '';
		for (let i = 0; i < 6; i++) {
			OTP += digits[Math.floor(Math.random() * 10)];
		}
		return OTP;
	}

	function isValidURL(inputStr = '') {
		const input = inputStr.toLowerCase();
		let isValidURLEntry = false;
		if ((input !== "")) {
			const colonCount = (input.match(/:/g) === null) ? 0 : input.match(/:/g).length; // storing colon count if its valid
			let ipExp = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
			let hostExp = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;
			let httpCheck = (input.indexOf('http://') > -1 || input.indexOf('https://') > -1);
			let checkPortNo = ((colonCount === 0 && !httpCheck) || (colonCount === 1 && httpCheck));
			let dataArr = input.split(':');
			let valueToTestEntry = (httpCheck) ? dataArr[1] : dataArr[0];
			valueToTestEntry = valueToTestEntry.replace(/\//g, '');
			// if a valid count of colon is found, check for valid port number
			if (colonCount == 1 || colonCount == 2) {
				if ((httpCheck && colonCount == 2) ||
					(!httpCheck && colonCount == 1)) {
					let portNo = parseInt(dataArr[dataArr.length - 1]);
					// check if port number is a valid number and lies between 1025 and 65335
					checkPortNo = (!isNaN(portNo) && portNo > 1024 && portNo < 65536);
				}
			}
			isValidURLEntry = (
				checkPortNo &&
				valueToTestEntry !== null &&
				valueToTestEntry !== undefined &&
				valueToTestEntry !== "0.0.0.0" &&
				valueToTestEntry !== "255.255.255.255" &&
				valueToTestEntry.length <= 127 &&
				(ipExp.test(valueToTestEntry) || hostExp.test(valueToTestEntry))
			)
		}
		return isValidURLEntry;
	}

	/**
	 * 
	 */
	function postLogs() {
		const ipAddress = document.getElementById("ipAddressToPost").value;
		if (isValidURL(ipAddress)) {
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
									screenshotId: generateOTP(),
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
        <div class="each-list-item log_{logtype}">
            <span class="log-indicator" style='background-color: {color}'></span>
            <div class="d-flex justify-content-start align-items-center">
							<div class="logiconholder text-center">
								<i style="color:{color}" class="logicon {icon}"></i>
							</div>
							<div class="text-left w-100 logmessagetext">
								{message}
							</div>
            </div>
        </div>
        `;
		const itemIndex = item["index"];

		let returnVal = replaceAll(output, "{logtype}", item['logLevel'].type);
		returnVal = replaceAll(returnVal, "{icon}", item['logLevel'].icon);
		returnVal = replaceAll(returnVal, "{color}", item.logLevel.color.browser);
		returnVal = replaceAll(returnVal, "{message}", itemIndex + ") "
			+ item["date"] + ": " + evaluateValue(item["value"], itemIndex));
		return returnVal;
	}

	function replaceAll(str, find, replace) {
		if (str && String(str).trim() !== "") {
			return String(str).split(find).join(replace);
		} else {
			return str;
		}
	}

	/**
	 * 
	 * @param {*} item 
	 */
	function setNewLog(item) {
		// if (loadLogsDynamically === true) {
		fullLogs.push(item);
		filteredLogs.push(item);
		filterLogs();
		// }
	}

	/**
	 * 
	 * @param {*} value 
	 */
	function evaluateValue(value, itemIndex) {
		let output = "";
		for (let i = 0; i < value.length; i++) {
			if (Array.isArray(value[i]) || isObject(value[i])) {
				//output += processInput(value[i], "");
				output += '<div class="log-item-object" data-input-index=' + itemIndex +
					' onclick="templateLogsModule.processAndRenderObject(this)">View Object</div>';
			} else {
				output += value[i] + " ";
			}
		}
		return output;
	}

	function processAndRenderObject(object) {
		const logIndex = parseInt(object.getAttribute('data-input-index')) - 1;
		if (logIndex >= 0) {
			let value = console.getFullLogs()[logIndex].value;
			let output = "";
			for (let i = 0; i < value.length; i++) {
				if (Array.isArray(value[i]) || isObject(value[i])) {
					output += processInput(value[i], "");
				} else {
					output += value[i] + " ";
				}
			}
			object.innerHTML = output;
			object.removeAttribute('onclick');
			object.classList.add('smoke');
		}
	}

	/**
	 * 
	 */
	function filterLogs() {
		setTimeout(() => {
			if (loadLogsDynamically === true) {
				const input = ""; //document.getElementById("logFilter").value;
				const selectedLogTypes = [];
				const logLevels = Object.values(console.LOG_LEVELS);
				// for (let i = 0; i < logLevels.length; i++) {
				// 	// let selectedTypeOption = document.getElementById("ch5ListLogsSelectedTypeOption_" + i);
				// 	// if (selectedTypeOption.checked === true) {
				// 		// selectedLogTypes.push(selectedTypeOption.value);
				// 	// }
				// }
				filteredLogs = fullLogs.filter((tempObj) => {
					return (tempObj.mergedValue.toLowerCase().indexOf(input.trim().toLowerCase()) !== -1);
				});
				currentScrollIndex = 0;

				let objDiv = getLoggerElement();
				objDiv.innerHTML = formatLogs();

				// const logTypeCountObj = console.getLogTypeCountDetails();
				// for (let i = 0; i < logLevels.length; i++) {
				// 	document.getElementById("ch5ListLogsSelectedTypeOptionLabel_" + i).innerHTML = logLevels[i].type + " (<b>" +
				// 		logTypeCountObj[logLevels[i].type] + "</b>)";
				// }

				// document.getElementById("logDisplayNoOfLogs").innerHTML = fullLogs.length;
				setTimeout(() => {
					objDiv.scrollTop = objDiv.scrollHeight;
				}, 500);
			}
			synchronize();
		}, 100);
	}

	/**
		 * 
	 */
	function populate() {
		const scrollTop = getLoggerElement().scrollTop;
		if (scrollTop < 100 && loadLogsDynamically) {
			currentScrollIndex += 1;
			if (filteredLogs.length - ((currentScrollIndex + 1) * LOG_SCROLL_INCREMENT_COUNTER) >= 0) {
				getLoggerElement().insertAdjacentHTML("afterbegin", formatLogs());
			}
		}
	}

	/**
	 * 
	 */
	function showDetails() {
		document.getElementById('overlayClassLogDisplayOpen').classList.add('is-open');
		document.getElementById('overlayClassLogDisplayClose').classList.add('is-open');
	}

	/**
	 * 
	 */
	function hideDetails() {
		document.getElementById('overlayClassLogDisplayOpen').classList.remove('is-open');
		document.getElementById('overlayClassLogDisplayClose').classList.remove('is-open');
	}

	/**
	 * 
	 */
	function onInit() {

	}

	/**
	 * 
	 */
	function closePopup() {
		getLoggerElement().innerHTML = '';
		loadLogsDynamically = false;
		navigationModule.closePopup(navigationModule.popupPages.logDisplayImportPage);
	}

	/**
	 * 
	 */
	function getLoggerElement() {
		return document.getElementById('divLogContent');
	}

	/**
	 * 
	 * @param {*} input 
	 * @param {*} index 
	 * @param {*} subTitle 
	 */
	function processInput(input, index, subTitle) {
		let z = "";
		let title = "";

		if (Array.isArray(input)) {
			if (subTitle) {
				title = (subTitle === "" ? "" : (subTitle + ": ")) + "[Array] (" + input.length + ")";
			} else {
				title = (index === "" ? "" : (index + ": ")) + "[Array] (" + input.length + ")";
			}

			if (input.length === 0) {
				z += "<li class='m-l-20'>[]</li>";
			} else {
				for (let i = 0; i < input.length; i++) {
					if (Array.isArray(input[i])) {
						z += processInput(input[i], i);
					} else if (isObject(input[i])) {
						z += processInput(input[i], i);
					} else {
						z += "<li class='m-l-20'>" + i + ": " + input[i] + "</li>";
					}
				}
			}
			let parentNewList = parentList;
			parentNewList = parentNewList.replace("{title}", title);
			parentNewList = parentNewList.replace("{nestedList}", z);
			return parentNewList;

		} else if (isObject(input)) {
			if (subTitle) {
				title = (subTitle === "" ? "" : (subTitle + ": ")) + "{Object}";
			} else {
				title = (index === "" ? "" : (index + ": ")) + "{Object}";
			}
			if (typeof input === 'object' && input !== null) {
				if (Object.keys(input).length === 0 && input.constructor === Object) {
					z += "<li class='m-l-20'>{}</li>";
				} else {

					for (let key in input) {
						if (typeof input[key] === 'object' && input[key] !== null) {
							z += processInput(input[key], "", key);
						} else {
							z += "<li class='m-l-20'>" + key + ": " + input[key] + "</li>";
						}
					}
				}
			}
			let parentNewList = parentList;
			parentNewList = parentNewList.replace("{title}", title);
			parentNewList = parentNewList.replace("{nestedList}", z);
			return parentNewList;
		} else {
			return input;
		}
	}

	/**
	 * 
	 * @param {*} val 
	 */
	function isObject(val) {
		if (val === null) {
			return false;
		}
		return ((typeof val === 'function') || (typeof val === 'object'));
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
		setNewLog,
		toggleJsonObject,
		showLogs,
		clearLogs,
		reload,
		captureScreenshot,
		postLogs,
		filterLogs,
		showDetails,
		hideDetails,
		closePopup,
		onLoggerTextboxOnFocus,
		onLoggerTextboxOnBlur,
		processAndRenderObject
	};

	// END::CHANGEAREA

})();