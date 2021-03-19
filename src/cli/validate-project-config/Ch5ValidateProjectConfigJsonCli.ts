// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCli } from "../Ch5BaseClassForCli";
import { ICh5Cli } from "../ICh5Cli";

const path = require('path');
const fs = require("fs");
const process = require("process");
const jsonSchema = require('jsonschema');
const Enquirer = require('enquirer');
const enquirer = new Enquirer();

export class Ch5ValidateProjectConfigCli extends Ch5BaseClassForCli implements ICh5Cli {

  private outputResponse: any = {};
  private errorsFound: any = [];
  private warningsFound: any = [];
  private projectConfigJson: any = {};
  private projectConfigJsonSchema: any = {};

  public constructor() {
    super("validate-project-config");
  }

  // public async setupCommand(program: commander.Command) {
  //   let programObject = program
  //     .command('generate:page')
  //     .name('generate:page')
  //     .usage('[options]');

  //   programObject = programObject.option("-n, --name", 'Set the Name of the page to be created');
  //   programObject = programObject.option("-m, --menu", "Allow the page navigation to be added to Menu (valid input values are 'Y', 'y', 'N', 'n'");

  //   const helpContentPath: string = path.join(__dirname, "templates", "help.template");
  //   const contentForHelp: string = await this.componentHelper.readFileContent(helpContentPath);
  //   programObject = programObject.addHelpText('after', contentForHelp);
  //   programObject.action(async (options) => {
  //     try {
  //       //  await console.log("Options", options);
  //       //   await console.log("archive", archive);
  //       await this.validateJSON();
  //       // await this.deploy(archive, options);
  //     } catch (e) {
  //       this.logger.error(e);
  //     }
  //   });
  // }

  /**
   * Method for validating projectconfig.json file
   */
  async run() {
    this.logger.printLog(this.getText("PROCESSING_MESSAGE"));

    this.projectConfigJson = JSON.parse(this.componentHelper.readFileContentSync("./app/project-config.json"));
    this.projectConfigJsonSchema = JSON.parse(this.componentHelper.readFileContentSync("./.vscode/project-config-schema.json"));

    this.clearErrors();
    this.clearWarnings();

    const projectConfigObject = JSON.parse(JSON.stringify(this.projectConfigJson));
    const pagesArray = projectConfigObject.content.pages;
    const widgetsArray = projectConfigObject.content.widgets;

    // Validate schema - https://www.npmjs.com/package/jsonschema
    this.validateSchema();

    // Check pages
    this.verifyPagesExist(pagesArray);

    // Check widgets
    this.verifyWidgetsExist(widgetsArray);

    // Check repeated page names
    this.checkIfPagesAreRepeated(pagesArray);

    // Check repeated widget names
    this.checkIfWidgetsAreRepeated(widgetsArray);

    // Check page sequences
    this.checkPageSequence(pagesArray);

    // Check if theme name is Invalid
    this.checkInvalidSelectedTheme(projectConfigObject);

    // Check if theme name is duplicated in array
    this.checkIfThemeNamesAreRepeated(projectConfigObject.themes);

    // If menuOrientation is either veritcal or horizontal , then check if atleast 1 navigation item exists in the list
    this.checkAtleastOneNavigationForMenu(pagesArray, projectConfigObject.menuOrientation);

    // Warning for iconposition for vertical menu orientation
    this.checkIconPositionForVerticalMenu(pagesArray, projectConfigObject.menuOrientation);

    // Fix validate project config - We need to check menuOrientation="vertical" and header display="false" -
    this.checkHeaderAvailabilityForVerticalMenu(projectConfigObject.header.display, projectConfigObject.menuOrientation);

    // Pages array is empty
    this.checkIfNoPagesExist(pagesArray);

    // Check if response.content.$defaultView has valid input
    this.checkIfDefaultViewIsValid(projectConfigObject.content.$defaultView, pagesArray);

    // Check if there are additional folders in the project which are not available in project-config.json and throw a warning
    // this.checkIfUnwantedFilesAndFoldersExist(pagesArray, "./app/project/components/pages/");

    // Check if there are additional folders in the project which are not available in project-config.json and throw a warning
    // this.checkIfUnwantedFilesAndFoldersExist(widgetsArray, "./app/project/components/widgets/");

    // Page and Widget Names collide
    this.checkIfPagesAndWidgetNamesDuplicate(pagesArray, widgetsArray);

    // Check if the header and footer components have navigation
    this.checkIfHeaderComponentsHaveNavigation(projectConfigObject, pagesArray, projectConfigObject.header.display, projectConfigObject.menuOrientation);

    // Check if the header and footer components have navigation
    this.checkIfFooterComponentsHaveNavigation(projectConfigObject, pagesArray, projectConfigObject.footer.display, projectConfigObject.menuOrientation);

    if (this.getErrors().length > 0) {
      this.logger.printError(this.composeOutput(this.getErrors(), this.getText("TYPE_ERROR")));
    }
    if (this.getWarnings().length > 0) {
      this.logger.printWarning(this.composeOutput(this.getWarnings(), this.getText("TYPE_WARNING")));
    }
    if (this.getErrors().length > 0) {
      // Exit after printing both errors and warnings
      process.exit(1);
    }

    this.logger.printSuccess(this.getText("SUCCESS_MESSAGE"));
  }

