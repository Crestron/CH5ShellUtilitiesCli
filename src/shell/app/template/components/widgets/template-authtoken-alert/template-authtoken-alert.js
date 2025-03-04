// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

/*global CrComLib, translateModule, serviceModule, utilsModule, templateAppLoaderModule, templatePageModule, projectConfigModule, projectConfigModule */

const templateAuthtokenAlertModule = (() => {
	'use strict';

	// Handle the escape key 
	document.addEventListener("keydown", function (event) {
		let alertFlag = document.getElementById('authtoken-alert').getAttribute('show');
		if (event.key === 'Escape' && alertFlag) {
			event.stopPropagation();
		}
	});

	/**
	 * private method for page class initialization
	 */
	let loadedImportSnippet = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:template-authtoken-alert-import-page', (value) => {
		if (value['loaded']) {
			setTimeout(() => {
				CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:template-authtoken-alert-import-page', loadedImportSnippet);
				loadedImportSnippet = null;
			});
		}
	});

	/**
	 * All public method and properties are exported here
	 */
	return {

	};
})();