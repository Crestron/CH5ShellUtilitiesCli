// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCliNew } from "../Ch5BaseClassForCliNew";
import { Ch5CliProjectConfig } from "../Ch5CliProjectConfig";
import { Ch5GeneratePageCli } from "../generate-page/Ch5GeneratePageCli";
import { Ch5GenerateWidgetCli } from "../generate-widget/Ch5GenerateWidgetCli";
import { ICh5Cli } from "../ICh5Cli";

const path = require('path');
const fs = require("fs");
const fsExtra = require("fs-extra");
const process = require('process');
const editJsonFile = require("edit-json-file");

export class Ch5CreateProjectCli extends Ch5BaseClassForCliNew implements ICh5Cli {

  private readonly SHELL_FOLDER: string = path.normalize(path.join(__dirname, "../../", "shell"));

  /**
   * Constructor
   */
  public constructor() {
    super("create-project");
  }

  /**
   * Method for creating project
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

      // Update project-config first (so that if this fails, we don't worry about file deletion). Next Delete Files
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
    this.outputResponse.askConfirmation = true; // We do not need confirmation for Create Project
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
      if (!(this.isConfigFileValid(this.inputArgs["config"].argsValue, path.join(this.SHELL_FOLDER, ".vscode", "project-config-schema.json"), false))) {
        // this.logger.printError(this.composeOutput(this.errorsFound, this.getText("TYPE_ERROR"))); // TODO
        throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_INVALID"));
      }
    } else {
      this.logger.log("Blank project creation without json file");

      Object.entries(this.inputArgs).forEach(([key, value]: any) => {
        const inputUpdate = {
          ...value,
          "warning": "",
          "value": null
        };
        if (value.inputReceived === true && (this.utils.isValidInput(value.argsValue) || value.optionalArgument === false)) {
          // console.log("value.optionalArgument", value.optionalArgument);
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
    }
    this.logger.end();
  }

  /**
   * Check if there are questions to be prompted to the developer
   */
  async checkPromptQuestions() {
    this.logger.start("checkPromptQuestions");
    if (this.inputArgs["config"].argsValue !== "") {
      // 
    } else {
      this.logger.log("this.outputResponse.data.updateInputs", this.outputResponse.data.updateInputs);
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
              .catch((error: any) => { throw new Error(this.getText("ERRORS.DO_NOT_CREATE_PROJECT")); });
            this.logger.log(this.outputResponse.data.updateInputs[i].key + ": ", this.outputResponse.data.updateInputs[i].value);
          } else if (this.outputResponse.data.updateInputs[i].type === "string") {
            const questionsArray = [
              {
                type: "text",
                name: "projectName",
                initial: "shell-template",
                hint: "",
                message: "Project Name", //this.getText("VALIDATIONS.GET_PAGE_NAME"),
                validate: (compName: string) => {
                  const valResponse: any = this.validateCLIInputArgument(this.outputResponse.data.updateInputs[i], this.outputResponse.data.updateInputs[i]["key"], compName, "ERROR");
                  if (valResponse.error && valResponse.error !== "") {
                    return false;
                  } else {
                    return true;
                  }
                }
              }];
            const response = await this.getEnquirer.prompt(questionsArray);
            if (!this.utils.isValidInput(response.projectName)) {
              throw new Error(this.getText("ERRORS.DO_NOT_CREATE_PROJECT"));
            }
            this.outputResponse.data.updateInputs[i].value = response.projectName;
            this.logger.log(this.outputResponse.data.updateInputs[i].key + ": ", this.outputResponse.data.updateInputs[i].value);
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
    if (this.inputArgs["config"].argsValue !== "") {

      // Step 4: Make changes to project-config.json stepwise
      const newProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.inputArgs["config"].argsValue));
      const oldProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(path.join(this.SHELL_FOLDER, "/app/project-config.json")));

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

      oldProjectConfigJSON["content"]["triggerViewProperties"] = newProjectConfigJSON["content"]["triggerViewProperties"];

      const pagesToBeCreated: any[] = [];
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
      for (let i: number = 0; i < newProjectConfigJSON["content"]["widgets"].length; i++) {
        let pageObj = newProjectConfigJSON["content"]["widgets"][i];
        const pageInOldSet = oldProjectConfigJSON["content"]["widgets"].find((widgetName: any) => widgetName === pageObj.widgetName);
        if (!pageInOldSet) {
          // Exists in New set but not in old - so create page
          widgetsToBeCreated.push(pageObj);
          //   changesToBeDone.push({ "key": k, "oldValue": oldProjectConfigJSON["content"][k], "newValue": newProjectConfigJSON["content"][k] });
        }
      }

      // TODO - check and update default page
      oldProjectConfigJSON["content"]["$defaultView"] = newProjectConfigJSON["content"]["$defaultView"];

      const pathToCreateProject: string = path.resolve(path.join("./", oldProjectConfigJSON.projectName));
      if (!fs.existsSync(pathToCreateProject)) {
        fs.mkdirSync(pathToCreateProject, { recursive: true });
      }
      fsExtra.copySync(this.SHELL_FOLDER, pathToCreateProject, { recursive: true });
      // console.log("oldProjectConfigJSON", oldProjectConfigJSON);

