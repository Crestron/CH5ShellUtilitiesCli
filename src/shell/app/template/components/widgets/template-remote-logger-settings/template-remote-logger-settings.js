// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.
/*jslint es6 */
/*global CrComLib, translateModule, serviceModule, utilsModule, templatePageModule */

const templateRemoteLoggerSettingsModule = (() => {
  "use strict";

  let logger;
  let isConfigured = false;
  let appender = {};
  let clickCount = 0;
  let startTimer = 0;
  let ds = null;
  let dsElem = null;
  let rlbtn = null;
  let errorMessage = null;
  let ipAddressElem = null;
  let portNumberElem = null;

  function onInit() {
    ds = document.getElementById("template-dstatus");
    dsElem = document.getElementsByClassName('dockerstatus');
    rlbtn = document.getElementById('template-rlbtn');
    errorMessage = document.querySelector(".ui.error.message");
    ipAddressElem = document.getElementById("loggerIpAddress");
    portNumberElem = document.getElementById("loggerPortNumber");
  }

  /**
   * Reset Status
   */
  function resetStatus() {
    ds.innerHTML = translateModule.translateInstant("app.ch5logger.docker.dockerdisconnected");
    dsElem[0].firstChild.classList.remove("red");
    dsElem[0].firstChild.classList.remove("amber");
    dsElem[0].firstChild.classList.remove("green");
  }

  /**
   * Reset the connection style
   */
  function resetConnection() {
    const errorMessage = document.querySelector(".ui.error.message");
    errorMessage.style.display = "none";
    resetStatus();
    if (logger !== undefined) {
      logger.disconnect();
    }
    disconnect();
  }

  /**
   * Perform actions related to remote logger disconection
   * and set the values for connect
   */
  function disconnect() {
    rlbtn.disabled = false;
    rlbtn.className = "connect";
    ipAddressElem.disabled = false;
    portNumberElem.disabled = false;
    if (logger !== undefined) {
      logger.disconnect();
    }
    rlbtn.innerHTML = translateModule.translateInstant("app.ch5logger.form.connect");
  }

  /**
   * Perform actions related to remote logger disconection
   * and set the values for disconnect
   */
  function connect() {
    rlbtn.disabled = false;
    ipAddressElem.disabled = true;
    portNumberElem.disabled = true;
    rlbtn.className = "disconnect";
    rlbtn.innerHTML = translateModule.translateInstant("app.ch5logger.form.disconnect");
  }

  /**
   * Set the remote logger configuration for docker
   */
  function setRemoteLoggerConfig(hName, pNumber) {
    try {
      // Store hostname and port number
      ipAddressElem.disabled = true;
      portNumberElem.disabled = true;
      rlbtn.disabled = true;

      if (isConfigured) {
        appender.resetIP(hName, pNumber);
        logger = CrComLib.getLogger(appender, true);
      } else {
        appender = CrComLib.getRemoteAppender(hName, pNumber);
        logger = CrComLib.getLogger(appender, true);
        isConfigured = true;

        logger.subscribeDockerStatus.subscribe((message) => {
          if (message !== "") {
            resetStatus();
            if (message === "DOCKER_CONNECTING") {
              rlbtn.innerHTML = translateModule.translateInstant("app.ch5logger.form.connecting");
              dsElem[0].firstChild.classList.add("amber");
            } else if (message === "DOCKER_CONNECTED") {
              connect();
              dsElem[0].firstChild.classList.add("green");
            } else if (message === "DOCKER_ERROR") {
              disconnect();
              dsElem[0].firstChild.classList.add("red");
            }
            message = message.toLowerCase();
            message = message.replace(/_/, "");
            ds.innerHTML = translateModule.translateInstant("app.ch5logger.docker." + message);
          }
        });
      }
    } catch (error) {
      ipAddressElem.disabled = false;
      portNumberElem.disabled = false;
      rlbtn.disabled = false;
      utilsModule.log(error);
    }
  }

  /**
   * Counts the clicks happened in the time difference
   */
  function clickCounter() {
    if (startTimer) {
      if (timeDifference() > 3) {
        resetTimer();
      }
    }
    clickCount += 1;
    if (clickCount == 1) {
      startTimer = Date.now();
    }
  }

  /**
   * Reset the time
   */
  function resetTimer() {
    clickCount = 0;
    startTimer = 0;
  }

  /**
   * Calculate the Time difference
   */
  function timeDifference() {
    const endTimer = Date.now();
    const timerDiff = Math.floor((endTimer - startTimer) / 1000);
    return timerDiff;
  }

  /**
   * Displays the logger popup
   */
  function showLoggerPopUp() {
    const model = document.getElementById("loggerModalWrapper");
    const errorMessage = document.querySelector(".ui.error.message");
    errorMessage.style.display = "none";
    clickCounter();
    if (clickCount === 5) {
      if (timeDifference() <= 3) {
        CrComLib.publishEvent("b", "template-remote-logger.clicked", true);
        model.style.display = "block";
        resetTimer();
      } else {
        CrComLib.publishEvent("b", "template-remote-logger.clicked", false);
        model.style.display = "none";
        resetTimer();
      }
    }
  }

  /**
   * Retrieve the inputs from the form and passes to the setRemoteLoggerConfig()
   */
  function updateLoggerInfo() {
    const hostName = ipAddressElem.value;
    const portNumber = portNumberElem.value;
    if (rlbtn.classList.contains("connect")) {
      setRemoteLoggerConfig(hostName, portNumber);
    } else {
      resetConnection();
    }
  }

  /**
   * Validate the IP Address / Hostname and Port number provided in the form
   */
  function validate() {
    let ipExp = /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/;
    let hostExp = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$/;
    errorMessage.style.display = "none";
    let ip = false;
    let port = false;
    errorMessage.innerHTML = "";
    if (ipAddressElem.value === "" || ipAddressElem.value === undefined || ipAddressElem.value === null) {
      errorMessage.innerHTML = "Please enter IP Address/Hostname";
      errorMessage.style.display = "block";
      return false;
    }
    if (portNumberElem.value === "" || portNumberElem.value === undefined || portNumberElem.value === null) {
      errorMessage.innerHTML = "Please enter Port Number";
      errorMessage.style.display = "block";
      return false;
    }
    if (
      ipAddressElem.value !== undefined &&
      ipAddressElem.value !== null &&
      ipAddressElem.value !== "0.0.0.0" &&
      ipAddressElem.value !== "255.255.255.255" &&
      ipAddressElem.value.length <= 127 &&
      (ipExp.test(ipAddressElem.value) || hostExp.test(ipAddressElem.value))
    ) {
      ip = true;
      errorMessage.style.display = "none";
    } else {
      errorMessage.innerHTML = "Please enter valid IP Address/Hostname";
      errorMessage.style.display = "block";
      return false;
    }
    if (
      portNumberElem.value !== null &&
      !isNaN(portNumberElem.value) &&
      portNumberElem.value >= 1025 &&
      portNumberElem.value < 65536
    ) {
      port = true;
      errorMessage.style.display = "none";
    } else {
      errorMessage.innerHTML = "Please enter valid Port Number between 1025 to 65536";
      errorMessage.style.display = "block";
      return false;
    }
    if (ip && port) {
      errorMessage.style.display = "none";
      updateLoggerInfo();
    }
  }

  /**
 * private method for page class initialization
 */
  let loadedImportSnippet = CrComLib.subscribeState('o', 'ch5-import-htmlsnippet:template-remote-logger-settings-import-page', (value) => {
    if (value['loaded']) {
      setTimeout(() => {
        onInit();
      }, 5000);
      setTimeout(() => {
        CrComLib.unsubscribeState('o', 'ch5-import-htmlsnippet:template-remote-logger-settings-import-page', loadedImportSnippet);
        loadedImportSnippet = null;
      });
    }
  });

  /**
   * All public method and properties are exported here
   */
  return {
    showLoggerPopUp,
    validate,
    resetConnection,
    updateLoggerInfo,
    setRemoteLoggerConfig,
  };
})();