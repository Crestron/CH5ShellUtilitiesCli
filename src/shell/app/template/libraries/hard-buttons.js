/*jslint es6 */
/*global CrComLib, projectConfigModule, templatePageModule, translateModule, serviceModule, utilsModule, templateAppLoaderModule, templateVersionInfoModule */

const hardButtonsModule = (() => {
	'use strict';

	let repeatDigitalInterval = null;
	const REPEAT_DIGITAL_PERIOD = 200;
	const MAX_REPEAT_DIGITALS = 30000 / REPEAT_DIGITAL_PERIOD;

	let currentDevice = "TSW-1070"; // "";
	let currentPage = "page1"; // "";

	/* 
	1. Find all unique signal names
	2. Subscribe state for all signals
	2.1. Create logic as per subscription
	*/
	function getAllSignals(hardButtonsArray) {
		const signalNames = [];
		for (let i = 0; i < hardButtonsArray.project.signals.length; i++) {
			const projectSignal = hardButtonsArray.project.signals[i];
			const signalFound = signalNames.find(signal => signal.signalName === projectSignal.hardButtonSignal);
			if (!signalFound) {
				signalNames.push({
					signalName: projectSignal.hardButtonSignal,
					isReady: false
				});
			}
		}
		for (let j = 0; j < hardButtonsArray.project.pages.length; j++) {
			const projectPage = hardButtonsArray.project.pages[j];
			for (let i = 0; i < projectPage.signals.length; i++) {
				const projectSignal = projectPage.signals[i];
				const signalFound = signalNames.find(signal => signal.signalName === projectSignal.hardButtonSignal);
				if (!signalFound) {
					signalNames.push({
						signalName: projectSignal.hardButtonSignal,
						isReady: false
					});
				}
			}
		}
		for (let k = 0; k < hardButtonsArray.project.devices.length; k++) {
			const projectDevice = hardButtonsArray.project.devices[k];
			for (let i = 0; i < projectDevice.signals.length; i++) {
				const projectSignal = projectDevice.signals[i];
				const signalFound = signalNames.find(signal => signal.signalName === projectSignal.hardButtonSignal);
				if (!signalFound) {
					signalNames.push({
						signalName: projectSignal.hardButtonSignal,
						isReady: false
					});
				}
			}
			for (let j = 0; j < projectDevice.pages.length; j++) {
				const projectPage = projectDevice.pages[j];
				for (let i = 0; i < projectPage.signals.length; i++) {
					const projectSignal = projectPage.signals[i];
					const signalFound = signalNames.find(signal => signal.signalName === projectSignal.hardButtonSignal);
					if (!signalFound) {
						signalNames.push({
							signalName: projectSignal.hardButtonSignal,
							isReady: false
						});
					}
				}
			}
		}
		return signalNames;
	}

	function initialize(deviceNameInput) {
		currentDevice = deviceNameInput;

		return new Promise((resolve, reject) => {
			serviceModule.loadJSON("./assets/data/hard-buttons.json", (dataResponse) => {
				const hardButtonData = JSON.parse(dataResponse);
				const signalNames = getAllSignals(hardButtonData);
				log("signalNames", signalNames);
				for (let i = 0; i < signalNames.length; i++) {
					const iteratedSignal = signalNames[i];
					CrComLib.subscribeState('b', iteratedSignal.signalName, (response) => {
						log("CrComLib.subscribeState: ", iteratedSignal.signalName, response);
						if (iteratedSignal.isReady === true) {
							hardButtonClicked(hardButtonData, iteratedSignal.signalName, response);
						}
						iteratedSignal.isReady = true; // Required for first time to ensure that subscribe is called and nothing should happen
					});
				}
				resolve(true);
			}, error => {
				reject(false);
			});
		});
	}

	function log(...data) {
		console.log(...data);
		let outputString = "";
		for (let i = 0; i < data.length; i++) {
			outputString += data[i] + " ";
		}
		if (document.getElementById('txtOutput')) {
			document.getElementById('txtOutput').value += outputString + "\n";
		}
	}

	function hardButtonClicked(hardButtonsArray, signal, response) {
		/* Priority is 
			(a) Device level page (if user is on the selected page)
			(b) Device level
			(c) Project level page (if user is on the selected page)
			(d) Project level
		*/
		currentPage = navigationModule.selectedPage();

		let signalValue = "";
		let navigationPageName = "";

		for (let i = 0; i < hardButtonsArray.project.signals.length; i++) {
			const selectedSignal = hardButtonsArray.project.signals[i];
			if (selectedSignal.hardButtonSignal === signal) {
				if (selectedSignal.navigationPageName !== "") {
					navigationPageName = selectedSignal.navigationPageName;
				} else if (selectedSignal.digitalJoin !== "") {
					signalValue = selectedSignal.digitalJoin;
				}
			}
		}
		for (let j = 0; j < hardButtonsArray.project.pages.length; j++) {
			const selectedPage = hardButtonsArray.project.pages[j];
			if (selectedPage.pageName === currentPage) {
				for (let i = 0; i < selectedPage.signals.length; i++) {
					const selectedSignal = selectedPage.signals[i];
					if (selectedSignal.hardButtonSignal === signal) {
						if (selectedSignal.navigationPageName !== "") {
							navigationPageName = selectedSignal.navigationPageName;
						} else if (selectedSignal.digitalJoin !== "") {
							signalValue = selectedSignal.digitalJoin;
						}
					}
				}
			}
		}
		for (let k = 0; k < hardButtonsArray.project.devices.length; k++) {
			const selectedDevice = hardButtonsArray.project.devices[k];
			if (selectedDevice.deviceName === currentDevice) {
				for (let i = 0; i < selectedDevice.signals.length; i++) {
					const selectedSignal = selectedDevice.signals[i];
					if (selectedSignal.hardButtonSignal === signal) {
						if (selectedSignal.navigationPageName !== "") {
							navigationPageName = selectedSignal.navigationPageName;
						} else if (selectedSignal.digitalJoin !== "") {
							signalValue = selectedSignal.digitalJoin;
						}
					}
				}
				for (let j = 0; j < selectedDevice.pages.length; j++) {
					const selectedPage = selectedDevice.pages[j];
					if (selectedPage.pageName === currentPage) {
						for (let i = 0; i < selectedPage.signals.length; i++) {
							const selectedSignal = selectedPage.signals[i];
							if (selectedSignal.hardButtonSignal === signal) {
								if (selectedSignal.navigationPageName !== "") {
									navigationPageName = selectedSignal.navigationPageName;
								} else if (selectedSignal.digitalJoin !== "") {
									signalValue = selectedSignal.digitalJoin;
								}
							}
						}
					}
				}
			}
		}

		log("signalValue: ", signalValue);
		log("navigationPageName: ", navigationPageName);
		if (navigationPageName !== "") {
			if (response === false) {
				log("currentPage.toLowerCase().trim(): ", currentPage.toLowerCase().trim());
				log("navigationPageName.toLowerCase().trim(): ", navigationPageName.toLowerCase().trim());
				if (currentPage.toLowerCase().trim() !== navigationPageName.toLowerCase().trim()) {
					templatePageModule.navigateTriggerViewByPageName(navigationPageName);
				}
			}
		} else if (signalValue != "") {
			if (response === true) {
				let numRepeatDigitals = 0;
				CrComLib.publishEvent('b', signalValue, response);
				repeatDigitalInterval = window.setInterval(() => {
					log("Prioritized signal name: ", signalValue, ' for response ', response);
					if (++numRepeatDigitals >= MAX_REPEAT_DIGITALS) {
						console.warn("Hard Button MAXIMUM Repeat digitals sent");
						window.clearInterval(repeatDigitalInterval);
						CrComLib.publishEvent('b', signalValue, response);
						if (repeatDigitalInterval !== null) {
							window.clearInterval(repeatDigitalInterval);
						}
					}
				}, REPEAT_DIGITAL_PERIOD);
			} else {
				if (repeatDigitalInterval !== null) {
					window.clearInterval(repeatDigitalInterval);
				}
				CrComLib.publishEvent('b', signalValue, response);
			}
		}
	}

	return {
		initialize
	};

})();


