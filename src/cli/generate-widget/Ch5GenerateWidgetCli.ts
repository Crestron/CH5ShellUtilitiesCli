// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCli } from "../Ch5BaseClassForCli";
import { ICh5Cli } from "../ICh5Cli";

const path = require('path');
const fs = require("fs");
const fsExtra = require("fs-extra");
const Enquirer = require('enquirer');
const enquirer = new Enquirer();

export class Ch5GenerateWidgetCli extends Ch5BaseClassForCli implements ICh5Cli {

  private readonly MIN_LENGTH_OF_WIDGET_NAME: number = 2;
  private readonly MAX_LENGTH_OF_WIDGET_NAME: number = 31;

  private outputResponse: any = {};
  private readableInputs: any = [];

  public constructor() {
    super("generate-widget");
  }

  /**
   * Initialize
   */
  private initialize() {
    this.outputResponse = {
      result: false,
      errorMessage: "",
      warningMessage: "",
      data: {
        widgetName: "",
        fileName: "",
        folderPath: ""
      }
    };

    if (this.readableInputs.length === 0) {
      this.readableInputs = this.componentHelper.processArgs();
    }
  }

  /**
   * Method for generating page
   * @param {*} processArgs 
   */
  async run() {
    try {
      // Initialize
      this.initialize();

      // Pre-requisite validations
      this.checkPrerequisiteValidations();

      // Verify input params
      this.verifyInputParams();

      // Ask details to developer based on input parameter validation
      await this.checkPromptQuestions();

      // Update project-config first (so that if this fails, we don't worry about file deletion). Next Delete Files
      await this.processRequest();

      // Clean up
      this.cleanUp();

    } catch (e) {
      if (e && this.utils.isValidInput(e.message)) {
        if (e.message.trim().toLowerCase() === 'error') {
          this.outputResponse.errorMessage = this.getText("ERRORS.SOMETHING_WENT_WRONG");
        } else {
          this.outputResponse.errorMessage = e.message;
        }
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
  private checkPrerequisiteValidations() {
    // Nothing for this process
  }

  /**
   * Verify input parameters
   */
  private verifyInputParams() {
    const tabDisplayText = this.getText("ERRORS.TAB_DELIMITER");
    if (this.utils.isValidInput(this.readableInputs["name"])) {
      const validationResponse = this.validateWidgetName(this.readableInputs["name"]);
      if (validationResponse === "") {
        this.outputResponse.data.widgetName = this.readableInputs["name"];
      } else {
        this.outputResponse.warningMessage += tabDisplayText + this.getText("ERRORS.WIDGET_NAME_INVALID_ENTRY", validationResponse);
      }
    }

    if (this.utils.isValidInput(this.outputResponse.warningMessage)) {
      this.logger.printWarning(this.getText("ERRORS.MESSAGE_TITLE", this.outputResponse.warningMessage));
    }
  }

  /**
   * Check if there are questions to be prompted to the developer
   */

  async checkPromptQuestions() {
    if (!this.utils.isValidInput(this.outputResponse.data.widgetName)) {
      let widgets = this.projectConfig.getAllWidgets();
      widgets = widgets.sort(this.utils.dynamicsort("asc", "widgetName"));
      this.logger.log("widgets", widgets);
      const newWidgetNameToSet = this.loopAndCheckWidget(widgets);

      const questionsArray = [
        {
          type: "text",
          name: "widgetName",
          initial: newWidgetNameToSet,
          hint: "",
          message: this.getText("VALIDATIONS.GET_WIDGET_NAME"),
          validate: (compName: string) => {
            let output = this.validateWidgetName(compName);
            return output === "" ? true : output;
          }
        }
      ];

      const response = await enquirer.prompt(questionsArray);
      if (!this.utils.isValidInput(response.widgetName)) {
        throw new Error(this.getText("ERRORS.WIDGET_NAME_EMPTY_IN_REQUEST"));
      }
      this.logger.log("  response.widgetName: ", response.widgetName);
      this.outputResponse.data.widgetName = response.widgetName;
    }

    let originalInputName = this.namingHelper.convertMultipleSpacesToSingleSpace(this.outputResponse.data.widgetName.trim().toLowerCase());
    this.outputResponse.data.widgetName = this.namingHelper.camelize(originalInputName);
    this.logger.log("  this.outputResponse.data.widgetName: ", this.outputResponse.data.widgetName);
    this.outputResponse.data.fileName = this.namingHelper.dasherize(originalInputName);
    this.logger.log("  this.outputResponse.data.fileName: ", this.outputResponse.data.fileName);

    if (!this.utils.isValidInput(this.outputResponse.data.widgetName)) {
      throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
    } else if (!this.utils.isValidInput(this.outputResponse.data.widgetName)) {
      throw new Error(this.getText("ERRORS.WIDGET_NAME_EMPTY_IN_REQUEST"));
    } else if (!this.utils.isValidInput(this.outputResponse.data.fileName)) {
      throw new Error(this.getText("ERRORS.SOMETHING_WENT_WRONG"));
    }
  }

  /**
   * Clean up
   */
  private cleanUp() {
    // Nothing to cleanup for this process
  }

  /**
   * Log Final Response Message
   */
  private logOutput() {
    if (this.outputResponse.result === false) {
      this.logger.printError(this.outputResponse.errorMessage);
    } else {
      this.logger.printSuccess(this.getText("SUCCESS_MESSAGE", this.outputResponse.data.widgetName, this.outputResponse.data.folderPath));
      this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_CONCLUSION"));
    }
  }

  /**
   * Create Folder for the Wudgets to be created
   */
  private async createFolder() {
    let isFolderCreated = false;
    let fullPath = "";

    let folderPath = this.getConfigNode("basePathForWidgets") + this.outputResponse.data.fileName + "/";
    let folderPathSplit = folderPath.toString().split("/");
    for (let i: number = 0; i < folderPathSplit.length; i++) {
      this.logger.log(folderPathSplit[i]);
      if (folderPathSplit[i] && folderPathSplit[i].trim() !== "") {
        let previousPath = fullPath;
        fullPath += folderPathSplit[i] + "/";
        if (!fs.existsSync(fullPath)) {
          this.logger.log("Creating new folder " + folderPathSplit[i] + " inside the folder " + previousPath);
          fs.mkdirSync(fullPath, {
            recursive: true,
          });
          isFolderCreated = true;
        } else {
          this.logger.log(fullPath + " exists !!!");
        }
      }
    }

    // Check if Folder exists
    if (isFolderCreated === false) {
      // No folder is created. This implies that the widget folder already exists.

      let files = fs.readdirSync(fullPath);

      if (files.length === 0) {
        // Check if folder is empty.
        return fullPath;
      } else {
        // listing all files using forEach
        for (let j = 0; j < files.length; j++) {
          let file = files[j];
          // If a single file exists, do not continue the process of generating widget
          // If not, ensure to send message that folder is not empty but still created new files
          this.logger.log(file);
          let fileName = this.outputResponse.data.fileName;
          this.logger.log(fileName.toLowerCase() + ".html");
          if (file.toLowerCase() === fileName.toLowerCase() + ".html" || file.toLowerCase() === fileName.toLowerCase() + ".scss" || file.toLowerCase() === fileName.toLowerCase() + ".js") {
            throw new Error(this.getText("ERRORS.HTML_FILE_EXISTS", fileName.toLowerCase() + ".html", fullPath));
          }
        }
        return fullPath;
      }
    } else {
      return fullPath;
    }
  }

  /**
   * Create New File based on templates
   * @param {string} fileExtension - File extension - applicable values are .html, .js, .scss
   * @param {string} templateFile - Template file name
   */
  private async createNewFile(fileExtension: string, templateFile: string, fileNameSuffix: string) {
    if (templateFile !== "") {
      let actualContent = fsExtra.readFileSync(path.join(__dirname, "templates", templateFile));
      actualContent = this.utils.replaceAll(actualContent, "<%widgetName%>", this.outputResponse.data.widgetName);
      actualContent = this.utils.replaceAll(actualContent, "<%titleWidgetName%>", this.namingHelper.capitalizeEachWordWithSpaces(this.outputResponse.data.widgetName));
      actualContent = this.utils.replaceAll(actualContent, "<%styleWidgetName%>", this.namingHelper.dasherize(this.outputResponse.data.widgetName));
      actualContent = this.utils.replaceAll(actualContent, "<%copyrightYear%>", String(new Date().getFullYear()));
      actualContent = this.utils.replaceAll(actualContent, "<%fileName%>", this.outputResponse.data.fileName);

      const completeFilePath = this.outputResponse.data.folderPath + this.outputResponse.data.fileName + fileNameSuffix + "." + fileExtension;
      fsExtra.writeFileSync(completeFilePath, actualContent);
      // Success case, the file was saved
      this.logger.log("File contents saved!");
    }
  }

  /**
   * Creates the widget object in project-config.json.
   */
  createWidgetObject() {
    let widgetObject = {
      "widgetName": this.outputResponse.data.widgetName,
      "fullPath": this.outputResponse.data.folderPath,
      "fileName": this.outputResponse.data.fileName + '.html',
      "widgetProperties": {}
    };
    return widgetObject;
  }



  /**
   * Method to validate Widget Name
   * @param {string} widgetName
   */
  validateWidgetName(widgetName: string) {
    this.logger.log("widgetName to Validate", widgetName);
    if (this.utils.isValidInput(widgetName)) {
      widgetName = String(widgetName).trim();
      if (widgetName.length < this.MIN_LENGTH_OF_WIDGET_NAME || widgetName.length > this.MAX_LENGTH_OF_WIDGET_NAME) {
        return this.getText("ERRORS.WIDGET_NAME_LENGTH", String(this.MIN_LENGTH_OF_WIDGET_NAME), String(this.MAX_LENGTH_OF_WIDGET_NAME));
      } else {
        let widgetValidity = new RegExp(/^[a-zA-Z][a-zA-Z0-9-_ $]*$/).test(widgetName);
        if (widgetValidity === false) {
          return this.getText("ERRORS.WIDGET_NAME_MANDATORY");
        } else {
          let originalInputName = this.namingHelper.convertMultipleSpacesToSingleSpace(widgetName.trim().toLowerCase());
          originalInputName = this.namingHelper.camelize(originalInputName);

          this.logger.log("  originalInputName: " + originalInputName);
          if (this.projectConfig.isWidgetExistInJSON(originalInputName)) {
            return this.getText("ERRORS.WIDGET_EXISTS_IN_PROJECT_CONFIG_JSON");
          } else if (this.projectConfig.isPageExistInJSON(originalInputName)) {
            return this.getText("ERRORS.PAGE_EXISTS_IN_PROJECT_CONFIG_JSON");
          } else if (this.checkWidgetNameForDisallowedKeywords(originalInputName, "startsWith") === true) {
            return this.getText("ERRORS.WIDGET_CANNOT_START_WITH", this.getInvalidWidgetStartWithValues());
          } else if (this.checkWidgetNameForDisallowedKeywords(originalInputName, "equals") === true) {
            return this.getText("ERRORS.WIDGET_DISALLOWED_KEYWORDS");
          } else {
            return "";
          }
        }
      }
    } else {
      return this.getText("ERRORS.WIDGET_NAME_MANDATORY");
    }
  }

  /**
   * Loop and check the next valid widget to set
   * @param {*} widgets 
   */
  private loopAndCheckWidget(widgets: any[]) {
    let widgetFound: boolean = false;
    let newWidgetNameToSet: string = "";
    let i: number = 1;
    do {
      newWidgetNameToSet = "widget" + i;
      widgetFound = false;
      for (let j: number = 0; j < widgets.length; j++) {
        if (widgets[j].widgetName.trim().toLowerCase() === newWidgetNameToSet.toString().toLowerCase()) {
          widgetFound = true;
          break;
        }
      }
      i++;
    }
    while (widgetFound === true);
    return newWidgetNameToSet;
  }

  /**
   * Gets the keywords that are not allowed for widgets to start
   */
  private getInvalidWidgetStartWithValues() {
    let output = "";
    const templateNames: any = this.getConfigNode("templateNames");
    for (let i: number = 0; i < templateNames.disallowed["startsWith"].length; i++) {
      output += "'" + templateNames.disallowed["startsWith"][i] + "', ";
    }
    output = output.trim();
    return output.substr(0, output.length - 1);
  }

  /**
   * Checks if the widget name has disallowed keywords
   * @param {*} widgetName 
   * @param {*} type 
   */
  checkWidgetNameForDisallowedKeywords(widgetName: string, type: string) {
    const templateNames: any = this.getConfigNode("templateNames");
    if (type === "startsWith") {
      for (let i: number = 0; i < templateNames.disallowed[type].length; i++) {
        if (widgetName.trim().toLowerCase().startsWith(templateNames.disallowed[type][i].trim().toLowerCase())) {
          return true;
        }
      }
    } else if (type === "equals") {
      for (let i: number = 0; i < templateNames.disallowed[type].length; i++) {
        if (widgetName.trim().toLowerCase() === templateNames.disallowed[type][i].trim().toLowerCase()) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    if (this.projectConfig.isWidgetExistInJSON(this.outputResponse.data.widgetName)) {
      throw new Error(this.getText("ERRORS.WIDGET_EXISTS_IN_PROJECT_CONFIG_JSON"));
    } else {
      await this.createFolder().then(async (folderPathResponseGenerated) => {
        this.logger.log("  Folder Path (generated): " + folderPathResponseGenerated);
        this.outputResponse.data.folderPath = folderPathResponseGenerated;

        if (this.utils.isValidInput(this.outputResponse.data.folderPath)) {
          await this.createNewFile("html", "html.template", "");
          await this.createNewFile("js", "js.template", "");
          await this.createNewFile("scss", "scss.template", "");
          await this.createNewFile("json", "emulator.template", "-emulator");

          this.projectConfig.saveWidgetToJSON(this.createWidgetObject());
          this.outputResponse.result = true;
        } else {
          throw new Error(this.getText("ERRORS.ERROR_IN_FOLDER_PATH"));
        }
      }).catch((err) => {
        throw new Error(err);
      });
    }
  }

}
