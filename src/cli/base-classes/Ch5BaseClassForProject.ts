// Copyright (C) 2023 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCliCreate } from "../Ch5BaseClassForCliCreate";
import { Ch5ExportProjectCli } from "../export-project/Ch5ExportProjectCli";

const path = require('path');
const fs = require("fs");
const fsExtra = require("fs-extra");
const process = require('process');
const editJsonFile = require("edit-json-file");

export class Ch5BaseClassForProject extends Ch5BaseClassForCliCreate {

  private readonly CLI_SHELL_FOLDER: string = path.join(__dirname, "../../", "shell");
  private readonly CLI_TEMPLATES_SHELL_FOLDER: string = path.join(__dirname, "../../", "project-templates", "shell-template");
  private readonly CLI_TEMPLATES_ZOOM_ROOM_CONTROL_FOLDER: string = path.join(__dirname, "../../", "project-templates", "zoomroomcontrol");
  private readonly PROJECT_CONFIG_JSON_PATH: string = path.join("app", "project-config.json");
  private readonly VSCODE_SCHEMA_JSON_PATH: string = path.join(".vscode", "project-config-schema.json");

  private _outputResponse: any = null;

  /**
   * Constructor
   */
  public constructor(public showOutputMessages: boolean = true) {
    super(); // This processes the input arguments in the parent class.
  }

  /**
   * Initialize process
   */
  initialize(): any {
    this.logger.start("initialize");
    this._outputResponse = {
      askConfirmation: false,
      result: false,
      errorMessage: "",
      warningMessage: "",
      successMessage: "",
      backupFolder: "",
      data: {
        updatedInputs: [],
        projectName: "",
        projectType: ""
      }
    };
    this.logger.end();
  }

  protected validateCLIInputArgument(inputObj: any, key: string, value: string) {
    this.logger.log("validateCLIInputArgument: " + key + " - " + value, inputObj);
    value = String(value).trim(); //.toLowerCase();
    if (inputObj) {
      if (inputObj.allowedAliases && inputObj.allowedAliases.length > 0 && inputObj.allowedAliases.includes(value)) {
        if (inputObj.type === "boolean") {
          if (value) {
            const val: boolean = this.utils.toBoolean(value);
            return {
              value: val,
              warning: ""
            };
          } else {
            return {
              value: value,
              warning: ""
            };
          }
        } else if (inputObj.type === "enum") {
          if (inputObj.validation !== "") {
            if (inputObj.validation === "validateProjectType") {
              const valOutput: any = this.validateProjectType(inputObj.allowedValues, value);
              return {
                value: valOutput.value,
                warning: ""
              }
            }
            return {
              value: value,
              warning: ""
            };
          } else {
            return {
              value: value,
              warning: ""
            };
          }
        }
      } else {
        if (inputObj.type === "enum" && inputObj.validation !== "" && inputObj.validation === "validateProjectType") {
          const valOutput: any = this.validateProjectType(inputObj.allowedValues, value);
          return {
            value: valOutput.value,
            warning: ""
          }
        } else if (inputObj.type === "string") {
          if (inputObj.validation !== "") {
            if (inputObj.validation === "validatePackageJsonProjectName") {
              const valOutput: any = this.validatePackageJsonProjectName(value);
              if (valOutput.isValid === false) {
                return {
                  value: null,
                  warning: valOutput.warning
                };
              } else {
                return {
                  value: value,
                  warning: ""
                };
              }
            }
            return {
              value: value,
              warning: ""
            };
          } else {
            return {
              value: value,
              warning: ""
            };
          }
        } else if (inputObj.type === "boolean") {
          this.logger.log("boolean", value);
          if (this.utils.isValidInput(value)) {
            const val: boolean = this.utils.toBoolean(value);
            this.logger.log("boolean val", val);
            return {
              value: val,
              warning: ""
            };
          } else {
            this.logger.log("boolean 2 val", this.utils.toBoolean(inputObj.default));
            return {
              value: this.utils.toBoolean(inputObj.default),
              warning: ""
            };
          }
        }
      }
      return {
        value: value,
        warning: ""
      };
    }
    return {
      value: "",
      warning: this.getText("VERIFY_INPUT_PARAMS.INVALID_INPUT", key)
    };
  }

