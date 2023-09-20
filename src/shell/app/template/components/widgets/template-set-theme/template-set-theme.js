// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.
/*jslint es6 */
/*global CrComLib, translateModule, serviceModule, utilsModule, templatePageModule */

const templateSetThemeModule = (() => {
  "use strict";

  function onInit() {
  }

  function setTheme(themeName) {
    featureModule.changeTheme(themeName);
    // CrComLib.subscribeState('b', 'shellTemplate.projectTheme.sendEventOnClick', (value) => {
    //   console.log('shellTemplate.projectTheme.sendEventOnClick', (value));
    //   let themeName = "light-theme";
    //   if (value === true) {
    //     themeName = "dark-theme";
    //   }
    //   featureModule.changeTheme(projectThemes, themeName);
    //   CrComLib.publishEvent('b', "shellTemplate.projectTheme.receiveStateValue", value);
    // });
  }
  /**
 * private method for page class initialization
 */
  let loadedImportSnippet = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:template-set-theme-import-page', (value) => {
    if (value['loaded']) {
      setTimeout(() => {
        onInit();
      }, 5000);
      setTimeout(() => {
        CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:template-set-theme-import-page', loadedImportSnippet);
        loadedImportSnippet = null;
      });
    }
  });

  /**
   * All public method and properties are exported here
   */
  return {
    setTheme
  };
})();