  /**
   * Validating the schema file
   */
  validateSchema() {
    let Validator = jsonSchema.Validator;
    let v = new Validator();
    const errors = v.validate(this.projectConfigJson, this.projectConfigJsonSchema).errors;
    const errorOrWarningType = this.getText("VALIDATIONS.SCHEMA.HEADER");
    for (let i: number = 0; i < errors.length; i++) {
      this.logger.log("errors[i]", errors[i]);
      this.addError(errorOrWarningType, errors[i].stack.toString().replace("instance.", ""), errors[i].schema.description);
    }
  }

  /**
   * Check if the pages defined in project-config.json exists in project
   */
  verifyPagesExist(pagesArray: any[]) {
    for (let i: number = 0; i < pagesArray.length; i++) {
      if (!fs.existsSync(pagesArray[i].fullPath)) {
        this.addError(this.getText("VALIDATIONS.PAGE_MISSING_FILE_FOLDER.HEADER", pagesArray[i].pageName), this.getText("VALIDATIONS.PAGE_MISSING_FILE_FOLDER.FOLDER_PATH_MISSING", pagesArray[i].fullPath, pagesArray[i].fileName), "");
      } else {
        if (!fs.existsSync(pagesArray[i].fullPath + pagesArray[i].fileName)) {
          this.addError(this.getText("VALIDATIONS.PAGE_MISSING_FILE_FOLDER.HEADER", pagesArray[i].pageName), this.getText("VALIDATIONS.PAGE_MISSING_FILE_FOLDER.FILE_NOT_IN_FOLDER", pagesArray[i].fileName, pagesArray[i].fullPath, pagesArray[i].pageName), "");
        }
      }
    }
  }

  /**
   * Check if the widgets defined in project-config.json exists in project
   */
  verifyWidgetsExist(widgetsArray: string | any[]) {
    for (let i: number = 0; i < widgetsArray.length; i++) {
      if (!fs.existsSync(widgetsArray[i].fullPath)) {
        this.addError(this.getText("VALIDATIONS.WIDGET_MISSING_FILE_FOLDER.HEADER", widgetsArray[i].widgetName), this.getText("VALIDATIONS.WIDGET_MISSING_FILE_FOLDER.FOLDER_PATH_MISSING", widgetsArray[i].fullPath, widgetsArray[i].fileName), "");
      } else {
        if (!fs.existsSync(widgetsArray[i].fullPath + widgetsArray[i].fileName)) {
          this.addError(this.getText("VALIDATIONS.WIDGET_MISSING_FILE_FOLDER.HEADER", widgetsArray[i].widgetName), this.getText("VALIDATIONS.WIDGET_MISSING_FILE_FOLDER.FILE_NOT_IN_FOLDER", widgetsArray[i].fileName, widgetsArray[i].fullPath, widgetsArray[i].widgetName), "");
        }
      }
    }
  }

