// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

/* global WebXPanel, translateModule*/

var webXPanelModule = (function () {
  "use strict";

  const config = {
    "host": window.location.hostname,
    "port": 49200,
    "roomId": "",
    "ipId": "0x03",
    "tokenSource": "",
    "tokenUrl": ""
  };

  const RENDER_STATUS = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    hide: 'hide',
    loading: 'loading'
  };

  var status;
  var pcConfig = config;
  var urlConfig = config;
  var isDisplayHeader = false;
  var isEmptyHeaderComponent = true;
  var isDisplayInfo = false;
  var connectParams = config;
  /**
   * Function to set status bar current state - hidden being default
   * @param {*} classNameToAdd
   */
  function setStatus(classNameToAdd = RENDER_STATUS.hide) {
    if (!isDisplayHeader) {
      return;
    }

    let preloader = document.getElementById('pageStatusIdentifier');
    if (preloader) {
      preloader.className = classNameToAdd;
    }
  }

  /**
   * Get WebXPanel configuration present in project-config.json
   */
  function getWebXPanelConfiguration(projectConfig) {
    if (projectConfig.config && projectConfig.config.controlSystem) {
      pcConfig.host = projectConfig.config.controlSystem.host || config.host;
      pcConfig.port = projectConfig.config.controlSystem.port || config.port;
      pcConfig.roomId = projectConfig.config.controlSystem.roomId || config.roomId;
      pcConfig.ipId = projectConfig.config.controlSystem.ipId || config.ipId;
      pcConfig.tokenSource = projectConfig.config.controlSystem.tokenSource || config.tokenSource;
      pcConfig.tokenUrl = projectConfig.config.controlSystem.tokenUrl || config.tokenUrl;
    }
  }

  /**
   * Convert the URL search params from string to object
   * The key should be in lowercase.
   * @param {object} entries
   * @returns
   */
  function paramsToObject(entries) {
    const result = {}
    for (const [key, value] of entries) {
      result[key.toLowerCase()] = value;
    }
    return result;
  }

  /**
   * Get the url params if defined.
   */
  function getWebXPanelUrlParams() {
    const urlString = window.location.href;
    const urlParams = new URL(urlString);
    const params = new URLSearchParams(urlParams.search);
    const entries = paramsToObject(params);

    // default host should be the IP address of the PC
    urlConfig.host = entries["host"] || pcConfig.host;
    urlConfig.port = entries["port"] || pcConfig.port;
    urlConfig.roomId = entries["roomid"] || pcConfig.roomId;
    urlConfig.ipId = entries["ipid"] || pcConfig.ipId;
    urlConfig.tokenSource = entries["tokensource"] || pcConfig.tokenSource;
    urlConfig.tokenUrl = entries["tokenurl"] || pcConfig.tokenUrl;
  }

  /**
   * Set the listeners for WebXPanel
   */
  function setWebXPanelListeners() {
    // A successful WebSocket connection has been established
    WebXPanel.default.addEventListener(WebXPanel.WebXPanelEvents.CONNECT_WS, (event) => {
      updateInfoStatus("app.webxpanel.status.CONNECT_WS");
    });

    WebXPanel.default.addEventListener(WebXPanel.WebXPanelEvents.DISCONNECT_CIP, (msg) => {
      updateInfoStatus("app.webxpanel.status.DISCONNECT_CIP");
      displayConnectionWarning();
    });

    WebXPanel.default.addEventListener(WebXPanel.WebXPanelEvents.ERROR_WS, (msg) => {
      updateInfoStatus("app.webxpanel.status.ERROR_WS");
      displayConnectionWarning();
    });

    WebXPanel.default.addEventListener(WebXPanel.WebXPanelEvents.AUTHENTICATION_FAILED, (msg) => {
      updateInfoStatus("app.webxpanel.status.AUTHENTICATION_FAILED");
      displayConnectionWarning();
    });

    WebXPanel.default.addEventListener(WebXPanel.WebXPanelEvents.AUTHENTICATION_REQUIRED, (msg) => {
      updateInfoStatus("app.webxpanel.status.AUTHENTICATION_REQUIRED");
      displayConnectionWarning();
    });

    WebXPanel.default.addEventListener(WebXPanel.WebXPanelEvents.FETCH_TOKEN_FAILED, (msg) => {
      if (msg.detail && msg.status) {
        let statusMsgPrefix = translateModule.translateInstant("app.webxpanel.statusmessageprefix");
        status.innerHTML = statusMsgPrefix + msg.detail.status + " " + msg.detail.statusText;
      } else {
        updateInfoStatus("app.webxpanel.status.FETCH_TOKEN_FAILED");
      }
      displayConnectionWarning();
    });

    WebXPanel.default.addEventListener(WebXPanel.WebXPanelEvents.CONNECT_CIP, (msg) => {
      setStatus(RENDER_STATUS.success);
      removeConnectionWarning();

      // Hide the bar after 10 seconds
      setTimeout(() => {
        setStatus(RENDER_STATUS.hide);
      }, 10000);
      updateInfoStatus("app.webxpanel.status.CONNECT_CIP");

      if (isVersionInfoDisplayed()) {
        document.querySelector('#webxpanel-tab-content .connection .cs').textContent = `CS: wss://${connectParams.host}:${connectParams.port}`;
        document.querySelector('#webxpanel-tab-content .connection .ipid').textContent = `IPID: ${urlConfig.ipId}`;
        if (msg.detail.roomId !== "") {
          document.querySelector('#webxpanel-tab-content .connection .roomid').textContent = `Room Id: ${msg.detail.roomId}`;
        }
      }
    });

    // Authorization
    WebXPanel.default.addEventListener(WebXPanel.WebXPanelEvents.NOT_AUTHORIZED, ({ detail }) => {
      const redirectURL = detail.redirectTo;
      updateInfoStatus("app.webxpanel.status.NOT_AUTHORIZED");

      setTimeout(() => {
        console.log("redirecting to " + redirectURL);
        window.location.replace(redirectURL);
      }, 3000);
    });
  }

  /**
   * Update info status if Info icon is enabled
   */
  function updateInfoStatus(statusMessageKey) {
    let statusMsgPrefix = translateModule.translateInstant("app.webxpanel.statusmessageprefix");
    let statusMessage = translateModule.translateInstant(statusMessageKey);
    if (statusMessage) {
      let sMsg = statusMsgPrefix + statusMessage;
      if (isVersionInfoDisplayed()) {
        status.innerHTML = sMsg;
      } else {
        console.log(sMsg);
      }
    }
  }

  function isVersionInfoDisplayed() {
    return (isDisplayInfo && isEmptyHeaderComponent && isDisplayHeader);
  }
  /**
   * Show the badge on the info icon for connection status.
   */
  function displayConnectionWarning() {
    if (!isVersionInfoDisplayed()) {
      return;
    }

    let classArr = document.getElementById("infobtn").classList;
    if (classArr) {
      classArr.add("warn");
    }
  }

  /**
   * Remove the badge on the info icon.
   */
  function removeConnectionWarning() {
    if (!isVersionInfoDisplayed()) {
      return;
    }

    let classArr = document.getElementById("infobtn").classList;
    if (classArr) {
      classArr.remove("warn");
    }
  }

  /**
   * Show WebXPanel connection status
   */
  function webXPanelConnectionStatus() {
    //Display the connection animation on the header bar
    setStatus(RENDER_STATUS.loading);

    // Hide the animation after 30 seconds
    setTimeout(() => {
      setStatus(RENDER_STATUS.hide);
    }, 30000);
  }


  /**
   * Connect to the control system through websocket connection.
   * Show the status in the header bar using CSS animation.
   * @param {object} projectConfig
   */
  function connectWebXPanel(projectConfig) {
    connectParams = config;

    isDisplayHeader = projectConfig.header.display;
    /**
     * if the header is false then displayInfo needs to be false
     * even if it is set as true in project-config.json
     */
    isDisplayInfo = projectConfig.header.displayInfo;
    isEmptyHeaderComponent = (projectConfig.header.$component === "") ? true : false;

    // Show the connection bar when true
    if (isVersionInfoDisplayed()) {
      status = document.querySelector('#webxpanel-tab-content .connection .status');
    }

    webXPanelConnectionStatus();

    // Merge the configuration params, params of the URL takes precedence
    getWebXPanelConfiguration(projectConfig);
    getWebXPanelUrlParams();

    // Assign the combined configuration
    connectParams = urlConfig;

    WebXPanel.default.initialize(connectParams);

    updateInfoStatus("app.webxpanel.status.CONNECT_WS");

    if (isVersionInfoDisplayed()) {
      if (connectParams.host !== "") {
        document.querySelector('#webxpanel-tab-content .connection .cs').textContent = `CS: wss://${connectParams.host}:${connectParams.port}`;
      }
      if (connectParams.ipId !== "") {
        document.querySelector('#webxpanel-tab-content .connection .ipid').textContent = `IPID: ${Number(connectParams.ipId).toString(16)}`;
      }
      if (connectParams.roomId !== "") {
        document.querySelector('#webxpanel-tab-content .connection .roomid').textContent = `Room Id: ${connectParams.roomId}`;
      }
    }

    // WebXPanel listeners are called in the below method
    setWebXPanelListeners();
  }

  /**
   * Initialize WebXPanel
   */
  function connect(projectConfig) {
    // Connect only in browser environment
    if (typeof WebXPanel !== "undefined" && WebXPanel.isActive) {
      connectWebXPanel(projectConfig);
    } else {
      return;
    }
  }

  /**
   * All public method and properties exporting here
   */
  return {
    connect
  };

})();
