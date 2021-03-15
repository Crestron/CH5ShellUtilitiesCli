// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import * as commander from "commander";
import { Ch5BaseClassForCli } from "../Ch5BaseClassForCli";

const fs = require("fs"); 
const fsExtra = require("fs-extra");
const path = require('path');
const zl = require("zip-lib");
const rimraf = require("rimraf");
const Enquirer = require('enquirer');
const enquirer = new Enquirer();

export class Ch5ImportAssetsCli extends Ch5BaseClassForCli {

  private outputResponse: any = {};
  private folderPaths: any = {};

  public constructor() {
    super("importComponents");
  }
  
  public async setupCommand(program: commander.Command) {
    let programObject = program
      .command('generate:page')
      .name('generate:page')
      .usage('[options]');

    programObject = programObject.option("-n, --name", 'Set the Name of the page to be created');
    programObject = programObject.option("-m, --menu", "Allow the page navigation to be added to Menu (valid input values are 'Y', 'y', 'N', 'n'");

    const contentForHelp: string = await this.componentHelper.getAdditionalHelpContent(path.join(this.templateFolderPath, "help.template"));
    programObject = programObject.addHelpText('after', contentForHelp);
    programObject.action(async (options) => {
      try {
        await this.run(options);
      } catch (e) {
        this.logger.error(e);
      }
    });
  }

