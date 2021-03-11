// Copyright (C) 2020 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.
const fs = require("fs"); // global object - always available
const process = require("process"); // global object - always available
const fsExtra = require("fs-extra");
const path = require('path');
const zl = require("zip-lib");
const rimraf = require("rimraf");

process.env["NODE_CONFIG_DIR"] = "./shell-utilities/config/";
const config = require("config");

const componentHelper = require("../helpers/components");
const packageJson = require("../../package.json");
const logger = require("../helpers/logger");
const namingHelpers = require("../helpers/naming-helpers");
const utils = require("../helpers/utils");

const exportProject = {

  CONFIG_FILE: config.exportProject,

  /**
   * Public Method called to exporting project
   */
  run() {
    const processArgs = componentHelper.processArgs();
    if (processArgs["help"] === true) {
      componentHelper.displayHelp(this.CONFIG_FILE.templatesPath + "help.template");
    } else {
      this.exportProject();
    }
  },

  /**
   * Method for exporting project
   */
  async exportProject() {
    let fileName = namingHelpers.removeAllSpaces(String(packageJson.name).trim());
    logger.log("  File Name: " + fileName);

    let completeFileName = this.CONFIG_FILE.zipFileDestinationPath + fileName + ".zip";
    logger.log("  Complete File Name: " + completeFileName);
    this.deleteFile(completeFileName);

    let folderPathName = packageJson.name + "-Code-Folder-Temp";
    let folderPathActual = this.createTempFolder(folderPathName);
    logger.log("  Temp Folder Path: " + folderPathActual);

    let excludedFiles = this.CONFIG_FILE.ignoreFilesFolders;
    excludedFiles.push(folderPathName);

    const output = await this.copyFiles(folderPathActual, excludedFiles, completeFileName);
    return output;
  },

  /**
   * Copy Files
   * @param {*} folderPathActual 
   * @param {*} excludedFiles 
   * @param {*} completeFileName 
   */
  async copyFiles(folderPathActual, excludedFiles, completeFileName) {
    try {
      const out = await fsExtra
        .copy("./", folderPathActual, {
          filter: (path) => {
            let isValidOutput = true;
            for (let i = 0; i < excludedFiles.length; i++) {
              if (path.indexOf(excludedFiles[i]) > -1) {
                logger.log("path ===", path);
                isValidOutput = false;
              }
            }
            return isValidOutput;
          },
        })
        .then(async () => {
          logger.info("Copy Done.");
          const output = await this.zipFiles(folderPathActual, completeFileName);
          logger.info("output.", output);
          return output;
        })
        .catch((err) => {
          logger.error(err);
          return false;
        });
      return out;
    } catch (e) {
      logger.error(e);
      return false;
    }
  },

  /**
   * Zip files
   * @param {*} folderPathActual 
   * @param {*} completeFileName 
   */
  async zipFiles(folderPathActual, completeFileName) {
    const output = await zl.archiveFolder(folderPathActual, completeFileName).then(async () => {
      logger.info("Zip Done.");
      try {
        await rimraf.sync(folderPathActual);
        logger.info("Clean up Done.");
        logger.printSuccess(this.getText("SUCCESS_MESSAGE", completeFileName));
        return true;
      } catch (e) {
        logger.log(e);
        return false;
      }
    }, (err) => {
      logger.log(err);
      return false;
    });
    return output;
  },

  /**
   * Get the String output from default.json file in config
   * @param {*} key 
   * @param  {...any} values 
   */
  getText(key, ...values) {
    const DYNAMIC_TEXT_MESSAGES = this.CONFIG_FILE.textMessages;
    return utils.getText(DYNAMIC_TEXT_MESSAGES, key, ...values);
  },

  /**
   * Create Temporary Folder for copy files before zipping
   */
  createTempFolder(folderPathName) {
    let folderPathActual = this.CONFIG_FILE.zipFileDestinationPath + folderPathName;
    fs.mkdirSync(folderPathActual, {
      recursive: true,
    });
    return folderPathActual;
  },

  /**
   * Delete directory by path
   * @param {string} directoryName
   */
  deleteFolder(directoryName) {
    try {
      return rimraf(directoryName);
    } catch (e) {
      return false;
    }
  },

  /**
   * Delete File
   * @param {string} completeFilePath
   */
  async deleteFile(completeFilePath) {
    try {
      return await rimraf.sync(completeFilePath);
    } catch (e) {
      return false;
    }
  }

};

module.exports = exportProject;