  /**
   * Check if the selected theme is not empty and available in the list of themes
   */
  checkInvalidSelectedTheme(projectConfigObject: { selectedTheme: string; themes: string | any[]; }) {
    let isThemeAvailable = false;
    const errorOrWarningType = this.getText("VALIDATIONS.SELECTED_THEME_INCORRECT.HEADER");

    if (this.utils.isValidInput(projectConfigObject.selectedTheme)) {
      for (let i: number = 0; i < projectConfigObject.themes.length; i++) {
        if (projectConfigObject.selectedTheme.trim().toLowerCase() === projectConfigObject.themes[i].name.trim().toLowerCase()) {
          if (projectConfigObject.selectedTheme !== projectConfigObject.themes[i].name) {
            this.addWarning(errorOrWarningType, this.getText("VALIDATIONS.SELECTED_THEME_INCORRECT.THEME_NAMING_STYLE", projectConfigObject.selectedTheme, projectConfigObject.themes[i].name), "");
          }
          isThemeAvailable = true;
          break;
        }
      }
      if (isThemeAvailable === false) {
        this.addError(errorOrWarningType, this.getText("VALIDATIONS.SELECTED_THEME_INCORRECT.THEME_NOT_IN_LIST", projectConfigObject.selectedTheme), "");
      }
    } else {
      this.addError(errorOrWarningType, this.getText("VALIDATIONS.SELECTED_THEME_INCORRECT.THEME_NOT_AVAILABLE"), "");
    }
  }

  /**
   * Check if any other folders exist in the app which are not defined in project-config.json
   */
  checkIfPagesAreRepeated(pagesArray: string | any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.PAGE_NAMES_REPEATED.HEADER");
    const newPageArray: any[] = [];
    for (let i: number = 0; i < pagesArray.length; i++) {
      if (newPageArray.includes(pagesArray[i].pageName.trim().toLowerCase())) {
        this.addError(errorOrWarningType, this.getText("VALIDATIONS.PAGE_NAMES_REPEATED.MESSAGE", pagesArray[i].pageName), "");
      } else {
        newPageArray.push(pagesArray[i].pageName.trim().toLowerCase());
      }
    }
  }

  /**
   * Check if any other folders exist in the app which are not defined in project-config.json
   */
  checkIfWidgetsAreRepeated(widgetsArray: string | any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.WIDGET_NAMES_REPEATED.HEADER");
    const newWidgetArray: any[] = [];
    for (let i: number = 0; i < widgetsArray.length; i++) {
      if (newWidgetArray.includes(widgetsArray[i].widgetName.trim().toLowerCase())) {
        this.addError(errorOrWarningType, this.getText("VALIDATIONS.PAGE_NAMES_REPEATED.MESSAGE", widgetsArray[i].widgetName), "");
      } else {
        newWidgetArray.push(widgetsArray[i].widgetName.trim().toLowerCase());
      }
    }
  }

  /**
   * Check if any other folders exist in the app which are not defined in project-config.json
   */
  checkPageSequence(pagesArray: string | any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.NAVIGATION_PAGE_SEQUENCE.HEADER");
    const newPageArraySequence: any[] = [];
    for (let i: number = 0; i < pagesArray.length; i++) {
      if (pagesArray[i].navigation) {
        if (newPageArraySequence.includes(pagesArray[i].navigation.sequence)) {
          this.addWarning(errorOrWarningType, this.getText("VALIDATIONS.NAVIGATION_PAGE_SEQUENCE.MESSAGE", pagesArray[i].pageName), "");
        } else {
          newPageArraySequence.push(pagesArray[i].navigation.sequence);
        }
      }
    }
  }

  /**
   * Checks if the theme name is repeated in the themes array.
   * @param {*} pagesArray 
   */
  checkIfThemeNamesAreRepeated(themes: string | any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.REPEATED_THEME_NAME_IN_ARRAY.HEADER");
    const newPageArraySequence: any[] = [];
    for (let i: number = 0; i < themes.length; i++) {
      if (newPageArraySequence.includes(themes[i].name)) {
        this.addError(errorOrWarningType, this.getText("VALIDATIONS.REPEATED_THEME_NAME_IN_ARRAY.MESSAGE", themes[i].name), "");
      } else {
        newPageArraySequence.push(themes[i].name);
      }
    }
  }

