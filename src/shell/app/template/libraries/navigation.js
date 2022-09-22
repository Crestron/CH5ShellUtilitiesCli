/*jslint es6 */
/*global CrComLib, projectConfigModule, templatePageModule, translateModule, serviceModule, utilsModule, templateAppLoaderModule, templateVersionInfoModule */

const navigationModule = (() => {
	'use strict';


	let displayInfo;
	let displayHeader;

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

	function goToPage(pageName) {
		const navigationPages = projectConfigModule.getAllPages();
		const pageObject = navigationPages.find(page => page.pageName === pageName);
		templateAppLoaderModule.showLoading(pageObject);
		const listOfNavigationButtons = document.querySelectorAll('ch5-button[id*=menu-list-id-');
		const url = pageObject.fullPath + pageObject.fileName;
		const routeId = pageObject.pageName + "-import-page";
		const listOfPages = projectConfigModule.getNavigationPages();
		for (let i = 0; i < listOfPages.length; i++) {
			if (routeId !== listOfPages[i].pageName + "-import-page") {
				CrComLib.publishEvent('b', listOfPages[i].pageName + "-import-page-show", false);
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
		let loadedSubId = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:' + pageObject.pageName + '-import-page', (value) => {
			if (value['loaded']) {
				if (displayInfo === undefined) {
					projectConfigModule.projectConfigData().then(projectConfigResponse => {
						displayInfo = projectConfigResponse.header.displayInfo;
						displayHeader = projectConfigResponse.header.display;
						if (displayInfo && displayHeader) {
							listOfNavigationButtons.forEach(e => e.children[0].style.pointerEvents = "none");
							templateVersionInfoModule.updateDiagnosticsOnPageChange(pageObject);
						}
					})
				} else if (displayInfo && displayHeader) {
					listOfNavigationButtons.forEach(e => e.children[0].style.pointerEvents = "none");
					templateVersionInfoModule.updateDiagnosticsOnPageChange(pageObject);
				}
				setTimeout(() => {
					CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:' + pageObject.pageName + '-import-page', loadedSubId);
					loadedSubId = '';
				});
			}
		});
	}
	return {
		goToPage
	};

})();
