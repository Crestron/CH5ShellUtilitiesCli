/*jslint es6 */
/*global CrComLib, projectConfigModule, translateModule, serviceModule, utilsModule, templateAppLoaderModule */

const templateAppLoaderModule = (() => {
	'use strict';

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
		const isCached = isCachePageLoaded(routeId);
		if (isCached === false) {
			CrComLib.publishEvent('b', routeId + '-show-app-loader', true);
		}
	}

	/**
	 * All public method and properties are exported here
	 */
	return {
		showLoading,
		isCachePageLoaded
	};

})();