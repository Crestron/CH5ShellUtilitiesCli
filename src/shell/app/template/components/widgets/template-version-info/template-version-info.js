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
	const processedPage = new Set();
	const tableCount = {
		ch5Count: 0,
		domCount: 0,
		ch5ComponentsPageWise: {}
	};
	/**
	 * Initialize Method
	 */
	function onInit() {
		projectConfigModule.projectConfigData().then(projectConfigResponse => {
			projectConfig = projectConfigResponse;
			if (projectConfig.header.displayInfo) {
				setTabs();
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
		const diagnosticPageHeaderElement = document.getElementById('diagnosticPageHeaderElement');
		const listOfPages = projectConfigModule.getNavigationPages();
		const pageCount = document.getElementById('pageCount');

		pageCount.textContent = translateModuleHelper('pagecount', listOfPages.length);
		diagnosticPageHeaderElement.children[2].textContent += ` (${listOfPages.filter(page => page.preloadPage).length})`;
		diagnosticPageHeaderElement.children[3].textContent += ` (${listOfPages.filter(page => page.cachePage).length})`;
		for (const page of listOfPages) {
			const processedPageName = page.navigation.isI18nLabel ? translateModule.translateInstant(page.navigation.label) : page.navigation.label;
			const newTableEntry = createTableRow({ name: processedPageName, count: '', preload: page.preloadPage ? 'Y' : 'N', cached: page.cachePage ? 'Y' : 'N', nodes: '' });
			newTableEntry.setAttribute('id', 'diagnostics-table-' + page.pageName);
			diagnosticsTableElement.appendChild(newTableEntry);
			tableCount.ch5ComponentsPageWise[`${page.pageName}`] = {};
		}
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
			...tableCount,
			currentCh5Components: +currentComponents.textContent,
			totalCh5ComponentsCurrentlyLoaded: CrComLib.countNumberOfCh5Components(document.getElementsByTagName('body')[0]).total
		}

		const signalNames = document.getElementById('totalSubscribers').textContent;
		const subscriptions = document.getElementById('totalSignals').textContent;
		if ((signalValue !== undefined && signalValue === true) || signalValue === undefined) {
			console.log({ signals, ch5components, signalNames, subscriptions });
		}
	}
	function translateModuleHelper(fieldName, fieldValue) {
		return translateModule.translateInstant(`header.info.diagnostics.${fieldName}`) + fieldValue;
	}

	function updateDiagnosticsOnPageChange(pageConfiguration) {
		setTimeout(() => {
			const listOfNavigationButtons = document.querySelectorAll('ch5-button[id*=menu-list-id-');
			if (!projectConfig.header.displayInfo) {
				listOfNavigationButtons.forEach(e => e.children[0].style.pointerEvents = "auto");
				return;
			}
			setTimeout(() => {
				if (!processedPage.has(pageConfiguration.pageName)) {
					processedPage.add(pageConfiguration.pageName);
					diagnosticsTable(pageConfiguration.pageName);
				}
				getCurrentCh5Components();
				updateSubscriptions();
				listOfNavigationButtons.forEach(e => e.children[0].style.pointerEvents = "auto");
			}, 150);
		});
	}
	function getCurrentCh5Components() {
		const listOfPages = projectConfigModule.getNavigationPages();
		let currentCh5ComponentsCount = 0;
		listOfPages.forEach(page => {
			const pageImporterElement = document.getElementById(page.pageName + '-import-page');
			if (pageImporterElement) currentCh5ComponentsCount += CrComLib.countNumberOfCh5Components(pageImporterElement).total;
		});
		const currentComponents = document.getElementById('currentComponents');
		currentComponents.textContent = translateModuleHelper('currentcomp', currentCh5ComponentsCount);
	}

	function diagnosticsTable(pageName) {
		const pageImporterElement = document.getElementById(pageName + '-import-page');

		// Current Page Table Row Updation
		const currentPageTableRow = document.getElementById('diagnostics-table-' + pageName);
		const domNodesOnPage = pageImporterElement.getElementsByTagName('*').length;

		let currentCh5ComponentsCount = CrComLib.countNumberOfCh5Components(pageImporterElement).total;
		currentPageTableRow.childNodes[1].textContent = currentCh5ComponentsCount;
		currentPageTableRow.childNodes[4].textContent = domNodesOnPage;

		// Diagnostic Table Count Updation
		tableCount.ch5ComponentsPageWise[`${pageName}`] = CrComLib.countNumberOfCh5Components(pageImporterElement);
		tableCount.ch5Count += currentCh5ComponentsCount;
		tableCount.domCount += domNodesOnPage;

		// Diagnostic Info Count Updation
		const totalComponents = document.getElementById('totalComponents');
		const totalDom = document.getElementById('totalDom');

		totalComponents.innerHTML = translateModuleHelper('totalcomponents', tableCount.ch5Count);;
		totalDom.innerHTML = translateModuleHelper('totalnodes', tableCount.domCount);
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
		updateDiagnosticsOnPageChange,
		logSubscriptionsCount
	};
})();