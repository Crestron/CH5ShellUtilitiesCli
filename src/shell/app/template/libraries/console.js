// Copyright (C) 2020 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement 
// under which you licensed this source code.  
/* jslint es6 */

const console = (function (defaultConsole) {

	"use strict";

	let configurationData = {
		"allowLogging": true,
		"urls": {
			"ipAddress": "127.0.0.1",
			"uriProtocol": "http://",
			"portNumber": ":8008"
		},
		"logger": {
			"limit": 2500
		}
	};

	let allowLogging = false;
	let device = {
		deviceId: getUniqueID()
	};
	let logIndex = 0;
	let logs = [];
	let addColors = true;
	let colorType = "browser";
	let showLogIndex = true;
	let showDeviceId = true;
	let addDate = true;

	const logStyles = {
		Reset: "\x1b[0m",
		Bright: "\x1b[1m",
		Dim: "\x1b[2m",
		Underscore: "\x1b[4m",
		Blink: "\x1b[5m",
		Reverse: "\x1b[7m",
		Hidden: "\x1b[8m",
		SpaceChar: "%s"
	};

	const COLORS = {
		Black: {
			browser: "black",
			console: "\x1b[30m"
		},
		Red: {
			browser: "red",
			console: "\x1b[31m",
		},
		Green: {
			browser: "green",
			console: "\x1b[32m",
		},
		Amber: {
			browser: "orange",
			console: "\x1b[33m",
		},
		Blue: {
			browser: "blue",
			console: "\x1b[34m",
		},
		Magenta: {
			browser: "magenta",
			console: "\x1b[35m",
		},
		Cyan: {
			browser: "cyan",
			console: "\x1b[36m",
		},
		White: {
			browser: "white",
			console: "\x1b[37m"
		},
		Gray: {
			browser: "dimgray",
			console: "\x1b[37m"
		}
	};

	const logBgColors = {
		BgBlack: "\x1b[40m",
		BgRed: "\x1b[41m",
		BgGreen: "\x1b[42m",
		BgYellow: "\x1b[43m",
		BgBlue: "\x1b[44m",
		BgMagenta: "\x1b[45m",
		BgCyan: "\x1b[46m",
		BgWhite: "\x1b[47m"
	};

	const LOG_LEVELS = {
		TRACE: { type: 'trace', value: 1, color: COLORS.Black, icon: "fas fa-list-ul" },
		DEBUG: { type: 'debug', value: 2, color: COLORS.Blue, icon: "fas fa-bug" },
		LOG: { type: 'log', value: 4, color: COLORS.Gray, icon: "fas fa-user-circle" },
		INFO: { type: 'info', value: 6, color: COLORS.Green, icon: "fas fa-info-circle" },
		WARN: { type: 'warn', value: 9, color: COLORS.Amber, icon: "fas fa-exclamation-triangle" },
		ERROR: { type: 'error', value: 13, color: COLORS.Red, icon: "fas fa-times-circle" }
	};

	let logLevel = LOG_LEVELS.TRACE;
	let logLevelCountObj = {};
	logLevelCountObj[LOG_LEVELS.TRACE.type] = 0;
	logLevelCountObj[LOG_LEVELS.DEBUG.type] = 0;
	logLevelCountObj[LOG_LEVELS.LOG.type] = 0;
	logLevelCountObj[LOG_LEVELS.INFO.type] = 0;
	logLevelCountObj[LOG_LEVELS.WARN.type] = 0;
	logLevelCountObj[LOG_LEVELS.ERROR.type] = 0;

	/**
	 * Returns Urls
	 */
	function getUrls() {
		return configurationData.urls;
	}

	function getLoggerLimit() {
		return configurationData.logger.limit;
	}

	/**
	 * Returns icon based on iconName and iconType
	 * @param {*} iconName 
	 * @param {*} iconType 
	 */
	function getConfigIcon(iconName, iconType) {
		if (!iconName) {
			iconName = 'Swirl'; // defaulting to swirl if no icon name is present
		}
		return configurationData.iconMapping[iconName][iconType];
	}

	/**
	 * Sets the configuration data object.
	 * @param {*} resp 
	 */
	function setData(resp) {
		configurationData = resp;
	}

	/**
	 * Returns the configuration data object.
	 */
	function getData() {
		return configurationData;
	}

	/**
	 * Wrapper over console.log to allow controlling this based on config.
	 */
	function initialize() {
		allowLogging = false;		
		const configData = getData();
		if (configData) {
			allowLogging = configData.allowLogging;
		}
		CrComLib.publishEvent('b', 'logsbtn.show', true);
		// CrComLib.subscribeState('s', `console.log`, (v) => {
		//   // console.log("****");
		//   // avfUtility.log(`console.log: ${v}`);
		// });
	}

	function getUniqueID() {
		// Declare a digits variable which stores all digits 
		const digits = '0123456789';
		let OTP = '';
		for (let i = 0; i < 6; i++) {
			OTP += digits[Math.floor(Math.random() * 10)];
		}
		return OTP;
	}

	/**
	 * 
	 * @param {*} logLevelInput 
	 * @param  {...any} input 
	 */
	function internalLog(logLevelInput, ...input) {
		if (allowLogging === true && logLevel.value <= logLevelInput.value) {
			logIndex += 1;
			const outputLog = [];
			let outputString = "";
			const dateForLog = new Date().toISOString();

			if (showLogIndex === true) {
				outputString += "%c" + (logIndex) + ') ';
			}
			if (showDeviceId === true) {
				outputString += "%c" + device.deviceId + " - ";
			}
			if (addDate === true) {
				outputString += "%c" + dateForLog + ": ";
			}
			if (addColors === true) {
				if (colorType === "browser") {
					for (let i = 0; i < input.length; i++) {
						//outputString += "%c" + input[i] + " ";
						outputLog.push(input[i]);
					}
					// outputLog.push(outputString);

					// if (showLogIndex === true) {
					//   outputLog.push("color:" + logLevelInput.color.browser);
					// }
					// if (showDeviceId === true) {
					//   outputLog.push("color:" + logLevelInput.color.browser);
					// }
					// if (addDate === true) {
					//   outputLog.push("color:" + logLevelInput.color.browser);
					// }
					// for (let i = 0; i < input.length; i++) {
					//   outputLog.push("color:" + logLevelInput.color.browser);
					// }
					defaultConsole[logLevelInput.type](...outputLog);
				} else if (colorType === "console") {
					defaultConsole[logLevelInput.type](logLevelInput.color.console, ...input, logStyles.Reset);
				} else {
					defaultConsole[logLevelInput.type](...input);
				}
			} else {
				defaultConsole[logLevelInput.type](...input);
			}
			const newLog = { index: logIndex, date: dateForLog, logLevel: logLevelInput, value: input, mergedValue: input.join(" ") };
			incrementLogTypeBasedCount(logLevelInput.type);
			logs.push(newLog);

			if (templateLogsModule) {
				templateLogsModule.setNewLog(newLog);
			}

			const logLimit = getLoggerLimit();
			if (logs.length > logLimit) {
				logs.splice(0, 1); // removing the first log from array whenever a new log gets added
			}
		}
	}

	/**
	 * Function to track log type separately
	 * @param {log type for tracking count} logType 
	 */
	function incrementLogTypeBasedCount(logType) {
		if (!logLevelCountObj.hasOwnProperty(logType)) {
			logLevelCountObj[logType] = 0;
		}
		logLevelCountObj[logType] = parseInt(logLevelCountObj[logType]) + 1;
	}

	function getDeviceDetails() {
		return device;
	}
	/**
	* 
	*/
	function getFullLogs() {
		const newLogs = (logs) ? JSON.parse(JSON.stringify(logs)) : [];
		return newLogs;
	}

	/**
	 * Function to get the complete logger object count-wise
	 */
	function getLogTypeCountDetails() {
		return logLevelCountObj;
	}

	function resetLogLevelCountObj() {
		logLevelCountObj[LOG_LEVELS.TRACE.type] = 0;
		logLevelCountObj[LOG_LEVELS.DEBUG.type] = 0;
		logLevelCountObj[LOG_LEVELS.LOG.type] = 0;
		logLevelCountObj[LOG_LEVELS.INFO.type] = 0;
		logLevelCountObj[LOG_LEVELS.WARN.type] = 0;
		logLevelCountObj[LOG_LEVELS.ERROR.type] = 0;
		return logLevelCountObj;
	}

	/**
	 * 
	 */
	function clearLogs() {
		logs = [];
		resetLogLevelCountObj();
	}

	/**
	* 
	* @param  {...any} input 
	*/
	function debug(...input) {
		internalLog(LOG_LEVELS.DEBUG, ...input);
		// defaultConsole.debug(...input);
	}

	/**
	 * 
	 * @param  {...any} input 
	 */
	function log(...input) {
		internalLog(LOG_LEVELS.LOG, ...input);
		// defaultConsole.log(...input);
	}

	/**
	 * 
	 * @param  {...any} input 
	 */
	function warn(...input) {
		internalLog(LOG_LEVELS.WARN, ...input);
		// defaultConsole.warn(...input);
	}

	/**
	 * 
	 * @param  {...any} input 
	 */
	function error(...input) {
		internalLog(LOG_LEVELS.ERROR, ...input);
		// defaultConsole.error(...input);
	}

	/**
	 * 
	 * @param  {...any} input 
	 */
	function info(...input) {
		internalLog(LOG_LEVELS.INFO, ...input);
		// defaultConsole.info(...input);
	}

	/**
	 * 
	 * @param  {...any} input 
	 */
	function trace(...input) {
		internalLog(LOG_LEVELS.TRACE, ...input);
		// defaultConsole.trace(...input);
	}

	/**
	 * Throw any error raised
	 * @param {any} err
	 */
	function onErr(err) {
		error(err);
		throw err;
	}

	return {
		LOG_LEVELS,
		initialize,
		warn,
		error,
		debug,
		info,
		trace,
		log,
		clearLogs,
		getFullLogs,
		getDeviceDetails,
		getLogTypeCountDetails,
		resetLogLevelCountObj,
		setData,
		getData,
		getConfigIcon,
		getUrls,
		getLoggerLimit
	};

}(window.console));

//Then redefine the old console
window.console = console;
