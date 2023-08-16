// Copyright (C) 2023 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCliCreate } from "../Ch5BaseClassForCliCreate";
import { Ch5DeleteComponentsCli } from "../delete-components/Ch5DeleteComponentsCli";
import { Ch5ExportProjectCli } from "../export-project/Ch5ExportProjectCli";
import { Ch5GeneratePageCli } from "../generate-page/Ch5GeneratePageCli";
import { Ch5GenerateWidgetCli } from "../generate-widget/Ch5GenerateWidgetCli";
import { ICh5CliNew } from "../ICh5Cli";

const path = require('path');
const fsExtra = require("fs-extra");

export class Ch5UpdateProjectCli extends Ch5BaseClassForCliCreate implements ICh5CliNew {

  private readonly SHELL_FOLDER: string =  path.resolve(path.normalize(path.join(__dirname, "../../", "shell")));
  private readonly TEMPLATES_SHELL_FOLDER: string = path.resolve(path.normalize(path.join(__dirname, "../../", "project-templates", "shell-template")));
  private readonly TEMPLATES_ZOOM_ROOM_CONTROL_FOLDER: string = path.resolve(path.normalize(path.join(__dirname, "../../", "project-templates", "ZoomRoomControl")));
  private readonly PROJECT_CONFIG_JSON_PATH: string =path.normalize("/app/project-config.json");
  private readonly VSCODE_SCHEMA_JSON_PATH: string =path.join(".vscode", "project-config-schema.json");

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
    if (this.inputArgs["config"].inputValue !== "") {
      // Do nothing
    } else {
      const getAllThemeNames = this.projectConfig.getAllThemeNames();
      if (this.inputArgs["selectedTheme"]) {
        this.inputArgs["selectedTheme"].allowedValues = getAllThemeNames;
        this.inputArgs["selectedTheme"].allowedAliases = getAllThemeNames;
      }
    }
    this.logger.end();
  }

  /**
   * Verify input parameters
   */
  async verifyInputParams() {
    this.logger.start("verifyInputParams");
    this.logger.log("verifyInputParams - this.inputArgs: ", this.inputArgs);
    // Step 0: Check if json in the project to be updated is valid or not
    if (!(await this.isConfigFileValid(this.PROJECT_CONFIG_JSON_PATH, path.join(this.SHELL_FOLDER, this.VSCODE_SCHEMA_JSON_PATH)))) {
      throw new Error(this.getText("VERIFY_INPUT_PARAMS.INVALID_PROJECT_CONFIG_JSON"));
    }

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

          if (this.utils.isValidInput(value.inputValue)) {
            const validationResponse: any = this.validateCLIInputArgument(value, value.key, value.inputValue);
            this.logger.log("validationResponse is ", validationResponse);
            if (validationResponse.warning === "") {
              inputUpdate.argsValue = validationResponse.value;
            } else {
              inputUpdate.warning = validationResponse.warning;
            }
          }
          this._outputResponse.data.updatedInputs.push(inputUpdate);
        }
      });

      this.logger.log("this._outputResponse.data.updatedInputs: ", this._outputResponse.data.updatedInputs);

      // To Check if atleast 1 input is provided
      if (this._outputResponse.data.updatedInputs.length === 0) {
        throw new Error(this.getText("VERIFY_INPUT_PARAMS.MISSING_INPUTS_NEED_ATlEAST_ONE_DATA"));
      }

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
    this.logger.end();
  }

  /**
   * Check if there are questions to be prompted to the integrator
   */
  async checkPromptQuestions() {
    this.logger.start("checkPromptQuestions");
    if (this.inputArgs["config"].argsValue !== "") {

      // Identify changes
      // const newCheck = new CompareJSON();
      // this.logger.log(newCheck.map(oldProjectConfigJSON, newProjectConfigJSON));

      let askConfirmation: boolean = false;
      if (this.inputArgs["force"].argsValue === true) {
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
          throw new Error(this.getText("ERRORS.DO_NOT_UPDATE_PROJECT"));
        });
      }
      this._outputResponse.askConfirmation = this.utils.toBoolean(askConfirmation);
    } else {
      for (let i: number = 0; i < this._outputResponse.data.updatedInputs.length; i++) {
        if (this._outputResponse.data.updatedInputs[i].inputReceived === true && !this.utils.isValidInput(this._outputResponse.data.updatedInputs[i].argsValue)) {
          if (this._outputResponse.data.updatedInputs[i].type === "enum" || this._outputResponse.data.updatedInputs[i].type === "boolean") {
            const choicesList = this._outputResponse.data.updatedInputs[i].allowedValues;
            const componentsQuery = new this.getSelect({
              name: this._outputResponse.data.updatedInputs[i].key,
              message: this.getText(this._outputResponse.data.updatedInputs[i].question, this._outputResponse.data.updatedInputs[i].key),
              choices: choicesList
            });

            this._outputResponse.data.updatedInputs[i].argsValue = await componentsQuery.run()
              .then((selectedMenu: any) => { return selectedMenu; })
              .catch((error: any) => { throw new Error(this.getText("ERRORS.DO_NOT_UPDATE_PROJECT")); });
            if (this._outputResponse.data.updatedInputs[i].type === "boolean") {
              this._outputResponse.data.updatedInputs[i].argsValue = this.toBoolean(this._outputResponse.data.updatedInputs[i].argsValue);
            }

            this.logger.log(this._outputResponse.data.updatedInputs[i].key + ": ", this._outputResponse.data.updatedInputs[i].argsValue);
          } else if (this._outputResponse.data.updatedInputs[i].type === "string") {
            const question = {
              name: this._outputResponse.data.updatedInputs[i].key,
              message: this.getText(this._outputResponse.data.updatedInputs[i].question, this._outputResponse.data.updatedInputs[i].key),
              type: 'input'
            };
            this._outputResponse.data.updatedInputs[i].argsValue = await this.getPrompt(question)
              .then((answer: any) => { 
                if(this._outputResponse.data.updatedInputs[i].key==="projectName"){
                return answer[this._outputResponse.data.updatedInputs[i].key].toLowerCase();
              }
                else {
                return answer[this._outputResponse.data.updatedInputs[i].key];}
               }
               )
              .catch((error: any) => { throw new Error(this.getText("ERRORS.DO_NOT_UPDATE_PROJECT")); });

            this.logger.log(this._outputResponse.data.updatedInputs[i].key + ": ", this._outputResponse.data.updatedInputs[i].argsValue);
          }
        }
      }

      this._outputResponse.askConfirmation = true;
    }
    this.logger.end();
  }

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    this.logger.start("processRequest");
    if (this._outputResponse.askConfirmation === true) {
      if (this.inputArgs["config"].argsValue !== "") {

        const folderNameForBackup: string = this.getFolderName();
        this._outputResponse.data.backupFolder = path.normalize(path.join(this.getConfigNode("backupFolder"), folderNameForBackup));
        // Step 3: Take back up of existing json and project
        fsExtra.copySync(this.inputArgs["config"].argsValue, path.join(this.getConfigNode("backupFolder"), folderNameForBackup, "project-config.json"));

        const exportProject = new Ch5ExportProjectCli(false);
        exportProject.changeConfigParam("zipFileDestinationPath", path.join(this.getConfigNode("backupFolder"), folderNameForBackup));
        await exportProject.run();

        // Step 4: Make changes to project-config.json stepwise
        const oldProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.PROJECT_CONFIG_JSON_PATH));
        const newProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.inputArgs["config"].argsValue));

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
        oldProjectConfigJSON["content"]["$defaultView"] = newProjectConfigJSON["content"]["$defaultView"];
        this.projectConfig.changeNodeValues("content.$defaultView", oldProjectConfigJSON["content"]["$defaultView"]);

        oldProjectConfigJSON["content"]["triggerViewProperties"] = newProjectConfigJSON["content"]["triggerViewProperties"];
        this.projectConfig.changeNodeValues("content.triggerViewProperties", oldProjectConfigJSON["content"]["triggerViewProperties"]);

        const pagesToBeCreated: any[] = [];
        const pagesToBeUpdated: any[] = [];
        const pagesToBeDeleted: any[] = [];
        for (let i: number = 0; i < oldProjectConfigJSON["content"]["pages"].length; i++) {
          let pageObj = oldProjectConfigJSON["content"]["pages"][i];
          const pageInNewSet = newProjectConfigJSON["content"]["pages"].find((page: any) => page.pageName.toString().toLowerCase() === pageObj.pageName.toString().toLowerCase());
          if (pageInNewSet) {
            pagesToBeUpdated.push(pageInNewSet);
          } else {
            // Exists in Old set but not in new - so create page
            pagesToBeDeleted.push(pageObj);
          }
        }
        for (let i: number = 0; i < newProjectConfigJSON["content"]["pages"].length; i++) {
          let pageObj = newProjectConfigJSON["content"]["pages"][i];
          const pageInOldSet = oldProjectConfigJSON["content"]["pages"].find((page: any) => page.pageName.toString().toLowerCase() === pageObj.pageName.toString().toLowerCase());
          if (!pageInOldSet) {
            // Exists in New set but not in old - so create page
            pagesToBeCreated.push(pageObj);
          }
        }

        const widgetsToBeCreated: any[] = [];
        const widgetsToBeDeleted: any[] = [];
        const widgetsToBeUpdated: any[] = [];

        for (let i: number = 0; i < oldProjectConfigJSON["content"]["widgets"].length; i++) {
          const widgetObj = oldProjectConfigJSON["content"]["widgets"][i];
          const pageInNewSet = newProjectConfigJSON["content"]["widgets"].find((widget: any) => widget.widgetName.toString().toLowerCase() === widgetObj.widgetName.toString().toLowerCase());
          if (pageInNewSet) {
            widgetsToBeUpdated.push(pageInNewSet);
          } else {
            // Exists in Old set but not in new - so create page
            widgetsToBeDeleted.push(widgetObj);
          }
        }

        for (let i: number = 0; i < newProjectConfigJSON["content"]["widgets"].length; i++) {
          const widgetObj = newProjectConfigJSON["content"]["widgets"][i];
          const pageInOldSet = oldProjectConfigJSON["content"]["widgets"].find((widget: any) => widget.widgetName.toString().toLowerCase() === widgetObj.widgetName.toString().toLowerCase());
          if (!pageInOldSet) {
            // Exists in New set but not in old - so create page
            widgetsToBeCreated.push(widgetObj);
          }
        }

        for (let i: number = 0; i < pagesToBeDeleted.length; i++) {
          const delPage: Ch5DeleteComponentsCli = new Ch5DeleteComponentsCli(false);
          delPage.setInputArgsForTesting(["--list", pagesToBeDeleted[i].pageName, "--force"]);
          await delPage.run();
        }

        for (let i: number = 0; i < pagesToBeCreated.length; i++) {
          const genPage: Ch5GeneratePageCli = new Ch5GeneratePageCli(false);
          const newPageName = pagesToBeCreated[i].fileName.toLowerCase().split(".")[0]; // pagesToBeCreated[i].pageName - picking file name to accommodate hyphens
          genPage.setInputArgsForTesting(["-n", newPageName, "-m", pagesToBeCreated[i].navigation ? "Y" : "N"]);  
          await genPage.run();
          this.projectConfig.replacePageNodeInJSON(pagesToBeCreated[i]);
        }

        for (let i: number = 0; i < pagesToBeUpdated.length; i++) {
          // Update in project-config
          this.projectConfig.replacePageNodeInJSON(pagesToBeUpdated[i]);
        }

        for (let i: number = 0; i < widgetsToBeDeleted.length; i++) {
          const delWidget: Ch5DeleteComponentsCli = new Ch5DeleteComponentsCli(false);
          delWidget.setInputArgsForTesting(["--list", widgetsToBeDeleted[i].widgetName, "--force"]);
          await delWidget.run();
        }

        for (let i: number = 0; i < widgetsToBeCreated.length; i++) {
          const genWidget: Ch5GenerateWidgetCli = new Ch5GenerateWidgetCli(false);
          const newWidgetName = widgetsToBeCreated[i].fileName.toLowerCase().split(".")[0]; // widgetsToBeCreated[i].widgetName - picking file name to accommodate hyphens
          genWidget.setInputArgsForTesting(["-n", newWidgetName]);
          await genWidget.run();
          this.projectConfig.removeWidgetFromJSON(widgetsToBeCreated[i]);
        }

        for (let i: number = 0; i < widgetsToBeUpdated.length; i++) {
          // Update in project-config
          this.projectConfig.replaceWidgetNodeInJSON(widgetsToBeUpdated[i]);
        }

        // Step 6: Run validate:project-config
        if (!(await this.isConfigFileValid(this.PROJECT_CONFIG_JSON_PATH, path.join(this.SHELL_FOLDER, this.VSCODE_SCHEMA_JSON_PATH)))) {
          throw new Error(this.getText("PROCESS_REQUEST.FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_INVALID"));
        }

        // Step 7: Show proper messages  
        this._outputResponse.result = true;
        this._outputResponse.successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE_WITH_BACKUP", this._outputResponse.data.backupFolder);

      } else {
        // Change project config
        for (let i: number = 0; i < this._outputResponse.data.updatedInputs.length; i++) {
          this.logger.log("Changed Values", this._outputResponse.data.updatedInputs[i].key, this._outputResponse.data.updatedInputs[i].argsValue)
          this.projectConfig.changeNodeValues(this._outputResponse.data.updatedInputs[i].key, this._outputResponse.data.updatedInputs[i].argsValue);
        }
        this._outputResponse.result = true;
        this._outputResponse.successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE");
      }
    } else if (this._outputResponse.askConfirmation === false) {
      throw new Error(this.getText("ERRORS.DO_NOT_UPDATE_PROJECT"));
    } else {
      throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
    }
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

  getFolderName() {
    const currentDateTime = new Date();
    return String(currentDateTime.getFullYear()) + "-" + this.doubleDigit(currentDateTime.getMonth() + 1) + "-" + this.doubleDigit(currentDateTime.getDate()) + "-" + this.doubleDigit(currentDateTime.getHours()) + "-" + this.doubleDigit(currentDateTime.getMinutes()) + "-" + this.doubleDigit(currentDateTime.getSeconds());
  }

  private doubleDigit(input: number): string {
    if (input < 10) {
      return "0" + String(input);
    }
    return String(input);
  }

  private toBoolean(val: any, isEmptyValueEqualToTrue = false): boolean {
    const str = String(val);
    switch (str.toLowerCase().trim()) {
      case "true": case "1": return true;
      case "false": case "0": return false;
      case "": case null: case undefined:
        if (isEmptyValueEqualToTrue === true) {
          return true;
        } else {
          return false;
        }
      default:
        return false;
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
