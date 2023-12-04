/*jslint es6 */
/*global CrComLib, projectConfigModule, navigationModule, templatePageModule, translateModule, serviceModule, utilsModule, templateAppLoaderModule, templateVersionInfoModule */

const hardButtonsModule = (() => {
	'use strict';

	let repeatDigitalInterval = null;
	const REPEAT_DIGITAL_PERIOD = 200;
	const MAX_REPEAT_DIGITALS = 30000 / REPEAT_DIGITAL_PERIOD;

	let currentDevice = "";
	let currentPage = "";
	let clickedOnPage = "";

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
				utilsModule.log("signalNames", signalNames);
				for (let i = 0; i < signalNames.length; i++) {
					const iteratedSignal = signalNames[i];
					CrComLib.subscribeState('b', iteratedSignal.signalName, (response) => {
						utilsModule.log("CrComLib.subscribeState: ", iteratedSignal.signalName, response, clickedOnPage);
						if (clickedOnPage !== "" || response === true) {
							if (response === true) {
								clickedOnPage = navigationModule.selectedPage();
							}
							hardButtonClicked(hardButtonData, iteratedSignal.signalName, response);
						}
					});
				}
				resolve(true);
			}, error => {
				console.error("Error in Hard Buttons", error);
				reject(false);
			});
		});
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
				}
				if (selectedSignal.digitalJoin !== "") {
					signalValue = selectedSignal.digitalJoin;
				}
			}
		}
		for (let j = 0; j < hardButtonsArray.project.pages.length; j++) {
			const selectedPage = hardButtonsArray.project.pages[j];
			if (selectedPage.pageName === clickedOnPage) {
				for (let i = 0; i < selectedPage.signals.length; i++) {
					const selectedSignal = selectedPage.signals[i];
					if (selectedSignal.hardButtonSignal === signal) {
						if (selectedSignal.navigationPageName !== "") {
							navigationPageName = selectedSignal.navigationPageName;
						}
						if (selectedSignal.digitalJoin !== "") {
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
						}
						if (selectedSignal.digitalJoin !== "") {
							signalValue = selectedSignal.digitalJoin;
						}
					}
				}
				for (let j = 0; j < selectedDevice.pages.length; j++) {
					const selectedPage = selectedDevice.pages[j];
					if (selectedPage.pageName === clickedOnPage) {
						for (let i = 0; i < selectedPage.signals.length; i++) {
							const selectedSignal = selectedPage.signals[i];
							if (selectedSignal.hardButtonSignal === signal) {
								if (selectedSignal.navigationPageName !== "") {
									navigationPageName = selectedSignal.navigationPageName;
								}
								if (selectedSignal.digitalJoin !== "") {
									signalValue = selectedSignal.digitalJoin;
								}
							}
						}
					}
				}
			}
		}

		utilsModule.log("signalValue: ", signalValue);
		utilsModule.log("navigationPageName: ", navigationPageName);
		if (navigationPageName !== "") {
			if (response === true) {
				utilsModule.log("currentPage.toLowerCase().trim(): ", currentPage.toLowerCase().trim());
				utilsModule.log("navigationPageName.toLowerCase().trim(): ", navigationPageName.toLowerCase().trim());
				if (currentPage.toLowerCase().trim() !== navigationPageName.toLowerCase().trim()) {
					templatePageModule.navigateTriggerViewByPageName(navigationPageName);
				}
			}
		}
		if (signalValue != "") {
			if (response === true) {
				CrComLib.publishEvent('b', signalValue, response);
				if (repeatDigitalInterval !== null) {
					window.clearInterval(repeatDigitalInterval);
				}
				let numRepeatDigitals = 0;
				repeatDigitalInterval = window.setInterval(() => {
					utilsModule.log("Prioritized signal name: ", signalValue, ' for response ', response);
					CrComLib.publishEvent('b', signalValue, response);
					if (++numRepeatDigitals >= MAX_REPEAT_DIGITALS) {
						console.warn("Hard Button MAXIMUM Repeat digitals sent");
						window.clearInterval(repeatDigitalInterval);
						CrComLib.publishEvent('b', signalValue, !response);
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