  /**
   * If menuOrientation is either veritcal or horizontal , then check if atleast 1 navigation item exists in the list
   */
  checkAtleastOneNavigationForMenu(pagesArray: string | any[], menuOrientation: string) {
    if (menuOrientation === "horizontal" || menuOrientation === "vertical") {
      const errorOrWarningType = this.getText("VALIDATIONS.ATLEAST_ONE_MENU.HEADER");
      let menuCount = 0;
      for (let i: number = 0; i < pagesArray.length; i++) {
        if (pagesArray[i].navigation) {
          menuCount++;
        }
      }
      if (menuCount === 0) {
        this.addError(errorOrWarningType, this.getText("VALIDATIONS.ATLEAST_ONE_MENU.MESSAGE"), "");
      }
    }
  }

  /**
   * Warning for iconposition for vertical menu orientation
   * @param {*} pagesArray 
   * @param {*} menuOrientation 
   */
  checkIconPositionForVerticalMenu(pagesArray: any[], menuOrientation: string) {
    if (menuOrientation === "vertical") {
      const errorOrWarningType = this.getText("VALIDATIONS.ICON_POSITION_VERTICAL.HEADER");
      for (let i: number = 0; i < pagesArray.length; i++) {
        if (pagesArray[i].navigation && pagesArray[i].navigation.iconPosition !== "") {
          this.addWarning(errorOrWarningType, this.getText("VALIDATIONS.ICON_POSITION_VERTICAL.MESSAGE"), "");
          break;
        }
      }
    }
  }

  /**
   * Check menuOrientation="vertical" and header display="false" 
   * @param {*} pagesArray 
   * @param {*} menuOrientation 
   */
  checkHeaderAvailabilityForVerticalMenu(headerDisplay: boolean, menuOrientation: string) {
    if (menuOrientation === "vertical" && headerDisplay === false) {
      const errorOrWarningType = this.getText("VALIDATIONS.VERTICAL_MENU_HEADER_AVAILABLE.HEADER");
      this.addError(errorOrWarningType, this.getText("VALIDATIONS.VERTICAL_MENU_HEADER_AVAILABLE.MESSAGE"), "");
    }
  }

  /**
   * Check if the header component has navigation
   * @param {*} projectConfigObject 
   * @param {*} pagesArray 
   * @param {*} headerDisplay 
   * @param {*} menuOrientation 
   */
  checkIfHeaderComponentsHaveNavigation(projectConfigObject: { header: { [x: string]: any; }; }, pagesArray: any[], headerDisplay: boolean, menuOrientation: string) {
    if (menuOrientation !== "none" && headerDisplay === true) {
      const headerComponentName = projectConfigObject.header["$component"];
      if (this.utils.isValidInput(headerComponentName)) {
        const errorOrWarningType = this.getText("VALIDATIONS.HEADER_COMPONENT_MISMATCH.HEADER");
        const getPageObject = pagesArray.find((tempObj: { pageName: string; }) => tempObj.pageName.trim().toLowerCase() === headerComponentName.trim().toLowerCase());
        if (getPageObject) {
          if (getPageObject.navigation) {
            // If navigation, then we have to throw error for now
            this.addError(errorOrWarningType, this.getText("VALIDATIONS.HEADER_COMPONENT_MISMATCH.ERROR_MESSAGE_NAVIGATION"), "");
          } else {
            if (getPageObject.standAloneView === true) {
              this.addError(errorOrWarningType, this.getText("VALIDATIONS.HEADER_COMPONENT_MISMATCH.ERROR_MESSAGE_STANDALONE_TRUE"), "");
            }
          }
        } else {
          this.addError(errorOrWarningType, this.getText("VALIDATIONS.HEADER_COMPONENT_MISMATCH.ERROR_MESSAGE_PAGE_MISSING"), "");
        }
      }
    }
  }