  private validateProjectType(templateProjectTypes: string[], projectType: string) {
    /*
     - projectType must be "zoomroomcontrol" or "shell-template", and it is case-insensitive.
    */
    if (projectType && projectType.trim().length > 0) {
      projectType = projectType.trim().toLowerCase();

      const indexForProjectType = templateProjectTypes.findIndex((element: string) => {
        return element.toLowerCase() === projectType.toLowerCase();
      });

      if (indexForProjectType === -1) {
        this.logger.warn("projectType: " + projectType + " is invalid. Setting it to 'shell-template'");
        return {
          value: "shell-template",
          isValid: true,
          warning: ""
        };
      } else {
        return {
          value: projectType,
          isValid: true,
          warning: ""
        };
      }
    } else {
      this.logger.log("projectType: " + projectType + " is empty.");
      return {
        value: "shell-template",
        isValid: false,
        warning: ""
      };
    }
  }

  private validatePackageJsonProjectName(packageName: string) {
    /*
      - project name length should be greater than zero and cannot exceed 214
      - project name characters must be lowercase i.e., no uppercase or mixed case names are allowed
      - project name can consist of hyphens, numbers, and alphabets
      - project name must not contain any non-url-safe characters (since name ends up being part of a URL)
      - project name should not contain any spaces or any of the following characters: ~)('!*
    */
    if (packageName && packageName.trim().length > 0) {
      packageName = packageName.trim(); //.toLowerCase();
      // packageName = packageName.substring(0, 213);
      //  const packageNameValidity = new RegExp(/^[a-z][a-z0-9-._$]*$/).test(packageName);
      const regexValue = /^(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?\/)?[a-z0-9-~][a-z0-9-._~]*$/;
      const packageNameValidity = new RegExp(regexValue).test(packageName);
      if (packageNameValidity === false) {
        return {
          value: null,
          isValid: false,
          warning: this.getText("COMMON.VALIDATIONS.PROJECT_NAME")
        };
      } else {
        if (packageName.length > 214) {
          return {
            value: null,
            isValid: false,
            warning: this.getText("COMMON.VALIDATIONS.PROJECT_NAME")
          };
        } else {
          return {
            value: packageName,
            isValid: true,
            warning: ""
          };
        }
      }
    } else {
      return {
        value: "",
        isValid: false,
        warning: this.getText("COMMON.VALIDATIONS.PROJECT_NAME")
      };
    }
  }

  protected printWarningsOnVerifiedInputs() {
    const tabDisplayText = this.getText("COMMON.HYPHEN_DELIMITER");
    let warningMessage: string = "";
    for (let i: number = 0; i < this._outputResponse.data.updatedInputs.length; i++) {
      if (this.utils.isValidInput(this._outputResponse.data.updatedInputs[i].warning)) {
        warningMessage += tabDisplayText + this._outputResponse.data.updatedInputs[i].key + ": " + this._outputResponse.data.updatedInputs[i].warning;
      }
    }
    if (warningMessage !== "") {
      if (this.showOutputMessages === true) {
        this.logger.printWarning(this.getText("VERIFY_INPUT_PARAMS.INPUT_WARNING_TITLE", warningMessage));
      }
    }
  }

  protected getConfigFileSchemaPath() {
    return path.resolve(this.CLI_SHELL_FOLDER, this.VSCODE_SCHEMA_JSON_PATH);
  }

  protected addUpdatedInputs(inputUpdateValue: any) {
    this._outputResponse.data.updatedInputs.push(inputUpdateValue);
  }

