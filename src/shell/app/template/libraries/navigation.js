/*jslint es6 */
/*global CrComLib, projectConfigModule, templatePageModule, translateModule, serviceModule, utilsModule, templateAppLoaderModule, templateVersionInfoModule */

const navigationModule = (() => {
	'use strict';

	let currentPageName = '';

	let displayInfo;
	let displayHeader;

	function goToPage(pageName) {
		const navigationPages = projectConfigModule.getAllPages();
		const pageObject = navigationPages.find(page => page.pageName === pageName);
		templateAppLoaderModule.showLoading(pageObject);
		// Remove the elements that were removed from the diagnostics tab
		if (currentPageName) {
			templateVersionInfoModule.handleUnloadedPageCount(navigationPages.find(page => page.pageName === currentPageName));
		}
		currentPageName = pageName;
		setTimeout(() => {
			const url = pageObject.fullPath + pageObject.fileName;
			// TODO - Handle using promises
			showPage(pageObject, url);
		});
	}

	function isCachePageLoaded(routeId) {
		if (document.getElementById(routeId)) {
			return document.getElementById(routeId).hasAttribute("url") &&
				document.getElementById(routeId).getAttribute("url") !== null &&
				document.getElementById(routeId).getAttribute("url") !== undefined &&
				document.getElementById(routeId).getAttribute("url") !== "";
		} else {
			return false;
		}
	}

	function showPage(pageObject, url) {
		const routeId = pageObject.pageName + "-import-page";
		const listOfPages = projectConfigModule.getNavigationPages();
		for (let i = 0; i < listOfPages.length; i++) {
			// if (listOfPages[i].cachePage === false && listOfPages[i].preloadPage === false) {

			if (routeId !== listOfPages[i].pageName + "-import-page") {
				const htmlImportSnippet = document.getElementById(listOfPages[i].pageName + "-import-page");
				// if (htmlImportSnippet.hasAttribute("receivestateshow")) {
				CrComLib.publishEvent('b', listOfPages[i].pageName + "-import-page-show", false);
				// }
			}
		}

		// setTimeout required because hiding is not happening instantaneously with show. Show comes first sometimes.
		setTimeout(() => {
			if (!isCachePageLoaded(routeId)) {
				if (document.getElementById(routeId)) {
					document.getElementById(routeId).setAttribute("url", url);
				}
				CrComLib.publishEvent('b', routeId + '-show', true);
			}
			// LOADING INDICATOR - Uncomment the below line along with code in template-page.js file to enable loading indicator
			// CrComLib.publishEvent('b', routeId + '-show-app-loader', false);
			templatePageModule.hideLoading(pageObject); // TODO - check - fix with mutations called in callbakcforhideloading
		}, 50);

		// Allow components and pages to be transitioned
		setTimeout(() => {
			if (displayInfo === undefined) {
				projectConfigModule.projectConfigData().then(projectConfigResponse => {
					displayInfo = projectConfigResponse.header.displayInfo;
					displayHeader = projectConfigResponse.header.display;
					if (displayInfo && displayHeader) {
						templateVersionInfoModule.updateDiagnosticsOnPageChange(routeId, pageObject);
					}
				})
			} else if (displayInfo && displayHeader) {
				templateVersionInfoModule.updateDiagnosticsOnPageChange(routeId, pageObject);
			}
		}, 100);
	}

	return {
		goToPage
	};

})();
