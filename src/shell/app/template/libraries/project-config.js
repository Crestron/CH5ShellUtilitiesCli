/* global CrComLib, serviceModule, utilsModule */

const projectConfigModule = (() => {
	'use strict';

	/**
	 * All public and local properties
	 */
	let response = null;

	/**
	 * This method is used to fetch project-config.json file
	 */
	function initialize() {
		return new Promise((resolve, reject) => {
			serviceModule.loadJSON("./assets/data/project-config.json", (dataResponse) => {
				response = JSON.parse(dataResponse);
				resolve(response);
			}, error => {
				reject(error);
			});
		});
	}

	function getAllStandAloneViewPages() {
		return response.content.pages.filter((pageObj) => {
			return (!utilsModule.isValidObject(pageObj.navigation) && pageObj.standAloneView === true);
		});
	}

	function defaultActiveViewIndex() {
		let activeView = 0; //set the default
		if (response.content.$defaultView === "undefined" && response.content.$defaultView.trim() === "") {
			return activeView;
		}

		let seqObject = projectConfigModule.getNavigationPages();
		for (let i = 0; i < seqObject.length; i++) {
			if (seqObject[i].pageName.trim().toLowerCase() === response.content.$defaultView.trim().toLowerCase()) {
				activeView = i;
				break;
			}
		}
		return activeView;
	}

	function getMenuOrientation() {
		return response.menuOrientation;
	}

	function getNonNavigationPages() {
		return response.content.pages.filter(page => page.navigation === undefined);
	}

	function getNavigationPages() {
		return response.content.pages.filter(page => page.navigation !== undefined).sort(utilsModule.dynamicSort("asc", "navigation", "sequence"));
	}

	function getAllPages() {
		return response.content.pages;
	}

	function getCustomPageUrl(pageName) {
		if (pageName && pageName !== "") {
			const page = projectConfigModule.getNonNavigationPages().find(page => page.pageName === pageName);
			return page.fullPath + page.fileName;
		} else {
			return "";
		}
	}

	function getCustomFooterUrl() {
		return getCustomPageUrl(response.footer.$component);
	}

	function getCustomHeaderUrl() {
		return getCustomPageUrl(response.header.$component);
	}

	async function projectConfigData() {
		if (response !== null) {
			return response;
		} else {
			// wait until the promise returns us a value
			let result = await initialize();
			return result;
		}
	}

	/**
	 * All public method and properties exporting here
	 */
	return {
		getAllPages,
		projectConfigData,
		getNavigationPages,
		getNonNavigationPages,
		getAllStandAloneViewPages,
		defaultActiveViewIndex,
		getCustomHeaderUrl,
		getCustomFooterUrl,
		getMenuOrientation
	};

})();