  /**
   * Check if the footer component has navigation
   * @param {*} projectConfigObject 
   * @param {*} pagesArray 
   * @param {*} footerDisplay 
   * @param {*} menuOrientation 
   */
  checkIfFooterComponentsHaveNavigation(projectConfigObject: { footer: { [x: string]: any; }; }, pagesArray: any[], footerDisplay: boolean, menuOrientation: string) {
    if (menuOrientation !== "none" && footerDisplay === true) {
      const footerComponentName = projectConfigObject.footer["$component"];
      if (this.utils.isValidInput(footerComponentName)) {
        const errorOrWarningType = this.getText("VALIDATIONS.FOOTER_COMPONENT_MISMATCH.HEADER");
        const getPageObject = pagesArray.find((tempObj: { pageName: string; }) => tempObj.pageName.trim().toLowerCase() === footerComponentName.trim().toLowerCase());
        if (getPageObject) {
          if (getPageObject.navigation) {
            // If navigation, then we have to throw error for now
            this.addError(errorOrWarningType, this.getText("VALIDATIONS.FOOTER_COMPONENT_MISMATCH.ERROR_MESSAGE_NAVIGATION"), "");
          } else {
            if (getPageObject.standAloneView === true) {
              this.addError(errorOrWarningType, this.getText("VALIDATIONS.FOOTER_COMPONENT_MISMATCH.ERROR_MESSAGE_STANDALONE_TRUE"), "");
            }
          }
        } else {
          this.addError(errorOrWarningType, this.getText("VALIDATIONS.FOOTER_COMPONENT_MISMATCH.ERROR_MESSAGE_PAGE_MISSING"), "");
        }
      }
    }
  }

  /**
   * Pages array is empty
   * @param {*} pagesArray 
   */
  checkIfNoPagesExist(pagesArray: any[]) {
    if (!(pagesArray && pagesArray.length > 0)) {
      const errorOrWarningType = this.getText("VALIDATIONS.EMPTY_PAGES_ARRAY.HEADER");
      this.addError(errorOrWarningType, this.getText("VALIDATIONS.EMPTY_PAGES_ARRAY.MESSAGE"), "");
    }
  }

  /**
   * Page and Widget Names collide
   * @param {*} pagesArray 
   * @param {*} widgetsArray 
   */
  checkIfPagesAndWidgetNamesDuplicate(pagesArray: any[], widgetsArray: any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.PAGE_AND_WIDGET_DUPLICATES.HEADER");
    for (let i: number = 0; i < pagesArray.length; i++) {
      for (let j = 0; j < widgetsArray.length; j++) {
        if (widgetsArray[j].widgetName.trim().toLowerCase() === pagesArray[i].pageName.trim().toLowerCase()) {
          this.addError(errorOrWarningType, this.getText("VALIDATIONS.PAGE_AND_WIDGET_DUPLICATES.MESSAGE", pagesArray[i].pageName, widgetsArray[j].widgetName), "");
        }
      }
    }
  }

  /**
   * Check if default view is valid
   * @param {*} pagesArray 
   */
  //response.content.$defaultView
  checkIfDefaultViewIsValid(defaultView: string, pagesArray: any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.DEFAULT_VIEW_INVALID.HEADER");
    if (defaultView && this.utils.isValidInput(defaultView)) {
      let lblnDefaultViewExists = false;
      for (let i: number = 0; i < pagesArray.length; i++) {
        if (pagesArray[i].pageName.trim().toLowerCase() === defaultView.trim().toLowerCase()) {
          if (pagesArray[i].navigation) {
            lblnDefaultViewExists = true;
            break;
          } else {
            // If no navigation, then we have to throw error for now
            this.addError(errorOrWarningType, this.getText("VALIDATIONS.DEFAULT_VIEW_INVALID.ERROR_MESSAGE_NO_NAVIGATION", defaultView), "");
            return;
          }
        }
      }
      if (lblnDefaultViewExists === false) {
        this.addError(errorOrWarningType, this.getText("VALIDATIONS.DEFAULT_VIEW_INVALID.ERROR_MESSAGE", defaultView), "");
      }
    } else {
      this.addWarning(errorOrWarningType, this.getText("VALIDATIONS.DEFAULT_VIEW_INVALID.WARNING_MESSAGE"), "");
    }
  }

