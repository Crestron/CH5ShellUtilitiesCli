/*jslint es6 */
/*global CrComLib, projectConfigModule, translateModule, serviceModule, utilsModule, templateAppLoaderModule */

const templateAppLoaderModule = (() => {
	'use strict';

	let isPageLoadingInProgress = false;
	let pageDurationList = new Map();

	const debounce = (func, wait) => {
		let timeout;
		return function executedFunction(...args) {
			const later = () => {
				window.clearTimeout(timeout);
				func(...args);
			};
			// if (timeout) {
			window.clearTimeout(timeout);
			// }
			timeout = window.setTimeout(later, wait);
		};
	};

	const debounceSetButtonDisplay = debounce(() => {
		callBackForHideLoading();
	}, 30);

	/**
	 * Set the page name in the page duration map
	 */
	function initializePageDuration() {
		let listOfPages = projectConfigModule.getNavigationPages();

		for (const page of listOfPages) {
			const startDuration = 0;
			const endDuration = 0;
			const loadDuration = 0;
			pageDurationList.set(page.pageName, { startDuration, endDuration, loadDuration });
		}
	}

	/**
	 * This sets the end duration for the page in milliseconds. This is set only once for the page.
	 * @param {object} pageObject contains page information
	 */
	function beginPageLoad(pageObject) {
		if (pageDurationList.has(pageObject.pageName)) {
			let obj = pageDurationList.get(pageObject.pageName);
			obj.startDuration = new Date().getTime();
		}
	}

	/**
	 * This sets the end duration for the page in milliseconds. The page name
	 * should be present and the endDuration value should be zero.
	 * @param {object} pageObject contains page information
	 */
	function endPageLoad(pageObject) {
		let loadTime = 0;
		if (pageDurationList.has(pageObject.pageName)) {
			let obj = pageDurationList.get(pageObject.pageName);
			if (obj.endDuration === 0) {
				obj.endDuration = (new Date()).getTime();
			}
			loadTime = obj.endDuration - obj.startDuration;
			obj.loadDuration = loadTime > 0 ? loadTime : 0; // avoid any negative values 
		}
	}

	/**
	 * Loader method is for spinner
	 */
	function hideLoading(id) {
		isPageLoadingInProgress = false;
		// Select the node that will be observed for mutations
		const targetNode = document.getElementById(id);

		// Options for the observer (which mutations to observe)
		const config = { attributes: true, childList: true, subtree: true };

		// Callback function to execute when mutations are observed
		const callback = function (mutationsList, observer) {
			// Use traditional 'for loops' for IE 11
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList' || mutation.type === 'attributes') {
					debounceSetButtonDisplay();
					break;
				}
			}
		};

		// Create an observer instance linked to the callback function
		const observerNew = new MutationObserver(callback);

		// Start observing the target node for configured mutations
		observerNew.observe(targetNode, config);

		// Later, you can stop observing
		// observerNew.disconnect();

	}

	function callBackForHideLoading() {
		isPageLoadingInProgress = false;
		setTimeout(() => {
			const appLoader = document.getElementById("template-app-loader-import-page");
			if (appLoader) {
				document.getElementById("loader").style.display = "none";
			}
		}, 50);
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

	function showLoading(pageObject) {
		const routeId = pageObject.pageName + "-import-page";
		templateAppLoaderModule.beginPageLoad(pageObject);
		const isCached = isCachePageLoaded(routeId);
		if (isCached === false) {
			isPageLoadingInProgress = true;
			CrComLib.publishEvent('b', routeId + '-show-app-loader', true);
		}
	}

	/**
	 * All public method and properties are exported here
	 */
	return {
		showLoading,
		hideLoading,
		beginPageLoad,
		endPageLoad,
		initializePageDuration,
		pageDurationList
	};

})();