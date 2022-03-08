// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

/*global CrComLib, translateModule, serviceModule, utilsModule, templatePageModule */

const templateVersionInfoModule = (() => {
	'use strict';

	let appName = null;
	let appVersion = null;
	let errorClass = "version-error";


	/**
	 * Initialize Method
	 */
	function onInit() {
		getAppVersionInfo();
		versionInformation();
	}

	/**
	 * Fetch app version info from manifest file.
	 */
	function getAppVersionInfo() {
		serviceModule.loadJSON("./assets/data/app.manifest.json", (response) => {
			response = JSON.parse(response);
			appName = response.appName;
			appVersion = response.appVersion;
			let _appVersionEl = document.getElementById("appVersion");
			if (!!appName && !!appVersion && !!_appVersionEl) {
				let _successMessage = `${appName} Version: ${appVersion}`;
				_appVersionEl.classList.remove(errorClass);
				_appVersionEl.innerHTML = _successMessage;
			} else {
				_appVersionEl.classList.add(errorClass);
				_appVersionEl.innerHTML = `Error: While fetching sample project version.`;
			}
		});
	}

	/**
	 * Display Crestron Component Library version information using ch5-modal-dialog.
	 */
	function versionInformation() {
		let _crComLibVersion = CrComLib.version;
		let _crComBuildDate = CrComLib.buildDate;
		let _versionEl = document.getElementById("versionDescription");
		if (!!_crComLibVersion && !!_crComBuildDate && !!_versionEl) {
			let _successMessage = `Crestron Component Library<span>Version: ${_crComLibVersion}</span><span>Build date: ${_crComBuildDate}</span>`;
			_versionEl.classList.remove(errorClass);
			_versionEl.innerHTML = _successMessage;
		} else {
			_versionEl.classList.add(errorClass);
			_versionEl.innerHTML = `Error: While fetching crestron component library version.`;
		}
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
	return {};

})();