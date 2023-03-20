/*jslint es6 */
/*global CrComLib, projectConfigModule, templatePageModule, translateModule, serviceModule, utilsModule, templateAppLoaderModule, templateVersionInfoModule */

const navigationModule = (() => {
	'use strict';

	let _pageName = "";

	function goToPage(pageName) {
		const navigationPages = projectConfigModule.getAllPages();
		const pageObject = navigationPages.find(page => page.pageName === pageName);
		templateAppLoaderModule.showLoading(pageObject);
		const routeId = pageObject.pageName + "-import-page";
		const listOfPages = projectConfigModule.getNavigationPages();
		for (let i = 0; i < listOfPages.length; i++) {
			if (routeId !== listOfPages[i].pageName + "-import-page") {
				CrComLib.publishEvent('b', listOfPages[i].pageName + "-import-page-show", false);
			}
		}

		// setTimeout required because hiding is not happening instantaneously with show. Show comes first sometimes.
		setTimeout(() => {
			if (!templateAppLoaderModule.isCachePageLoaded(routeId)) {
				if (document.getElementById(routeId)) {
					const url = pageObject.fullPath + pageObject.fileName;
					document.getElementById(routeId).setAttribute("url", url);
				}
				CrComLib.publishEvent('b', routeId + '-show', true);
			}
			// LOADING INDICATOR - Uncomment the below line along with code in template-page.js file to enable loading indicator
			// CrComLib.publishEvent('b', routeId + '-show-app-loader', false);
			templatePageModule.hideLoading(pageObject); // TODO - check - fix with mutations called in callbackforhideloading

			_pageName = pageName;
			// Allow components and pages to be transitioned
			let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:' + pageObject.pageName + '-import-page', (value) => {
				if (value['loaded']) {
					const setTimeoutDelay = pageObject.preloadPage ? 0 : CrComLib.isCrestronTouchscreen() ? 300 : 50;
					setTimeout(() => updateDiagnosticsOnPageChange(pageObject.pageName), setTimeoutDelay);
					setTimeout(() => {
						CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:' + pageObject.pageName + '-import-page', loadedSubId);
						loadedSubId = '';
					});
				}
			});
		}, 50);
	}

	function selectedPage() {
		return _pageName;
	}

	function updateDiagnosticsOnPageChange(pageName) {
		projectConfigModule.projectConfigData().then((projectConfigResponse) => {
			if (projectConfigResponse.header.display === true && projectConfigResponse.header.displayInfo === true && projectConfigResponse.header.$component === ""){
				const pageImporterElement = document.getElementById(pageName + '-import-page');
				if (!pageImporterElement) return;

				// Table Count Updation
				templateVersionInfoModule.tableCount[`${pageName}`] = CrComLib.countNumberOfCh5Components(pageImporterElement);
				templateVersionInfoModule.tableCount[`${pageName}`].domNodes = pageImporterElement.getElementsByTagName('*').length;

				// Current Page Table Row Updation
				const currentPageTableRow = document.getElementById('diagnostics-table-' + pageName);
				currentPageTableRow.childNodes[1].textContent = templateVersionInfoModule.tableCount[`${pageName}`].total;
				currentPageTableRow.childNodes[4].textContent = templateVersionInfoModule.tableCount[`${pageName}`].domNodes;

				// Diagnostic Info Count Updation
				let totalDomCount = 0;
				let totalComponentsCount = 0;
				let currentCh5ComponentsCount = 0;
				const listOfPages = projectConfigModule.getNavigationPages();
				listOfPages.forEach((page) => totalDomCount += templateVersionInfoModule.tableCount[`${page.pageName}`].domNodes || 0);
				listOfPages.forEach((page) => totalComponentsCount += templateVersionInfoModule.tableCount[`${page.pageName}`].total || 0);
				listOfPages.forEach(page => {
					const pageImporterElement = document.getElementById(page.pageName + '-import-page');
					if (pageImporterElement) currentCh5ComponentsCount += CrComLib.countNumberOfCh5Components(pageImporterElement).total;
				});
				document.getElementById('totalDom').innerHTML = templateVersionInfoModule.translateModuleHelper('totalnodes', totalDomCount);
				document.getElementById('totalComponents').innerHTML = templateVersionInfoModule.translateModuleHelper('totalcomponents', totalComponentsCount);;
				document.getElementById('currentComponents').innerHTML = templateVersionInfoModule.translateModuleHelper('currentcomp', currentCh5ComponentsCount);

				// Updating Table Count for Add Log
				templateVersionInfoModule.componentCount.totalDomCount = totalDomCount;
				templateVersionInfoModule.componentCount.totalComponentsCount = totalComponentsCount;
				templateVersionInfoModule.componentCount.currentCh5Components = currentCh5ComponentsCount;
				templateVersionInfoModule.updateSubscriptions();
			}
		});
	}

	return {
		goToPage,
		selectedPage,
		updateDiagnosticsOnPageChange
	};

})();
