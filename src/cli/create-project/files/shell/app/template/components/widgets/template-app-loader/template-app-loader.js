/*jslint es6 */
/*global CrComLib, projectConfigModule, translateModule, serviceModule, utilsModule, templateAppLoaderModule */

const templateAppLoaderModule = (() => {
	'use strict';

	let isPageLoadingInProgress = false;

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
		// console.log("debounceSetButtonDisplay");
		callBackForHideLoading();
	}, 30);

	/**
	 * Loader method is for spinner
	 */
	function hideLoading(id) {
		isPageLoadingInProgress = false;
		// console.log("hideLoading");
		// Select the node that will be observed for mutations
		const targetNode = document.getElementById(id);

		// Options for the observer (which mutations to observe)
		const config = { attributes: true, childList: true, subtree: true };

		// Callback function to execute when mutations are observed
		const callback = function (mutationsList, observer) {
			// Use traditional 'for loops' for IE 11
console.log("MUTATIONS CALLED");
			let callHide = false;
			for (const mutation of mutationsList) {
				if (mutation.type === 'childList' || mutation.type === 'attributes') {
					callHide = true;
					debounceSetButtonDisplay();
					break;

					// console.log('A child node has been added or removed.');
				}
				// else if (mutation.type === 'attributes') {
				// 	console.log('The ' + mutation.attributeName + ' attribute was modified.');
				// }
				// if (callHide === true) {
				// }
			}
		};

		// Create an observer instance linked to the callback function
		const observer = new MutationObserver(callback);

		// Start observing the target node for configured mutations
		observer.observe(targetNode, config);

		// Later, you can stop observing
		// observer.disconnect();

	}

	function callBackForHideLoading() {
		// console.log("callBackForHideLoading",);
		isPageLoadingInProgress = false;
		// if (isCached === false) {
		setTimeout(() => {
			const appLoader = document.getElementById("template-app-loader-import-page");// document.getElementById("app-loader");
			if (appLoader) {
				// appLoader.classList.add("ch5-hide-dis");
				// appLoader.style.display = "none";
				document.getElementById("loader").style.display = "none";
			}
		}, 50);

		// } else {
		// 	const appLoader = document.getElementById("template-app-loader-import-page");// document.getElementById("app-loader");
		// 	if (appLoader) {
		// 		appLoader.classList.add("ch5-hide-dis");
		// 		// appLoader.style.display = "none";
		// 		document.getElementById("loader").style.display = "none";
		// 	}

		// }
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

	function showLoading(routeId) {
		const isCached = isCachePageLoaded(routeId);
		if (isCached === false) {
			console.log("showLoading",  routeId + '-show-app-loader');
			isPageLoadingInProgress = true;
			CrComLib.publishEvent('b', routeId + '-show-app-loader', true);

			// const appLoader = document.getElementById("template-app-loader-import-page");// document.getElementById("app-loader");
			// if (appLoader) {
			// 	// setTimeout(() => {
			// 	appLoader.classList.remove("ch5-hide-dis");
			// 	// appLoader.style.display = "block";
			// 	// }, 100);
			// } else {
			// 	document.getElementById("loader").style.display = "block";
			// }
		}
	}

	/**
	 * All public method and properties are exported here
	 */
	return {
		showLoading,
		hideLoading
	};

})();