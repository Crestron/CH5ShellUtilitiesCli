// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import * as commander from "commander";

import { Ch5CliUtil } from "../Ch5CliUtil";
import { Ch5CliLogger } from "../Ch5CliLogger";
import { Ch5CliNamingHelper } from "../Ch5CliNamingHelper";
import { Ch5CliComponentsHelper } from "../Ch5CliComponentsHelper";
import { Ch5CliProjectConfig } from "../Ch5CliProjectConfig";

const inquirer = require('inquirer');
const path = require('path');
const fs = require("fs"); // global object - always available
const process = require("process"); // global object - always available
const fsExtra = require("fs-extra");

const Enquirer = require('enquirer');
const enquirer = new Enquirer();

// process.env["NODE_CONFIG_DIR"] = "./"; //"./../config/";
const config = require("config");

export class Ch5ExportComponentsCli {
  private readonly _cliUtil: Ch5CliUtil;
  private readonly _cliLogger: Ch5CliLogger;
  private readonly _cliComponentHelper: Ch5CliComponentsHelper;
  private readonly _cliNamingHelper: Ch5CliNamingHelper;
  private readonly _cliCh5CliProjectConfig: Ch5CliProjectConfig;

  private readonly CONFIG_FILE: any = config.generatePage;
  private outputResponse: any = {};
  private processArgs: any = [];
  private templateFolderPath: string = "";

  public constructor() {
    this._cliUtil = new Ch5CliUtil();
    this._cliLogger = new Ch5CliLogger();
    this._cliComponentHelper = new Ch5CliComponentsHelper();
    this._cliNamingHelper = new Ch5CliNamingHelper();
    this._cliCh5CliProjectConfig = new Ch5CliProjectConfig();
    this.templateFolderPath = path.join(__dirname, '..', this.CONFIG_FILE.templatesPath);
  }

  public async setupCommand(program: commander.Command) {
    let programObject = program
      .command('generate:page')
      .name('generate:page')
      .usage('[options]');

    programObject = programObject.option("-n, --name", 'Set the Name of the page to be created');
    programObject = programObject.option("-m, --menu", "Allow the page navigation to be added to Menu (valid input values are 'Y', 'y', 'N', 'n'");

    const contentForHelp: string = await this._cliComponentHelper.getHelpContent(path.join(this.templateFolderPath, "help.template"));
    programObject = programObject.addHelpText('after', contentForHelp);
    programObject.action(async (options) => {
      try {
        //  await console.log("Options", options);
        //   await console.log("archive", archive);
        await this.run(options);
        // await this.deploy(archive, options);
      } catch (e) {
        this._cliUtil.writeError(e);
      }
    });
    // program
    //   .command('generate:page')
    //   .option("-H, --deviceHost <deviceHost>", "Device host or IP. Required.")
    //   .option("-t, --deviceType <deviceType>", "Device type, value in [touchscreen, controlsystem, web]. Required.", /^(touchscreen|controlsystem|web)$/i)
    //   .option("-d, --deviceDirectory <deviceDirectory>",
    //     "Device target deploy directory. Defaults to 'display' when deviceType is touchscreen, to 'HTML' when deviceType is controlsystem. Optional.")
    //   .option("-p, --prompt-for-credentials", "Prompt for credentials. Optional.")
    //   .option("-q, --quiet [quiet]", "Don\'t display messages. Optional.")
    //   .option("-vvv, --verbose [verbose]", "Verbose output. Optional.")
    //   .action(async (options) => {
    //     try {
    //     //  await console.log("Options", options);
    //     //   await console.log("archive", archive);
    //       await this.run(options);
    //       // await this.deploy(archive, options);
    //     } catch (e) {
    //       this._cliUtil.writeError(e);
    //     }
    //   });
  }

  /**
   * Public Method 
   */
  async run(options: any) {
    this.processArgs = this._cliComponentHelper.processArgs();
    // if (this.processArgs["help"] === true) {
    //   this._cliComponentHelper.displayHelp(this.CONFIG_FILE.templatesPath + "help.template");
    // } else {
    await this.generatePage();
    // }
  }