      fs.writeFileSync(path.join(pathToCreateProject, "/app/project-config.json"), JSON.stringify(oldProjectConfigJSON));

      process.chdir(pathToCreateProject);

      const packageJsonFile = editJsonFile("./package.json"); // Must be after directory change
      packageJsonFile.set("name", oldProjectConfigJSON.projectName);
      packageJsonFile.save();

      // Step 5: Save Project-config
      // console.log("pagesToBeCreated", pagesToBeCreated);
      // const projectConfigObject = new Ch5CliProjectConfig();
      // projectConfigObject.addPagesToJSON(pagesToBeCreated);
      // projectConfigObject.addWidgetsToJSON(widgetsToBeCreated);
      // this.projectConfig.save(newProjectConfigJSON);
      for (let i: number = 0; i < pagesToBeCreated.length; i++) {
        const genPage: Ch5GeneratePageCli = new Ch5GeneratePageCli();
        genPage.setInputArgsForTesting(["-n", pagesToBeCreated[i].pageName, "-m", pagesToBeCreated[i].navigation ? "Y" : "N"]);
        await genPage.run();
      }

      for (let i: number = 0; i < widgetsToBeCreated.length; i++) {
        const genWidget: Ch5GenerateWidgetCli = new Ch5GenerateWidgetCli();
        genWidget.setInputArgsForTesting(["-n", widgetsToBeCreated[i].widgetName]);
        await genWidget.run();
      }

      // console.log("widgetsToBeCreated", widgetsToBeCreated);
      // Step 6: Run validate:project-config
      if (!(this.isConfigFileValid(path.join(pathToCreateProject, "/app/project-config.json"), path.join(pathToCreateProject, ".vscode", "project-config-schema.json")))) {
        // this.logger.printError(this.composeOutput(this.errorsFound, this.getText("TYPE_ERROR"))); // TODO
        throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_INVALID"));
      }

      // Step 8: Show proper messages  
      this.outputResponse.result = true;
    } else {
      // Step 4: Make changes to project-config.json stepwise
      const projectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(path.resolve(path.join(this.SHELL_FOLDER, "/app/project-config.json"))));
      // this.projectConfigJsonSchema = JSON.parse(this.utils.readFileContentSync("./.vscode/project-config-schema.json"));

      // 1. Project Data
      projectConfigJSON.projectName = this.outputResponse.data.updateInputs.find((objValue: any) => objValue.key === "projectName").value;

      // projectConfigJSON.projectName = this.outputResponse.data.updateInputs.find((objValue: any) => objValue.key === "projectName").value;
      const pathToCreateProject: string = path.resolve(path.join("./", projectConfigJSON.projectName));

      // Check if current folder is empty.

      try {
        const isFolder = await this.utils.readdirAsync(pathToCreateProject);
        if (!(isFolder && isFolder.length > 0)) {
        } else {
          //  throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_MISSING"));
        }
      } catch (e) {
        //  throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_MISSING"));

      }

      // 2. Themes


      // 3. Config


      // 4. Header


      // 5. Footer


      // 6. Content
      // const defaultPage = new Ch5GeneratePageCli();
      // defaultPage.setInputArgsForTesting(["--name", "page1", "--menu", "Y"]);
      // defaultPage.run();

      // Step 5: Save Project-config
      // this.projectConfig.addPagesToJSON(projectConfigJSON.content.pages[0]);

      // TODO - check and update default page
      if (!fs.existsSync(pathToCreateProject)) {
        fs.mkdirSync(pathToCreateProject, { recursive: true });
      }
      fsExtra.copySync(this.SHELL_FOLDER, pathToCreateProject, { recursive: true });
      projectConfigJSON["content"]["$defaultView"] = "page1"; //newProjectConfigJSON["content"]["$defaultView"];
      fs.writeFileSync(path.join(pathToCreateProject, "/app/project-config.json"), JSON.stringify(projectConfigJSON));

      process.chdir(pathToCreateProject);

      const packageJsonFile = editJsonFile("./package.json"); // Must be after directory change
      packageJsonFile.set("name", projectConfigJSON.projectName);
      packageJsonFile.save();

      const genPage: Ch5GeneratePageCli = new Ch5GeneratePageCli();
      genPage.setInputArgsForTesting(["-n", "page1", "-m", "Y"]);
      await genPage.run();

      // Step 6: Run validate:project-config
      if (!(this.isConfigFileValid(path.join(pathToCreateProject, "/app/project-config.json"), path.join(__dirname, "files", "project-config-schema.json")))) {
        // this.logger.printError(this.composeOutput(this.errorsFound, this.getText("TYPE_ERROR"))); // TODO
        throw new Error(this.getText("FAILURE_MESSAGE_INPUT_PARAM_CONFIG_FILE_INVALID"));
      }

      // Step 8: Show proper messages  
      this.outputResponse.result = true;
    }
    this.logger.end();
  }

  /**
   * Clean up
   */
  cleanUp() {
    //
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
