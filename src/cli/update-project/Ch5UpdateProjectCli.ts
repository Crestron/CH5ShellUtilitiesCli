// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCliNew } from "../Ch5BaseClassForCliNew";
import { Ch5GeneratePageCli } from "../generate-page/Ch5GeneratePageCli";
import { ICh5Cli } from "../ICh5Cli";

const path = require('path');
const fs = require("fs");
const fsExtra = require("fs-extra");

export class Ch5UpdateProjectCli extends Ch5BaseClassForCliNew implements ICh5Cli {

  /**
   * Constructor
   */
  public constructor() {
    super("update-project");
  }

  /**
   * Method for updating project
   */
  async run() {
    this.logger.start("run");
    try {
      // Initialize
      this.initialize();

      // Verify input params
      this.verifyInputParams();

      // Ask details to developer based on input parameter validation
      await this.checkPromptQuestions();

      // // Update project-config first (so that if this fails, we don't worry about file deletion). Next Delete Files
      await this.processRequest();

    } catch (e: any) {
      this.outputResponse.errorMessage = this.logError(e);
    } finally {
      // Clean up
      this.cleanUp();
    }

    // Show output response
    this.logOutput();
    this.logger.end();
    return this.outputResponse.result; // The return is required to validate in automation test case
  }

  /**
   * Initialize process
   */
  initialize() {
    this.logger.start("initialize");
    super.initialize();
    this.outputResponse.data.updateInputs = [];

    if (this.inputArgs["config"] !== "") {
      // Do nothing
    } else {
      const getAllStandalonePages = this.projectConfig.getAllStandalonePages();

      const headerComponentObj: any = this.inputArgs.find((inpObj: any) => "headerComponent" === inpObj.key);
      if (headerComponentObj) {
        headerComponentObj.allowedValues = getAllStandalonePages;
        headerComponentObj.allowedAliases = getAllStandalonePages;
      }

      const footerComponentObj: any = this.inputArgs.find((inpObj: any) => "footerComponent" === inpObj.key);
      if (footerComponentObj) {
        footerComponentObj.allowedValues = getAllStandalonePages;
        footerComponentObj.allowedAliases = getAllStandalonePages;
      }

      const selectedThemeObj: any = this.inputArgs.find((inpObj: any) => "selectedTheme" === inpObj.key);
      if (selectedThemeObj) {
        const getAllThemeNames = this.projectConfig.getAllThemeNames();
        selectedThemeObj.allowedValues = getAllThemeNames;
        selectedThemeObj.allowedAliases = getAllThemeNames;
      }

      const defaultViewObj: any = this.inputArgs.find((inpObj: any) => "defaultView" === inpObj.key);
      if (defaultViewObj) {
        const getAllNavigationPages = this.projectConfig.getAllNavigations();
        defaultViewObj.allowedValues = getAllNavigationPages;
        defaultViewObj.allowedAliases = getAllNavigationPages;
      }
    }
    this.logger.end();
  }

  /**
   * Verify input parameters
   */
  verifyInputParams() {
    this.logger.start("verifyInputParams");
    if (this.inputArgs["config"].argsValue !== "") {
      // Step 1: Check file extension for json
      if (!(this.utils.isValidInput(this.inputArgs["config"].argsValue) && this.isConfigFileExist(this.inputArgs["config"].argsValue))) {
        throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_MISSING"));
      }
      // Step 2: Check if json is as per its schema (.vscode is hidden folder)
      if (!(this.isConfigFileValid(this.inputArgs["config"].argsValue, path.join(__dirname, "files/shell/.vscode", "project-config-schema.json")))) {
        // this.logger.printError(this.composeOutput(this.errorsFound, this.getText("TYPE_ERROR"))); // TODO
        throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_INVALID"));
      }
    } else {
      
      Object.entries(this.inputArgs).forEach(([key, value]: any) => {
        const inputUpdate = {
          ...value,
          "warning": "",
          "value": null
        };
        if (value.inputReceived === true && (this.utils.isValidInput(value.argsValue) || value.optionalArgument === false)) {
          console.log("value.optionalArgument", value.optionalArgument);
          if (this.utils.isValidInput(value.argsValue)) {
            const validationResponse: any = this.validateCLIInputArgument(value, value.key, value.argsValue, this.getText("ERRORS.INVALID_INPUT"));
            this.logger.log("validationResponse", validationResponse);
            if (validationResponse.error === "") {
              inputUpdate.value = validationResponse.value;
            } else {
              inputUpdate.warning = this.getText("ERRORS.INVALID_ENTRY", validationResponse.error);
            }
          }
          this.outputResponse.data.updateInputs.push(inputUpdate);
        } else if (value.optionalArgument === false) {
          this.outputResponse.data.updateInputs.push(inputUpdate);
        }
      });
      this.logger.log("this.outputResponse.data.updateInputs: ", this.outputResponse.data.updateInputs);

      const tabDisplayText = this.getText("ERRORS.TAB_DELIMITER");
      let warningMessage: string = "";
      for (let i: number = 0; i < this.outputResponse.data.updateInputs.length; i++) {
        if (this.utils.isValidInput(this.outputResponse.data.updateInputs[i].warning)) {
          warningMessage += tabDisplayText + this.outputResponse.data.updateInputs[i].key + ": " + this.outputResponse.data.updateInputs[i].warning;
        }
      }
      if (warningMessage !== "") {
        this.logger.printWarning(this.getText("ERRORS.MESSAGE_TITLE", warningMessage));
      }

      // To Check if atleast 1 input is provided
      if (this.outputResponse.data.updateInputs.length === 0) {
        throw new Error(this.getText("ERRORS.MISSING_ATlEAST_ONE_DATA"));
      }
    }
    this.logger.end();
  }

