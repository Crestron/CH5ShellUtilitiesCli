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

  let projectThemesList = [];

  function onInit() {
    projectConfigModule.projectConfigData().then(projectConfigResponse => {
      //translateModule.initializeDefaultLanguage().then(() => {

        const receiveStateTheme = projectConfigResponse.customSignals.receiveStateTheme || 'template-theme';
        const sendEventTheme = projectConfigResponse.customSignals.sendEventTheme || 'template-theme';

        const projectThemes = projectConfigResponse.themes;
        setThemes(projectConfigResponse.themes);
        const themeList = document.getElementById('template-theme-list');
        let wrapper = `<ch5-button-list orientation="vertical" buttonType="warning" numberOfItems="${projectThemes.length}" columns="1" 
        buttonShape="rounded-rectangle" indexId="idx" loadItems="all"
        receiveStateSelectedButton="selectedTheme">`
        projectThemes.forEach(theme => {
          wrapper +=
            `<ch5-button-list-individual-button 
            onRelease="CrComLib.publishEvent('s','${receiveStateTheme}','${theme.name}')" 
            labelInnerHtml="${theme.name}" >
          </ch5-button-list-individual-button>`
        })
        wrapper += '</ch5-button-list>';
        themeList.innerHTML = wrapper;

        CrComLib.subscribeState('b', 'themebtn.clicked', (value) => {
          if (value.repeatdigital === true && document.getElementById('template-theme').getAttribute('show') === 'false') {
            document.getElementById('template-theme').setAttribute('show', 'true');
          }
        });

        CrComLib.subscribeState('s', receiveStateTheme, (value) => {
          // Conditions to check theme value
          const validValue = !!projectThemes.find(theme => theme.name === value);
          const noValue = value === "";

          // change theme if valid
          if (validValue || noValue) {
            setTimeout(() => {
              document.getElementById('template-theme').setAttribute('show', 'false');
            }, 50);

            const theme = validValue === true ? value : projectConfigResponse.selectedTheme;
            changeTheme(theme);
            if (receiveStateTheme !== sendEventTheme && sendEventTheme?.trim()) {
              CrComLib.publishEvent('s', sendEventTheme, theme);
            }
          }
        });
      //});

    });
  }

  function setThemes(listInput) {
    projectThemesList = listInput;
  }

  /**
   * This is public method to change the theme
   * @param {string} theme pass theme type like 'light-theme', 'dark-theme'
   */
  function changeTheme(theme) {
    const body = document.body;
    for (let i = 0; i < projectThemesList.length; i++) {
      body.classList.remove(projectThemesList[i].name);
    }
    let selectedThemeName = theme.trim();
    if (!body.classList.contains(selectedThemeName)) {
      body.classList.add(selectedThemeName);
    }

    let selectedTheme = projectThemesList.find((tempObj) => tempObj.name.trim().toLowerCase() === selectedThemeName.toLowerCase());
    if (document.getElementById("brandLogo")) {
      if (selectedTheme.brandLogo !== "undefined") {
        for (const prop in selectedTheme.brandLogo) {
          if (selectedTheme.brandLogo[prop] !== "") {
            document.getElementById("brandLogo").setAttribute(prop, selectedTheme.brandLogo[prop]);
          }
        }
      }
    }

    const templateContentBackground = document.getElementById("template-content-background");
    if (templateContentBackground) {
      // CH5C-28506: added the below subscription to fix background color issue
      CrComLib.subscribeState('o', 'appLoad', (value) => {
        if (value['loaded']) {
          const element = window.getComputedStyle(document.body);
          const styleValue = element.getPropertyValue("--theme-colors--theme-background-color");
          if (styleValue && styleValue.trim() !== "") {
            templateContentBackground.setAttribute("backgroundColor", styleValue);
          }
        }
      }); 
    }
    const themeIndex = projectThemesList.findIndex(ele => ele.name === theme);
    CrComLib.publishEvent('n', 'selectedTheme', themeIndex);
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
    setThemes,
    changeTheme
  };
})();