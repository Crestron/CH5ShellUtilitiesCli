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

const Enquirer = require('enquirer');
const enquirer = new Enquirer();

process.env["NODE_CONFIG_DIR"] = "./shell-utilities/config/";
const config = require("config");

const componentHelper = require("../helpers/components");
const logger = require("../helpers/logger");
const utils = require("../helpers/utils");
const projectConfig = require("../project-config/project-config");

const importAssets = {

  CONFIG_FILE: config.importAssets,
  outputResponse: {},
  folderPaths: {},

  /**
   * Public Method called to exporting components.
   * This method is called from package.json script.
   * If the help parameter is set to true, then the help screen is shown.
   * Otherwise, the process continues to import components.
   */
  run() {
    const processArgs = componentHelper.processArgs();
    if (processArgs["help"] === true) {
      componentHelper.displayHelp(this.CONFIG_FILE.templatesPath + "help.template");
    } else {
      this.importAssets();
    }
  },

  /**
   * Initialize all variables and set module level constants
   */
  initialize() {
    this.outputResponse = {
      result: false,
      errorMessage: "",
      warningMessage: "",
      data: {
        overwriteFiles: false,
        invalidInputFiles: [],
        inputFileExistsInSourceFolder: [],
        sourceFilesInTargetFolder: [],
        newSourceFiles: [],
        listOfFilesWithOverrideFalse: [],
        filesToBeAvoidedFromCopying: []
      }
    };

    this.processArgs = componentHelper.processArgs();

    this.folderPaths = {
      inputZipFileToImport: this.processArgs["zipFile"],
      temporaryLocationForCopiedZipFile: path.join(this.CONFIG_FILE.zipFileDestinationPath, this.CONFIG_FILE.outputFileName),
      temporaryLocationForExtractedFilesFolder: path.join(this.CONFIG_FILE.zipFileDestinationPath, this.CONFIG_FILE.outputTempFolderName),
      temporaryLocationForAllFilesCopyFrom: path.join(this.CONFIG_FILE.zipFileDestinationPath, this.CONFIG_FILE.outputTempFolderName, this.CONFIG_FILE.exportedFolderName),
      temporaryLocationForProjectConfig: path.join(this.CONFIG_FILE.zipFileDestinationPath, this.CONFIG_FILE.outputTempFolderName, this.CONFIG_FILE.exportedFolderName, path.normalize("app/project-config.json"))
    };
  },

  /**
   * Method for importing components
   */
  async importAssets() {
    try {
      // Initialize
      this.initialize();

      // Pre-requisite validations like Check if there are pages to be deleted
      this.checkPrerequisiteValidations();

      // Verify input params
      await this.verifyInputParams();

      // Ask details to developer based on input parameter validation
      await this.checkPromptQuestions();

      // Update project-config first (so that if this fails, we don't worry about file deletion). Next Delete Files
      await this.processRequest();

      // Clean up
      this.cleanUp();

    } catch (e) {
      if (e && utils.isValidInput(e.message)) {
        this.outputResponse.errorMessage = e.message;
      } else {
        this.outputResponse.errorMessage = this.getText("ERRORS.SOMETHING_WENT_WRONG");
        logger.log(e);
      }
    }

    // Show output response
    this.logOutput();

    return this.outputResponse.result; // The return is required to validate in automation test case
  },

  /**
  * Check any validations that need to be done before verifying input parameters
  */
  checkPrerequisiteValidations() {
    // Nothing for this component
  },

  /**
   * Verify input parameters
   */
  async verifyInputParams() {
    if (utils.isValidInput(this.processArgs["zipFile"]) && this.isZipFileValid(this.processArgs["zipFile"])) {
      if (this.processArgs["all"] === false) {
        if (this.processArgs["list"].length === 0) {
          throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAMS_EMPTY_IN_REQUEST"));
        }
      }
    } else {
      throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_ZIP_FILE_MISSING"));
    }

    // Copy zip file from developer input to a temporary location in dist folder.
    fsExtra.copySync(this.folderPaths.inputZipFileToImport, this.folderPaths.temporaryLocationForCopiedZipFile);

    // Unzip the exported zip file.
    const unzip = new zl.Unzip({
      // Called before an item is extracted.
      onEntry: function (event) {
        if (/^__MACOSX\//.test(event.entryName)) {
          // entry name starts with __MACOSX/
          event.preventDefault();
        }
      }
    });

    await rimraf.sync(this.folderPaths.temporaryLocationForExtractedFilesFolder);

    // Extract the developer input zip file into a temporary location in dist folder.
    await unzip.extract(this.folderPaths.temporaryLocationForCopiedZipFile, this.folderPaths.temporaryLocationForExtractedFilesFolder).then(async () => {
      logger.log("Folder unzipped");
    }, (err) => {
      throw new Error(err);
    });

    /*
    If processArgs("all") is false
      Run through all the input files, and check if they exist in the zipped folder to identify Valid, Invalid files
      If overwrite = true or ForceFlag
        overwrite: true will ensure that files already existing are  overwritten
        If invalid files is zero
          Message listing valid files
        Else
          Message showing valid and invalid files
      Else
        overwrite: false will ensure that files already existing are not overwritten
        If invalid files is zero
          Message listing valid files
        Else
          Message showing valid and invalid files
    Else
      In this case, I am not worried if files are valid or not in the zip file.
      The zip file is extracted as an output of export, and so the expectation is that the files are valid.
      If overwrite = true or ForceFlag
        Generic Message
      Else
        Identify the copied files 
    */

    // Check if proper folder exists after unzip.
    // This can happen if user is trying to import assets using exported-components.zip file
    if (!fs.existsSync(path.normalize(this.folderPaths.temporaryLocationForAllFilesCopyFrom))) {
      throw new Error(this.getText("FAILURE_MESSAGE_INVALID_ZIP_FILE_EXTRACT"));
    }

    let inputListOfFiles = [];
    if (this.processArgs["all"] === false) {
      inputListOfFiles = this.processArgs['list'];
    } else {
      inputListOfFiles = this.replaceDistFolderPathNameInInput(this.getAllFiles(path.normalize(this.folderPaths.temporaryLocationForAllFilesCopyFrom)));
    }
    logger.log("inputListOfFiles", inputListOfFiles);

    const checkedFilesForLoop = [];
    for (let i = 0; i < inputListOfFiles.length; i++) {
      if (this.checkIfNewFileInput(checkedFilesForLoop, inputListOfFiles[i])) {
        const fileNewPath = path.join(path.normalize(this.folderPaths.temporaryLocationForAllFilesCopyFrom), path.normalize(inputListOfFiles[i]));
        if (fs.existsSync(fileNewPath)) {
          const checkFileOrFolder = fs.statSync(fileNewPath);
          if (checkFileOrFolder && checkFileOrFolder.isFile()) {
            if (!this.isFileToBeAvoided(inputListOfFiles[i])) {
              this.outputResponse.data.inputFileExistsInSourceFolder.push(inputListOfFiles[i]);
            }
          } else {
            this.outputResponse.data.invalidInputFiles.push(inputListOfFiles[i]);
          }
        } else {
          this.outputResponse.data.invalidInputFiles.push(inputListOfFiles[i]);
        }
      }
      checkedFilesForLoop.push(inputListOfFiles[i]);
    }

    // Identify source files in target folder 
    // if (this.processArgs["force"] === false) {
    for (let i = 0; i < this.outputResponse.data.inputFileExistsInSourceFolder.length; i++) {
      const fileNewPath = path.normalize(this.outputResponse.data.inputFileExistsInSourceFolder[i]);
      if (fs.existsSync(fileNewPath)) {
        const checkFileOrFolder = fs.statSync(fileNewPath);
        if (checkFileOrFolder && checkFileOrFolder.isFile()) {
          if (!this.isFileToBeAvoided(this.outputResponse.data.inputFileExistsInSourceFolder[i])) {
            this.outputResponse.data.sourceFilesInTargetFolder.push(this.outputResponse.data.inputFileExistsInSourceFolder[i]);
          }
        } else {
          // Not a file, and so we cannot identify this as a valid source file
        }
      } else {
        if (!this.isFileToBeAvoided(this.outputResponse.data.inputFileExistsInSourceFolder[i])) {
          this.outputResponse.data.newSourceFiles.push(this.outputResponse.data.inputFileExistsInSourceFolder[i]);
        }
      }
    }
    // }

    /*
      this.outputResponse.data.sourceFilesInTargetFolder [
        './app/project/components/pages/page1/page1.html',
        './app/project/components/pages/page2/page2.html'
      ] 
      this.outputResponse.data.newSourceFiles [
        './app/project/components/widgets/pagedisplay/pagedisplay.htm',
        './app/project/components/pages/page7/page7.html',
        './app/project/components/widgets/widget1/widget1.html'
      ] 
      this.outputResponse.data.invalidInputFiles [
        './app/project/components/widgets/pagedisplay/pagedisplay.htm',
        './app/project/components/pages/page2/'
      ] 
      this.outputResponse.data.inputFileExistsInSourceFolder [
        './app/project/components/pages/page1/page1.html',
        './app/project/components/pages/page2/page2.html',
        './app/project/components/pages/page7/page7.html',
        './app/project/components/widgets/widget1/widget1.html'
      ] 
    */

    for (let i = 0; i < this.outputResponse.data.inputFileExistsInSourceFolder.length; i++) {
      let isExists = false;
      for (let j = 0; j < this.outputResponse.data.sourceFilesInTargetFolder.length; j++) {
        if (this.outputResponse.data.inputFileExistsInSourceFolder[i] === this.outputResponse.data.sourceFilesInTargetFolder[j]) {
          isExists = true;
          break;
        }
      }
      if (isExists === false) {
        this.outputResponse.data.listOfFilesWithOverrideFalse.push(this.outputResponse.data.inputFileExistsInSourceFolder[i]);
      }
    }

    logger.log("this.outputResponse.data.sourceFilesInTargetFolder", this.outputResponse.data.sourceFilesInTargetFolder);
    logger.log("this.outputResponse.data.newSourceFiles", this.outputResponse.data.newSourceFiles);
    logger.log("this.outputResponse.data.invalidInputFiles", this.outputResponse.data.invalidInputFiles);
    logger.log("this.outputResponse.data.inputFileExistsInSourceFolder", this.outputResponse.data.inputFileExistsInSourceFolder);
    logger.log("this.outputResponse.data.listOfFilesWithOverrideFalse", this.outputResponse.data.listOfFilesWithOverrideFalse);

    if (this.outputResponse.data.inputFileExistsInSourceFolder.length === 0) {
      throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAMS_INVALID_IN_REQUEST", this.folderPaths.inputZipFileToImport, utils.convertArrayToString(this.processArgs["list"], "\n")));
    }
  },

  /**
   * 
   * @param {*} fileName 
   */
  isFileToBeAvoided(fileName) {
    for (let i = 0; i < this.outputResponse.data.filesToBeAvoidedFromCopying.length; i++) {
      if (path.normalize(this.outputResponse.data.filesToBeAvoidedFromCopying[i]).trim().toLowerCase() === path.normalize(fileName).trim().toLowerCase()) {
        return true;
      }
    }
    return false;
  },

  /**
   * 
   * @param {*} input 
   */
  replaceDistFolderPathNameInInput(input) {
    if (input && input.length > 0) {
      const output = [];
      for (let i = 0; i < input.length; i++) {
        output.push(input[i].replace(this.folderPaths.temporaryLocationForAllFilesCopyFrom, "."));
      }
      return output;
    } else {
      return [];
    }
  },

  /**
   * 
   * @param {*} sourcePath 
   */
  getAllFiles(sourcePath) {
    return fs.readdirSync(sourcePath).reduce((files, file) => {
      const name = path.join(sourcePath, file);
      const isDirectory = fs.statSync(name).isDirectory();
      return isDirectory ? [...files, ...this.getAllFiles(name)] : [...files, name];
    }, []);
  },

  /**
   * Check if there are questions to be prompted to the developer
   */
  async checkPromptQuestions() {
    if (this.processArgs["force"] === true) {
      this.outputResponse.data.overwriteFiles = true;
    } else {
      // Lists of the questions that the developer will be asked
      let messageText = "";
      let newSourceText = "";
      let existingFilesText = "";
      let invalidFilesText = "";

      if (this.outputResponse.data.newSourceFiles && this.outputResponse.data.newSourceFiles.length > 0) {
        for (let i = 0; i < this.outputResponse.data.newSourceFiles.length; i++) {
          newSourceText += this.outputResponse.data.newSourceFiles[i] + "\n";
        }
        newSourceText = this.getText("VALIDATIONS.NEW_FILES_TO_BE_IMPORTED") + "\n" + newSourceText + "\n";
      } else {
        newSourceText = this.getText("VALIDATIONS.NO_NEW_FILES_AVAILABLE_TO_BE_IMPORTED") + "\n\n";        
      }

      if (this.outputResponse.data.invalidInputFiles && this.outputResponse.data.invalidInputFiles.length > 0) {
        for (let i = 0; i < this.outputResponse.data.invalidInputFiles.length; i++) {
          invalidFilesText += this.outputResponse.data.invalidInputFiles[i] + "\n";
        }
        invalidFilesText = this.getText("VALIDATIONS.INVALID_FILES_IN_IMPORT_LIST") + "\n" + invalidFilesText + "\n";
      }

      if (this.outputResponse.data.sourceFilesInTargetFolder && this.outputResponse.data.sourceFilesInTargetFolder.length > 0) {
        for (let i = 0; i < this.outputResponse.data.sourceFilesInTargetFolder.length; i++) {
          existingFilesText += this.outputResponse.data.sourceFilesInTargetFolder[i] + "\n";
        }
        existingFilesText = this.getText("VALIDATIONS.EXISTING_FILES_IN_IMPORT_FOLDER") + "\n" + existingFilesText + "\n";
      }
      existingFilesText += this.getText("VALIDATIONS.OVERWRITE_FILES");

      messageText = newSourceText + invalidFilesText + existingFilesText;

      const questionsArray = [
        {
          type: 'select',
          name: 'overwriteFile',
          message: messageText,
          choices: [
            { message: this.getText("VALIDATIONS.OVERWRITE_FILES_YES"), hint: this.getText("VALIDATIONS.OVERWRITE_FILES_HINT_YES"), value: 'Y' },
            { message: this.getText("VALIDATIONS.OVERWRITE_FILES_NO"), hint: this.getText("VALIDATIONS.OVERWRITE_FILES_HINT_NO"), value: 'N' }
          ],
          initial: 0
        }
      ];

      let response = await enquirer.prompt(questionsArray).then((response) => {
        logger.log(response);
        return response.overwriteFile;
      }).catch((err) => {
        throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
      });
      this.outputResponse.data.overwriteFiles = utils.convertStringToBoolean(response);
    }
  },

  /**
   * Implement this component's main purpose
   * Unzip the export-components.zip file, copy files as per user input in command-terminal from source (extracted export-components.zip file) to destination (./ project folder).
   */
  async processRequest() {
    logger.log("this.outputResponse.data.overwriteFiles", this.outputResponse.data.overwriteFiles);
    if (this.processArgs["all"] === true) {
      fsExtra.copySync(this.folderPaths.temporaryLocationForAllFilesCopyFrom, "./", { overwrite: this.outputResponse.data.overwriteFiles, filter: file => { if (path.basename(file).toLowerCase() === "project-config.json") { return false; } else { return true; } } });
    } else {
      for (let i = 0; i < this.outputResponse.data.inputFileExistsInSourceFolder.length; i++) {
        logger.log("this.folderPaths.temporaryLocationForAllFilesCopyFrom", this.folderPaths.temporaryLocationForAllFilesCopyFrom);
        logger.log("this.outputResponse.data.inputFileExistsInSourceFolder[i]", this.outputResponse.data.inputFileExistsInSourceFolder[i]);
        const fromPath = path.normalize((path.join(this.folderPaths.temporaryLocationForAllFilesCopyFrom, path.normalize(this.outputResponse.data.inputFileExistsInSourceFolder[i]))));
        const toPath = path.normalize((path.normalize(this.outputResponse.data.inputFileExistsInSourceFolder[i])));
        fsExtra.copySync(fromPath, toPath, { recursive: true, overwrite: this.outputResponse.data.overwriteFiles, filter: file => { if (path.basename(file).toLowerCase() === "project-config.json") { return false; } else { return true; } } });
      }
    }
    this.outputResponse.result = true;
  },

  /**
  * Log Final Response Message
  */
  logOutput() {
    logger.log("this.outputResponse", JSON.stringify(this.outputResponse));
    if (utils.isValidInput(this.outputResponse.errorMessage)) {
      logger.printError(this.outputResponse.errorMessage);
    } else {
      if (this.outputResponse.result === true) {
        /*
        If processArgs("all") is false
          If overwrite = true
            If invalid files is zero
              Message listing valid files
            Else
              Message showing valid and invalid files
          Else
            If invalid files is zero
              Message listing valid files
            Else
              Message showing valid and invalid files
        Else
          If overwrite = true
            Generic Message
          Else
            Identify the copied files 
        */
        if (this.processArgs["all"] === true) {
          if (this.outputResponse.data.overwriteFiles === true) {
            logger.printSuccess(this.getText("SUCCESS_MESSAGE_ALL"));
          } else {
            if (this.outputResponse.data.listOfFilesWithOverrideFalse.length === 0) {
              logger.printError(this.getText("FAILURE_MESSAGE_NO_VALID_OVERWRITE_FILES"));
            } else {
              logger.printSuccess(this.getText("SUCCESS_MESSAGE_SPECIFIC", utils.convertArrayToString(this.outputResponse.data.listOfFilesWithOverrideFalse, "\n")));
            }
          }
        } else {
          if (this.outputResponse.data.overwriteFiles === true) {
            logger.printSuccess(this.getText("SUCCESS_MESSAGE_SPECIFIC", utils.convertArrayToString(this.outputResponse.data.inputFileExistsInSourceFolder, "\n")));
          } else {
            if (this.outputResponse.data.listOfFilesWithOverrideFalse.length === 0) {
              logger.printError(this.getText("FAILURE_MESSAGE_NO_VALID_OVERWRITE_FILES"));
            } else {
              if (this.outputResponse.data.invalidInputFiles.length > 0) {
                logger.printSuccess(this.getText("SUCCESS_MESSAGE_SPECIFIC_WITH_ERROR", utils.convertArrayToString(this.outputResponse.data.listOfFilesWithOverrideFalse, "\n"), utils.convertArrayToString(this.outputResponse.data.sourceFilesInTargetFolder, "\n"), utils.convertArrayToString(this.outputResponse.data.invalidInputFiles, "\n")));
              } else {
                logger.printSuccess(this.getText("SUCCESS_MESSAGE_SPECIFIC", utils.convertArrayToString(this.outputResponse.data.listOfFilesWithOverrideFalse, "\n")));
              }
            }
          }
        }
      } else {
        logger.printError(this.outputResponse.errorMessage);
      }
    }
  },

  /**
   * Clean up method
   */
  async cleanUp() {
    // Delete the copied zip file from temp folder
    this.deleteFile(this.folderPaths.temporaryLocationForCopiedZipFile);
    this.deleteFolder(this.folderPaths.temporaryLocationForExtractedFilesFolder);
  },

  /**
   * Get the String text from default.json file in config
   * @param {*} key 
   * @param  {...any} values 
   */
  getText(key, ...values) {
    const DYNAMIC_TEXT_MESSAGES = this.CONFIG_FILE.textMessages;
    return utils.getText(DYNAMIC_TEXT_MESSAGES, key, ...values);
  },

  /**
   * Delete directory by path
   * @param {string} directoryName
   */
  deleteFolder(directoryName) {
    try {
      return rimraf.sync(directoryName);
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
  },

  /**
   * 
   * @param {*} arrayOfFiles 
   * @param {*} newFile 
   */
  checkIfNewFileInput(arrayOfFiles, newFile) {
    const outputObj = arrayOfFiles.find((tempObj) => path.normalize(tempObj).trim().toLowerCase() === path.normalize(newFile).trim().toLowerCase());

    if (outputObj) {
      return false;
    }
    return true;
  },

  /**
   * Check if the file is a zip file and exists, and follows proper folder structure
   * Suggestion - Export and import should have version number
   * Note that we are not checking for export-components.zip file as filename because the 
   * user can rename his file if required.
   * @param {*} fileName 
   */
  isZipFileValid(fileName) {
    if (fs.existsSync(fileName)) {
      const checkFileOrFolder = fs.statSync(fileName);
      if (checkFileOrFolder && checkFileOrFolder.isFile()) {
        if (path.extname(fileName).trim().toLowerCase() === ".zip") {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

};

module.exports = importAssets;