  protected validateAndSetReceivedInputValuesForFirstTime() {
    Object.entries(this.inputArgs).forEach(([key, value]: any) => {
      if (value.isSpecialArgument === false) {
        const inputUpdate = {
          ...value,
          argsValue: null,
          warning: ""
        };
        if (!(value.validation === "validatePackageJsonProjectName" && value.inputValue === "")) { // This will validate if we want to display warning on empty project name for the first time in create project
          this.logger.log("inputUpdate is ", inputUpdate);
          const validationResponse: any = this.validateCLIInputArgument(value, value.key, value.inputValue);
          this.logger.log("validationResponse is ", validationResponse);
          if (validationResponse.warning === "") {
            inputUpdate.argsValue = validationResponse.value;
          } else {
            inputUpdate.warning = validationResponse.warning;
          }
        }
        this.addUpdatedInputs(inputUpdate);
      }
    });
    this.logger.log("validateAndSetReceivedInputValuesForFirstTime - outputResponse.data.updatedInputs: ", this.getOutputResponse().data.updatedInputs);
  }

  protected validateAndSetReceivedInputValuesForUpdate() {
    Object.entries(this.inputArgs).forEach(([key, value]: any) => {
      if (value.isSpecialArgument === false) {
        const inputUpdate = {
          ...value,
          argsValue: null,
          warning: ""
        };
        if (!(value.validation === "validatePackageJsonProjectName" && value.inputValue === "")) { // This will validate if we want to display warning on empty project name for the first time in create project
          this.logger.log("inputUpdate is ", inputUpdate);
          const validationResponse: any = this.validateCLIInputArgument(value, value.key, value.inputValue);
          this.logger.log("validationResponse is ", validationResponse);
          if (validationResponse.warning === "") {
            inputUpdate.argsValue = validationResponse.value;
          } else {
            inputUpdate.warning = validationResponse.warning;
          }
        }
        this.addUpdatedInputs(inputUpdate);
      }
    });
    this.logger.log("validateAndSetReceivedInputValuesForFirstTime - outputResponse.data.updatedInputs: ", this.getOutputResponse().data.updatedInputs);
  }

  protected validateAndSetReceivedInputValues() {
    Object.entries(this.inputArgs).forEach(([key, value]: any) => {
      if (value.isSpecialArgument === false) {
        const inputUpdate = {
          ...value,
          argsValue: null,
          warning: ""
        };
        this.logger.log("inputUpdate is ", inputUpdate);

        const validationResponse: any = this.validateCLIInputArgument(value, value.key, value.inputValue);
        this.logger.log("validationResponse is ", validationResponse);
        if (validationResponse.warning === "") {
          inputUpdate.argsValue = validationResponse.value;
        } else {
          inputUpdate.warning = validationResponse.warning;
        }
        this.addUpdatedInputs(inputUpdate);
      }
    });
    this.logger.log("validateAndSetReceivedInputValues - outputResponse.data.updatedInputs: ", this.getOutputResponse().data.updatedInputs);
  }