  /**
   * Check if there are questions to be prompted to the developer
   */
  async checkPromptQuestions() {
    this.logger.start("checkPromptQuestions");
    if (this.inputArgs["config"].argsValue !== "") {
      // Step 3: Take back up of existing json and project
      // fsExtra.copySync(this.inputArguments["config"], path.join(this.getConfigNode("backupFolder"), this.getFolderName(), "project-config.json"));

      // const exportProject = new Ch5ExportProjectCli();
      // exportProject.changeConfigParam("zipFileDestinationPath", path.join(this.getConfigNode("backupFolder"), this.getFolderName()));
      // exportProject.run();

      // const newCheck = new CompareJSON();
      // console.log(newCheck.map(oldProjectConfigJSON, newProjectConfigJSON));

      // Identify changes

      let askConfirmation: boolean = false;
      if (this.inputArgs["force"].argsValue === true) {
        askConfirmation = true;
      } else {
        const questionsArray = {
          name: this.getText("VALIDATIONS.CONFIRMATION.TITLE"),
          message: this.getText("VALIDATIONS.ARE_YOU_SURE_TO_CHANGE"),
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
        if (!this.utils.isValidInput(this.outputResponse.data.updateInputs[i].value)) {
          if (this.outputResponse.data.updateInputs[i].type === "enum") {
            const choicesList = this.outputResponse.data.updateInputs[i].allowedValues;
            const componentsQuery = new this.getSelect({
              name: 'value',
              message: this.getText(this.outputResponse.data.updateInputs[i].question),
              choices: choicesList
            });

            this.outputResponse.data.updateInputs[i].value = await componentsQuery.run()
              .then((selectedMenu: any) => { return selectedMenu; })
              .catch((error: any) => { throw new Error(this.getText("ERRORS.DO_NOT_UPDATE_PROJECT")); });
            this.logger.log(this.outputResponse.data.updateInputs[i].key + ": ", this.outputResponse.data.updateInputs[i].value);
          }
        }
      }

      this.outputResponse.askConfirmation = true;
    }
  }

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    this.logger.start("processRequest");
    if (this.outputResponse.askConfirmation === true) {
      if (this.inputArgs["config"].argsValue !== "") {

        // Step 4: Make changes to project-config.json stepwise
        const oldProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync("./app/project-config.json"));
        const newProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.inputArgs["config"].argsValue));
        // this.projectConfigJsonSchema = JSON.parse(this.utils.readFileContentSync("./.vscode/project-config-schema.json"));

        // 1. Project Data
        for (const k in newProjectConfigJSON) {
          if (!(typeof newProjectConfigJSON[k] === 'object' && newProjectConfigJSON[k] !== null)) {
            if (oldProjectConfigJSON[k] && oldProjectConfigJSON[k] !== newProjectConfigJSON[k]) {
              oldProjectConfigJSON[k] = newProjectConfigJSON[k];
            }
          }
        }

        // 2. Themes
        oldProjectConfigJSON["themes"] = newProjectConfigJSON["themes"];

        // 3. Config
        oldProjectConfigJSON["config"] = newProjectConfigJSON["config"];

        // 4. Header
        oldProjectConfigJSON["header"] = newProjectConfigJSON["header"];

        // 5. Footer
        oldProjectConfigJSON["footer"] = newProjectConfigJSON["footer"];

        // 6. Content
        // for (const k in newProjectConfigJSON["content"]) {
        //   if (!(typeof newProjectConfigJSON["content"][k] === 'object' && newProjectConfigJSON["content"][k] !== null)) {
        //     if (oldProjectConfigJSON["content"][k] && oldProjectConfigJSON["content"][k] !== newProjectConfigJSON["content"][k]) {
        //       changesToBeDone.push({ "key": k, "oldValue": oldProjectConfigJSON["content"][k], "newValue": newProjectConfigJSON["content"][k] });
        //       oldProjectConfigJSON["content"][k] = newProjectConfigJSON["content"][k];
        //     }
        //   }
        // }
        oldProjectConfigJSON["content"]["$defaultView"] = newProjectConfigJSON["content"]["$defaultView"];
        oldProjectConfigJSON["content"]["triggerViewProperties"] = newProjectConfigJSON["content"]["triggerViewProperties"];

