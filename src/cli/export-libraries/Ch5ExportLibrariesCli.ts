// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCli } from "../Ch5BaseClassForCli";
import { ICh5Cli } from "../ICh5Cli";

const path = require('path');
const fs = require("fs");
const fsExtra = require("fs-extra");
const zl = require("zip-lib");
const findRemoveSync = require('find-remove');

export class Ch5ExportLibrariesCli  extends Ch5BaseClassForCli implements ICh5Cli  {

  private outputResponse: any = {};
  private finalOutputZipFile: string = "";

  public constructor() {
    super("export-libraries");
  }

  /**
   * Method for exporting libraries
   */
  async run() {
    this.outputResponse = {};
    this.finalOutputZipFile = path.join(this.getConfigNode("zipFileDestinationPath"), this.getConfigNode("outputFileName"));

    if (this.inputArguments["all"] === true) {
      if (fs.existsSync(this.getConfigNode("requiredFolderPath"))) {
        if (fs.readdirSync(this.getConfigNode("requiredFolderPath")).length > 0) {
          await this.copyAndZipFiles([], true);
        } else {
          this.outputResponse['result'] = false;
          this.outputResponse['errorMessage'] = this.getText("FAILURE_MESSAGE_NO_FILES_IN_DIR");
          this.logFinalResponses();
        }
      } else {
        this.outputResponse['result'] = false;
        this.outputResponse['errorMessage'] = this.getText("FAILURE_MESSAGE_NO_DIR");
        this.logFinalResponses();
      }
    } else {
      let inputNames = this.inputArguments["list"];
      this.logger.log("inputNames", inputNames);
      if (inputNames && inputNames.length > 0) {
        await this.copyAndZipFiles(inputNames, false);
      } else {
        this.outputResponse['result'] = false;
        this.outputResponse['errorMessage'] = this.getText("FAILURE_MESSAGE_INPUT_PARAMS_EMPTY_IN_REQUEST");
        this.logFinalResponses();
      }
    }
    return this.outputResponse['result'];
  }

  /**
   * Log Final Response Message
   * @param {*} errorMessage
   */
  logFinalResponses() {
    if (this.utils.isValidInput(this.outputResponse['errorMessage'])) {
      this.logger.printError(this.outputResponse['errorMessage']);
    } else {
      if (this.outputResponse['result'] === true) {
        if (this.outputResponse['copyAll'] === true) {
          this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_ALL", this.finalOutputZipFile));
        } else {
          if (this.outputResponse['invalidInputs'].length > 0) {
            this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_SPECIFIC_WITH_ERROR", this.finalOutputZipFile, this.utils.convertArrayToString(this.outputResponse['validInputs'], ", "), this.utils.convertArrayToString(this.outputResponse['invalidInputs'], ", ")));
          } else {
            this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_SPECIFIC", this.finalOutputZipFile, this.utils.convertArrayToString(this.outputResponse['validInputs'], ", ")));
          }
        }
      } else {
        this.logger.printError(this.outputResponse['errorMessage']);
      }
    }
  }

  /**
   * Copy and Zip files
   * @param {*} inputNames
   * @param {*} copyAll
   */
  async copyAndZipFiles(inputNames:string[], copyAll:boolean) {
    const invalidInputs = [];
    const validInputs = [];
    this.outputResponse['copyAll'] = copyAll;

    let zipFileName = path.join(this.getConfigNode("zipFileDestinationPath"), this.getConfigNode("outputFileName"));
    this.logger.log("  Complete File Name: " + zipFileName);
    await this.utils.deleteFile(zipFileName);

    const temporaryFolderPath = path.join(this.getConfigNode("zipFileDestinationPath"), this.getConfigNode("outputTempFolderName"));
    try {
       this.utils.deleteFolder(temporaryFolderPath);
      //Create Temporary Folder for copy files before zipping
      fs.mkdirSync(temporaryFolderPath, {
        recursive: true,
      });
      this.logger.log("  Temp Folder Path Created: " + temporaryFolderPath);

      if (copyAll === true) {
        fsExtra.copySync(this.getConfigNode("requiredFolderPath"), path.join(temporaryFolderPath, this.getConfigNode("zipFolderName"), path.normalize(this.getConfigNode("requiredFolderPath"))), { recursive: true });
      } else {
        for (let i:number = 0; i < inputNames.length; i++) {
          if (path.normalize(inputNames[i]).indexOf(path.normalize(this.getConfigNode("requiredFolderPath"))) >= 0) {
            if (fs.existsSync(inputNames[i])) {
              const checkFileOrFolder = fs.statSync(inputNames[i]);
              if (checkFileOrFolder && checkFileOrFolder.isFile()) {
                if (validInputs.indexOf(inputNames[i]) === -1) {
                  validInputs.push(inputNames[i]);
                  fsExtra.copySync(inputNames[i], path.join(temporaryFolderPath, this.getConfigNode("zipFolderName"), path.normalize(inputNames[i])), { recursive: true });
                }
              } else {
                if (invalidInputs.indexOf(inputNames[i]) === -1) {
                  invalidInputs.push(inputNames[i]);
                }
              }
            } else {
              if (invalidInputs.indexOf(inputNames[i]) === -1) {
                invalidInputs.push(inputNames[i]);
              }
            }
          } else {
            if (invalidInputs.indexOf(inputNames[i]) === -1) {
              invalidInputs.push(inputNames[i]);
            }
          }
        }
      }

      this.outputResponse['validInputs'] = validInputs;
      this.outputResponse['invalidInputs'] = invalidInputs;
      this.logger.info("Copy Done.");

      if (copyAll === true || validInputs.length > 0) {
        const removedFiles = findRemoveSync(temporaryFolderPath, { extensions: this.getConfigNode("ignoreFilesFolders"), files: this.getConfigNode("ignoreFilesFolders") });
        this.logger.log("RemovedFiles", removedFiles);

        const outputArchive = await zl.archiveFolder(temporaryFolderPath, zipFileName).then(async () => {
          this.logger.info("Zip Done.");
          try {
             this.utils.deleteFolder(temporaryFolderPath);
            this.logger.info("Clean up Done.");
            this.outputResponse['result'] = true;
            this.outputResponse['errorMessage'] = "";
            this.logFinalResponses();
          } catch (e) {
            this.outputResponse['result'] = false;
            this.outputResponse['errorMessage'] = e;
            this.logFinalResponses();
          }
        } ,(err: any) => {
          this.outputResponse['result'] = false;
          this.outputResponse['errorMessage'] = err;
          this.logFinalResponses();
        });
      } else {
        this.outputResponse['result'] = false;
        this.utils.deleteFolder(temporaryFolderPath);
        if (validInputs.length === 0) {
          this.outputResponse['errorMessage'] = this.getText("FAILURE_MESSAGE_NO_VALID_INPUTS");
        } else {
          this.outputResponse['errorMessage'] = this.getText("FAILURE_MESSAGE_NO_VALID_FILES_IN_DIR");
        }
        this.logFinalResponses();
      }
    } catch (e) {
      this.outputResponse['result'] = false;
      this.utils.deleteFolder(temporaryFolderPath);
      this.outputResponse['errorMessage'] = e;
      this.logFinalResponses();
    }
  }

}
