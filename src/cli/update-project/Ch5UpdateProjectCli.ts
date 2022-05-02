// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCliNew } from "../Ch5BaseClassForCliNew";
import { Ch5DeleteComponentsCli } from "../delete-components/Ch5DeleteComponentsCli";
import { Ch5ExportProjectCli } from "../export-project/Ch5ExportProjectCli";
import { Ch5GeneratePageCli } from "../generate-page/Ch5GeneratePageCli";
import { Ch5GenerateWidgetCli } from "../generate-widget/Ch5GenerateWidgetCli";
import { ICh5CliNew } from "../ICh5Cli";

const path = require('path');
const fs = require("fs");
const fsExtra = require("fs-extra");

export class Ch5UpdateProjectCli extends Ch5BaseClassForCliNew implements ICh5CliNew {

  private readonly SHELL_FOLDER: string = path.normalize(path.join(__dirname, "../../", "shell"));
  private readonly PROJECT_CONFIG_JSON_PATH: string = path.normalize("./app/project-config.json");
  private readonly VSCODE_SCHEMA_JSON_PATH: string = path.normalize(path.join(".vscode", "project-config-schema.json"));

  /**
   * Constructor
   */
  public constructor(public showOutputMessages: boolean = true) {
    super("update-project");
  }

  /**
   * Initialize process
   */
  async initialize() {
    this.outputResponse.data.updateInputs = [];
    this.outputResponse.data.projectName = "";
    this.outputResponse.data.backupFolder = "";
    if (this.inputArgs["config"].argsValue !== "") {
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
    if (this.inputArgs["config"].argsValue !== "") {
      // Step 1: Check file extension for json, valid input for 'config' argument, and config file existence
      if (!(this.utils.isValidInput(this.inputArgs["config"].argsValue) && this.isConfigFileExist(this.inputArgs["config"].argsValue))) {
        throw new Error(this.getText("VERIFY_INPUT_PARAMS.INVALID_CONFIG_INPUT"));
      }
      // Step 2: Check if json is as per its schema (.vscode is hidden folder)
      if (!(this.isConfigFileValid(this.inputArgs["config"].argsValue, path.join(this.SHELL_FOLDER, this.VSCODE_SCHEMA_JSON_PATH), false))) {
        throw new Error(this.getText("VERIFY_INPUT_PARAMS.INVALID_CONFIG_FILE"));
      }
    } else {
      this.logger.log("Update project without json file");

      Object.entries(this.inputArgs).forEach(([key, value]: any) => {
        if (value.isSpecialArgument === false) {
          const inputUpdate = {
            ...value,
            "warning": ""
          };
          if (value.inputReceived === true) {
            // TODO - how to check validity of data
            if (this.utils.isValidInput(value.argsValue)) {
              const validationResponse: any = this.validateCLIInputArgument(value, value.key, value.argsValue, this.getText("VERIFY_INPUT_PARAMS.INVALID_INPUT", value.key));
              this.logger.log("validationResponse", validationResponse);
              if (validationResponse.warning === "") {
                inputUpdate.argsValue = validationResponse.value;
              } else {
                inputUpdate.argsValue = null;
                inputUpdate.warning = validationResponse.warning;
              }
            }
            this.outputResponse.data.updateInputs.push(inputUpdate);
          }
        }
      });
      this.logger.log("this.outputResponse.data.updateInputs: ", this.outputResponse.data.updateInputs);

      // To Check if atleast 1 input is provided
      if (this.outputResponse.data.updateInputs.length === 0) {
        throw new Error(this.getText("VERIFY_INPUT_PARAMS.MISSING_INPUTS_NEED_ATlEAST_ONE_DATA"));
      }

      const tabDisplayText = this.getText("COMMON.HYPHEN_DELIMITER");
      let warningMessage: string = "";
      for (let i: number = 0; i < this.outputResponse.data.updateInputs.length; i++) {
        if (this.utils.isValidInput(this.outputResponse.data.updateInputs[i].warning)) {
          warningMessage += tabDisplayText + this.outputResponse.data.updateInputs[i].key + ": " + this.outputResponse.data.updateInputs[i].warning;
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

      const folderNameForBackup: string = this.getFolderName();
      this.outputResponse.data.backupFolder = path.normalize(path.join(this.getConfigNode("backupFolder"), folderNameForBackup));
      // Step 3: Take back up of existing json and project
      fsExtra.copySync(this.inputArgs["config"].argsValue, path.join(this.getConfigNode("backupFolder"), folderNameForBackup, "project-config.json"));

      const exportProject = new Ch5ExportProjectCli(false);
      exportProject.changeConfigParam("zipFileDestinationPath", path.join(this.getConfigNode("backupFolder"), folderNameForBackup));
      exportProject.run();

      // Identify changes
      // const newCheck = new CompareJSON();
      // console.log(newCheck.map(oldProjectConfigJSON, newProjectConfigJSON));

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
      this.outputResponse.askConfirmation = this.utils.toBoolean(askConfirmation);
    } else {
      for (let i: number = 0; i < this.outputResponse.data.updateInputs.length; i++) {
        if (this.outputResponse.data.updateInputs[i].inputReceived === true && !this.utils.isValidInput(this.outputResponse.data.updateInputs[i].argsValue)) {
          if (this.outputResponse.data.updateInputs[i].type === "enum" || this.outputResponse.data.updateInputs[i].type === "boolean") {
            const choicesList = this.outputResponse.data.updateInputs[i].allowedValues;
            const componentsQuery = new this.getSelect({
              name: this.outputResponse.data.updateInputs[i].key,
              message: this.getText(this.outputResponse.data.updateInputs[i].question, this.outputResponse.data.updateInputs[i].key),
              choices: choicesList
            });

            this.outputResponse.data.updateInputs[i].argsValue = await componentsQuery.run()
              .then((selectedMenu: any) => { return selectedMenu; })
              .catch((error: any) => { throw new Error(this.getText("ERRORS.DO_NOT_UPDATE_PROJECT")); });
            this.logger.log(this.outputResponse.data.updateInputs[i].key + ": ", this.outputResponse.data.updateInputs[i].argsValue);
          } else if (this.outputResponse.data.updateInputs[i].type === "string") {
            const question = {
              name: this.outputResponse.data.updateInputs[i].key,
              message: this.getText(this.outputResponse.data.updateInputs[i].question, this.outputResponse.data.updateInputs[i].key),
              type: 'input'
            };
            // TODO - validate method
            this.outputResponse.data.updateInputs[i].argsValue = await this.getPrompt(question)
              .then((answer: any) => { return answer[this.outputResponse.data.updateInputs[i].key]; })
              .catch((error: any) => { throw new Error(this.getText("ERRORS.DO_NOT_UPDATE_PROJECT")); });

            this.logger.log(this.outputResponse.data.updateInputs[i].key + ": ", this.outputResponse.data.updateInputs[i].argsValue);
          }
        }
      }

      this.outputResponse.askConfirmation = true;
    }
    this.logger.end();
  }

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    this.logger.start("processRequest");
    if (this.outputResponse.askConfirmation === true) {
      if (this.inputArgs["config"].argsValue !== "") {

        // Step 4: Make changes to project-config.json stepwise
        const oldProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.PROJECT_CONFIG_JSON_PATH));
        const newProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.inputArgs["config"].argsValue));

        // 1. Project Data
        for (const k in newProjectConfigJSON) {
          if (!(typeof newProjectConfigJSON[k] === 'object' && newProjectConfigJSON[k] !== null)) {
            if (oldProjectConfigJSON[k] && oldProjectConfigJSON[k] !== newProjectConfigJSON[k]) {
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
          genPage.setInputArgsForTesting(["-n", pagesToBeCreated[i].pageName, "-m", pagesToBeCreated[i].navigation ? "Y" : "N"]);
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
          genWidget.setInputArgsForTesting(["-n", widgetsToBeCreated[i].widgetName]);
          await genWidget.run();
          this.projectConfig.removeWidgetFromJSON(widgetsToBeCreated[i]);
        }

        for (let i: number = 0; i < widgetsToBeUpdated.length; i++) {
          // Update in project-config
          this.projectConfig.replaceWidgetNodeInJSON(widgetsToBeUpdated[i]);
        }

        // Step 6: Run validate:project-config
        if (!(this.isConfigFileValid(this.PROJECT_CONFIG_JSON_PATH, path.join(this.SHELL_FOLDER, this.VSCODE_SCHEMA_JSON_PATH)))) {
          throw new Error(this.getText("PROCESS_REQUEST.FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_INVALID"));
        }

        // Step 7: Show proper messages  
        this.outputResponse.result = true;
        this.outputResponse.successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE_WITH_BACKUP", this.outputResponse.data.backupFolder);

      } else {
        // Change project config
        for (let i: number = 0; i < this.outputResponse.data.updateInputs.length; i++) {
          this.logger.log("Changed Values", this.outputResponse.data.updateInputs[i].key, this.outputResponse.data.updateInputs[i].argsValue)
          this.projectConfig.changeNodeValues(this.outputResponse.data.updateInputs[i].key, this.outputResponse.data.updateInputs[i].argsValue);
        }
        this.outputResponse.result = true;
        this.outputResponse.successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE");
      }
    } else if (this.outputResponse.askConfirmation === false) {
      throw new Error(this.getText("ERRORS.DO_NOT_UPDATE_PROJECT"));
    } else {
      throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
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
  /**
   * Clean up
   */
  async cleanUp() {
    if (this.inputArgs["config"].argsValue !== "") {
      // Step 7: Clean up
    }
  }

}