  /**
   * Initialize
   */
  initialize() {
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
    if (this.processArgs.length === 0) {
      this.processArgs = this._cliComponentHelper.processArgs();
    }
  }

  /**
   * Method for generating page
   * @param {*} processArgs 
   */
  async generatePage() {
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
      if (e && this._cliUtil.isValidInput(e.message)) {
        if (e.message.trim().toLowerCase() === 'error') {
          this.outputResponse.errorMessage = this.getText("ERRORS.SOMETHING_WENT_WRONG");
        } else {
          this.outputResponse.errorMessage = e.message;
        }
      } else {
        this.outputResponse.errorMessage = this.getText("ERRORS.SOMETHING_WENT_WRONG");
        this._cliLogger.log(e);
      }
    }

    // Show output response
    this.logOutput();

    return this.outputResponse.result; // The return is required to validate in automation test case
  }

  /**
   * Check any validations that need to be done before verifying input parameters
   */
  checkPrerequisiteValidations() {
    // Nothing for this process
  }

  /**
   * Verify input parameters
   */
  verifyInputParams() {
    const tabDisplayText = this.getText("ERRORS.TAB_DELIMITER");
    if (this._cliUtil.isValidInput(this.processArgs["name"])) {
      const validationResponse = this.validatePageName(this.processArgs["name"]);
      if (validationResponse === "") {
        this.outputResponse.data.pageName = this.processArgs["name"];
      } else {
        this.outputResponse.warningMessage += tabDisplayText + this.getText("ERRORS.PAGE_NAME_INVALID_ENTRY", validationResponse);
      }
    }

    if (this._cliUtil.isValidInput(this.processArgs["menu"])) {
      const validationResponse = this.validateMenuOption(this.processArgs["menu"]);
      if (validationResponse === "") {
        this.outputResponse.data.menuOption = this.processArgs["menu"];
      } else {
        this.outputResponse.warningMessage += tabDisplayText + validationResponse + "\n";
      }
    }

    if (this._cliUtil.isValidInput(this.outputResponse.warningMessage)) {
      this._cliLogger.printWarning(this.getText("ERRORS.MESSAGE_TITLE", this.outputResponse.warningMessage));
    }
  }

  /**
   * Check if there are questions to be prompted to the developer
   */
  async checkPromptQuestions() {
    if (!this._cliUtil.isValidInput(this.outputResponse.data.pageName)) {
      let pages = this._cliCh5CliProjectConfig.getAllPages();
      pages = pages.sort(this._cliUtil.dynamicsort("asc", "pageName"));
      this._cliLogger.log("pages", pages);
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
      if (!this._cliUtil.isValidInput(response.pageName)) {
        throw new Error(this.getText("ERRORS.PAGE_NAME_EMPTY_IN_REQUEST"));
      }
      this._cliLogger.log("  response.pageName: ", response.pageName);
      this.outputResponse.data.pageName = response.pageName;
    }

    if (!this._cliUtil.isValidInput(this.outputResponse.data.menuOption)) {
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
      if (!this._cliUtil.isValidInput(response.menuOption)) {
        throw new Error(this.getText("ERRORS.ADD_TO_MENU_EMPTY_IN_REQUEST"));
      }
      this._cliLogger.log("  response.menuOption: ", response.menuOption);
      this.outputResponse.data.menuOption = response.menuOption;
    }

    let originalInputName = this._cliNamingHelper.convertMultipleSpacesToSingleSpace(this.outputResponse.data.pageName.trim().toLowerCase());
    this.outputResponse.data.pageName = this._cliNamingHelper.camelize(originalInputName);
    this._cliLogger.log("  this.outputResponse.data.pageName: ", this.outputResponse.data.pageName);
    this._cliLogger.log("  this.outputResponse.data.menuOption: ", this.outputResponse.data.menuOption);
    this.outputResponse.data.fileName = this._cliNamingHelper.dasherize(originalInputName);
    this._cliLogger.log("  this.outputResponse.data.fileName: ", this.outputResponse.data.fileName);

    if (!this._cliUtil.isValidInput(this.outputResponse.data.pageName) && !this._cliUtil.isValidInput(this.outputResponse.data.menuOption)) {
      throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
    } else if (!this._cliUtil.isValidInput(this.outputResponse.data.pageName)) {
      throw new Error(this.getText("ERRORS.PAGE_NAME_EMPTY_IN_REQUEST"));
    } else if (!this._cliUtil.isValidInput(this.outputResponse.data.menuOption)) {
      throw new Error(this.getText("ERRORS.ADD_TO_MENU_EMPTY_IN_REQUEST"));
    } else if (!this._cliUtil.isValidInput(this.outputResponse.data.fileName)) {
      throw new Error(this.getText("ERRORS.SOMETHING_WENT_WRONG"));
    }
  }

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    if (this._cliCh5CliProjectConfig.isPageExistInJSON(this.outputResponse.data.pageName)) {
      throw new Error(this.getText("ERRORS.PAGE_EXISTS_IN_PROJECT_CONFIG_JSON"));
    } else {
      await this.createFolder().then(async (folderPathResponseGenerated) => {
        this._cliLogger.log("  Folder Path (generated): " + folderPathResponseGenerated);
        this.outputResponse.data.folderPath = folderPathResponseGenerated;

        if (this._cliUtil.isValidInput(this.outputResponse.data.folderPath)) {
          await this.createNewFile("html", "html.template", "");
          await this.createNewFile("js", "js.template", "");
          await this.createNewFile("scss", "scss.template", "");
          await this.createNewFile("json", "emulator.template", "-emulator");

          this._cliCh5CliProjectConfig.savePageToJSON(this.createPageObject());
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
  cleanUp() {
    // Nothing to cleanup for this process
  }

  /**
   * Log Final Response Message
   */
  logOutput() {
    if (this.outputResponse.result === false) {
      this._cliLogger.printError(this.outputResponse.errorMessage);
    } else {
      this._cliLogger.printSuccess(this.getText("SUCCESS_MESSAGE", this.outputResponse.data.pageName, this.outputResponse.data.folderPath));
      if (this.outputResponse.data.menuOption === "Y") {
        this._cliLogger.printSuccess(this.getText("SUCCESS_MESSAGE_NAVIGATION_ADDED"));
      }
      this._cliLogger.printSuccess(this.getText("SUCCESS_MESSAGE_CONCLUSION"));
    }
  }

  /**
   * Create Folder for the Pages to be created
   */
  async createFolder() {
    let isFolderCreated = false;
    let fullPath = "";

    let folderPath = this.CONFIG_FILE.basePathForPages + this.outputResponse.data.fileName + "/";
    let folderPathSplit = folderPath.toString().split("/");
    for (let i = 0; i < folderPathSplit.length; i++) {
      this._cliLogger.log(folderPathSplit[i]);
      if (folderPathSplit[i] && folderPathSplit[i].trim() !== "") {
        let previousPath = fullPath;
        fullPath += folderPathSplit[i] + "/";
        if (!fs.existsSync(fullPath)) {
          this._cliLogger.log("Creating new folder " + folderPathSplit[i] + " inside the folder " + previousPath);
          fs.mkdirSync(fullPath, {
            recursive: true,
          });
          isFolderCreated = true;
        } else {
          this._cliLogger.log(fullPath + " exists !!!");
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
          this._cliLogger.log(file);
          let fileName = this.outputResponse.data.fileName;
          this._cliLogger.log(fileName.toLowerCase() + ".html");
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
  async createNewFile(fileExtension: string, templateFile: string, fileNameSuffix: string) {
    if (templateFile !== "") {
      let actualContent = fsExtra.readFileSync(path.join(this.templateFolderPath, templateFile));
      actualContent = this._cliUtil.replaceAll(actualContent, "<%pageName%>", this.outputResponse.data.pageName);
      actualContent = this._cliUtil.replaceAll(actualContent, "<%titlePageName%>", this._cliNamingHelper.capitalizeEachWordWithSpaces(this.outputResponse.data.pageName));
      actualContent = this._cliUtil.replaceAll(actualContent, "<%stylePageName%>", this._cliNamingHelper.dasherize(this.outputResponse.data.pageName));
      actualContent = this._cliUtil.replaceAll(actualContent, "<%copyrightYear%>", String(new Date().getFullYear()));
      actualContent = this._cliUtil.replaceAll(actualContent, "<%fileName%>", this.outputResponse.data.fileName);

      let commonContentInGeneratedFiles = this.CONFIG_FILE.commonContentInGeneratedFiles;
      for (let i = 0; i < commonContentInGeneratedFiles.length; i++) {
        actualContent = this._cliUtil.replaceAll(actualContent, "<%" + commonContentInGeneratedFiles[i].key + "%>", commonContentInGeneratedFiles[i].value);
      }

      const completeFilePath = this.outputResponse.data.folderPath + this.outputResponse.data.fileName + fileNameSuffix + "." + fileExtension;
      fsExtra.writeFileSync(completeFilePath, actualContent);
      // Success case, the file was saved
      this._cliLogger.log("File contents saved!");
    }
  }

  /**
   * Creates the page object in project-config.json.
   * If the menuOrientation is horizontal, then iconPosition is set to bottom by default.
   * If the menuOrientation is vertical, then iconPosition is set to empty by default.
   * If the menuOrientation is none, then iconPosition and iconUrl are set to empty.
   */
  createPageObject() {
    const allowNavigation = this._cliUtil.convertStringToBoolean(this.outputResponse.data.menuOption);
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
      const projectConfigJSON = this._cliCh5CliProjectConfig.getJson();
      if (projectConfigJSON.menuOrientation === 'horizontal') {
        pageObject.navigation = {
          "sequence": this._cliCh5CliProjectConfig.getHighestNavigationSequence() + 1,
          "label": this.outputResponse.data.pageName.toLowerCase(),
          "isI18nLabel": false,
          "iconClass": "",
          "iconUrl": "./app/project/assets/img/navigation/page.svg",
          "iconPosition": "bottom"
        };
      } else if (projectConfigJSON.menuOrientation === 'vertical') {
        pageObject.navigation = {
          "sequence": this._cliCh5CliProjectConfig.getHighestNavigationSequence() + 1,
          "label": this.outputResponse.data.pageName.toLowerCase(),
          "isI18nLabel": false,
          "iconClass": "",
          "iconUrl": "./app/project/assets/img/navigation/page.svg",
          "iconPosition": ""
        };
      } else {
        pageObject.navigation = {
          "sequence": this._cliCh5CliProjectConfig.getHighestNavigationSequence() + 1,
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
  loopAndCheckPage(pages: any) {
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
  validatePageName(pageName: string) {
    this._cliLogger.log("pageName to Validate", pageName);
    if (this._cliUtil.isValidInput(pageName)) {
      pageName = String(pageName).trim();
      if (pageName.length < this.CONFIG_FILE.minLengthOfPageName || pageName.length > this.CONFIG_FILE.maxLengthOfPageName) {
        return this.getText("ERRORS.PAGE_NAME_LENGTH", this.CONFIG_FILE.minLengthOfPageName, this.CONFIG_FILE.maxLengthOfPageName);
      } else {
        let pageValidity = new RegExp(/^[a-zA-Z][a-zA-Z0-9-_ $]*$/).test(pageName);
        if (pageValidity === false) {
          return this.getText("ERRORS.PAGE_NAME_MANDATORY");
        } else {
          let originalInputName = this._cliNamingHelper.convertMultipleSpacesToSingleSpace(pageName.trim().toLowerCase());
          originalInputName = this._cliNamingHelper.camelize(originalInputName);

          this._cliLogger.log("  originalInputName: " + originalInputName);
          if (this._cliCh5CliProjectConfig.isPageExistInJSON(originalInputName)) {
            return this.getText("ERRORS.PAGE_EXISTS_IN_PROJECT_CONFIG_JSON");
          } else if (this._cliCh5CliProjectConfig.isWidgetExistInJSON(originalInputName)) {
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
  getInvalidPageStartWithValues() {
    let output = "";
    for (let i = 0; i < config.templateNames.disallowed["startsWith"].length; i++) {
      output += "'" + config.templateNames.disallowed["startsWith"][i] + "', ";
    }
    output = output.trim();
    return output.substr(0, output.length - 1);
  }

  /**
   * Checks if the pagename has disallowed keywords
   * @param {*} pageName 
   * @param {*} type 
   */
  checkPageNameForDisallowedKeywords(pageName: string, type: string) {
    if (type === "startsWith") {
      for (let i = 0; i < config.templateNames.disallowed[type].length; i++) {
        if (pageName.trim().toLowerCase().startsWith(config.templateNames.disallowed[type][i].trim().toLowerCase())) {
          return true;
        }
      }
    } else if (type === "equals") {
      for (let i = 0; i < config.templateNames.disallowed[type].length; i++) {
        if (pageName.trim().toLowerCase() === config.templateNames.disallowed[type][i].trim().toLowerCase()) {
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
  validateMenuOption(menuOption: string) {
    this._cliLogger.log("menuOption to Validate", menuOption);
    if (this._cliUtil.isValidInput(menuOption)) {
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

  /**
   * Get the String output from default.json file in config
   * @param {*} key 
   * @param  {...any} values 
   */
  getText(key: string, ...values: string[]) {
    const DYNAMIC_TEXT_MESSAGES = this.CONFIG_FILE.textMessages;
    return this._cliUtil.getText(DYNAMIC_TEXT_MESSAGES, key, ...values);
  }

  private async deploy(archive: string, options: any): Promise<void> {
    this.validateDeployOptions(archive, options);


    // let deviceType = this._cliUtil.getDeviceType(options.deviceType);

    // const userAndPassword = await this.getUserAndPassword(options.promptForCredentials);

    // let configOptions = {
    //   controlSystemHost: options.deviceHost,
    //   deviceType: deviceType,
    //   sftpDirectory: options.deviceDirectory,
    //   sftpUser: userAndPassword.user,
    //   sftpPassword: userAndPassword.password,
    //   outputLevel: this._cliUtil.getOutputLevel(options)
    // } as IConfigOptions;
    // await distributor(archive, configOptions);
    // process.exit(0); // required, takes too long to exit :|
  }

  private validateDeployOptions(archive: string, options: any): void {
    let missingArguments = [];
    let missingOptions = [];

    if (!archive) {
      missingArguments.push('archive');
    }

    if (!options.deviceHost) {
      missingOptions.push('deviceHost');
    }

    if (!options.deviceType) {
      missingOptions.push('deviceType');
    }

    if (missingArguments.length == 0 && missingOptions.length == 0) {
      return;
    }

    const argumentsMessage = missingArguments.length > 0 ? `Missing arguments: ${missingArguments.join(', ')}.` : '';
    const optionsMessage = missingOptions.length > 0 ? `Missing options: ${missingOptions.join('. ')}.` : '';
    throw new Error(`${argumentsMessage} ${optionsMessage} Type 'ch5-cli deploy --help' for usage information.`)
  }

  private async getUserAndPassword(promptForCredentials: boolean): Promise<any> {
    if (!promptForCredentials) {
      return {
        user: 'crestron',
        password: ''
      }
    }
    return await inquirer.prompt(
      [
        {
          type: 'string',
          message: 'Enter SFTP user',
          name: 'user',
          default: 'crestron',
        },
        {
          type: 'password',
          message: 'Enter SFTP password',
          name: 'password',
          mask: '*',
          default: ''
        }
      ]
    );
  }
}