  protected async askQuestionsToUser(taskType: string) {
    const outputResponse = this.getOutputResponse();
    this.logger.log("checkPromptQuestions - outputResponse.data.updatedInputs", outputResponse.data.updatedInputs);

    for (let i: number = 0; i < outputResponse.data.updatedInputs.length; i++) {
      let isValidToAskQuestion: boolean = false
      if (taskType === "create") {
        isValidToAskQuestion = (outputResponse.data.updatedInputs[i].question.name !== "");
      } else if (taskType === "update") {
        isValidToAskQuestion = (outputResponse.data.updatedInputs[i].question.name !== "") && (outputResponse.data.updatedInputs[i].inputReceived === true);
      }
      if (isValidToAskQuestion) {
        if (!this.utils.isValidInput(outputResponse.data.updatedInputs[i].argsValue)) {
          if (outputResponse.data.updatedInputs[i].type === "enum") {
            const choicesList = outputResponse.data.updatedInputs[i].allowedValues;
            const componentsQuery = new this.getSelect({
              name: outputResponse.data.updatedInputs[i].key,
              message: this.getText(outputResponse.data.updatedInputs[i].question.name, outputResponse.data.updatedInputs[i].key),
              choices: choicesList
            });

            outputResponse.data.updatedInputs[i].argsValue = await componentsQuery.run()
              .then((responseValue: any) => { return responseValue; })
              .catch((error: any) => { throw new Error(this.getText("COMMON.SOMETHING_WENT_WRONG")); });
            this.logger.log(outputResponse.data.updatedInputs[i].key + ": ", outputResponse.data.updatedInputs[i].argsValue);
          } else if (outputResponse.data.updatedInputs[i].type === "string") {
            const question = {
              type: "input",
              name: outputResponse.data.updatedInputs[i].key,
              initial: outputResponse.data.updatedInputs[i].question.initialValue,
              hint: "",
              message: this.getText(outputResponse.data.updatedInputs[i].question.name, outputResponse.data.updatedInputs[i].key),
              validate: (inputValue: string) => {
                const valResponse: any = this.validateCLIInputArgument(outputResponse.data.updatedInputs[i], outputResponse.data.updatedInputs[i]["key"], inputValue);
                if (valResponse.warning && valResponse.warning !== "") {
                  return valResponse.warning; // String output is considered as false for validate method.
                } else {
                  return true;
                }
              }
            };
            const response = await this.getPrompt(question);
            // Note that the prompt will keep asking inputs till it validates the correct value
            if (!this.utils.isValidInput(response[outputResponse.data.updatedInputs[i].key])) {
              throw new Error(this.getText("COMMON.SOMETHING_WENT_WRONG"));
            }

            outputResponse.data.updatedInputs[i].argsValue = response.projectName; //.toLowerCase();
            this.logger.log(outputResponse.data.updatedInputs[i].key + ": ", outputResponse.data.updatedInputs[i].argsValue);
          } else if (outputResponse.data.updatedInputs[i].type === "boolean") {
            const choicesList = outputResponse.data.updatedInputs[i].allowedValues;
            const componentsQuery = new this.getSelect({
              name: outputResponse.data.updatedInputs[i].key,
              message: this.getText(outputResponse.data.updatedInputs[i].question.name, outputResponse.data.updatedInputs[i].key),
              choices: choicesList
            });

            outputResponse.data.updatedInputs[i].argsValue = await componentsQuery.run()
              .then((responseValue: any) => { return responseValue; })
              .catch((error: any) => { throw new Error(this.getText("COMMON.SOMETHING_WENT_WRONG")); });
            outputResponse.data.updatedInputs[i].argsValue = this.utils.toBoolean(outputResponse.data.updatedInputs[i].argsValue);
          }
        }
      }
    }
  }

