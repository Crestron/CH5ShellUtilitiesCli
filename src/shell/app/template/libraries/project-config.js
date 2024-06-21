/* global CrComLib, serviceModule, utilsModule */

const projectConfigModule = (() => {
	'use strict';

	/**
	 * All public and local properties
	 */
	let projectConfigJson = null;
	let appMainfestJson = null;

	/**
	 * This method is used to fetch project-config.json file
	 */
	function readProjectConfigJsonFromFile() {
		return new Promise((resolve, reject) => {
			serviceModule.loadJSON("./assets/data/project-config.json", (dataResponse) => {
				projectConfigJson = JSON.parse(dataResponse);
				resolve(projectConfigJson);
			}, error => {
				reject(error);
			});
		});
	}

	/**
	 * This method is used to fetch project-config.json file
	 */
	function readAppManifestJsonFromFile() {
		return new Promise((resolve, reject) => {
			serviceModule.loadJSON("./assets/data/app.manifest.json", (dataResponse) => {
				appMainfestJson = JSON.parse(dataResponse);
				resolve(appMainfestJson);
			}, error => {
				reject(error);
			});
		});
	}

	function getAllStandAloneViewPages() {
		return projectConfigJson.content.pages.filter((pageObj) => {
			return (!utilsModule.isValidObject(pageObj.navigation) && pageObj.standAloneView === true);
		});
	}

	function defaultActiveViewIndex() {
		let activeView = 0; //set the default
		if (projectConfigJson.content.$defaultView === "undefined" && projectConfigJson.content.$defaultView.trim() === "") {
			return activeView;
		}

		let seqObject = projectConfigModule.getNavigationPages();
		for (let i = 0; i < seqObject.length; i++) {
			if (seqObject[i].pageName.trim().toLowerCase() === projectConfigJson.content.$defaultView.trim().toLowerCase()) {
				activeView = i;
				break;
			}
		}
		return activeView;
	}

	function getMenuOrientation() {
		return projectConfigJson.menuOrientation;
	}

	function getNonNavigationPages() {
		return projectConfigJson.content.pages.filter(page => page.navigation === undefined);
	}

	function getNavigationPages() {
		return projectConfigJson.content.pages.filter(page => page.navigation !== undefined).sort(utilsModule.dynamicSort("asc", "navigation", "sequence"));
	}

	function getAllPages() {
		return projectConfigJson.content.pages;
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
		return getCustomPageUrl(projectConfigJson.footer.$component);
	}

	function getCustomHeaderUrl() {
		return getCustomPageUrl(projectConfigJson.header.$component);
	}

	async function projectConfigData() {
		if (projectConfigJson !== null) {
			return projectConfigJson;
		} else {
			// wait until the promise returns us a value
			const result = await readProjectConfigJsonFromFile();
			return result;
		}
	}

	async function appMainfestData() {
		if (appMainfestJson !== null) {
			return appMainfestJson;
		} else {
			// wait until the promise returns us a value
			const result = await readAppManifestJsonFromFile();
			return result;
		}
	}

	/**
	 * All public method and properties exporting here
	 */
	return {
		getAllPages,
		projectConfigData,
		appMainfestData,
		getNavigationPages,
		getNonNavigationPages,
		getAllStandAloneViewPages,
		defaultActiveViewIndex,
		getCustomHeaderUrl,
		getCustomFooterUrl,
		getMenuOrientation
	};

})();
