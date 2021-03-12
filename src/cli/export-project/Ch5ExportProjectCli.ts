// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import * as commander from "commander";
import { Ch5BaseClassForCli } from "../Ch5BaseClassForCli";

const path = require('path');
const fs = require("fs");
const zl = require("zip-lib");

const fsExtra = require("fs-extra");
const rimraf = require("rimraf");
// console.log("dirName", __dirname);
// const packageJson = require("./package.json");

export class Ch5ExportProjectCli extends Ch5BaseClassForCli {

  private outputResponse: any = {};
  private processArgs: any = [];

  public constructor() {
    super("exportProject");
  }

  public async setupCommand(program: commander.Command) {
    let programObject = program
      .command('export:project')
      .name('export:project')
      .usage('[options]');

    const contentForHelp: string = await this.componentHelper.getAdditionalHelpContent(path.join(this.templateFolderPath, "help.template"));
    programObject = programObject.addHelpText('after', contentForHelp);
    programObject.action((options) => {
      try {
        this.run();
      } catch (e) {
        this.logger.error(e);
      }
    });
  }

  /**
   * Public Method 
   */
  run() {
    this.exportProject();
  }

  /**
   * Method for exporting project
   */
  async exportProject() {
    // let fileName = this.namingHelper.removeAllSpaces(String(packageJson.name).trim());
    // this.logger.log("File Name: " + fileName);

    // const completeFileName = this.getConfigNode("zipFileDestinationPath") + fileName + ".zip";
    // this.logger.log("Complete File Name: " + completeFileName);
    // this.deleteFile(completeFileName);

    // const folderPathName = packageJson.name + "-Code-Folder-Temp";
    // const folderPathActual = this.createTempFolder(folderPathName);
    // this.logger.log("Temp Folder Path: " + folderPathActual);

    // const excludedFiles = this.getConfigNode("ignoreFilesFolders");
    // excludedFiles.push(folderPathName);

    // const output = await this.copyFiles(folderPathActual, excludedFiles, completeFileName);
    // return output;
  }

  /**
   * Copy Files
   * @param {*} folderPathActual 
   * @param {*} excludedFiles 
   * @param {*} completeFileName 
   */
  async copyFiles(folderPathActual: string, excludedFiles: string | any[], completeFileName: string) {
    try {
      const out = await fsExtra
        .copy("./", folderPathActual, {
          filter: (path: string | any[]) => {
            let isValidOutput = true;
            for (let i = 0; i < excludedFiles.length; i++) {
              if (path.indexOf(excludedFiles[i]) > -1) {
                this.logger.log("path ===", path);
                isValidOutput = false;
              }
            }
            return isValidOutput;
          }
        })
        .then(async () => {
          this.logger.info("Copy Done.");
          const output = await this.zipFiles(folderPathActual, completeFileName);
          this.logger.info("output.", output);
          return output;
        })
        .catch((err: any) => {
          this.logger.error(err);
          return false;
        });
      return out;
    } catch (e) {
      this.logger.error(e);
      return false;
    }
  }

  /**
   * Zip files
   * @param {*} folderPathActual 
   * @param {*} completeFileName 
   */
  async zipFiles(folderPathActual: any, completeFileName: string) {
    const output = await zl.archiveFolder(folderPathActual, completeFileName).then(async () => {
      this.logger.info("Zip Done.");
      try {
        await rimraf.sync(folderPathActual);
        this.logger.info("Clean up Done.");
        this.logger.printSuccess(this.getText("SUCCESS_MESSAGE", completeFileName));
        return true;
      } catch (e) {
        this.logger.log(e);
        return false;
      }
    }, (err: any) => {
      this.logger.log(err);
      return false;
    });
    return output;
  }

  /**
   * Create Temporary Folder for copy files before zipping
   */
  createTempFolder(folderPathName: string) {
    let folderPathActual = this.getConfigNode("zipFileDestinationPath") + folderPathName;
    fs.mkdirSync(folderPathActual, {
      recursive: true,
    });
    return folderPathActual;
  }

  /**
   * Delete directory by path
   * @param {string} directoryName
   */
  deleteFolder(directoryName: string) {
    try {
      return rimraf(directoryName);
    } catch (e) {
      return false;
    }
  }

  /**
   * Delete File
   * @param {string} completeFilePath
   */
  async deleteFile(completeFilePath: string) {
    try {
      return await rimraf.sync(completeFilePath);
    } catch (e) {
      return false;
    }
  }

}
