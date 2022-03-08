
/* global CrComLib, projectConfigModule, loggerService */

const featureModule = (() => {
  'use strict';

  let themeTimer = null;

  /**
   * This is public method to change the theme
   * @param {string} theme pass theme type like 'light-theme', 'dark-theme'
   */
  function changeTheme(theme) {
    clearTimeout(themeTimer);
    themeTimer = setTimeout(() => {
      projectConfigModule.projectConfigData().then((response) => {
        let selectedTheme;
        let body = document.body;
        for (let i = 0; i < response.themes.length; i++) {
          body.classList.remove(response.themes[i].name);
        }
        let selectedThemeName = "";
        if (theme && theme !== "") {
          selectedThemeName = theme.trim();
        } else {
          selectedThemeName = response.selectedTheme.trim();
        }
        body.classList.add(selectedThemeName);
        selectedTheme = response.themes.find((tempObj) => tempObj.name.trim().toLowerCase() === selectedThemeName.trim().toLowerCase());

        if (document.getElementById("brandLogo")) {
          document.getElementById("brandLogo").setAttribute("url", selectedTheme.brandLogo.url);
        }
      });
    }, 500);
  }

  /**
   * Initialize remote logger
   * @param {string} hostName - docker server IPaddress / Hostname
   * @param {string} portNumber - docker server Port number
   */
  function initializeLogger(hostName, portNumber) {
    setTimeout(() => {
      loggerService.setRemoteLoggerConfig(hostName, portNumber);
    });
  }

  /**
   * All public method and properties exporting here
   */
  return {
    changeTheme,
    initializeLogger
  };

})();
