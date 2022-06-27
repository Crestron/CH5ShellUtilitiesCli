// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

/*global CrComLib, translateModule, serviceModule, utilsModule, templateAppLoaderModule, templatePageModule, projectConfigModule, projectConfigModule */

const templateVersionInfoModule = (() => {
	'use strict';

	const processedPages = new Set();

	const HTML_IDS = {
		tabWrapper: 'tab-wrapper',
		versionTab: 'version-tab',
		webxpanelTab: 'webxpanel-tab',
		diagnosticsTab: 'diagnostics-tab',
		versionTabContent: 'version-tab-content',
		webxpanelTabContent: 'webxpanel-tab-content',
		diagnosticsTabContent: 'diagnostics-tab-content',
		memoryUsed: 'memory-used',
		memorySpan: 'memory-span',
		memoryBar: 'memory-bar',
		totalComponents: 'total-components',
		totalSubscriptions: 'total-subscriptions',
		totalSubscribers: 'total-subscribers',
		pageCount: 'page-count',
		totalDom: 'total-dom',
		currentComponents: 'current-components',
		startDuration: 'start-duration',
		memoryCollabsableContainer: 'memory-collabsable-container',
		subscribeCollabsableContainer: 'subscribe-collabsable-container',
		subscribeLogButton: 'subscribe-log',
	};

	const TAB_TO_CONTENT = {
		'version-tab': 'version-tab-content',
		'diagnostics-tab': 'diagnostics-tab-content',
		'webxpanel-tab': 'webxpanel-tab-content'
	};

	let diagnosticsPageChangeChanged = false;
	let projectConfig;
	let isListenerInitialized = false;

	/**
	 * Initialize Method
	 */
	function onInit() {
		projectConfigModule.projectConfigData().then(projectConfigResponse => {
			projectConfig = projectConfigResponse;
			if (projectConfig.header.displayInfo) {
				setTabs();
			}
		})
	}

	function setTabs() {
		const tabWrapperElement = document.getElementById(HTML_IDS.tabWrapper);

		const webxPanelTab = document.getElementById(HTML_IDS.webxpanelTab);

		if (!projectConfig.useWebXPanel) {
			webxPanelTab.style.display = 'none';
		}

		if (!tabWrapperElement) return;

		updateVersionTabHTML();
		updateDiagnosticsHTML();

		setTabsListeners();
	}

	function updateVersionTabHTML() {
		const versionTabContent = document.getElementById(HTML_IDS.versionTabContent);
		const tableWrapper = versionTabContent.querySelector('tbody');

		serviceModule.loadJSON('./assets/data/version.json', (packages) => {
			if (packages) {
				for (const crestronPackage of JSON.parse(packages)) {
					const newTableEntry = createTableRow(crestronPackage);
					tableWrapper.appendChild(newTableEntry);
				}
			} else {
				console.log("FILE NOT FOUND");
			}
		})
	}

	function createTableRow(data) {
		const tableRow = document.createElement('tr');
		for (const value of Object.values(data)) {
			const tableData = document.createElement('td');

			if (value === 'Y') {
				tableData.innerHTML = "&#10003; Yes";
				tableData.style.color = "green";
			}
			else if (value === 'N') {
				tableData.innerHTML = "&#x2716; No"
				tableData.style.color = "orange";
			}
			else {
				tableData.textContent = value;
			}
			tableRow.appendChild(tableData);
		}
		return tableRow;
	}

	function updateDiagnosticsHTML() {
		updatePageCount();
	}

	function updateSubscriptions() {
		let tsubscriptions = 0;
		let subscribers = 0;
		let data = [];
		const signals = CrComLib.getSubscriptionsCount();
		for (const [sType, value] of Object.entries(signals)) {
			for (const [signal, details] of Object.entries(value)) {
				tsubscriptions++;
				let signalType = sType != undefined ? sType : "";
				let signalName = signal != undefined ? signal : "";
				let subscriptions = Object.values(details._subscriptions).length - 1;
				data.push({ signalType, signalName, subscriptions });
				subscribers += Object.values(details._subscriptions).length - 1;
			}
		}
		const subscriptionsElement = document.getElementById(HTML_IDS.totalSubscriptions);
		const subscribersElement = document.getElementById(HTML_IDS.totalSubscribers);

		subscriptionsElement.textContent = tsubscriptions;
		subscribersElement.textContent = subscribers;

		if (!isListenerInitialized) {
			isListenerInitialized = true;
			setLogButtonListener();
		}
		return data;
	}

	function setLogButtonListener() {
		document.getElementById(HTML_IDS.subscribeLogButton).addEventListener('click', logSubscriptionsCount);
		CrComLib.subscribeState('b', '' + projectConfig.header.diagnostics.logs.receiveStateLogDiagnostics, (value) => logSubscriptionsCount(null, value));
	}
	
	function logSubscriptionsCount(event, signalValue) {
		const currentCh5Components = document.getElementById(HTML_IDS.currentComponents);
		const totalCh5Components = document.getElementById(HTML_IDS.totalComponents);
		const totalDomNodes = document.getElementById(HTML_IDS.totalDom);
		const signals = updateSubscriptions();
		const ch5components = {
			currentCh5Components: currentCh5Components.textContent,
			totalCh5Components: totalCh5Components.textContent,
			totalDomNodes: totalDomNodes.textContent,
			componentsAndAttributes: CrComLib.countNumberOfCh5Components(document.getElementsByTagName('body')[0])
		}

		const signalNames = document.getElementById(HTML_IDS.totalSubscribers).textContent;
		const subscriptions = document.getElementById(HTML_IDS.totalSubscriptions).textContent;
		if ((signalValue !== undefined && signalValue === true) || signalValue === undefined) {
			console.log({ signals, ch5components, signalNames, subscriptions });
		}
	}

	function updatePageCount() {
		const diagnosticsTabContentElement = document.getElementById(HTML_IDS.diagnosticsTabContent);
		const diagnosticsTableElement = diagnosticsTabContentElement.querySelector('tbody');
		const pageCountElement = document.getElementById(HTML_IDS.pageCount);
		const listOfPages = projectConfigModule.getNavigationPages();
		pageCountElement.textContent = `${translateModule.translateInstant('header.info.diagnostics.pagecount')} ${listOfPages.length} (${listOfPages.filter(page => page.cachePage).length} Cached)`;
		for (const page of listOfPages) {
			const processedPageName = page.navigation.isI18nLabel ? translateModule.translateInstant(page.navigation.label) : page.navigation.label;
			const newTableEntry = createTableRow({ name: processedPageName, count: '', cached: page.cachePage ? 'Y' : 'N', nodes: '' });
			newTableEntry.setAttribute('id', `diagnostics-table-${page.pageName}`);
			diagnosticsTableElement.appendChild(newTableEntry);
		}
	}
	function diagnosticsTable(idComponent, pageName) {
		const pageImporterElement = document.getElementById(idComponent);
		const domNodesOnPage = pageImporterElement.getElementsByTagName('*').length;
		const pageTableEntry = document.getElementById(`diagnostics-table-${pageName}`);
		const ch5ComponentsCountForCurrentPage = pageTableEntry.childNodes[1];
		const domNodesForCurrentPage = pageTableEntry.childNodes[3];
		ch5ComponentsCountForCurrentPage.textContent = `${CrComLib.countNumberOfCh5Components(pageImporterElement).total}`;
		domNodesForCurrentPage.textContent = domNodesOnPage;
	}
	function updateDiagnosticsOnPageChange(idComponent, pageConfiguration) {
		// Wait for the page to load
		const diagnosticsPageChangeInterval = setInterval(() => {
			// if (resources.length || templateAppLoaderModule.pageDurationList.size > 0) {
			clearInterval(diagnosticsPageChangeInterval);
			const totalCh5Components = document.getElementById(HTML_IDS.totalComponents);
			const currentDomNodes = document.getElementById(HTML_IDS.totalDom);
			const currentCh5Components = document.getElementById(HTML_IDS.currentComponents);
			let totalCh5Count = 0;
			let totalDomCount = 0;
			let totalComponentsOnPage = 0;
			let preloadPageList = [];
			const listOfPages = projectConfigModule.getNavigationPages();
			listOfPages.forEach(page => {
				if (page.preloadPage) preloadPageList.push(page);
			})

			if (!processedPages.has(pageConfiguration.pageName)) {
				diagnosticsTable(pageConfiguration.pageName + "-import-page", pageConfiguration.pageName);
				processedPages.add(pageConfiguration.pageName);
				diagnosticsPageChangeChanged = true;
			}
			if (pageConfiguration.navigation.sequence === 1) {
				preloadPageList.forEach(pageConfiguration => {
					diagnosticsTable(pageConfiguration.pageName + "-import-page", pageConfiguration.pageName);
				})
			}
			listOfPages.forEach(page => {
				const pageTableEntry = document.getElementById(`diagnostics-table-${page.pageName}`);
				if (pageTableEntry.getElementsByTagName("td")[1].innerText !== "") {
					totalCh5Count = totalCh5Count + Number(pageTableEntry.getElementsByTagName("td")[1].innerText);
				}
				if (pageTableEntry.getElementsByTagName("td")[3].innerText !== "") {
					totalDomCount = totalDomCount + Number(pageTableEntry.getElementsByTagName("td")[3].innerText);
				}
				const pageImporterElement = document.getElementById(page.pageName + "-import-page");
				if (!pageImporterElement) return;
				totalComponentsOnPage = totalComponentsOnPage + Number(CrComLib.countNumberOfCh5Components(pageImporterElement).total);
			})
			totalCh5Components.innerHTML = totalCh5Count.toString();
			currentDomNodes.innerHTML = totalDomCount.toString();
			currentCh5Components.textContent = totalComponentsOnPage.toString();

			updateSubscriptions();
		}, 1000);
	}

	function handleUnloadedPageCount(oldPageObject) {
		// Workaround because page 1 is called twice one after another
		const unloadPageIdInterval = setInterval(() => {
			if (diagnosticsPageChangeChanged) {
				clearInterval(unloadPageIdInterval);
				diagnosticsPageChangeChanged = false;
				if (!oldPageObject.cachePage) {
					const currentCh5Components = document.getElementById(HTML_IDS.currentComponents);

					const oldPageTableEntry = document.getElementById(`diagnostics-table-${oldPageObject.pageName}`);
					if (oldPageTableEntry) {
						currentCh5Components.textContent = `${(currentCh5Components.textContent)}`;
					}
				}
			}
		}, 150);
	}

	function setTabsListeners() {
		const versionTab = document.getElementById(HTML_IDS.versionTab);
		const diagnosticsTab = document.getElementById(HTML_IDS.diagnosticsTab);
		const webxpanelTab = document.getElementById(HTML_IDS.webxpanelTab);

		const versionTabContent = document.getElementById(HTML_IDS.versionTabContent);
		const diagnosticsTabContent = document.getElementById(HTML_IDS.diagnosticsTabContent);
		const webxpanelTabContent = document.getElementById(HTML_IDS.webxpanelTabContent);

		const showTabContentVersionBind = showTabContent.bind(null, versionTabContent, versionTab);
		const showTabContentDiagnosticsBind = showTabContent.bind(null, diagnosticsTabContent, diagnosticsTab);
		const showTabContentWebxpanelBind = showTabContent.bind(null, webxpanelTabContent, webxpanelTab);

		versionTab.addEventListener('click', showTabContentVersionBind)
		diagnosticsTab.addEventListener('click', showTabContentDiagnosticsBind)
		webxpanelTab.addEventListener('click', showTabContentWebxpanelBind)
	}

	function showTabContent(currentElement, parentTab) {
		if (parentTab.classList.contains('selected')) {
			return;
		}

		const previousSelectedTab = document.querySelector('#tab-wrapper .selected');

		if (previousSelectedTab) {
			previousSelectedTab.classList.remove('selected');
			const previousSelectedContent = document.querySelector(`#${TAB_TO_CONTENT[previousSelectedTab.id]}`);
			previousSelectedContent.style.display = 'none';
		}

		currentElement.style.display = 'block';
		parentTab.classList.add('selected');
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
		handleUnloadedPageCount,
		logSubscriptionsCount
	};
})();