  /**
   * Public Method 
   */
  async run(options: any) {
    this.importComponents();
  }

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
        filesToBeAvoidedFromCopying: ['./app/project-config.json']
      }
    };

    this.folderPaths = {
      inputZipFileToImport: this.inputArguments["zipFile"],
      temporaryLocationForCopiedZipFile: path.join(this.getConfigNode("zipFileDestinationPath"), this.getConfigNode("outputFileName")),
      temporaryLocationForExtractedFilesFolder: path.join(this.getConfigNode("zipFileDestinationPath"), this.getConfigNode("outputTempFolderName")),
      temporaryLocationForAllFilesCopyFrom: path.join(this.getConfigNode("zipFileDestinationPath"), this.getConfigNode("outputTempFolderName"), this.getConfigNode("exportedFolderName")),
      temporaryLocationForProjectConfig: path.join(this.getConfigNode("zipFileDestinationPath"), this.getConfigNode("outputTempFolderName"), this.getConfigNode("exportedFolderName"), path.normalize("app/project-config.json"))
    };
  }

  /**
   * Method for importing components
   */
  async importComponents() {
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
      if (e && this.utils.isValidInput(e.message)) {
        this.outputResponse.errorMessage = e.message;
      } else {
        this.outputResponse.errorMessage = this.getText("ERRORS.SOMETHING_WENT_WRONG");
        this.logger.log(e);
      }
    }

    // Show output response
    this.logOutput();

    return this.outputResponse.result; // The return is required to validate in automation test case
  }

  /**
  * Check any validations that need to be done before verifying input parameters
  */
  checkPrerequisiteValidations() {
    // Nothing for this component
    // TODO - check if project config exist
  }

  /**
   * Verify input parameters
   */
  async verifyInputParams() {
    if (this.utils.isValidInput(this.inputArguments["zipFile"]) && this.isZipFileValid(this.inputArguments["zipFile"])) {
      if (this.inputArguments["all"] === false) {
        if (this.inputArguments["list"].length === 0) {
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
      onEntry: function (event: { entryName: string; preventDefault: () => void; }) {
        if (/^__MACOSX\//.test(event.entryName)) {
          // entry name starts with __MACOSX/
          event.preventDefault();
        }
      }
    });

    await rimraf.sync(this.folderPaths.temporaryLocationForExtractedFilesFolder);

    // Extract the developer input zip file into a temporary location in dist folder.
    await unzip.extract(this.folderPaths.temporaryLocationForCopiedZipFile, this.folderPaths.temporaryLocationForExtractedFilesFolder).then(async () => {
      this.logger.log("Folder unzipped");
    } ,(err: any) => {
      throw new Error(err);
    });

    /*
    If inputArguments("all") is false
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
    if (this.inputArguments["all"] === false) {
      inputListOfFiles = this.inputArguments['list'];
    } else {
      inputListOfFiles = this.replaceDistFolderPathNameInInput(this.getAllFiles(path.normalize(this.folderPaths.temporaryLocationForAllFilesCopyFrom)));
    }
    this.logger.log("inputListOfFiles", inputListOfFiles);

    const checkedFilesForLoop = [];
    for (let i:number = 0; i < inputListOfFiles.length; i++) {
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
    // if (this.inputArguments["force"] === false) {
    for (let i:number = 0; i < this.outputResponse.data.inputFileExistsInSourceFolder.length; i++) {
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

    for (let i:number = 0; i < this.outputResponse.data.inputFileExistsInSourceFolder.length; i++) {
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

    this.logger.log("this.outputResponse.data.sourceFilesInTargetFolder", this.outputResponse.data.sourceFilesInTargetFolder);
    this.logger.log("this.outputResponse.data.newSourceFiles", this.outputResponse.data.newSourceFiles);
    this.logger.log("this.outputResponse.data.invalidInputFiles", this.outputResponse.data.invalidInputFiles);
    this.logger.log("this.outputResponse.data.inputFileExistsInSourceFolder", this.outputResponse.data.inputFileExistsInSourceFolder);
    this.logger.log("this.outputResponse.data.listOfFilesWithOverrideFalse", this.outputResponse.data.listOfFilesWithOverrideFalse);

    if (this.outputResponse.data.inputFileExistsInSourceFolder.length === 0) {
      throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAMS_INVALID_IN_REQUEST", this.folderPaths.inputZipFileToImport, this.utils.convertArrayToString(this.inputArguments["list"], "\n")));
    }
  }

  /**
   * 
   * @param {*} fileName 
   */
  isFileToBeAvoided(fileName: string) {
    for (let i:number = 0; i < this.outputResponse.data.filesToBeAvoidedFromCopying.length; i++) {
      if (path.normalize(this.outputResponse.data.filesToBeAvoidedFromCopying[i]).trim().toLowerCase() === path.normalize(fileName).trim().toLowerCase()) {
        return true;
      }
    }
    return false;
  }

  /**
   * 
   * @param {*} input 
   */
  replaceDistFolderPathNameInInput(input:string[]) {
    if (input && input.length > 0) {
      const output = [];
      for (let i:number = 0; i < input.length; i++) {
        output.push(input[i].replace(this.folderPaths.temporaryLocationForAllFilesCopyFrom, "."));
      }
      return output;
    } else {
      return [];
    }
  }

  /**
   * 
   * @param {*} sourcePath 
   */
  getAllFiles(sourcePath: string) {
    return fs.readdirSync(sourcePath).reduce((files: any, file: any) => {
      const name = path.join(sourcePath, file);
      const isDirectory = fs.statSync(name).isDirectory();
      return isDirectory ? [...files, ...this.getAllFiles(name)] : [...files, name];
    }, []);
  }

  /**
   * Check if there are questions to be prompted to the developer
   */
  async checkPromptQuestions() {
    if (this.inputArguments["force"] === true) {
      this.outputResponse.data.overwriteFiles = true;
    } else {
      // Lists of the questions that the developer will be asked
      let messageText = "";
      let newSourceText = "";
      let existingFilesText = "";
      let invalidFilesText = "";

      if (this.outputResponse.data.newSourceFiles && this.outputResponse.data.newSourceFiles.length > 0) {
        for (let i:number = 0; i < this.outputResponse.data.newSourceFiles.length; i++) {
          newSourceText += this.outputResponse.data.newSourceFiles[i] + "\n";
        }
        newSourceText = this.getText("VALIDATIONS.NEW_FILES_TO_BE_IMPORTED") + "\n" + newSourceText + "\n";
      } else {
        newSourceText = this.getText("VALIDATIONS.NO_NEW_FILES_AVAILABLE_TO_BE_IMPORTED") + "\n\n";
      }

      if (this.outputResponse.data.invalidInputFiles && this.outputResponse.data.invalidInputFiles.length > 0) {
        for (let i:number = 0; i < this.outputResponse.data.invalidInputFiles.length; i++) {
          invalidFilesText += this.outputResponse.data.invalidInputFiles[i] + "\n";
        }
        invalidFilesText = this.getText("VALIDATIONS.INVALID_FILES_IN_IMPORT_LIST") + "\n" + invalidFilesText + "\n";
      }

      if (this.outputResponse.data.sourceFilesInTargetFolder && this.outputResponse.data.sourceFilesInTargetFolder.length > 0) {
        for (let i:number = 0; i < this.outputResponse.data.sourceFilesInTargetFolder.length; i++) {
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

      let response = await enquirer.prompt(questionsArray).then((response: { overwriteFile: any; }) => {
        this.logger.log(response);
        return response.overwriteFile;
      }).catch((err: any) => {
        throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
      });
      this.outputResponse.data.overwriteFiles = this.utils.convertStringToBoolean(response);

      // if (this.outputResponse.data.overwriteFiles === false && this.outputResponse.data.sourceFilesInTargetFolder.length === 0) {
      //   this.logger.printError(this.getText("FAILURE_MESSAGE_NO_VALID_OVERWRITE_FILES"));
      // }
    }
  }

  /**
   * Implement this component's main purpose
   * Unzip the export-components.zip file, copy files as per user input in command-terminal from source (extracted export-components.zip file) to destination (./ project folder).
   */
  async processRequest() {
    this.logger.log("this.outputResponse.data.overwriteFiles", this.outputResponse.data.overwriteFiles);
    const pagesSelected = [];
    const widgetsSelected = [];
    if (this.inputArguments["all"] === true) {
      fsExtra.copySync(this.folderPaths.temporaryLocationForAllFilesCopyFrom, "./", { overwrite: this.outputResponse.data.overwriteFiles, filter: (file: any) => { if (path.basename(file).toLowerCase() === "project-config.json") { return false; } else { return true; } } });
    } else {
      for (let i:number = 0; i < this.outputResponse.data.inputFileExistsInSourceFolder.length; i++) {
        this.logger.log("this.folderPaths.temporaryLocationForAllFilesCopyFrom", this.folderPaths.temporaryLocationForAllFilesCopyFrom);
        this.logger.log("this.outputResponse.data.inputFileExistsInSourceFolder[i]", this.outputResponse.data.inputFileExistsInSourceFolder[i]);
        const fromPath = path.normalize(path.dirname(path.join(this.folderPaths.temporaryLocationForAllFilesCopyFrom, path.normalize(this.outputResponse.data.inputFileExistsInSourceFolder[i]))));
        const toPath = path.normalize(path.dirname(path.normalize(this.outputResponse.data.inputFileExistsInSourceFolder[i])));
        fsExtra.copySync(fromPath, toPath, { recursive: true, overwrite: this.outputResponse.data.overwriteFiles, filter: (file: any) => { if (path.basename(file).toLowerCase() === "project-config.json") { return false; } else { return true; } } });
        if (fromPath.indexOf(path.normalize("components/pages")) >= 0) {
          pagesSelected.push(path.basename(path.normalize(this.outputResponse.data.inputFileExistsInSourceFolder[i])));
        } else {
          widgetsSelected.push(path.basename(path.normalize(this.outputResponse.data.inputFileExistsInSourceFolder[i])));
        }
      }
    }
    await this.processExportedProjectConfigJSON(pagesSelected, widgetsSelected);
  }

  /**
  * Log Final Response Message
  */
  logOutput() {
    this.logger.log("this.outputResponse", JSON.stringify(this.outputResponse));
    if (this.utils.isValidInput(this.outputResponse.errorMessage)) {
      this.logger.printError(this.outputResponse.errorMessage);
    } else {
      if (this.outputResponse.result === true) {
        /*
        If inputArguments("all") is false
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
        if (this.inputArguments["all"] === true) {
          if (this.outputResponse.data.overwriteFiles === true) {
            this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_ALL"));
          } else {
            if (this.outputResponse.data.listOfFilesWithOverrideFalse.length === 0) {
              this.logger.printError(this.getText("FAILURE_MESSAGE_NO_VALID_OVERWRITE_FILES"));
            } else {
              this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_SPECIFIC", this.utils.convertArrayToString(this.outputResponse.data.listOfFilesWithOverrideFalse, "\n")));
            }
          }
        } else {
          if (this.outputResponse.data.overwriteFiles === true) {
            this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_SPECIFIC", this.utils.convertArrayToString(this.outputResponse.data.inputFileExistsInSourceFolder, "\n")));
          } else {
            if (this.outputResponse.data.listOfFilesWithOverrideFalse.length === 0) {
              this.logger.printError(this.getText("FAILURE_MESSAGE_NO_VALID_OVERWRITE_FILES"));
            } else {
              if (this.outputResponse.data.invalidInputFiles.length > 0) {
                this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_SPECIFIC_WITH_ERROR", this.utils.convertArrayToString(this.outputResponse.data.listOfFilesWithOverrideFalse, "\n"), this.utils.convertArrayToString(this.outputResponse.data.sourceFilesInTargetFolder, "\n"), this.utils.convertArrayToString(this.outputResponse.data.invalidInputFiles, "\n")));
              } else {
                this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_SPECIFIC", this.utils.convertArrayToString(this.outputResponse.data.listOfFilesWithOverrideFalse, "\n")));
              }
            }
          }
        }
      } else {
        this.logger.printError(this.outputResponse.errorMessage);
      }
    }
  }

  /**
   * Clean up method
   */
  async cleanUp() {
    // Delete the copied zip file from temp folder
    await  this.utils.deleteFile(this.folderPaths.temporaryLocationForCopiedZipFile);
    await  this.utils.deleteFolder(this.folderPaths.temporaryLocationForExtractedFilesFolder);
  }

  /**
   * 
   * @param {*} arrayOfFiles 
   * @param {*} newFile 
   */
  checkIfNewFileInput(arrayOfFiles: any[], newFile: any) {
    const outputObj = arrayOfFiles.find((tempObj: any) => path.normalize(tempObj).trim().toLowerCase() === path.normalize(newFile).trim().toLowerCase());

    if (outputObj) {
      return false;
    }
    return true;
  }

  /**
   * Check if the file is a zip file and exists, and follows proper folder structure
   * Suggestion - Export and import should have version number
   * Note that we are not checking for export-components.zip file as filename because the 
   * user can rename his file if required.
   * @param {*} fileName 
   */
  isZipFileValid(fileName: string) {
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

  /**
   * For 'page' type components without conflicting name 
   * -   The target project content view should be appended with the imported pages in the same order they were in the source project.
   * -   If the navigation buttons were defined in source project, the target project navigation buttons should be appended with buttons for imported page in same order they were in the source project. 
   * For 'page' type components with conflicting name
   * -   the location in the content view of the imported page should remain the same as before the import
   * -   if navigation buttons were defined in both the source and target project, the order should remain the same
   * -   if navigation button was defined in source project, but not the target project, an imported navigation button should be appended to end of navigation buttons
   * -   if navigation button was not defined in source project, but was defined in target project, the target project button should be removed.
   */
  async processExportedProjectConfigJSON(selectedPages: string | any[], selectedWidgets: string | any[]) {
    if (this.inputArguments["all"] === true) {
      const jsonToBeImported = fsExtra.readJSONSync(path.resolve(this.folderPaths.temporaryLocationForProjectConfig));
      this.logger.log("jsonToBeImported", jsonToBeImported);
      this.projectConfig.addPagesToJSON(jsonToBeImported.pages);
      this.projectConfig.addWidgetsToJSON(jsonToBeImported.widgets);
    } else {
      const jsonToBeImported = fsExtra.readJSONSync(path.resolve(this.folderPaths.temporaryLocationForProjectConfig));
      this.logger.log("jsonToBeImported", jsonToBeImported);
      if (selectedPages.length > 0) {
        const pageArray = [];
        for (let i:number = 0; i < selectedPages.length; i++) {
          pageArray.push(jsonToBeImported.pages.find((tempObj: { fileName: string; }) => tempObj.fileName.trim().toLowerCase() === selectedPages[i].trim().toLowerCase()));
        }
        if (pageArray.length > 0) {
          this.projectConfig.addPagesToJSON(pageArray);
        }
      }

      if (selectedWidgets.length > 0) {
        const pageArray = [];
        for (let i:number = 0; i < selectedWidgets.length; i++) {
          pageArray.push(jsonToBeImported.widgets.find((tempObj: { fileName: string; }) => tempObj.fileName.trim().toLowerCase() === selectedWidgets[i].trim().toLowerCase()));
        }
        if (pageArray.length > 0) {
          this.projectConfig.addWidgetsToJSON(pageArray);
        }
      }
    }
    this.logger.log("project-config read done");

    this.outputResponse.result = true;
  }
}
