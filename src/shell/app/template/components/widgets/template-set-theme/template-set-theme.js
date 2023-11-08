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
    projectConfigModule.projectConfigData().then(projectConfigResponse => {
      const projectThemes = projectConfigResponse.themes;
      const themeList = document.getElementById('template-theme-list');
      themeList.setAttribute('numberOfItems', projectThemes.length + '');

      projectThemes.forEach(theme => {
        themeList.innerHTML +=
          `<ch5-button-list-individual-button 
            onRelease="CrComLib.publishEvent('s','${projectConfigResponse.customSignals.receiveStateTheme}','${theme.name}')" 
            labelInnerHtml="${theme.name}" >
          </ch5-button-list-individual-button>`
      })

      CrComLib.subscribeState('b', 'themebtn.clicked', (value) => {
        if (value.repeatdigital === true && document.getElementById('template-theme').getAttribute('show') === 'false') {
          document.getElementById('template-theme').setAttribute('show', 'true');
        }
      })

      CrComLib.subscribeState('s', projectConfigResponse.customSignals.receiveStateTheme, (value) => {
        if (document.body.classList.contains(value) === false && projectThemes.find(theme => theme.name === value)) {
          featureModule.changeTheme(value);
          if (projectConfigResponse.customSignals.receiveStateTheme !== projectConfigResponse.customSignals.sendEventTheme) {
            CrComLib.publishEvent('s', projectConfigResponse.customSignals.sendEventTheme, value);
          }
        } else if (value === "" && document.body.classList.contains(projectConfigResponse.selectedTheme) === false) {
          featureModule.changeTheme(projectConfigResponse.selectedTheme);
        }
      });
    });
  }

  /**
 * private method for page class initialization
 */
  let loadedImportSnippet = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:template-set-theme-import-page', (value) => {
    if (value['loaded']) {
      onInit();
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
  };
})();