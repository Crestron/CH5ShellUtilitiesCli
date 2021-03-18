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

export class Ch5GeneratePageCli extends Ch5BaseClassForCli implements ICh5Cli {

  private readonly MIN_LENGTH_OF_PAGE_NAME: number = 2;
  private readonly MAX_LENGTH_OF_PAGE_NAME: number = 31;

  private outputResponse: any = {};

  public constructor() {
    super("generate-page");
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
        pageName: "",
        menuOption: "",
        fileName: "",
        folderPath: ""
      }
    };
  }

  /**
   * Method for generating page
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
    if (this.utils.isValidInput(this.inputArguments["name"])) {
      const validationResponse = this.validatePageName(this.inputArguments["name"]);
      if (validationResponse === "") {
        this.outputResponse.data.pageName = this.inputArguments["name"];
      } else {
        this.outputResponse.warningMessage += tabDisplayText + this.getText("ERRORS.PAGE_NAME_INVALID_ENTRY", validationResponse);
      }
    }

    if (this.utils.isValidInput(this.inputArguments["menu"])) {
      const validationResponse = this.validateMenuOption(this.inputArguments["menu"]);
      if (validationResponse === "") {
        this.outputResponse.data.menuOption = this.inputArguments["menu"];
      } else {
        this.outputResponse.warningMessage += tabDisplayText + validationResponse + "\n";
      }
    }

    if (this.utils.isValidInput(this.outputResponse.warningMessage)) {
      this.logger.printWarning(this.getText("ERRORS.MESSAGE_TITLE", this.outputResponse.warningMessage));
    }
  }

  /**
   * Check if there are questions to be prompted to the developer
   */
  private async checkPromptQuestions() {
    if (!this.utils.isValidInput(this.outputResponse.data.pageName)) {
      let pages = this.projectConfig.getAllPages();
      pages = pages.sort(this.utils.dynamicsort("asc", "pageName"));
      this.logger.log("pages", pages);
      const newPageNameToSet = this.loopAndCheckPage(pages);

      const questionsArray = [
        {
          type: "text",
          name: "pageName",
          initial: newPageNameToSet,
          hint: "",
          message: this.getText("VALIDATIONS.GET_PAGE_NAME"),
          validate: (compName: string) => {
            let output = this.validatePageName(compName);
            return output === "" ? true : output;
          }
        }];
      const response = await enquirer.prompt(questionsArray);
      if (!this.utils.isValidInput(response.pageName)) {
        throw new Error(this.getText("ERRORS.PAGE_NAME_EMPTY_IN_REQUEST"));
      }
      this.logger.log("  response.pageName: ", response.pageName);
      this.outputResponse.data.pageName = response.pageName;
    }

    if (!this.utils.isValidInput(this.outputResponse.data.menuOption)) {
      const questionsArray = [
        {
          type: 'select',
          name: 'menuOption',
          message: this.getText("VALIDATIONS.GET_ADD_TO_MENU_MESSAGE"),
          choices: [
            { message: this.getText("VALIDATIONS.GET_ADD_TO_MENU_YES"), hint: this.getText("VALIDATIONS.GET_ADD_TO_MENU_HINT_YES"), value: 'Y' },
            { message: this.getText("VALIDATIONS.GET_ADD_TO_MENU_NO"), hint: this.getText("VALIDATIONS.GET_ADD_TO_MENU_HINT_NO"), value: 'N' }
          ],
          initial: 0
        }
      ];
      const response = await enquirer.prompt(questionsArray);
      if (!this.utils.isValidInput(response.menuOption)) {
        throw new Error(this.getText("ERRORS.ADD_TO_MENU_EMPTY_IN_REQUEST"));
      }
      this.logger.log("  response.menuOption: ", response.menuOption);
      this.outputResponse.data.menuOption = response.menuOption;
    }

    let originalInputName = this.namingHelper.convertMultipleSpacesToSingleSpace(this.outputResponse.data.pageName.trim().toLowerCase());
    this.outputResponse.data.pageName = this.namingHelper.camelize(originalInputName);
    this.logger.log("  this.outputResponse.data.pageName: ", this.outputResponse.data.pageName);
    this.logger.log("  this.outputResponse.data.menuOption: ", this.outputResponse.data.menuOption);
    this.outputResponse.data.fileName = this.namingHelper.dasherize(originalInputName);
    this.logger.log("  this.outputResponse.data.fileName: ", this.outputResponse.data.fileName);

    if (!this.utils.isValidInput(this.outputResponse.data.pageName) && !this.utils.isValidInput(this.outputResponse.data.menuOption)) {
      throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
    } else if (!this.utils.isValidInput(this.outputResponse.data.pageName)) {
      throw new Error(this.getText("ERRORS.PAGE_NAME_EMPTY_IN_REQUEST"));
    } else if (!this.utils.isValidInput(this.outputResponse.data.menuOption)) {
      throw new Error(this.getText("ERRORS.ADD_TO_MENU_EMPTY_IN_REQUEST"));
    } else if (!this.utils.isValidInput(this.outputResponse.data.fileName)) {
      throw new Error(this.getText("ERRORS.SOMETHING_WENT_WRONG"));
    }
  }

  /**
   * Implement this component's main purpose
   */
  private async processRequest() {
    if (this.projectConfig.isPageExistInJSON(this.outputResponse.data.pageName)) {
      throw new Error(this.getText("ERRORS.PAGE_EXISTS_IN_PROJECT_CONFIG_JSON"));
    } else {
      await this.createFolder().then(async (folderPathResponseGenerated) => {
        this.logger.log("  Folder Path (generated): " + folderPathResponseGenerated);
        this.outputResponse.data.folderPath = folderPathResponseGenerated;

        if (this.utils.isValidInput(this.outputResponse.data.folderPath)) {
          await this.createNewFile("html", "html.template", "");
          await this.createNewFile("js", "js.template", "");
          await this.createNewFile("scss", "scss.template", "");
          await this.createNewFile("json", "emulator.template", "-emulator");

          this.projectConfig.savePageToJSON(this.createPageObject());
          this.outputResponse.result = true;
        } else {
          throw new Error(this.getText("ERRORS.ERROR_IN_FOLDER_PATH"));
        }
      }).catch((err) => {
        throw new Error(err);
      });
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
      this.logger.printSuccess(this.getText("SUCCESS_MESSAGE", this.outputResponse.data.pageName, this.outputResponse.data.folderPath));
      if (this.outputResponse.data.menuOption === "Y") {
        this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_NAVIGATION_ADDED"));
      }
      this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_CONCLUSION"));
    }
  }

  /**
   * Create Folder for the Pages to be created
   */
  private async createFolder() {
    let isFolderCreated = false;
    let fullPath = "";

    let folderPath = this.getConfigNode("basePathForPages") + this.outputResponse.data.fileName + "/";
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
      // No folder is created. This implies that the page folder already exists.

      let files = fs.readdirSync(fullPath);

      if (files.length === 0) {
        // Check if folder is empty.
        return fullPath;
      } else {
        // listing all files using forEach
        for (let j = 0; j < files.length; j++) {
          let file = files[j];
          // If a single file exists, do not continue the process of generating page
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
      actualContent = this.utils.replaceAll(actualContent, "<%pageName%>", this.outputResponse.data.pageName);
      actualContent = this.utils.replaceAll(actualContent, "<%titlePageName%>", this.namingHelper.capitalizeEachWordWithSpaces(this.outputResponse.data.pageName));
      actualContent = this.utils.replaceAll(actualContent, "<%stylePageName%>", this.namingHelper.dasherize(this.outputResponse.data.pageName));
      actualContent = this.utils.replaceAll(actualContent, "<%copyrightYear%>", String(new Date().getFullYear()));
      actualContent = this.utils.replaceAll(actualContent, "<%fileName%>", this.outputResponse.data.fileName);

      const completeFilePath = this.outputResponse.data.folderPath + this.outputResponse.data.fileName + fileNameSuffix + "." + fileExtension;
      fsExtra.writeFileSync(completeFilePath, actualContent);
      // Success case, the file was saved
      this.logger.log("File contents saved!");
    }
  }

  /**
   * Creates the page object in project-config.json.
   * If the menuOrientation is horizontal, then iconPosition is set to bottom by default.
   * If the menuOrientation is vertical, then iconPosition is set to empty by default.
   * If the menuOrientation is none, then iconPosition and iconUrl are set to empty.
   */
  private createPageObject() {
    const allowNavigation = this.utils.convertStringToBoolean(this.outputResponse.data.menuOption);
    let pageObject: any = {
      "pageName": this.outputResponse.data.pageName,
      "fullPath": this.outputResponse.data.folderPath,
      "fileName": this.outputResponse.data.fileName + '.html',
      "standAloneView": !allowNavigation,
      "pageProperties": {
        "class": ""
      }
    };
    if (allowNavigation === true) {
      const projectConfigJSON = this.projectConfig.getJson();
      if (projectConfigJSON.menuOrientation === 'horizontal') {
        pageObject.navigation = {
          "sequence": this.projectConfig.getHighestNavigationSequence() + 1,
          "label": this.outputResponse.data.pageName.toLowerCase(),
          "isI18nLabel": false,
          "iconClass": "",
          "iconUrl": "./app/project/assets/img/navigation/page.svg",
          "iconPosition": "bottom"
        };
      } else if (projectConfigJSON.menuOrientation === 'vertical') {
        pageObject.navigation = {
          "sequence": this.projectConfig.getHighestNavigationSequence() + 1,
          "label": this.outputResponse.data.pageName.toLowerCase(),
          "isI18nLabel": false,
          "iconClass": "",
          "iconUrl": "./app/project/assets/img/navigation/page.svg",
          "iconPosition": ""
        };
      } else {
        pageObject.navigation = {
          "sequence": this.projectConfig.getHighestNavigationSequence() + 1,
          "label": this.outputResponse.data.pageName.toLowerCase(),
          "isI18nLabel": false,
          "iconClass": "",
          "iconUrl": "",
          "iconPosition": ""
        };
      }
    }
    return pageObject;
  }

  /**
   * Loop and check the next valid page to set
   * @param {*} pages 
   */
  private loopAndCheckPage(pages: any) {
    let pageFound = false;
    let newPageNameToSet = "";
    let i = 1;
    do {
      newPageNameToSet = "Page" + i;
      pageFound = false;
      for (let j = 0; j < pages.length; j++) {
        if (pages[j].pageName.trim().toLowerCase() === newPageNameToSet.toString().toLowerCase()) {
          pageFound = true;
          break;
        }
      }
      i++;
    }
    while (pageFound === true);
    return newPageNameToSet;
  }

  /**
   * Method to validate Page Name
   * @param {string} pageName
   */
  private validatePageName(pageName: string) {
    this.logger.log("pageName to Validate", pageName);
    if (this.utils.isValidInput(pageName)) {
      pageName = String(pageName).trim();
      if (pageName.length < this.MIN_LENGTH_OF_PAGE_NAME || pageName.length > this.MAX_LENGTH_OF_PAGE_NAME) {
        return this.getText("ERRORS.PAGE_NAME_LENGTH", String(this.MIN_LENGTH_OF_PAGE_NAME), String(this.MAX_LENGTH_OF_PAGE_NAME));
      } else {
        let pageValidity = new RegExp(/^[a-zA-Z][a-zA-Z0-9-_ $]*$/).test(pageName);
        if (pageValidity === false) {
          return this.getText("ERRORS.PAGE_NAME_MANDATORY");
        } else {
          let originalInputName = this.namingHelper.convertMultipleSpacesToSingleSpace(pageName.trim().toLowerCase());
          originalInputName = this.namingHelper.camelize(originalInputName);

          this.logger.log("  originalInputName: " + originalInputName);
          if (this.projectConfig.isPageExistInJSON(originalInputName)) {
            return this.getText("ERRORS.PAGE_EXISTS_IN_PROJECT_CONFIG_JSON");
          } else if (this.projectConfig.isWidgetExistInJSON(originalInputName)) {
            return this.getText("ERRORS.WIDGET_EXISTS_IN_PROJECT_CONFIG_JSON");
          } else if (this.checkPageNameForDisallowedKeywords(originalInputName, "startsWith") === true) {
            return this.getText("ERRORS.PAGE_CANNOT_START_WITH", this.getInvalidPageStartWithValues());
          } else if (this.checkPageNameForDisallowedKeywords(originalInputName, "equals") === true) {
            return this.getText("ERRORS.PAGE_DISALLOWED_KEYWORDS");
          } else {
            return "";
          }
        }
      }
    } else {
      return this.getText("ERRORS.PAGE_NAME_MANDATORY");
    }
  }

  /**
   * Gets the keywords that are not allowed for pages to start
   */
  private getInvalidPageStartWithValues() {
    let output = "";
    const templateNames: any = this.getConfigNode("templateNames");
    for (let i: number = 0; i < templateNames.disallowed["startsWith"].length; i++) {
      output += "'" + templateNames.disallowed["startsWith"][i] + "', ";
    }
    output = output.trim();
    return output.substr(0, output.length - 1);
  }

  /**
   * Checks if the pagename has disallowed keywords
   * @param {*} pageName 
   * @param {*} type 
   */
  private checkPageNameForDisallowedKeywords(pageName: string, type: string) {
    const templateNames: any = this.getConfigNode("templateNames");
    if (type === "startsWith") {
      for (let i: number = 0; i < templateNames.disallowed[type].length; i++) {
        if (pageName.trim().toLowerCase().startsWith(templateNames.disallowed[type][i].trim().toLowerCase())) {
          return true;
        }
      }
    } else if (type === "equals") {
      for (let i: number = 0; i < templateNames.disallowed[type].length; i++) {
        if (pageName.trim().toLowerCase() === templateNames.disallowed[type][i].trim().toLowerCase()) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Validate Menu Option
   * @param {*} menuOption 
   */
  private validateMenuOption(menuOption: string) {
    this.logger.log("menuOption to Validate", menuOption);
    if (this.utils.isValidInput(menuOption)) {
      menuOption = String(menuOption).trim().toLowerCase();
      if (menuOption === "y" || menuOption === "n") {
        return "";
      } else {
        return this.getText("ERRORS.ADD_TO_MENU_INVALID_ENTRY");
      }
    } else {
      return this.getText("ERRORS.ADD_TO_MENU_INVALID_ENTRY");
    }
  }

}