        const pagesToBeCreated: any[] = [];
        const pagesToBeDeleted: any[] = [];
        for (let i: number = 0; i < oldProjectConfigJSON["content"]["pages"].length; i++) {
          let pageObj = oldProjectConfigJSON["content"]["pages"][i];
          const pageInNewSet = newProjectConfigJSON["content"]["pages"].find((pageName: any) => pageName === pageObj.pageName);
          if (pageInNewSet) {
            pageObj = pageInNewSet;
          } else {
            // Exists in Old set but not in new - so create page
            pagesToBeDeleted.push(pageObj);
            //   changesToBeDone.push({ "key": k, "oldValue": oldProjectConfigJSON["content"][k], "newValue": newProjectConfigJSON["content"][k] });
          }
        }
        for (let i: number = 0; i < newProjectConfigJSON["content"]["pages"].length; i++) {
          let pageObj = newProjectConfigJSON["content"]["pages"][i];
          const pageInOldSet = oldProjectConfigJSON["content"]["pages"].find((pageName: any) => pageName === pageObj.pageName);
          if (!pageInOldSet) {
            // Exists in New set but not in old - so create page
            pagesToBeCreated.push(pageObj);
            //   changesToBeDone.push({ "key": k, "oldValue": oldProjectConfigJSON["content"][k], "newValue": newProjectConfigJSON["content"][k] });
          }
        }

        const widgetsToBeCreated: any[] = [];
        const widgetsToBeDeleted: any[] = [];
        for (let i: number = 0; i < oldProjectConfigJSON["content"]["widgets"].length; i++) {
          let pageObj = oldProjectConfigJSON["content"]["widgets"][i];
          const pageInNewSet = newProjectConfigJSON["content"]["widgets"].find((widgetName: any) => widgetName === pageObj.widgetName);
          if (pageInNewSet) {
            pageObj = pageInNewSet;
          } else {
            // Exists in Old set but not in new - so create page
            widgetsToBeDeleted.push(pageObj);
            //   changesToBeDone.push({ "key": k, "oldValue": oldProjectConfigJSON["content"][k], "newValue": newProjectConfigJSON["content"][k] });
          }
        }
        for (let i: number = 0; i < newProjectConfigJSON["content"]["widgets"].length; i++) {
          let pageObj = newProjectConfigJSON["content"]["widgets"][i];
          const pageInOldSet = oldProjectConfigJSON["content"]["widgets"].find((widgetName: any) => widgetName === pageObj.widgetName);
          if (!pageInOldSet) {
            // Exists in New set but not in old - so create page
            widgetsToBeCreated.push(pageObj);
            //   changesToBeDone.push({ "key": k, "oldValue": oldProjectConfigJSON["content"][k], "newValue": newProjectConfigJSON["content"][k] });
          }
        }

        // Step 5: Save Project-config
        this.projectConfig.addPagesToJSON(pagesToBeCreated);
        this.projectConfig.removePagesFromJSON(pagesToBeDeleted);
        this.projectConfig.addWidgetsToJSON(widgetsToBeCreated);
        this.projectConfig.removeWidgetsFromJSON(widgetsToBeDeleted);
        // this.projectConfig.save(newProjectConfigJSON);

        // Step 6: Run validate:project-config
        if (!(this.isConfigFileValid("./app/project-config.json", path.join(__dirname, "files", "project-config-schema.json")))) {
          // this.logger.printError(this.composeOutput(this.errorsFound, this.getText("TYPE_ERROR"))); // TODO
          throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_INVALID"));
        }

        // Step 7: Show proper messages  
        this.outputResponse.result = true;
      } else {
        // Change project config
        for (let i: number = 0; i < this.outputResponse.data.updateInputs.length; i++) {
          this.projectConfig.changeNodeValues(this.outputResponse.data.updateInputs[i].key, this.outputResponse.data.updateInputs[i].value);
        }
        this.outputResponse.result = true;
      }
    } else if (this.outputResponse.askConfirmation === false) {
      throw new Error(this.getText("ERRORS.DO_NOT_UPDATE_PROJECT"));
    } else {
      throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
    }
  }

  getFolderName() {
    const currentDateTime = new Date();
    return String(currentDateTime.getFullYear()) + String(currentDateTime.getMonth() + 1) + String(currentDateTime.getDate()) + String(currentDateTime.getHours()) + String(currentDateTime.getMinutes()) + String(currentDateTime.getSeconds());
  }

  /**
   * Clean up
   */
  cleanUp() {
    if (this.inputArgs["config"].argsValue !== "") {
      // Step 7: Clean up
    }
  }

  /**
   * Log Final Response Message
   */
  logOutput() {
    if (this.outputResponse.result === false) {
      this.logger.printError(this.outputResponse.errorMessage);
    } else {
      this.logger.printSuccess(this.getText("SUCCESS_MESSAGE", this.utils.convertArrayToString(this.outputResponse['validInputsForComponentNames'], ", ")) + "\n");
    }
  }

}
