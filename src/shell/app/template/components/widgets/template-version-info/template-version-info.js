// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

/*global CrComLib, translateModule, serviceModule, utilsModule, templateAppLoaderModule, templatePageModule, projectConfigModule, projectConfigModule */

const templateVersionInfoModule = (() => {
	'use strict';

	const diagnosticsTableCount = {
		totalCh5Components: 0,
		totalDomCount: 0,
		signals: 0,
		subscriptions: 0,
		ch5ComponentsPageWise: {}
	};
	const HTML_IDS = {
		totalComponents: 'total-components',
		totalDom: 'total-dom',
	};

	const processedPage = new Set();
	let projectConfig;
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
			packages ? Array.from(JSON.parse(packages)).forEach((e) => versionTableBody.appendChild(createTableRow(e))) : console.log("FILE NOT FOUND");
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
		const listOfPages = projectConfigModule.getNavigationPages();
		pageCount.textContent = `${translateModule.translateInstant('header.info.diagnostics.pagecount')} ${listOfPages.length}`;
		diagnosticPageHeaderElement.children[2].textContent += ` (${listOfPages.filter(page => page.preloadPage).length})`;
		diagnosticPageHeaderElement.children[3].textContent += ` (${listOfPages.filter(page => page.cachePage).length})`;
		for (const page of listOfPages) {
			const processedPageName = page.navigation.isI18nLabel ? translateModule.translateInstant(page.navigation.label) : page.navigation.label;
			const newTableEntry = createTableRow({ name: processedPageName, count: '', preload: page.preloadPage ? 'Y' : 'N', cached: page.cachePage ? 'Y' : 'N', nodes: '' });
			newTableEntry.setAttribute('id', `diagnostics-table-${page.pageName}`);
			diagnosticsTableElement.appendChild(newTableEntry);
			diagnosticsTableCount.ch5ComponentsPageWise[`${page.pageName}`] = {};
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
					diagnosticsTable(pageConfiguration.pageName + "-import-page", pageConfiguration.pageName);
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
			const pageImporterElement = document.getElementById(`${page.pageName}-import-page`);
			if (pageImporterElement) currentCh5ComponentsCount += CrComLib.countNumberOfCh5Components(pageImporterElement).total;
		})
		currentComponents.textContent += currentCh5ComponentsCount;
	}

	function diagnosticsTable(idComponent, pageName) {
		const pageImporterElement = document.getElementById(idComponent);
		const domNodesOnPage = pageImporterElement.getElementsByTagName('*').length;
		const pageTableEntry = document.getElementById(`diagnostics-table-${pageName}`);
		if (!pageTableEntry) return;
		const ch5ComponentsCountForCurrentPage = pageTableEntry.childNodes[1];
		const domNodesForCurrentPage = pageTableEntry.childNodes[4];
		let currentCh5ComponentsCount = CrComLib.countNumberOfCh5Components(pageImporterElement).total;
		ch5ComponentsCountForCurrentPage.textContent = currentCh5ComponentsCount;
		domNodesForCurrentPage.textContent = domNodesOnPage;
		diagnosticsTableCount.ch5ComponentsPageWise[`${pageName}`] = CrComLib.countNumberOfCh5Components(pageImporterElement);
		diagnosticsTableCount.totalCh5Components += currentCh5ComponentsCount;
		diagnosticsTableCount.totalDomCount += domNodesOnPage;

		totalComponents.innerHTML += diagnosticsTableCount.totalCh5Components;
		totalDom.innerHTML += diagnosticsTableCount.totalDomCount;
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

		diagnosticsTableCount.signals += subscribers;
		diagnosticsTableCount.subscriptions += tsubscriptions;

		totalSignals.textContent = 'Total Signals: ' + diagnosticsTableCount.signals;
		totalSubscribers.textContent = 'Total Subscriptions: ' + diagnosticsTableCount.subscriptions;

		return data;
	}

	function logSubscriptionsCount(event, signalValue) {
		const signals = updateSubscriptions();
		const ch5components = {
			...diagnosticsTableCount,
			currentCh5Components: +currentComponents.textContent,
			totalCh5ComponentsCurrentlyLoaded: CrComLib.countNumberOfCh5Components(document.getElementsByTagName('body')[0]).total
		}

		const signalNames = document.getElementById('totalSubscribers').textContent;
		const subscriptions = document.getElementById('totalSignals').textContent;
		if ((signalValue !== undefined && signalValue === true) || signalValue === undefined) {
			console.log({ signals, ch5components, signalNames, subscriptions });
		}
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