  /**
   * Check if any other folders exist in the app which are not defined in project-config.json
   */
  async checkIfUnwantedFilesAndFoldersExist(arrayObject: any[], moveFrom: string) {
    return new Promise<void>(resolve => {
      try {
        // Get the files as an array
        fs.promises.readdir(moveFrom).then((files: any) => {
          // Loop them all with the new for...of
          for (const file of files) {
            // Get the full paths
            const fromPath = path.join(moveFrom, file);

            // Stat the file to see if we have a file or dir
            fs.promises.stat(fromPath).then((stat: { isFile: () => any; isDirectory: () => any; }) => {
              if (stat.isFile()) {
                this.checkIfFileExists(arrayObject, fromPath);
              } else if (stat.isDirectory()) {
                // console.log("'%s' is a directory.", fromPath);
                // checkIfUnwantedFilesAndFoldersExist(fromPath);
                this.checkIfFolderExists(arrayObject, fromPath);
                this.checkIfUnwantedFilesAndFoldersExist(arrayObject, fromPath);
              }
            });
          } // End for...of
          resolve();
        });

      } catch (e) {
        resolve();
        // Catch anything bad that happens
        // console.error("We've thrown! Whoops!", e);
      }
    });
  }

  /**
   * 
   * @param {*} objectArray 
   * @param {*} filePath 
   */
  checkIfFileExists(objectArray: any[], filePath: string) {
    const newFilePath: string = "./" + filePath.trim().toLowerCase();
    const errorOrWarningType = this.getText("VALIDATIONS.PAGE_AND_WIDGET_DUPLICATES.MESSAGE");
    let lbnPathExists = false;
    for (let i: number = 0; i < objectArray.length; i++) {
      if (newFilePath === objectArray[i]["fullPath"].trim().toLowerCase() && objectArray[i]["fileName"].trim().toLowerCase()) {
        lbnPathExists = true;
        break;
      }
    }
    if (lbnPathExists === false) {
      this.addWarning(errorOrWarningType, this.getText("VALIDATIONS.PAGE_AND_WIDGET_DUPLICATES.MESSAGE", newFilePath), "");
    }
  }

  /**
   * 
   * @param {*} objectArray 
   * @param {*} folderPath 
   */
  checkIfFolderExists(objectArray: any[], folderPath: string) {
    const newFilePath = "./" + folderPath.trim().toLowerCase() + "/";
    const errorOrWarningType = this.getText("VALIDATIONS.PAGE_AND_WIDGET_DUPLICATES.MESSAGE");
    let lbnPathExists = false;
    for (let i: number = 0; i < objectArray.length; i++) {
      if (newFilePath === objectArray[i]["fullPath"].trim().toLowerCase()) {
        lbnPathExists = true;
        break;
      }
    }
    if (lbnPathExists === false) {
      this.addWarning(errorOrWarningType, this.getText("VALIDATIONS.PAGE_AND_WIDGET_DUPLICATES.MESSAGE", newFilePath), "");
    }
  }

  /**
   * Returns errors found
   */
  getErrors() {
    return this.errorsFound;
  }

  /**
   * Clears the errors array
   */
  clearErrors() {
    this.errorsFound = [];
  }

  /**
   * Adds error message to the array
   * @param {string} heading 
   * @param {string} message 
   * @param {string} resolution 
   */
  addError(heading: string, message: string, resolution: string) {
    this.errorsFound.push({
      heading: heading,
      message: message,
      resolution: resolution
    });
  }

  /**
   * Returns warnings found
   */
  getWarnings() {
    return this.warningsFound;
  }

  /**
   * Clears the warning array
   */
  clearWarnings() {
    this.warningsFound = [];
  }

  /**
   * Adds warning message to the array
   * @param {string} heading 
   * @param {string} message 
   * @param {string} resolution 
   */
  addWarning(heading: string, message: string, resolution: string) {
    this.warningsFound.push({
      heading: heading,
      message: message,
      resolution: resolution
    });
  }

  /**
   * Composes the output message for errors
   * @param {array} dataArray 
   * @param {string} type 
   */
  composeOutput(dataArray: any[], type: string) {
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
