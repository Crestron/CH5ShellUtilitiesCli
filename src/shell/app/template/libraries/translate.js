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
  let langData = [];
  let crComLibTranslator = CrComLib.translationFactory.translator;
  let currentLng = document.getElementById("currentLng");
  let defaultLng = "en";
  let languageTimer;
  let setLng = "en";
  let firstLoad = false;

  /**
   * This is public method to fetch language data(JSON).
   * @param {string} lng is language code string like en, fr etc...
   */
  function getLanguage(lng) {
    return new Promise((resolve, reject) => {
      if (!langData[lng]) {
        let output = {};
        loadJSON("./app/template/assets/data/translation/", lng).then((responseTemplate) => {
          output = utilsModule.mergeJSON(output, responseTemplate);
          loadJSON("./app/project/assets/data/translation/", lng).then((responseProject) => {
            output = utilsModule.mergeJSON(output, responseProject);
            langData[lng] = {
              translation: output,
            };
            setLanguage(lng);
            resolve();
          });
        }).catch((error) => {
          loadJSON("./app/project/assets/data/translation/", lng).then((responseProject) => {
            output = utilsModule.mergeJSON(output, responseProject);
            langData[lng] = {
              translation: output,
            };
            setLanguage(lng);
            resolve();
          })
        });
      } else {
        setLanguage(lng);
        resolve();
      }
    });
  }

  function checkLangSubscription() {
    firstLoad = true;
    projectConfigModule.projectConfigData().then((projectConfigResponse) => {
      const receiveStateLanguage = projectConfigResponse.customSignals.receiveStateLanguage || "template-language";
      const sendEventLanguage = projectConfigResponse.customSignals.sendEventLanguage || "template-language";
      CrComLib.subscribeState("s", receiveStateLanguage, (value) => {
        if (value) {
          getLanguage(value).then(() => {
            if (langData[value]) {
              setLanguage(value);
            } else {
              setLanguage(defaultLng);
            }
            if (receiveStateLanguage !== sendEventLanguage && sendEventLanguage?.trim()) {
              CrComLib.publishEvent('s', sendEventLanguage, value);
            }
          })
        }
      })
    })
  }


  function initializeDefaultLanguage() {
    return new Promise((resolve, reject) => {
      if (!firstLoad) {
        checkLangSubscription();
      }
      if (!langData[defaultLng]) {
        let output = {};
        loadJSON("./app/template/assets/data/translation/", defaultLng).then((responseTemplate) => {
          output = utilsModule.mergeJSON(output, responseTemplate);
          loadJSON("./app/project/assets/data/translation/", defaultLng).then((responseProject) => {
            output = utilsModule.mergeJSON(output, responseProject);
            langData[defaultLng] = {
              translation: output,
            };
            setLanguage(defaultLng);
            resolve();
          });
        }).catch((error) => {
          loadJSON("./app/project/assets/data/translation/", defaultLng).then((responseProject) => {
            output = utilsModule.mergeJSON(output, responseProject);
            langData[defaultLng] = {
              translation: output,
            };
            setLanguage(defaultLng);
            resolve();
          });
        });
      } else {
        setLanguage(defaultLng);
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
      serviceModule.loadJSON(path + lng + ".json", (response) => {
        if (response) {
          resolve(JSON.parse(response));
        } else {
          reject("FILE NOT FOUND");
        }
      }, error => {
        reject("FILE NOT FOUND");
      });
    });
  }

  /**
   * Set the language
   * @param {string} lng
   */
  function setLanguage(lng) {
    // update selected language
    crComLibTranslator.changeLanguage(lng);
    setLng = lng;
    let responseArrayForNavPages = projectConfigModule.getNavigationPages();
    for (let i = 0; i < responseArrayForNavPages.length; i++) {
      const menu = document.getElementById("menu-list-id-" + i);
      if (responseArrayForNavPages[i].navigation.isI18nLabel === true) {
        menu.setAttribute("label", translateModule.translateInstant(responseArrayForNavPages[i].navigation.label));
      } else {
        menu.setAttribute("label", responseArrayForNavPages[i].navigation.label);
      }
    }
  }

  /**
   * This is private method to init ch5 i18next translate library
   */
  function initCh5LibTranslate() {
    CrComLib.registerTranslationInterface(crComLibTranslator, "-+", "+-");
    crComLibTranslator.init({
      fallbackLng: "en",
      language: currentLng,
      debug: true,
      resources: langData,
    });
  }

  /**
   * This is public method, it invokes on language change
   * @param {string} lng is language code string like en, fr etc...
   */
  function changeLang(lng) {
    clearTimeout(languageTimer);
    languageTimer = setTimeout(() => {
      if (lng !== defaultLng) {
        defaultLng = lng;
        // invoke language
        getLanguage(lng);
      }
    }, 500);
  }

  /**
   * 
   */
  function getTranslator() {
    return crComLibTranslator;
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
    getLanguage,
    changeLang,
    currentLng,
    defaultLng,
    getTranslator,
    translateInstant
  };
})();
