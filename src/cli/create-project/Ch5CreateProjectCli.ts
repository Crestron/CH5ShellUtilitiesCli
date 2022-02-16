// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCli } from "../Ch5BaseClassForCli";
import { ICh5Cli } from "../ICh5Cli";
import { Ch5ValidateProjectConfigCli } from "../validate-project-config/Ch5ValidateProjectConfigJsonCli";

const path = require('path');
const fs = require("fs");
const fsExtra = require("fs-extra");
const jsonSchema = require('jsonschema');

const { Select, Confirm } = require('enquirer');
const Enquirer = require('enquirer');
const enquirer = new Enquirer();

export class Ch5CreateProjectCli extends Ch5BaseClassForCli implements ICh5Cli {

  private inputsToValidate: any[] = [];
  private outputResponse: any = {};
  private errorsFound: any = [];

  /**
   * Constructor
   */
  public constructor() {
    super("create-project");
  }

  public get getEnquirer() {
    return enquirer;
  }

  public get getSelect() {
    return Select;
  }

  /**
   * Method for updating project
   */
  async run() {
    try {
      // Initialize
      this.initialize();

      // Verify input params
      this.verifyInputParams();

      // Ask details to developer based on input parameter validation
      await this.checkPromptQuestions();

      // // Update project-config first (so that if this fails, we don't worry about file deletion). Next Delete Files
      // await this.processRequest();

    } catch (e: any) {
      this.outputResponse.errorMessage = this.logError(e);
    } finally {
      // Clean up
      this.cleanUp();
    }

    // Show output response
    this.logOutput();
    return this.outputResponse.result; // The return is required to validate in automation test case
  }

  /**
   * Initialize process
   */
  initialize() {
    this.outputResponse = {
      result: false,
      errorMessage: "",
      warningMessage: "",
      data: {
        updateInputs: []
      }
    };

    this.errorsFound = [];
    if (this.inputArguments["config"] !== "") {
      //
    } else {
      //
    }
  }

  /**
   * Verify input parameters
   */
  verifyInputParams() {
    if (this.inputArguments["config"] !== "") {

      // Step 1: Check file extension for json
      if (!(this.utils.isValidInput(this.inputArguments["config"]) && this.isConfigFileExist(this.inputArguments["config"]))) {
        throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_MISSING"));
      }
      // Step 2: Check if json is as per its schema
      if (!(this.isConfigFileValid(this.inputArguments["config"]))) {
        // this.logger.printError(this.composeOutput(this.errorsFound, this.getText("TYPE_ERROR")));

        throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_INVALID"));
      }
    } else {
      this.logger.log("Blank project creation without json file");
      this.inputsToValidate = this.componentHelper.configParams;

      for (let i: number = 0; i < this.inputsToValidate.length; i++) {
        const projectConfigJSONKey: string = this.inputsToValidate[i].key;
        if (this.utils.isValidInput(this.inputArguments[projectConfigJSONKey])) {
          const inputUpdate = {
            ...this.inputsToValidate[i],
            "warning": "",
            "value": null
          };

          const validationResponse: any = this.validateCLIInputArgument(this.inputsToValidate[i], projectConfigJSONKey, this.inputArguments[projectConfigJSONKey], this.getText("ERRORS.INVALID_INPUT"));
          this.logger.log("validationResponse", validationResponse);
          if (validationResponse.error === "") {
            inputUpdate.value = validationResponse.value;
          } else {
            inputUpdate.warning = this.getText("ERRORS.INVALID_ENTRY", validationResponse.error);
          }
          this.outputResponse.data.updateInputs.push(inputUpdate);
        }
      }
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

    }
  }

