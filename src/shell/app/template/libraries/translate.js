// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement 
// under which you licensed this source code.
/* global CrComLib, serviceModule, utilsModule */

const translateModule = (() => {
  'use strict';

  /**
   * All public and local properties
   */
  const langData = [];
  const crComLibTranslator = CrComLib.translationFactory.translator;
  const DEFAULT_LANGUAGE = "en";
  let currentLanguage = "en";
  let languageToSet = "";
  let isTranslationLoaded = false;

  /**
   * This is public method to fetch language data(JSON).
   * @param {string} lng is language code string like en, fr etc...
   */

  function getLanguage(lng) {
    return new Promise((resolve, reject) => {
      if (langData[lng]) {
        console.log("Exists", langData[lng]);
        resolve();
      } else {
        let output = {};
        loadJSON("./app/project/assets/data/translation/", lng).then((responseProject) => {
          output = utilsModule.mergeJSON(output, responseProject);
          loadJSON("./app/template/assets/data/translation/", lng).then((responseTemplate) => {
            output = utilsModule.mergeJSON(output, responseTemplate);
            langData[lng] = {
              translation: output,
            };
            resolve();
          }).catch(() => {
            loadJSON("./app/template/assets/data/translation/", DEFAULT_LANGUAGE).then((responseTemplate) => {
              output = utilsModule.mergeJSON(output, responseTemplate);
              langData[lng] = {
                translation: output,
              };
              resolve();
            }).catch(() => {
              output = utilsModule.mergeJSON(output, responseTemplate);
              langData[lng] = {
                translation: output,
              };
              resolve();
            });
          });
        }).catch(() => {
          // No project json exists
          loadJSON("./app/template/assets/data/translation/", lng).then((responseTemplate) => {
            output = utilsModule.mergeJSON(output, responseTemplate);
            langData[lng] = {
              translation: output,
            };
            resolve();
          }).catch(() => {
            loadJSON("./app/template/assets/data/translation/", DEFAULT_LANGUAGE).then((responseTemplate) => {
              output = utilsModule.mergeJSON(output, responseTemplate);
              langData[lng] = {
                translation: output,
              };
              resolve();
            }).catch(() => {
              reject("Missing template files");
            });
          });
        });
      }
    });
  }

  function initializeDefaultLanguage() {
    return new Promise((resolve) => {
      if (!isTranslationLoaded) {
        projectConfigModule.projectConfigData().then((projectConfigResponse) => {
          const receiveStateLanguage = projectConfigResponse.customSignals.receiveStateLanguage || "template-language";
          const sendEventLanguage = projectConfigResponse.customSignals.sendEventLanguage || "template-language";
          CrComLib.subscribeState("s", receiveStateLanguage, (value) => {
            if (!(value && value !== "")) {
              value = DEFAULT_LANGUAGE;
            }
            setLanguage(value, receiveStateLanguage, sendEventLanguage).then(() => {
              isTranslationLoaded = true;
              resolve();
            });
          });
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * 
   * @param {String} keyInput 
   * @param {Object} values 
   */
  function translateInstant(keyInput, values) {
    try {
      return crComLibTranslator.t(keyInput, values);
    } catch (e) {
      return keyInput[0];
    }
  }

  function loadJSON(path, lng) {
    return new Promise((resolve, reject) => {
      const url = path + lng + ".json";
      promisifyLoadJSON(url)
        .then((response) => {
          resolve(JSON.parse(response));
        }).catch(() => {
          reject("No File Found");
        });
    });
  }

  function promisifyLoadJSON(url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function () {
        reject({
          status: xhr.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }

  /**
   * Set the language
   * @param {string} lng
   */
  function setLanguage(lng, receiveStateLanguage, sendEventLanguage) {
    return new Promise((resolve) => {
      getLanguage(lng).then(() => {
        crComLibTranslator.changeLanguage(lng);
        currentLanguage = lng;
        const responseArrayForNavPages = projectConfigModule.getNavigationPages();
        for (let i = 0; i < responseArrayForNavPages.length; i++) {
          const menu = document.getElementById("menu-list-id-" + i);
          if (menu) {
            if (responseArrayForNavPages[i].navigation.isI18nLabel === true) {
              menu.setAttribute("label", translateModule.translateInstant(responseArrayForNavPages[i].navigation.label));
            } else {
              menu.setAttribute("label", responseArrayForNavPages[i].navigation.label);
            }
          }
        }
        if (receiveStateLanguage !== sendEventLanguage && sendEventLanguage?.trim()) {
          if (lng !== languageToSet) { // Required since this will address multiple send requests.
            languageToSet = lng;
            CrComLib.publishEvent('s', sendEventLanguage, lng);
          }
        }
        resolve();
      });
    });
  }

  /**
   * This is private method to init ch5 i18next translate library
   */
  function initCh5LibTranslate() {
    CrComLib.registerTranslationInterface(crComLibTranslator, "-+", "+-");
    crComLibTranslator.init({
      fallbackLng: "en",
      language: currentLanguage,
      debug: true,
      resources: langData,
    });
  }

  /**
   * All public or private methods which need to call on init
   */
  initCh5LibTranslate();

  /**
   * All public method and properties exporting here
   */
  return {
    initializeDefaultLanguage,
    translateInstant
  };
})();