// function initialize(deviceNameInput) {
// 	// signals = {};
// 	currentDevice = deviceNameInput;
// 	currentPage = navigationModule.selectedPage();

// 	return new Promise((resolve, reject) => {
// 		serviceModule.loadJSON("./assets/data/hard-buttons.json", (dataResponse) => {
// 			const hardButtonData = JSON.parse(dataResponse);
// 			const signalNames = getAllSignals(hardButtonData)
// 			log("signalNames", signalNames);
// 			// iterate(hardButtonData, "");

// 			// log("signals", signals);
// 			for (let i = 0; i < signalNames.length; i++) {
// 				CrComLib.subscribeState('b', signalNames[i], (response) => {
// 					log("CrComLib.subscribeState: ", signalNames[i], response);
// 					hardButtonClicked(hardButtonData, signalNames[i], response);
// 					// log(key, signals[key], response);
// 					// if (isHardPressInitiated === true) {
// 					// 	hardButtonClicked(signals[key], response);
// 					// }
// 					// isHardKeyPressed = response;
// 					// isHardPressInitiated = true; // Required for first time to ensure that subscribe is called and nothing should happen
// 				});
// 			}
// 			resolve(true);
// 		}, error => {
// 			reject(false);
// 		});
// 	});
// }


// const iterate = (obj, parent) => {
// 	Object.keys(obj).forEach(key => {
// 		if (typeof obj[key] === 'object' && obj[key] !== null) {
// 			if (key.toLowerCase() === "pages") {
// 				iterate(obj[key], key);
// 			} else if (key.toLowerCase() === "devices") { // && key === currentDevice) {
// 				iterate(obj[key], key);
// 			} else {
// 				log("parent is", key, parent);
// 				if (parent === "pages") {
// 					if (key === currentPage) {
// 						iterate(obj[key], key);
// 					}
// 				} else if (parent === "devices" && key === currentDevice) {
// 					if (key === currentDevice) {
// 						iterate(obj[key], key);
// 					}
// 				} else {
// 					iterate(obj[key], key);
// 				}
// 			}
// 		} else {
// 			if (obj[key] && obj[key] !== "") {
// 				signals[parent] = obj;
// 			}
// 		}
// 	});
// };