  private isConfigFileValid(fileName: string) {
    const Validator = jsonSchema.Validator;
    const v = new Validator();
    const projectConfigJson = JSON.parse(this.componentHelper.readFileContentSync(fileName));
    const projectConfigJsonSchema = JSON.parse(this.componentHelper.readFileContentSync(path.join(__dirname, "files", "project-config-schema.json")));
    const errors = v.validate(projectConfigJson, projectConfigJsonSchema).errors;
    const errorOrWarningType = this.getText("VALIDATIONS.SCHEMA.HEADER");
    for (let i: number = 0; i < errors.length; i++) {
      this.logger.log("errors[i]", errors[i]);
      this.addError(errorOrWarningType, errors[i].stack.toString().replace("instance.", ""), errors[i].schema.description);
    }

    // run validate Project config
    const valProjConfig = new Ch5ValidateProjectConfigCli();
    valProjConfig.changeConfigParam("projectConfigJSONFile", fileName);
    valProjConfig.changeConfigParam("projectConfigJSONSchemaFile", path.join(__dirname, "files", "project-config-schema.json"));
    valProjConfig.run();
    this.logger.log("Schema Validation Errors: ", errors.length);
    return (errors.length === 0);
  }

  private addError(heading: string, message: string, resolution: string) {
    let valueExists = false;
    if (this.errorsFound.length > 0) {
      for (let item of this.errorsFound) {
        if (message === item.message) {
          valueExists = true;
          break;
        }
      }
    }
    if (!valueExists) {
      this.errorsFound.push({
        heading: heading,
        message: message,
        resolution: resolution
      });
    }
  }

