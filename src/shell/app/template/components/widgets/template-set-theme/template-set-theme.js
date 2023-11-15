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

      const receiveStateTheme = projectConfigResponse.customSignals.receiveStateTheme || 'template-theme';
      const sendEventTheme = projectConfigResponse.customSignals.sendEventTheme || 'template-theme';

      projectThemes.forEach(theme => {
        themeList.innerHTML +=
          `<ch5-button-list-individual-button 
            onRelease="CrComLib.publishEvent('s','${receiveStateTheme}','${theme.name}')" 
            labelInnerHtml="${theme.name}" >
          </ch5-button-list-individual-button>`
      })

      CrComLib.subscribeState('b', 'themebtn.clicked', (value) => {
        if (value.repeatdigital === true && document.getElementById('template-theme').getAttribute('show') === 'false') {
          document.getElementById('template-theme').setAttribute('show', 'true');
        }
      })

      CrComLib.subscribeState('s', receiveStateTheme, (value) => {

        // Conditions to check theme value
        const validValue = document.body.classList.contains(value) === false && !!projectThemes.find(theme => theme.name === value);
        const noValue = value === "" && document.body.classList.contains(projectConfigResponse.selectedTheme) === false;

        // change theme if valid
        if (validValue || noValue) {

          document.getElementById('template-theme').setAttribute('show', 'false');

          const theme = validValue === true ? value : projectConfigResponse.selectedTheme;
          featureModule.changeTheme(theme);

          if (receiveStateTheme !== sendEventTheme && sendEventTheme?.trim()) {
            CrComLib.publishEvent('s', sendEventTheme, theme);
          }
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