/*jslint es6 */
/*global CrComLib, projectConfigModule, templatePageModule, translateModule, serviceModule, utilsModule, templateAppLoaderModule */

const navigationModule = (() => {
	'use strict';

	function goToPage(pageName) {
		const navigationPages = projectConfigModule.getAllPages();
		const pageObject = navigationPages.find(page => page.pageName === pageName);
		templateAppLoaderModule.showLoading(pageObject.pageName + "-import-page");
		setTimeout(() => {
			const url = pageObject.fullPath + pageObject.fileName;
			// TODO - Handle using promises
			// Load child 
			const routeId = pageObject.pageName + "-import-page";
			// CrComLib.publishEvent('b', routeId + '-show', true);
			// checkIfExists(url, pageObject);
			showPage(pageObject.pageName + "-import-page", url);
		});
	}

	function checkIfExists(url, navigationPage) {
		const routeId = navigationPage.pageName + "-import-page";
		if (document.getElementById(routeId) && templatePageModule.isPageLoaded()) {
			showPage(routeId, url);
		} else {
			// console.log("Validate if Url Exists", routeId, document.getElementById(routeId), templatePageModule.isPageLoaded());
			setTimeout(() => {
				checkIfExists(url, navigationPage);
			}, 1000);
		}
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

	function removeAllChildNodes(parent) {
		while (parent.firstChild) {
			parent.removeChild(parent.firstChild);
		}
	}

	function showPage(routeId, url) {
		templateAppLoaderModule.showLoading(routeId);
		const listOfPages = projectConfigModule.getNavigationPages();
		for (let i = 0; i < listOfPages.length; i++) {
			// document.getElementById(listOfPages[i].pageName + "-import-page").classList.add("ch5-hide-dis");
			// document.getElementById(listOfPages[i].pageName + "-import-page").setAttribute("receiveStateShow", listOfPages[i].pageName + "-import-page-show");
			// CrComLib.publishEvent('b', listOfPages[i].pageName + "-import-page-show", false);

			if (listOfPages[i].cachePage === false && listOfPages[i].preloadPage === false) {
				// document.getElementById(listOfPages[i].pageName + "-import-page").setAttribute("url", listOfPages[i].fullPath + listOfPages[i].fileName);
				// document.getElementById(listOfPages[i].pageName + "-import-page").innerHTML = "";
				// document.getElementById(listOfPages[i].pageName + "-import-page").setAttribute("url", "");
				// removeAllChildNodes(document.getElementById(listOfPages[i].pageName + "-import-page").children[0]);
				if (routeId !== listOfPages[i].pageName + "-import-page") {
					CrComLib.publishEvent('b', listOfPages[i].pageName + "-import-page-show", false);
				}
			}
			// document.getElementById(listOfPages[i].pageName + "-import-page").setAttribute("noShowType", "remove");
		}

		// setTimeout required becos hiding is not happening instantaneously with show. Show comes first sometimes.
		setTimeout(() => {
			if (!isCachePageLoaded(routeId)) {
				if (document.getElementById(routeId)) {
					document.getElementById(routeId).setAttribute("url", url);
				}
				CrComLib.publishEvent('b', routeId + '-show', true);
			}
			// templateAppLoaderModule.hideLoading(routeId, isCachePageLoaded(routeId));
			CrComLib.publishEvent('b', routeId + '-show-app-loader', false);
			templatePageModule.hideLoading(); // TODO - check - fix with mutations called in callbakcforhideloading
			// document.getElementById(routeId).classList.remove("ch5-hide-dis");
		}, 50);
	}

	return {
		goToPage
	};

})();