// function hardButtonClicked_OLD(signal, response) {
// 	/* Priority is 
// 	(a) Device level page (if user is on the selected page)
// 	(b) Device level
// 	(c) Project level page (if user is on the selected page)
// 	(d) Project level
// 	*/

// 	if (signal && (signal.signalName !== "" || signal.navigateToPageName !== "")) {
// 		log("hardButtonClicked: ", signal, ' for response ', response);
// 		// Page flip gets priority
// 		if (signal.navigateToPageName !== "") {
// 			if (response === false) {
// 				if (currentPage.toLowerCase().trim() != currentPage.toLowerCase().trim()) {
// 					templatePageModule.navigateTriggerViewByPageName(signal.navigateToPageName);
// 				}
// 			}
// 		} else if (signal.signalName !== "") {
// 			if (response === true) {
// 				let numRepeatDigitals = 0;
// 				repeatDigitalInterval = window.setInterval(() => {
// 					log("Prioritized signal name: ", signal.signalName, ' for response ', response);
// 					CrComLib.publishEvent('b', signal.signalName, response);
// 					if (++numRepeatDigitals >= MAX_REPEAT_DIGITALS) {
// 						console.warn("Hard Button MAXIMUM Repeat digitals sent");
// 						window.clearInterval(repeatDigitalInterval);
// 						CrComLib.publishEvent('b', signal.signalName, response);
// 						if (repeatDigitalInterval !== null) {
// 							window.clearInterval(repeatDigitalInterval);
// 						}
// 					}
// 				}, REPEAT_DIGITAL_PERIOD);
// 			} else {
// 				if (repeatDigitalInterval !== null) {
// 					window.clearInterval(repeatDigitalInterval);
// 				}
// 				CrComLib.publishEvent('b', signal.signalName, response);
// 			}
// 		}
// 	}
// }

	// function initialize(deviceData) {
	// 	return new Promise((resolve, reject) => {
	// 		serviceModule.loadJSON("./assets/data/hard-buttons.json", (dataResponse) => {
	// 			const hardButtonData = JSON.parse(dataResponse);

	// 			const signalsArray = [];


	// 			for (let i = 0; i < hardButtonsList.length; i++) {
	// 				const hardButtonClickedId = 'Hard_Button_' + (i + 1);
	// 				CrComLib.subscribeState('b', hardButtonClickedId, (response) => {
	// 					log(hardButtonClickedId, response);

	// 					/* Priority is
	// 							(a) Device level page (if user clicks on selected page)
	// 							(b) Device level
	// 							(c) Project level page (if user clicks on selected page)
	// 							(d) Project level
	// 					*/
	// 					let signalNamePrioritized = "";
	// 					// if (hardButtonData && hardButtonData.hardButtons && hardButtonData.hardButtons.project &&
	// 					// 	hardButtonData.hardButtons.project.devices && hardButtonData.hardButtons.project.devices.pages && hardButtonData.hardButtons.project.devices.pages[navigationModule.selectedPage()] &&
	// 					// 	hardButtonData.hardButtons.project.devices.pages[navigationModule.selectedPage()][hardButtonClickedId] &&
	// 					// 	hardButtonData.hardButtons.project.devices.pages[navigationModule.selectedPage()][hardButtonClickedId] !== "") {
	// 					// 	signalNamePrioritized = hardButtonData.hardButtons.project.devices.pages[navigationModule.selectedPage()][hardButtonClickedId];
	// 					// } else if (hardButtonData && hardButtonData.hardButtons && hardButtonData.hardButtons.project && hardButtonData.hardButtons.project.devices &&
	// 					// 	hardButtonData.hardButtons.project.devices[deviceData] &&
	// 					// 	hardButtonData.hardButtons.project.devices[deviceData][hardButtonClickedId] &&
	// 					// 	hardButtonData.hardButtons.project.devices[deviceData][hardButtonClickedId] !== "") {
	// 					// 	signalNamePrioritized = hardButtonData.hardButtons.project.devices[deviceData][hardButtonClickedId];
	// 					// } else if (hardButtonData && hardButtonData.hardButtons && hardButtonData.hardButtons.project &&
	// 					// 	hardButtonData.hardButtons.project[hardButtonClickedId] &&
	// 					// 	hardButtonData.hardButtons.project[hardButtonClickedId] !== "") {
	// 					// 	signalNamePrioritized = hardButtonData.hardButtons.project[hardButtonClickedId];
	// 					// }

	// 					if (signalNamePrioritized !== "" && isHardPressInitiated === true) {
	// 						hardButtonClicked(signalNamePrioritized, response);
	// 					}
	// 					isHardKeyPressed = response;
	// 					isHardPressInitiated = true; // Required for first time to ensure that subscribe is called and nothing should happen
	// 				});
	// 			}
	// 			resolve(true);
	// 		}, error => {
	// 			reject(false);
	// 		});
	// 	});
	// }
