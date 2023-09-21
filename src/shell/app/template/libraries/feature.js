
/* global CrComLib, projectConfigModule, loggerService, templateVersionInfoModule */

const featureModule = (() => {
  'use strict';

  let projectThemes = [];

  function setProjectThemes(projectThemesInput) {
    projectThemes = projectThemesInput;
  }
  /**
   * This is public method to change the theme
   * @param {string} theme pass theme type like 'light-theme', 'dark-theme'
   */
  function changeTheme(theme) {
    setTimeout(() => {
      let body = document.body;
      for (let i = 0; i < projectThemes.length; i++) {
        body.classList.remove(projectThemes[i].name);
      }
      let selectedThemeName = theme.trim();
      body.classList.add(selectedThemeName);
      let selectedTheme = projectThemes.find((tempObj) => tempObj.name.trim().toLowerCase() === selectedThemeName.toLowerCase());
      const cacheBustVersion = "?v=" + (new Date()).getTime();
      document.getElementById("shellTemplateSelectedThemeCss").setAttribute("href", "./assets/css/" + selectedTheme.extends + ".css" + cacheBustVersion);

      // if (document.getElementById("brandLogo")) {
      //   document.getElementById("brandLogo").setAttribute("url", selectedTheme.brandLogo.url);
      // }

      if (document.getElementById("brandLogo")) {
        if (selectedTheme.brandLogo !== "undefined") {
          for (var prop in selectedTheme.brandLogo) {
            if (selectedTheme.brandLogo[prop] !== "") {
              document.getElementById("brandLogo").setAttribute(prop, selectedTheme.brandLogo[prop]);
            }
          }
        }
      }

      const templateContentBackground = document.getElementById("template-content-background");
      if (templateContentBackground) {
        if (selectedTheme.backgroundProperties !== "undefined") {
          for (let prop in selectedTheme.backgroundProperties) {

            if (prop === "url") {
              if (typeof selectedTheme.backgroundProperties.url === "object") {
                selectedTheme.backgroundProperties.url = selectedTheme.backgroundProperties.url.join(" | ");
              }
            }
            if (prop === "backgroundColor") {
              if (typeof selectedTheme.backgroundProperties.backgroundColor === "object") {
                selectedTheme.backgroundProperties.backgroundColor = selectedTheme.backgroundProperties.backgroundColor.join(' | ');
              }
            }

            if (selectedTheme.backgroundProperties[prop] !== "") {
              templateContentBackground.setAttribute(prop, selectedTheme.backgroundProperties[prop]);
            }
          }
        }
      }
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
    setProjectThemes,
    initializeLogger,
    logDiagnostics
  };

})();
