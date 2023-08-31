// Copyright (C) 2023 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCliCreate } from "../Ch5BaseClassForCliCreate";
import { Ch5GeneratePageCli } from "../generate-page/Ch5GeneratePageCli";
import { Ch5GenerateWidgetCli } from "../generate-widget/Ch5GenerateWidgetCli";
import { ICh5CliNew } from "../ICh5Cli";

const path = require('path');
const fs = require("fs");
const fsExtra = require("fs-extra");
const process = require('process');
const editJsonFile = require("edit-json-file");

export class Ch5CreateProjectCli extends Ch5BaseClassForCliCreate implements ICh5CliNew {

  private readonly SHELL_FOLDER: string = path.resolve(path.normalize(path.join(__dirname, "../../", "shell")));
  private readonly TEMPLATES_SHELL_FOLDER: string = path.resolve(path.normalize(path.join(__dirname, "../../", "project-templates", "shell-template")));
  private readonly TEMPLATES_ZOOM_ROOM_CONTROL_FOLDER: string = path.resolve(path.normalize(path.join(__dirname, "../../", "project-templates", "zoomroomcontrol")));
  private readonly PROJECT_CONFIG_JSON_PATH: string = path.normalize("/app/project-config.json");
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
      data: {
        updatedInputs: [],
        projectName: "",
        projectType: ""
      }
    };
    this.logger.end();
  }

  /**
   * Verify input parameters
   */
  async verifyInputParams() {
    this.logger.start("verifyInputParams");
    this.logger.log("verifyInputParams - this.inputArgs: ", this.inputArgs);

    if (this.inputArgs["config"].inputValue !== "") {
      // Step 1: Check file extension for json, valid input for 'config' argument, and config file existence
      if (!(this.utils.isValidInput(this.inputArgs["config"].inputValue) && this.isConfigFileExist(this.inputArgs["config"].inputValue))) {
        throw new Error(this.getText("VERIFY_INPUT_PARAMS.INVALID_CONFIG_INPUT"));
      }
      // Step 2: Check if json is as per its schema (.vscode is hidden folder)
      if (!(await this.isConfigFileValid(this.inputArgs["config"].inputValue, path.join(this.SHELL_FOLDER, this.VSCODE_SCHEMA_JSON_PATH), true))) {
        throw new Error(this.getText("VERIFY_INPUT_PARAMS.INVALID_CONFIG_FILE"));
      }
    } else {
      this.logger.log("Project without config json file");

      Object.entries(this.inputArgs).forEach(([key, value]: any) => {
        if (value.isSpecialArgument === false) {
          const inputUpdate = {
            ...value,
            argsValue: null,
            "warning": ""
          };
          this.logger.log("value is ", value);

          // if (this.utils.isValidInput(value.inputValue)) {
          const validationResponse: any = this.validateCLIInputArgument(value, value.key, value.inputValue);
          this.logger.log("validationResponse is ", validationResponse);
          if (validationResponse.warning === "") {
            inputUpdate.argsValue = validationResponse.value;
          } else {
            inputUpdate.warning = validationResponse.warning;
          }
          // }
          this._outputResponse.data.updatedInputs.push(inputUpdate);
        }
      });

      this.logger.log("this._outputResponse.data.updatedInputs: ", this._outputResponse.data.updatedInputs);
      this.printWarningsOnVerifyInputs();
    }
    this.logger.end();
  }

  /**
   * Check if there are questions to be prompted to the integrator
   */
  async checkPromptQuestions() {
    this.logger.start("checkPromptQuestions");
    if (this.inputArgs["config"].inputValue !== "") {
      // Do Nothing
    } else {
      this.logger.log("checkPromptQuestions - this._outputResponse.data.updatedInputs", this._outputResponse.data.updatedInputs);

      for (let i: number = 0; i < this._outputResponse.data.updatedInputs.length; i++) {
        if (this._outputResponse.data.updatedInputs[i].question !== "") {
          if (!this.utils.isValidInput(this._outputResponse.data.updatedInputs[i].argsValue)) {
            if (this._outputResponse.data.updatedInputs[i].type === "enum") {
              const choicesList = this._outputResponse.data.updatedInputs[i].allowedValues;
              const componentsQuery = new this.getSelect({
                name: 'value',
                message: this.getText(this._outputResponse.data.updatedInputs[i].question),
                choices: choicesList
              });

              this._outputResponse.data.updatedInputs[i].argsValue = await componentsQuery.run()
                .then((selectedMenu: any) => { return selectedMenu; })
                .catch((error: any) => { throw new Error(this.getText("COMMON.SOMETHING_WENT_WRONG")); });
              this.logger.log(this._outputResponse.data.updatedInputs[i].key + ": ", this._outputResponse.data.updatedInputs[i].argsValue);
            } else if (this._outputResponse.data.updatedInputs[i].type === "string") {
              const questionsArray = [
                {
                  type: "text",
                  name: this._outputResponse.data.updatedInputs[i].key,
                  initial: "shell-template",
                  hint: "",
                  message: this.getText(this._outputResponse.data.updatedInputs[i].question),
                  validate: (inputValue: string) => {
                    const valResponse: any = this.validateCLIInputArgument(this._outputResponse.data.updatedInputs[i], this._outputResponse.data.updatedInputs[i]["key"], inputValue);
                    if (valResponse.warning && valResponse.warning !== "") {
                      return valResponse.warning; // String output is considered as false for validate method.
                    } else {

                      return true;
                    }
                  }
                }];
              const response = await this.getEnquirer.prompt(questionsArray);
              // Note that the prompt will keep asking inputs till it validates the correct value
              if (!this.utils.isValidInput(response.projectName)) {
                throw new Error(this.getText("COMMON.SOMETHING_WENT_WRONG"));
              }

              this._outputResponse.data.updatedInputs[i].argsValue = response.projectName.toLowerCase();
              this.logger.log(this._outputResponse.data.updatedInputs[i].key + ": ", this._outputResponse.data.updatedInputs[i].argsValue);
            }
          }
        }
      }
    }
    this.logger.end();
  }

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    this.logger.start("processRequest");
    const projectFolderPath = path.resolve(path.join("./"));

    if (this.inputArgs["config"].inputValue !== "") {
      const newProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.inputArgs["config"].argsValue));
      const pathToCreateProject: string = path.resolve(path.join("./", newProjectConfigJSON.projectName));
      if (!fs.existsSync(pathToCreateProject)) {
        fs.mkdirSync(pathToCreateProject, { recursive: true });
      }

      this.logger.log("1. current working directory: " + process.cwd());
      process.chdir(pathToCreateProject);

      try {
        const isFolder = await this.utils.readdirAsync(pathToCreateProject);
        if ((isFolder && isFolder.length > 0)) {
          throw new Error(this.getText("PROCESS_REQUEST.FOLDER_CONTAINS_FILES", pathToCreateProject));
        }
      } catch (e) {
        throw new Error(this.getText("PROCESS_REQUEST.FOLDER_CONTAINS_FILES", pathToCreateProject));
      }

      fsExtra.copySync(this.SHELL_FOLDER, pathToCreateProject);
      fs.renameSync(path.resolve(path.join(pathToCreateProject, "packagelock.json")), path.resolve(path.join(pathToCreateProject, "package-lock.json")));

      this.logger.log("2. current working directory: " + process.cwd());

      // Step 4: Make changes to project-config.json stepwise
      const oldProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(path.join(this.SHELL_FOLDER, this.PROJECT_CONFIG_JSON_PATH)));

      // 1. Project Data
      for (const k in newProjectConfigJSON) {
        if ((typeof newProjectConfigJSON[k] !== 'object' && newProjectConfigJSON[k] !== null)) {
          if (oldProjectConfigJSON[k] !== newProjectConfigJSON[k]) {
            oldProjectConfigJSON[k] = newProjectConfigJSON[k];
            this.projectConfig.changeNodeValues(k, oldProjectConfigJSON[k]);
          }
        }
      }

      // 2. Themes
      oldProjectConfigJSON["themes"] = newProjectConfigJSON["themes"];
      this.projectConfig.changeNodeValues("themes", oldProjectConfigJSON["themes"]);

      // 3. Config
      oldProjectConfigJSON["config"] = newProjectConfigJSON["config"];
      this.projectConfig.changeNodeValues("config", oldProjectConfigJSON["config"]);

      // 4. Header
      oldProjectConfigJSON["header"] = newProjectConfigJSON["header"];
      this.projectConfig.changeNodeValues("header", oldProjectConfigJSON["header"]);

      // 5. Footer
      oldProjectConfigJSON["footer"] = newProjectConfigJSON["footer"];
      this.projectConfig.changeNodeValues("footer", oldProjectConfigJSON["footer"]);

      // 6. Content
      oldProjectConfigJSON["content"]["triggerViewProperties"] = newProjectConfigJSON["content"]["triggerViewProperties"];
      this.projectConfig.changeNodeValues("content.triggerViewProperties", oldProjectConfigJSON["content"]["triggerViewProperties"]);

      oldProjectConfigJSON["content"]["$defaultView"] = newProjectConfigJSON["content"]["$defaultView"];
      this.projectConfig.changeNodeValues("content.$defaultView", oldProjectConfigJSON["content"]["$defaultView"]);

      // fs.writeFileSync(path.join(pathToCreateProject, this.PROJECT_CONFIG_JSON_PATH), JSON.stringify(oldProjectConfigJSON));

      const pagesToBeCreated: any[] = [];
      for (let i: number = 0; i < newProjectConfigJSON["content"]["pages"].length; i++) {
        const pageObj = newProjectConfigJSON["content"]["pages"][i];
        const pageInOldSet = oldProjectConfigJSON["content"]["pages"].find((page: any) => page.pageName.toString().toLowerCase() === pageObj.pageName.toString().toLowerCase());
        if (!pageInOldSet) {
          // Exists in New set but not in old - so create page
          pagesToBeCreated.push(pageObj);
        }
      }

      const widgetsToBeCreated: any[] = [];
      for (let i: number = 0; i < newProjectConfigJSON["content"]["widgets"].length; i++) {
        const widgetObj = newProjectConfigJSON["content"]["widgets"][i];
        const pageInOldSet = oldProjectConfigJSON["content"]["widgets"].find((widget: any) => widget.widgetName.toString().toLowerCase() === widgetObj.widgetName.toString().toLowerCase());
        if (!pageInOldSet) {
          // Exists in New set but not in old - so create page
          widgetsToBeCreated.push(widgetObj);
        }
      }

      const packageJsonFile = editJsonFile("./package.json"); // Must be after directory change
      packageJsonFile.set("name", oldProjectConfigJSON.projectName);
      packageJsonFile.save();

      this._outputResponse.data.projectName = oldProjectConfigJSON.projectName;

      // Step 5: Save Project-config
      for (let i: number = 0; i < pagesToBeCreated.length; i++) {
        const genPage: Ch5GeneratePageCli = new Ch5GeneratePageCli(false);
        const newPageName = pagesToBeCreated[i].fileName.toLowerCase().split(".")[0]; // pagesToBeCreated[i].pageName - picking file name to accommodate hyphens
        genPage.setInputArgsForTesting(["-n", newPageName, "-m", pagesToBeCreated[i].navigation ? "Y" : "N"]);
        await genPage.run();
        this.projectConfig.replacePageNodeInJSON(pagesToBeCreated[i]);
      }

      for (let i: number = 0; i < widgetsToBeCreated.length; i++) {
        const genWidget: Ch5GenerateWidgetCli = new Ch5GenerateWidgetCli(false);
        const newWidgetName = widgetsToBeCreated[i].fileName.toLowerCase().split(".")[0]; // widgetsToBeCreated[i].widgetName - picking file name to accommodate hyphens
        genWidget.setInputArgsForTesting(["-n", newWidgetName]);
        await genWidget.run();
        this.projectConfig.removeWidgetFromJSON(widgetsToBeCreated[i]);
      }

      // Step 6: Run validate:project-config
      if (!(await this.isConfigFileValid(path.join(pathToCreateProject, this.PROJECT_CONFIG_JSON_PATH), path.join(pathToCreateProject, this.VSCODE_SCHEMA_JSON_PATH)))) {
        throw new Error(this.getText("PROCESS_REQUEST.PROJECT_CONFIG_VALIDATION_FAILED"));
      }

      // Step 8: Show proper messages  
      this._outputResponse.result = true;
      this._outputResponse.successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE", this._outputResponse.data.projectName, projectFolderPath);

    } else {

      this.logger.log("processRequest - this._outputResponse.data.updatedInputs: ", this._outputResponse.data.updatedInputs);

      const projectTypeObject = this._outputResponse.data.updatedInputs.find((objValue: any) => objValue.key === "projectType");
      const projectNameObject = this._outputResponse.data.updatedInputs.find((objValue: any) => objValue.key === "projectName");
      this._outputResponse.data.projectType = projectTypeObject.argsValue.toLowerCase();
      this._outputResponse.data.projectName = projectNameObject.argsValue.toLowerCase();

      this.logger.log("processRequest - this._outputResponse.data", this._outputResponse.data);
      // Step 4: Make changes to project-config.json stepwise
      const projectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(path.normalize(path.join(this.SHELL_FOLDER, this.PROJECT_CONFIG_JSON_PATH))));
      projectConfigJSON.projectName = this._outputResponse.data.projectName;
      
      const pathToCreateProject: string = path.resolve(path.join("./", projectConfigJSON.projectName));
      // Check if current folder is empty.
      try {
        const isFolder = await this.utils.readdirAsync(pathToCreateProject);
        if ((isFolder && isFolder.length > 0)) {
          throw new Error(this.getText("PROCESS_REQUEST.FOLDER_CONTAINS_FILES", pathToCreateProject));
        }
      } catch (e) {
        throw new Error(this.getText("PROCESS_REQUEST.FOLDER_CONTAINS_FILES", pathToCreateProject));
      }

      if (!fs.existsSync(pathToCreateProject)) {
        fs.mkdirSync(pathToCreateProject, { recursive: true });
      }

      fsExtra.copySync(this.SHELL_FOLDER, pathToCreateProject);

      if (this._outputResponse.data.projectType === "zoomroomcontrol") {

        // Remove folders from shell-template
        for (let i = 0; i < this.CONFIG_FILE.custom.templates["shell-template"].customFolders.length; i++) {
          // fsExtra.removeSync(path.resolve(pathToCreateProject, this.SHELL_ASSETS_FOLDER_PATH "app", "template", "assets", "fonts"));
          this.logger.log("shell-template customFolders-" + i + ": ", path.resolve(path.join(pathToCreateProject, this.CONFIG_FILE.custom.templates["shell-template"].customFolders[i])));
          fsExtra.removeSync(path.resolve(path.join(pathToCreateProject, this.CONFIG_FILE.custom.templates["shell-template"].customFolders[i])));
        }
        for (let i = 0; i < this.CONFIG_FILE.custom.templates["shell-template"].customFiles.length; i++) {
          this.logger.log("shell-template customFiles-" + i + ": ", path.resolve(path.join(pathToCreateProject, this.CONFIG_FILE.custom.templates["shell-template"].customFiles[i])));
          fsExtra.removeSync(path.resolve(path.join(pathToCreateProject, this.CONFIG_FILE.custom.templates["shell-template"].customFiles[i])));
        }

        // Copy folders from Zoom
        for (let i = 0; i < this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFolders.length; i++) {
          const fromLocation = path.resolve(path.join(this.TEMPLATES_ZOOM_ROOM_CONTROL_FOLDER, this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFolders[i]));
          const toLocation = path.resolve(path.join(pathToCreateProject, this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFolders[i]))
          this.logger.log("zoomroomcontrol customFolders-" + i + ": copy from " + fromLocation + " to " + toLocation);
          fsExtra.copySync(fromLocation, toLocation);
        }

        for (let i = 0; i < this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFiles.length; i++) {
          const fromLocation = path.resolve(path.join(this.TEMPLATES_ZOOM_ROOM_CONTROL_FOLDER, this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFiles[i]));
          const toLocation = path.resolve(path.join(pathToCreateProject, this.CONFIG_FILE.custom.templates["zoomroomcontrol"].customFiles[i]))
          this.logger.log("zoomroomcontrol customFolders-" + i + ": copy from " + fromLocation + " to " + toLocation);
          fsExtra.copySync(fromLocation, toLocation);
        }
      }

      // Reason for below: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json
      fs.renameSync(path.resolve(path.join(pathToCreateProject, "packagelock.json")), path.resolve(path.join(pathToCreateProject, "package-lock.json")));

      const defaultPageName = "page1";
      const defaultPageMenuValue = "Y";

      const forceDeviceXPanelObject = this._outputResponse.data.updatedInputs.find((objValue: any) => objValue.key === "forceDeviceXPanel");
      projectConfigJSON["forceDeviceXPanel"] = forceDeviceXPanelObject.argsValue;

      projectConfigJSON["content"]["$defaultView"] = defaultPageName;
      fs.writeFileSync(path.join(pathToCreateProject, this.PROJECT_CONFIG_JSON_PATH), JSON.stringify(projectConfigJSON));

      process.chdir(pathToCreateProject);

      const packageJsonFile = editJsonFile("./package.json"); // Must be after directory change
      packageJsonFile.set("name", projectConfigJSON.projectName);
      packageJsonFile.save();

      const genPage: Ch5GeneratePageCli = new Ch5GeneratePageCli(false);
      genPage.setInputArgsForTesting(["-n", defaultPageName, "-m", defaultPageMenuValue]);
      await genPage.run();

      // Step 6: Run validate:project-config
      if (!(await this.isConfigFileValid(path.join(pathToCreateProject, this.PROJECT_CONFIG_JSON_PATH), path.join(pathToCreateProject, this.VSCODE_SCHEMA_JSON_PATH)))) {
        throw new Error(this.getText("PROCESS_REQUEST.PROJECT_CONFIG_VALIDATION_FAILED"));
      }

      this._outputResponse.result = true;
      this._outputResponse.successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE", this._outputResponse.data.projectName, projectFolderPath);
    }
    this.logger.end();
  }

  protected validateCLIInputArgument(inputObj: any, key: string, value: string) {
    this.logger.log("validateCLIInputArgument: " + key + " - " + value, inputObj);
    value = String(value).trim().toLowerCase();
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
        this.logger.warn("projectType: " + projectType + " is invalid.");
        return {
          value: "shell-template",
          isValid: true,
          error: ""
        };
      } else {
        return {
          value: projectType,
          isValid: true,
          error: ""
        };
      }
    } else {
      this.logger.log("projectType: " + projectType + " is empty.");
      return {
        value: "shell-template",
        isValid: false,
        error: ""
      };
    }
  }

  private validatePackageJsonProjectName(packageName: string) {
    /*
      - project name length should be greater than zero and cannot exceed 214
      - project name characters must be lowercase i.e., no uppercase or mixed case names are allowed
      - project name can consist of hyphens and numbers, and can only begin with alphabets
      - project name must not contain any non-url-safe characters (since name ends up being part of a URL)
      - project name should not contain any spaces or any of the following characters: ~)('!*
    */
    if (packageName && packageName.trim().length > 0) {
      packageName = packageName.trim().toLowerCase();
      packageName = packageName.substring(0, 213);
      //  const packageNameValidity = new RegExp(/^[a-z][a-z0-9-._$]*$/).test(packageName);
      const regexValue = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/; // /^[a-z][a-z0-9-._$]*$/
      const packageNameValidity = new RegExp(regexValue).test(packageName);
      if (packageNameValidity === false) {
        return {
          value: null,
          isValid: false,
          error: this.getText("COMMON.VALIDATIONS.PROJECT_NAME")
        };
      } else {
        return {
          value: packageName,
          isValid: true,
          error: ""
        };
      }
    } else {
      return {
        value: "",
        isValid: false,
        error: this.getText("COMMON.VALIDATIONS.PROJECT_NAME")
      };
    }
  }

  private printWarningsOnVerifyInputs() {
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

  public getOutputResponse(): any {
    return this._outputResponse;
  }

  public getFolderPath(): any {
    // This method needs to be available here in order to get the current working directory
    return __dirname;
  }
}
