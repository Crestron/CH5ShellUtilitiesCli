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
  var connectParams = config;
  /**
   * Function to set status bar current state - hidden being default
   * @param {*} classNameToAdd
   */
  function setStatus(classNameToAdd = RENDER_STATUS.hide) {
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
  function paramsToObject() {
    const urlString = window.location.href;
    const urlParams = new URL(urlString);
    const params = new URLSearchParams(urlParams.search);
    const result = {}
    for (const [key, value] of params) {
      result[key.toLowerCase()] = value;
    }
    return result;
  }

  /**
   * Get the url params if defined.
   */
  function getWebXPanelUrlParams() {

    const entries = paramsToObject();

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
        const status = document.querySelector('#webxpanel-tab-content .connection .status');
        if (status !== null) {
          status.innerHTML = statusMsgPrefix + msg.detail.status + " " + msg.detail.statusText;
        }
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


      const cs = document.querySelector('#webxpanel-tab-content .connection .cs');
      const ipId = document.querySelector('#webxpanel-tab-content .connection .ipid');
      const roomId = document.querySelector('#webxpanel-tab-content .connection .roomid');
      cs.textContent = `CS: wss://${connectParams.host}:${connectParams.port}`;
      ipId.textContent = `IPID: ${urlConfig.ipId}`;
      if (msg.detail.roomId !== "") { roomId.textContent = `Room Id: ${msg.detail.roomId}`; }
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
      const status = document.querySelector('#webxpanel-tab-content .connection .status');
      if (status !== null) {
        status.innerHTML = sMsg;
      }
    }
  }

  /**
   * Show the badge on the info icon for connection status.
   */
  function displayConnectionWarning() {
    let infoBtn = document.getElementById("infobtn");
    if (infoBtn) {
      infoBtn.classList.add("warn");
    }
  }

  /**
   * Remove the badge on the info icon.
   */
  function removeConnectionWarning() {

    let infoBtn = document.getElementById("infobtn");
    if (infoBtn) {
      infoBtn.classList.remove("warn");
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

    status = document.querySelector('#webxpanel-tab-content .connection .status');

    webXPanelConnectionStatus();
    // Merge the configuration params, params of the URL takes precedence
    getWebXPanelConfiguration(projectConfig);
    getWebXPanelUrlParams();

    // Assign the combined configuration
    connectParams = urlConfig;

    if (ch5zoomsdk.default) {
      ch5zoomsdk.default.initialize(CrComLib, WebXPanel).then(() => finishConnectingWebXPanel());
    } else {
      finishConnectingWebXPanel();
    }
  }

  function finishConnectingWebXPanel() {
    WebXPanel.default.initialize(connectParams);

    updateInfoStatus("app.webxpanel.status.CONNECT_WS");

    const cs = document.querySelector('#webxpanel-tab-content .connection .cs');
    const ipId = document.querySelector('#webxpanel-tab-content .connection .ipid');
    const roomId = document.querySelector('#webxpanel-tab-content .connection .roomid');
    if (connectParams.host !== "") {
      cs.textContent = `CS: wss://${connectParams.host}:${connectParams.port}`;
    }
    if (connectParams.ipId !== "") {
      ipId.textContent = `IPID: ${Number(connectParams.ipId).toString(16)}`;
    }
    if (connectParams.roomId !== "") {
      roomId.textContent = `Room Id: ${connectParams.roomId}`;
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

  function getWebXPanel(isBrowser) {
    const Panel = WebXPanel.getWebXPanel(isBrowser);
    WebXPanel = { ...Panel, default: Panel.WebXPanel };
  }

  /**
   * All public method and properties exporting here
   */
  return {
    connect,
    getWebXPanel,
    paramsToObject
  };

})();
