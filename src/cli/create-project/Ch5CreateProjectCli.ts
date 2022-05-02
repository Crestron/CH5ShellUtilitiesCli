// Copyright (C) 2022 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCliNew } from "../Ch5BaseClassForCliNew";
import { Ch5GeneratePageCli } from "../generate-page/Ch5GeneratePageCli";
import { Ch5GenerateWidgetCli } from "../generate-widget/Ch5GenerateWidgetCli";
import { ICh5CliNew } from "../ICh5Cli";

const path = require('path');
const fs = require("fs");
const fsExtra = require("fs-extra");
const process = require('process');
const editJsonFile = require("edit-json-file");

export class Ch5CreateProjectCli extends Ch5BaseClassForCliNew implements ICh5CliNew {

  private readonly SHELL_FOLDER: string = path.normalize(path.join(__dirname, "../../", "shell"));
  private readonly PROJECT_CONFIG_JSON_PATH: string = path.normalize("/app/project-config.json");
  private readonly VSCODE_SCHEMA_JSON_PATH: string = path.normalize(path.join(".vscode", "project-config-schema.json"));

  /**
   * Constructor
   */
  public constructor(public showOutputMessages: boolean = true) {
    super("create-project");
  }

  /**
   * Initialize process
   */
  async initialize() {
    this.logger.start("initialize");
    this.outputResponse.data.updateInputs = [];
    this.outputResponse.data.projectName = "";
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
      this.logger.log("Blank project creation without json file");

      Object.entries(this.inputArgs).forEach(([key, value]: any) => {
        if (value.isSpecialArgument === false) {
          const inputUpdate = {
            ...value,
            "warning": ""
          };
          if (value.inputReceived === true) {
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

      if (this.outputResponse.data.updateInputs.length === 0) {
        const value = this.inputArgs["projectName"];
        const inputUpdate = {
          ...value,
          "warning": ""
        };

        inputUpdate.inputReceived = true
        this.outputResponse.data.updateInputs.push(inputUpdate);
      }
      this.logger.log("this.outputResponse.data.updateInputs: ", this.outputResponse.data.updateInputs);

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
      // Do Nothing
    } else {
      this.logger.log("this.outputResponse.data.updateInputs", this.outputResponse.data.updateInputs);
      for (let i: number = 0; i < this.outputResponse.data.updateInputs.length; i++) {
        if (!this.utils.isValidInput(this.outputResponse.data.updateInputs[i].argsValue)) {
          if (this.outputResponse.data.updateInputs[i].type === "enum") {
            const choicesList = this.outputResponse.data.updateInputs[i].allowedValues;
            const componentsQuery = new this.getSelect({
              name: 'value',
              message: this.getText(this.outputResponse.data.updateInputs[i].question),
              choices: choicesList
            });

            this.outputResponse.data.updateInputs[i].argsValue = await componentsQuery.run()
              .then((selectedMenu: any) => { return selectedMenu; })
              .catch((error: any) => { throw new Error(this.getText("COMMON.SOMETHING_WENT_WRONG")); });
            this.logger.log(this.outputResponse.data.updateInputs[i].key + ": ", this.outputResponse.data.updateInputs[i].argsValue);
          } else if (this.outputResponse.data.updateInputs[i].type === "string") {
            const questionsArray = [
              {
                type: "text",
                name: this.outputResponse.data.updateInputs[i].key,
                initial: "shell-template",
                hint: "",
                message: this.getText(this.outputResponse.data.updateInputs[i].question),
                validate: (inputValue: string) => {
                  const valResponse: any = this.validateCLIInputArgument(this.outputResponse.data.updateInputs[i], this.outputResponse.data.updateInputs[i]["key"], inputValue, this.getText("VERIFY_INPUT_PARAMS.INVALID_INPUT", this.outputResponse.data.updateInputs[i]["key"]));
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
            this.outputResponse.data.updateInputs[i].argsValue = response.projectName;
            this.logger.log(this.outputResponse.data.updateInputs[i].key + ": ", this.outputResponse.data.updateInputs[i].argsValue);
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

    if (this.inputArgs["config"].argsValue !== "") {

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

      fsExtra.copySync(this.SHELL_FOLDER, pathToCreateProject, { recursive: true });

      this.logger.log("2. current working directory: " + process.cwd());

      // Step 4: Make changes to project-config.json stepwise
      const oldProjectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(path.join(this.SHELL_FOLDER, this.PROJECT_CONFIG_JSON_PATH)));

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

      this.outputResponse.data.projectName = oldProjectConfigJSON.projectName;

      // Step 5: Save Project-config
      for (let i: number = 0; i < pagesToBeCreated.length; i++) {
        const genPage: Ch5GeneratePageCli = new Ch5GeneratePageCli(false);
        genPage.setInputArgsForTesting(["-n", pagesToBeCreated[i].pageName, "-m", pagesToBeCreated[i].navigation ? "Y" : "N"]);
        await genPage.run();
        this.projectConfig.replacePageNodeInJSON(pagesToBeCreated[i]);
      }

      for (let i: number = 0; i < widgetsToBeCreated.length; i++) {
        const genWidget: Ch5GenerateWidgetCli = new Ch5GenerateWidgetCli(false);
        genWidget.setInputArgsForTesting(["-n", widgetsToBeCreated[i].widgetName]);
        await genWidget.run();
        this.projectConfig.removeWidgetFromJSON(widgetsToBeCreated[i]);
      }

      // Step 6: Run validate:project-config
      if (!(this.isConfigFileValid(path.join(pathToCreateProject, this.PROJECT_CONFIG_JSON_PATH), path.join(pathToCreateProject, this.VSCODE_SCHEMA_JSON_PATH)))) {
        throw new Error(this.getText("PROCESS_REQUEST.PROJECT_CONFIG_VALIDATION_FAILED"));
      }

      // Step 8: Show proper messages  
      this.outputResponse.result = true;
      this.outputResponse.successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE", this.outputResponse.data.projectName, projectFolderPath);
    } else {
      // Step 4: Make changes to project-config.json stepwise
      const projectConfigJSON: any = JSON.parse(this.utils.readFileContentSync(path.resolve(path.join(this.SHELL_FOLDER, this.PROJECT_CONFIG_JSON_PATH))));

      // 1. Project Data
      projectConfigJSON.projectName = this.outputResponse.data.updateInputs.find((objValue: any) => objValue.key === "projectName").argsValue;

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

      projectConfigJSON["content"]["$defaultView"] = "page1";
      fs.writeFileSync(path.join(pathToCreateProject, this.PROJECT_CONFIG_JSON_PATH), JSON.stringify(projectConfigJSON));

      process.chdir(pathToCreateProject);

      const packageJsonFile = editJsonFile("./package.json"); // Must be after directory change
      packageJsonFile.set("name", projectConfigJSON.projectName);
      packageJsonFile.save();

      this.outputResponse.data.projectName = projectConfigJSON.projectName;

      const genPage: Ch5GeneratePageCli = new Ch5GeneratePageCli(false);
      genPage.setInputArgsForTesting(["-n", "page1", "-m", "Y"]);
      await genPage.run();

      // Step 6: Run validate:project-config
      if (!(this.isConfigFileValid(path.join(pathToCreateProject, this.PROJECT_CONFIG_JSON_PATH), path.join(pathToCreateProject, this.VSCODE_SCHEMA_JSON_PATH)))) {
        throw new Error(this.getText("PROCESS_REQUEST.PROJECT_CONFIG_VALIDATION_FAILED"));
      }

      this.outputResponse.result = true;
      this.outputResponse.successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE", this.outputResponse.data.projectName, projectFolderPath);
    }
    this.logger.end();
  }

}

