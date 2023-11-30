// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement 
// under which you licensed this source code.

/* global CrComLib, WebXPanel, webXPanelModule */

const serviceModule = (() => {
  'use strict';
  /**
   * All public and local(prefix '_') properties
   */
  let ch5Emulator = CrComLib.Ch5Emulator.getInstance();
  let useWebXPanel;
  let initialized = false;
  let noControlSystemEmulatorScenarios = [];

  /**
   * This is public method so that we can use in other module also
   * @param {string} url pass json file path
   * @param {object} callback method to get the json response
   */
  function loadJSON(url, callback) {
    let xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(xhr.responseText);
      }
    };
    xhr.send(null);
  }

  /**
   * This is public method to init the emulator
   * @param {object} emulator pass your emulator response
   */
  function initEmulator(emulator) {
    CrComLib.Ch5Emulator.clear();
    ch5Emulator = CrComLib.Ch5Emulator.getInstance();
    ch5Emulator.loadScenario(emulator);
    ch5Emulator.run();
  }

  /**
   * Load Emulator Json
   * @param {string} url 
   */
  function newJsonLoad(url) {
    // Create new promise with the Promise() constructor;
    // This has as its argument a function with two parameters, resolve and reject
    return new Promise(function (resolve, reject) {
      // Standard XHR to load an image
      let request = new XMLHttpRequest();
      request.open("GET", url);
      request.responseType = "json";
      // When the request loads, check whether it was successful
      request.onload = function () {
        if (request.status === 200 || request.response !== null) {
          // If successful, resolve the promise by passing back the request response
          resolve(request.response);
        } else {
          // If it fails, reject the promise with a error message
          reject(new Error("Json didn't load successfully; error code:" + request.statusText));
        }
      };
      request.onerror = function () {
        // Also deal with the case when the entire request fails to begin with
        // This is probably a network error, so reject the promise with an appropriate message
        reject(new Error("There was a network error."));
      };
      // Send the request
      request.send();
    });
  }

  /**
   * Adding Emulator Scenario only when not running in a Crestron Touch screen
   * @param {string} url 
   */
  function addEmulatorScenarioNoControlSystem(url) {
    noControlSystemEmulatorScenarios.push(url);
    if (initialized) {
      setTimeout(drainQueuedNoControlSystemEmulatorScenarios);
    }
  }

  /**
   * Adding Emulator Scenario
   * @param {string} url 
   */
  function addEmulatorScenario(url) {
    newJsonLoad(url).then(
      (scenario) => {
        if (scenario !== null) {
          ch5Emulator.loadScenario(scenario);
          ch5Emulator.run();
        }
      },
      (err) => {
        console.error("Could not load url as json file:" + url, err);
      }
    );
  }

  function initialize(projectConfigResponse) {
    initialized = true;
    useWebXPanel = projectConfigResponse.useWebXPanel;
    drainQueuedNoControlSystemEmulatorScenarios();
  }

  function drainQueuedNoControlSystemEmulatorScenarios() {
    // CrComLib.isCrestronTouchscreen() will return true when running on TSW and mobile
    // WebXPanel.isActive will return true when when WebXPanel library can attach to control system 
    // useWebXPanel is true when project-config.json 
    // configures to use web xpanel to connect to control system using webxpanel library

    // apply scenario only 
    // not running on TSW and either No XPanel loaded or XPanel disabled 
    if (!CrComLib.isCrestronTouchscreen()
      && ((typeof WebXPanel == 'undefined' || !WebXPanel.isActive) || !useWebXPanel)) {
      for (let index = 0; index < noControlSystemEmulatorScenarios.length; index++) {
        const url = noControlSystemEmulatorScenarios[index];
        addEmulatorScenario(url);
      }
      noControlSystemEmulatorScenarios = [];
    }
  }

  /**
   * All public method and properties exporting here
   */
  return {
    initialize,
    loadJSON,
    initEmulator,
    addEmulatorScenario,
    addEmulatorScenarioNoControlSystem
  };

})();
