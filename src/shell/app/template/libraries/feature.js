
/* global CrComLib, projectConfigModule, loggerService, templateVersionInfoModule */

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
   * Log information in specific interval as mentioned in project-config.json
   * @param {string} duration duration to log issues
   * @returns 
   */
  function logDiagnostics(duration) {
    let delay = 0;
    let logInterval;
    if (duration === "none") {
      return;
    } else if (duration === "hourly") {
      delay = 60 * 60 * 1000; // 1 hour in msec
    } else if (duration === "daily") {
      delay = 60 * 60 * 1000 * 24; // 24 hour in msec
    } else if (duration === "weekly") {
      delay = 60 * 60 * 1000 * 24 * 7; // Weekly in msec
    }

    if (!logInterval) {
      logInterval = setInterval(templateVersionInfoModule.logSubscriptionsCount, delay);
    }
  }

  /**
   * All public method and properties exporting here
   */
  return {
    changeTheme,
    initializeLogger,
    logDiagnostics
  };

})();
