// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

/*global CrComLib, translateModule, serviceModule, utilsModule, templateAppLoaderModule, templatePageModule, projectConfigModule, projectConfigModule */

const templateVersionInfoModule = (() => {
	'use strict';

	let projectConfig;
	const tableCount = {};
	const componentCount = {};
	/**
	 * Initialize Method
	 */
	function onInit() {
		CrComLib.subscribeState('b', 'infoBtn.clicked', (value) => {
			if (value) {
				projectConfigModule.projectConfigData().then(projectConfigResponse => {
					projectConfig = projectConfigResponse;
					if (projectConfig.header.displayInfo) {
						updateSubscriptions();
						setTabs();
					}
				});
			}
		});
	}
	function setTabs() {
		if (!projectConfig.useWebXPanel) document.getElementById('webxpanel-tab').style.display = 'none';
		updateVersionTabHTML();
		updatePageCount();
		setTabsListeners();
		setLogButtonListener();
	}
	function updateVersionTabHTML() {
		serviceModule.loadJSON('./assets/data/version.json', (packages) => {
			if (!packages) return console.log("FILE NOT FOUND");
			versionTableBody.innerHTML = "";
			Array.from(JSON.parse(packages)).forEach((e) => versionTableBody.appendChild(createTableRow(e)))
		})
	}
	function createTableRow(data) {
		const tableRow = document.createElement('tr');
		for (const value of Object.values(data)) {
			const tableData = document.createElement('td');
			if (value === 'Y') {
				tableData.style.color = "green";
				tableData.innerHTML = '<i class="fas fa-check"></i>&nbsp;&nbsp;Yes';
			}
			else if (value === 'N') {
				tableData.innerHTML = '<i class="fas fa-times"></i>&nbsp;&nbsp;No';
				tableData.style.color = "orange";
			}
			else {
				tableData.textContent = value;
			}
			tableRow.appendChild(tableData);
		}
		return tableRow;
	}
	function updatePageCount() {
		const diagnosticsTableElement = document.getElementById('diagnosticsTableElement');
		diagnosticsTableElement.innerHTML = "";
		const diagnosticPageHeaderElement = document.getElementById('diagnosticPageHeaderElement');
		const listOfPages = projectConfigModule.getNavigationPages();

		document.getElementById('pageCount').textContent = translateModuleHelper('pagecount', listOfPages.length);
		diagnosticPageHeaderElement.children[2].textContent = `Preload (${listOfPages.filter(page => page.preloadPage).length})`;
		diagnosticPageHeaderElement.children[3].textContent = `	Cached (${listOfPages.filter(page => page.cachePage).length})`;
		for (const page of listOfPages) {
			let count = tableCount[page.pageName].total ?? '';
			let nodes = tableCount[page.pageName].domNodes ?? '';
			if (tableCount.hasOwnProperty(page.pageName) === false) {
				const pageImporterElement = document.getElementById(page.pageName + '-import-page');
				if (!pageImporterElement) return;

				tableCount[`${page.pageName}`] = CrComLib.countNumberOfCh5Components(pageImporterElement);
				tableCount[`${page.pageName}`].domNodes = pageImporterElement.getElementsByTagName('*').length;
				count = tableCount[`${page.pageName}`].total;
				nodes = tableCount[`${page.pageName}`].domNodes;
			}
			const processedPageName = page.navigation.isI18nLabel ? translateModule.translateInstant(page.navigation.label) : page.navigation.label;
			const newTableEntry = createTableRow({ name: processedPageName, count, preload: page.preloadPage ? 'Y' : 'N', cached: page.cachePage ? 'Y' : 'N', nodes });
			newTableEntry.setAttribute('id', 'diagnostics-table-' + page.pageName);
			diagnosticsTableElement.appendChild(newTableEntry);
		}

		document.getElementById('totalDom').innerHTML = templateVersionInfoModule.translateModuleHelper('totalnodes', componentCount.totalDomCount);
		document.getElementById('totalComponents').innerHTML = templateVersionInfoModule.translateModuleHelper('totalcomponents', componentCount.totalComponentsCount);;
		document.getElementById('currentComponents').innerHTML = templateVersionInfoModule.translateModuleHelper('currentcomp', componentCount.currentCh5Components);

	}
	function setTabsListeners() {
		const tabs = ['version-tab', 'webxpanel-tab', 'diagnostics-tab'];
		tabs.forEach((tab) => {
			document.getElementById(tab).addEventListener('click', function () {
				if (this.classList.contains('selected')) return;
				tabs.forEach((tabContent) => tab !== tabContent ? document.getElementById(tabContent + '-content').style.display = "none" : document.getElementById(tabContent + '-content').style.display = "block");
				tabs.forEach((selectedTab) => tab !== selectedTab ? document.getElementById(selectedTab).classList.remove('selected') : "");
				this.classList.add('selected');
			})
		})
	}
	function setLogButtonListener() {
		subscribeLogButton.addEventListener('click', logSubscriptionsCount);
		CrComLib.subscribeState('b', '' + projectConfig.header.diagnostics.logs.receiveStateLogDiagnostics, (value) => logSubscriptionsCount(null, value));
	}
	function logSubscriptionsCount(event, signalValue) {
		const signals = updateSubscriptions();
		const ch5components = {
			ch5ComponentsPageWise: { ...tableCount },
			...componentCount,
			totalCh5ComponentsCurrentlyLoaded: CrComLib.countNumberOfCh5Components(document.getElementsByTagName('body')[0]).total
		}

		const signalNames = document.getElementById('totalSignals').textContent.split(':')[1].trim();
		const subscriptions = document.getElementById('totalSubscribers').textContent.split(':')[1].trim();
		if ((signalValue !== undefined && signalValue === true) || signalValue === undefined) {
			console.log({ signals, ch5components, signalNames, subscriptions });
		}
	}
	function translateModuleHelper(fieldName, fieldValue) {
		return translateModule.translateInstant(`header.info.diagnostics.${fieldName}`) + " " + fieldValue;
	}

	function updateSubscriptions() {
		let tsubscriptions = 0;
		let subscribers = 0;
		let data = [];
		const signals = CrComLib.getSubscriptionsCount();
		for (const [sType, value] of Object.entries(signals)) {
			for (const [signal, details] of Object.entries(value)) {
				tsubscriptions++;
				const signalType = sType != undefined ? sType : "";
				const signalName = signal != undefined ? signal : "";
				const subscriptions = Object.values(details._subscriptions).length - 1;
				data.push({ signalType, signalName, subscriptions });
				subscribers += subscriptions;
			}
		}
		const totalSignals = document.getElementById('totalSignals');
		const totalSubscribers = document.getElementById('totalSubscribers');

		totalSignals.textContent = translateModuleHelper('subscribers', subscribers);
		totalSubscribers.textContent = translateModuleHelper('subscription', tsubscriptions);

		return data;
	}

	/**
	 * private method for page class initialization
	 */
	let loadedImportSnippet = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:template-version-info-import-page', (value) => {
		if (value['loaded']) {
			setTimeout(() => {
				onInit();
			});
			setTimeout(() => {
				CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:template-version-info-import-page', loadedImportSnippet);
				loadedImportSnippet = null;
			});
		}
	});

	/**
	 * All public method and properties are exported here
	 */
	return {
		translateModuleHelper,
		updateSubscriptions,
		tableCount,
		componentCount,
		logSubscriptionsCount
	};
})();