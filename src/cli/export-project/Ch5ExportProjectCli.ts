// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCli } from "../Ch5BaseClassForCli";
import { ICh5Cli } from "../ICh5Cli";

const fs = require("fs");
const zl = require("zip-lib");
const fsExtra = require("fs-extra");
const path = require('path');

export class Ch5ExportProjectCli extends Ch5BaseClassForCli implements ICh5Cli {

  public constructor() {
    super("export-project");
  }

  /**
   * Method for exporting project
   */
  async run() {
    const packageJson: any = JSON.parse(JSON.stringify(fsExtra.readJSONSync("./package.json")));

    let fileName = this.namingHelper.removeAllSpaces(String(packageJson.name).trim());
    this.logger.log("File Name: " + fileName);

    const completeFileName = path.join(this.getConfigNode("zipFileDestinationPath"), fileName + ".zip");
    this.logger.log("Complete File Name: " + completeFileName);
    await this.utils.deleteFile(completeFileName);

    const folderPathName = packageJson.name + "-Code-Folder-Temp";
    const folderPathActual = this.createTempFolder(folderPathName);
    this.logger.log("Temp Folder Path: " + folderPathActual);

    const excludedFiles = this.getConfigNode("ignoreFilesFolders");
    excludedFiles.push(folderPathName);

    const includedFiles: string[] = packageJson.files;
    includedFiles.push("./");
    const output = await this.copyFiles(folderPathActual, excludedFiles, includedFiles, completeFileName);
    return output;
  }

  /**
   * Copy Files
   * @param {*} folderPathActual
   * @param {*} excludedFiles
   * @param {*} includedFiles
   * @param {*} completeFileName
   */
  async copyFiles(folderPathActual: string, excludedFiles: string[], includedFiles: string[], completeFileName: string) {
    try {
      const out = await fsExtra.copy("./", folderPathActual, {
        filter: (path: any) => {
          let isValidOutput = true;
          for (let i: number = 0; i < excludedFiles.length; i++) {
            if (path.indexOf(excludedFiles[i]) > -1) {
              this.logger.log("excluded path: ", path);
              isValidOutput = false;
            }
          }
          if (isValidOutput === true) {
            isValidOutput = false;
            for (let i: number = 0; i < includedFiles.length; i++) {
              let pathCheck: string = this.utils.replaceAll(includedFiles[i], "/", "");
              pathCheck = this.utils.replaceAll(pathCheck, "*", "");
              if (path.indexOf(pathCheck) > -1) {
                isValidOutput = true;
                break;
              }
            }
          }
          return isValidOutput;
        }
      }).then(async () => {
        this.logger.info("Copy Done.");
        const output = await this.zipFiles(folderPathActual, completeFileName);
        this.logger.info("output.", output);
        return output;
      }).catch((err: any) => {
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
        let cleanupPath: string = this.getConfigNode("temporaryFilePath");
        if (cleanupPath === this.getConfigNode("zipFileDestinationPath")) {
          cleanupPath = folderPathActual;
        }
        this.utils.deleteFolder(cleanupPath);
        this.logger.info("Clean up Done for the path: " + cleanupPath);
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
    let folderPathActual = this.getConfigNode("temporaryFilePath") + folderPathName;
    fs.mkdirSync(folderPathActual, {
      recursive: true,
    });
    return folderPathActual;
  }

}