  private isConfigFileExist(fileName: string) {
    if (fs.existsSync(fileName)) {
      const checkFileOrFolder = fs.statSync(fileName);
      if (checkFileOrFolder && checkFileOrFolder.isFile()) {
        if (path.extname(fileName).trim().toLowerCase() === ".json") {
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
   * Check if there are questions to be prompted to the developer
   */
  async checkPromptQuestions() {
    if (this.inputArguments["config"] !== "") {

      // Step 3: Take back up of existing json and project
      // fsExtra.copySync(this.inputArguments["config"], path.join(this.getConfigNode("backupFolder"), this.getFolderName(), "project-config.json"));

      // const exportProject = new Ch5ExportProjectCli();
      // exportProject.changeConfigParam("zipFileDestinationPath", path.join(this.getConfigNode("backupFolder"), this.getFolderName()));
      // exportProject.run();

      const newProjectConfigJSON: any = JSON.parse(this.componentHelper.readFileContentSync(this.inputArguments["config"]));
      const oldProjectConfigJSON: any = JSON.parse(this.componentHelper.readFileContentSync("./app/project-config.json"));

      // const newCheck = new CompareJSON();
      // console.log(newCheck.map(oldProjectConfigJSON, newProjectConfigJSON));

    } else {
      for (let i: number = 0; i < this.outputResponse.data.updateInputs.length; i++) {
        console.log("this.outputResponse.data.updateInputs[i].type", this.outputResponse.data.updateInputs[i].type);
        console.log("this.outputResponse.data.updateInputs[i].value", this.outputResponse.data.updateInputs[i].value);
        console.log("Check", this.utils.isValidInput(this.outputResponse.data.updateInputs[i].value));
      if (!this.utils.isValidInput(this.outputResponse.data.updateInputs[i].value)) {
          console.log("1. this.outputResponse.data.updateInputs[i].type", this.outputResponse.data.updateInputs[i].type);
          console.log("2. this.outputResponse.data.updateInputs[i].value", this.outputResponse.data.updateInputs[i].value);
            if (this.outputResponse.data.updateInputs[i].type === "enum") {
            const choicesList = this.outputResponse.data.updateInputs[i].allowedValues;
            const componentsQuery = new this.getSelect({
              name: 'value',
              message: this.getText(this.outputResponse.data.updateInputs[i].question),
              choices: choicesList
            });

            this.outputResponse.data.updateInputs[i].value = await componentsQuery.run()
              .then((selectedMenu: any) => { return selectedMenu; })
              .catch((error: any) => { throw new Error(this.getText("ERRORS.DO_NOT_CREATE_PROJECT")); });
            this.logger.log(this.outputResponse.data.updateInputs[i].key + ": ", this.outputResponse.data.updateInputs[i].value);
          } else if (this.outputResponse.data.updateInputs[i].type === "string") {
            const questionsArray = [
              {
                type: "text",
                name: "pageName",
                initial: "shell-template",
                hint: "",
                message: this.getText("VALIDATIONS.GET_PAGE_NAME"),
                validate: (compName: string) => {
                  return this.validateCLIInputArgument(this.outputResponse.data.updateInputs[i], this.outputResponse.data.updateInputs[i]["key"], compName, "ERROR");
                }
              }];
            const response = await this.getEnquirer.prompt(questionsArray);
            if (!this.utils.isValidInput(response.pageName)) {
              throw new Error(this.getText("ERRORS.DO_NOT_CREATE_PROJECT"));
            }

            this.outputResponse.data.updateInputs[i].value = response.pageName;
            this.logger.log(this.outputResponse.data.updateInputs[i].key + ": ", this.outputResponse.data.updateInputs[i].value);
          }
        }
      }
    }
  }

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    if (this.inputArguments["config"] !== "") {

      // Step 4: Make changes to project-config.json stepwise
      const newProjectConfigJSON: any = JSON.parse(this.componentHelper.readFileContentSync(this.inputArguments["config"]));
      const oldProjectConfigJSON: any = JSON.parse(this.componentHelper.readFileContentSync("./app/project-config.json"));
      // this.projectConfigJsonSchema = JSON.parse(this.componentHelper.readFileContentSync("./.vscode/project-config-schema.json"));
      const changesToBeDone: any[] = [];

      // 1. Project Data
      for (const k in newProjectConfigJSON) {
        if (!(typeof newProjectConfigJSON[k] === 'object' && newProjectConfigJSON[k] !== null)) {
          if (oldProjectConfigJSON[k] && oldProjectConfigJSON[k] !== newProjectConfigJSON[k]) {
            // changesToBeDone.push({ "key": k, "oldValue": oldProjectConfigJSON[k], "newValue": newProjectConfigJSON[k] });
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


      // Step 7: If error in Step 5, then revert to backup
      // TODO

      // Step 8: Show proper messages  
      this.outputResponse.result = true;
    } else {

      const pathForShellCreation: string = path.join(__dirname, "files/shell/");

      // Step 4: Make changes to project-config.json stepwise
      const projectConfigJSON: any = JSON.parse(this.componentHelper.readFileContentSync(path.join(pathForShellCreation, "/app/project-config.json")));
      // this.projectConfigJsonSchema = JSON.parse(this.componentHelper.readFileContentSync("./.vscode/project-config-schema.json"));

      // 1. Project Data


      // 2. Themes


      // 3. Config


      // 4. Header


      // 5. Footer


      // 6. Content

      // Step 5: Save Project-config
      this.projectConfig.addPagesToJSON(projectConfigJSON.content.pages[0]);

      // Step 6: Run validate:project-config


      // Step 7: If error in Step 5, then revert to backup
      // TODO

      // Step 8: Show proper messages  
      this.outputResponse.result = true;
    }
  }

  /**
   * Clean up
   */
  cleanUp() {
    if (this.inputArguments["config"] !== "") {
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

  private composeOutput(dataArray: any[], type: string) {
    let outputMessage = this.getText("OUTPUT_ERROR_HEADER", type, String(dataArray.length)) + "\n";
    let tab = "    ";
    let numbering = 1;
    let previousOutputHeading = "";
    for (let i: number = 0; i < dataArray.length; i++) {
      if (previousOutputHeading !== dataArray[i].heading) {
        outputMessage += tab + String(numbering) + ". " + dataArray[i].heading + ": " + dataArray[i].message + "\n";
        numbering += 1;
      }
      if (dataArray[i].resolution && dataArray[i].resolution.trim() !== "") {
        outputMessage += tab + " (" + dataArray[i].resolution + ").\n";
      }
    }
    return outputMessage;
  }

}