  protected getProjectName() {
    if (this.isCreateOrUpdateBasedOnConfigJson()) {
      const inputConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.getConfigJsonFilePath()));
      this._outputResponse.data.projectName = inputConfigJSON.projectName; // .toLowerCase();
      this._outputResponse.data.projectType = inputConfigJSON.projectType.toLowerCase();
    } else {
      const projectNameObject = this._outputResponse.data.updatedInputs.find((objValue: any) => objValue.key === "projectName");
      this._outputResponse.data.projectName = projectNameObject.argsValue; // .toLowerCase();
      const projectTypeObject = this._outputResponse.data.updatedInputs.find((objValue: any) => objValue.key === "projectType");
      this._outputResponse.data.projectType = projectTypeObject.argsValue.toLowerCase();
    }
    this.logger.log("this._outputResponse.data.projectName value is ", this._outputResponse.data.projectName);
    return this._outputResponse.data.projectName;
  }

  protected async traverseAndValidateProjectFolderAndVariables() {
    const pathToCreateProject: string = path.resolve("./", this.getProjectName());
    this.makeDirectoryForCreateProject(pathToCreateProject);
    process.chdir(pathToCreateProject);
    this.logger.log("1. current working directory: " + pathToCreateProject);
    try {
      const isFolder = await this.utils.readdirAsync(pathToCreateProject);
      if ((isFolder && isFolder.length > 0)) {
        throw new Error(this.getText("PROCESS_REQUEST.FOLDER_CONTAINS_FILES", pathToCreateProject));
      }
    } catch (e) {
      throw new Error(this.getText("PROCESS_REQUEST.FOLDER_CONTAINS_FILES", pathToCreateProject));
    }
  }

  protected removeFolderInProject(folderName: string) {
    // const location = path.resolve(PROJECT_CREATION_FOLDER, this.CONFIG_FILE.custom.templates["shell-template"].customFolders[i]);
    // this.logger.log("shell-template customFolders-" + i + ": ", location);
    // fsExtra.removeSync(path.resolve(PROJECT_CREATION_FOLDER, location));
    const location = path.resolve(folderName);
    this.logger.log("shell-template removeFolderInProject: ", location);
    fsExtra.removeSync(path.resolve(location));
  }

  protected removeFileInProject(fileName: string) {
    // const location = path.resolve(PROJECT_CREATION_FOLDER, this.CONFIG_FILE.custom.templates["shell-template"].customFolders[i]);
    // this.logger.log("shell-template customFolders-" + i + ": ", location);
    // fsExtra.removeSync(path.resolve(PROJECT_CREATION_FOLDER, location));
    const location = path.resolve(fileName);
    this.logger.log("shell-template removeFileInProject: ", fileName);
    fsExtra.removeSync(path.resolve(location));
  }

  protected copyZoomFolderToProject(folderName: string) {
    // const fromLocation = path.resolve(this.CLI_TEMPLATES_ZOOM_ROOM_CONTROL_FOLDER, this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFolders[i]);
    // const toLocation = path.resolve(PROJECT_CREATION_FOLDER, this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFolders[i]);
    // this.logger.log("zoomroomcontrol customFolders-" + i + ": copy from " + fromLocation + " to " + toLocation);
    // fsExtra.copySync(fromLocation, toLocation);
    const fromLocation = path.resolve(this.CLI_TEMPLATES_ZOOM_ROOM_CONTROL_FOLDER, folderName);
    const toLocation = path.resolve(folderName);
    this.logger.log("zoomroomcontrol copyZoomFolderToProject: copy from " + fromLocation + " to " + toLocation);
    fsExtra.copySync(fromLocation, toLocation);
  }

  protected copyZoomFileToProject(fileName: string) {
    // const fromLocation = path.resolve(this.CLI_TEMPLATES_ZOOM_ROOM_CONTROL_FOLDER, this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFiles[i]);
    // const toLocation = path.resolve(PROJECT_CREATION_FOLDER, this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFiles[i]);
    // this.logger.log("zoomroomcontrol customFolders-" + i + ": copy from " + fromLocation + " to " + toLocation);
    // fsExtra.copySync(fromLocation, toLocation);
    const fromLocation = path.resolve(this.CLI_TEMPLATES_ZOOM_ROOM_CONTROL_FOLDER, fileName);
    const toLocation = path.resolve(fileName);
    this.logger.log("zoomroomcontrol copyZoomFileToProject: copy from " + fromLocation + " to " + toLocation);
    fsExtra.copySync(fromLocation, toLocation);
  }

  protected copyShellFolderContentsToProjectFolder() {
    fsExtra.copySync(path.resolve(this.CLI_SHELL_FOLDER), "./");
    // Reason for below: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json
    fs.renameSync(path.join("./", "packagelock.json"), path.join("./", "package-lock.json"));
  }

  protected updateTemplateFiles() {
    const outputResponse = this.getOutputResponse();
    if (outputResponse.data.projectType === "zoomroomcontrol") {

      // Remove folders from shell-template
      for (let i = 0; i < this.CONFIG_FILE.custom.templates["shell-template"].customFolders.length; i++) {
        this.removeFolderInProject(this.CONFIG_FILE.custom.templates["shell-template"].customFolders[i]);
      }
      for (let i = 0; i < this.CONFIG_FILE.custom.templates["shell-template"].customFiles.length; i++) {
        this.removeFileInProject(this.CONFIG_FILE.custom.templates["shell-template"].customFiles[i]);
      }

      // Copy folders from Zoom
      for (let i = 0; i < this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFolders.length; i++) {
        this.copyZoomFolderToProject(this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFolders[i]);
      }
      for (let i = 0; i < this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFiles.length; i++) {
        this.copyZoomFileToProject(this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFiles[i]);
      }
    }
  }

  protected getShellTemplateProjectConfigPath() {
    return path.resolve(this.CLI_SHELL_FOLDER, this.PROJECT_CONFIG_JSON_PATH);
  }

  protected setValueInPackageJson(key: string, value: any) {
    const packageJsonFile = editJsonFile("./package.json"); // Must be after directory change
    packageJsonFile.set(key, value);
    packageJsonFile.save();
  }

  protected getCreatedOrUpdateProjectPathProjectConfigJsonFile() {
    return path.resolve(this.PROJECT_CONFIG_JSON_PATH);
  }

  protected getCreatedOrUpdateProjectPathProjectConfigJsonSchemaFile() {
    return path.resolve(this.VSCODE_SCHEMA_JSON_PATH);
  }

  protected makeDirectoryForCreateProject(projectName: string) {
    if (!fs.existsSync(projectName)) {
      fs.mkdirSync(projectName, { recursive: true });
    }
  }

  protected isCreateOrUpdateBasedOnConfigJson(): boolean {
    return this.getConfigJsonFilePath() !== "";
  }

  protected getConfigJsonFilePath(): string {
    return this.inputArgs["config"].inputValue;
  }

  public getOutputResponse(): any {
    return this._outputResponse;
  }

  protected getDateInStringFormat() {
    const currentDateTime = new Date();
    return String(currentDateTime.getFullYear()) + "-" + this.doubleDigit(currentDateTime.getMonth() + 1) + "-" + this.doubleDigit(currentDateTime.getDate()) + "-" + this.doubleDigit(currentDateTime.getHours()) + "-" + this.doubleDigit(currentDateTime.getMinutes()) + "-" + this.doubleDigit(currentDateTime.getSeconds());
  }

  protected async createBackupForExistingProject() {
    const folderNameForBackup: string = this.getDateInStringFormat();
    this._outputResponse.data.backupFolder = path.normalize(path.join(this.getConfigNode("backupFolder"), folderNameForBackup));
    // Step 3: Take back up of existing json and project
    fsExtra.copySync(this.inputArgs["config"].inputValue, path.join(this.getConfigNode("backupFolder"), folderNameForBackup, "project-config.json"));

    const exportProject = new Ch5ExportProjectCli(false);
    exportProject.changeConfigParam("zipFileDestinationPath", path.join(this.getConfigNode("backupFolder"), folderNameForBackup));
    await exportProject.run();
  }

  protected async getConfirmation() {
    let askConfirmation: boolean = false;
    if (this.inputArgs["force"]?.inputValue === true) {
      askConfirmation = true;
    } else {
      const questionsArray = {
        name: this.getText("VALIDATIONS.CONFIRMATION.TITLE"),
        message: this.getText("VALIDATIONS.CONFIRMATION.ARE_YOU_SURE_TO_CHANGE"),
        initial: true
      };
      askConfirmation = await new this.getConfirm(questionsArray).run().then((response: boolean) => {
        return response;
      }).catch((err: any) => {
        throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
      });
    }
  }
  protected doubleDigit(input: number): string {
    if (input < 10) {
      return "0" + String(input);
    }
    return String(input);
  }

  public getCLIExecutionPath(): any {
    // This method needs to be available here in order to get the current working directory
    return __dirname;
  }
}
