// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCli } from "../Ch5BaseClassForCli";
import { ICh5Cli } from "../ICh5Cli";

import path from 'path';

const fs = require("fs");
const process = require("process");
const jsonSchema = require('jsonschema');

export class Ch5ValidateProjectConfigCli extends Ch5BaseClassForCli implements ICh5Cli {

  private errorsFound: any = [];
  private warningsFound: any = [];
  private projectConfigJson: any = {};
  private projectConfigJsonSchema: any = {};

  public static RULES: any = {
    PRE_BUILD_RULES: "PRE_BUILD_RULES",
    POST_BUILD_RULES: "POST_BUILD_RULES",
    ALL_RULES: "ALL_RULES"
  };

  public constructor(public showOutputMessages: boolean = true, public exitProcess: boolean = true) {
    super("validate-project-config");
  }

  /**
   * Method for validating project-config.json file
   */
  async run() {
    this.checkVersionToExecute();

    this.logger.log(this.getText("PROCESSING_MESSAGE"));

    this.clearErrors();
    this.clearWarnings();

    try {
      this.projectConfigJson = JSON.parse(this.utils.readFileContentSync(this.getConfigNode("projectConfigJSONFile")));
      this.projectConfigJsonSchema = JSON.parse(this.utils.readFileContentSync(this.getConfigNode("projectConfigJSONSchemaFile")));
    } catch (e: any) {
      this.logger.log(e.message);
      // Exit after printing both errors and warnings
      this.addError(Ch5ValidateProjectConfigCli.RULES.ALL_RULES, "Project Config JSON", e.message, "");
    }

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

    // Check if page names have been manually updated incorrectly
    this.verifyPageNameWithFileNames(pagesArray);

    // Check if widget names have been manually updated incorrectly
    this.verifyWidgetNameWithFileNames(widgetsArray);

    // Check if page folder path have been manually updated incorrectly
    this.verifyPageFolderPath(pagesArray);

    // Check if widget folder path have been manually updated incorrectly
    this.verifyWidgetFolderPath(widgetsArray);

    // Check repeated widget names
    this.checkIfWidgetsAreRepeated(widgetsArray);

    // Check page sequences
    this.checkPageSequence(pagesArray);

    // Check if theme name is Invalid
    this.checkInvalidSelectedTheme(projectConfigObject);

    // Check if theme name is duplicated in array
    this.checkIfThemeNamesAreRepeated(projectConfigObject.themes);

    // If menuOrientation is either vertical or horizontal , then check if atleast 1 navigation item exists in the list
    this.checkAtleastOneNavigationForMenu(pagesArray, projectConfigObject.menuOrientation);

    // Warning for iconPosition for vertical menu orientation
    this.checkIconPositionForVerticalMenu(pagesArray, projectConfigObject.menuOrientation);

    // Fix validate project config - We need to check menuOrientation="vertical" and header display="false" -
    this.checkHeaderAvailabilityForVerticalMenu(projectConfigObject.header.display, projectConfigObject.menuOrientation);

    // Pages array is empty
    this.checkIfNoPagesExist(pagesArray);

    // Check if response.content.$defaultView has valid input
    this.checkIfDefaultViewIsValid(projectConfigObject.content.$defaultView, pagesArray);

    // Check if forceDeviceXPanel is set to false for Zoom project
    this.checkIfForceDeviceXPanelForZoomRoomControl(projectConfigObject.forceDeviceXPanel, projectConfigObject.projectType);

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

    if (this.showOutputMessages === true) {
      this.printOutputErrorsAndWarnings(this.getErrors(), this.getWarnings());
    }

    if (this.getErrors().length > 0) {
      // Exit after printing both errors and warnings
      if (this.exitProcess === true) {
        process.exit(1);
      }
      return false;
    }

    if (this.showOutputMessages === true) {
      this.logger.printSuccess(this.getText("SUCCESS_MESSAGE"));
    }
    return true;
  }

  public printOutputErrorsAndWarnings(errors: any[], warnings: any[]) {
    if (errors.length > 0) {
      this.logger.printError(this.composeOutput(errors, this.getText("TYPE_ERROR")));
    }
    if (warnings.length > 0) {
      this.logger.printWarning(this.composeOutput(warnings, this.getText("TYPE_WARNING")));
    }
  }
  /**
   * Validating the schema file
   */
  private validateSchema() {
    let Validator = jsonSchema.Validator;
    let v = new Validator();
    const errors = v.validate(this.projectConfigJson, this.projectConfigJsonSchema).errors;
    const errorOrWarningTypeHeader: string = this.getText("VALIDATIONS.SCHEMA.HEADER");
    for (let i: number = 0; i < errors.length; i++) {
      this.logger.log("errors[i]", errors[i]);
      this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningTypeHeader, errors[i].stack.toString().replace("instance.", ""), errors[i].schema.description);
    }
  }

  /**
   * Check if the pages defined in project-config.json exists in project
   */
  private verifyPagesExist(pagesArray: any[]) {
    for (let i: number = 0; i < pagesArray.length; i++) {
      const page = pagesArray[i];
      if (!(page.hasOwnProperty("pageName"))) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.ALL_RULES, this.getText("VALIDATIONS.PAGE_NAME_MISSING.HEADER", page.pageName),
          this.getText("VALIDATIONS.PAGE_NAME_MISSING.MESSAGE", page.fullPath, page.fileName), "");
      } else if (!fs.existsSync(page.fullPath)) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.ALL_RULES, this.getText("VALIDATIONS.PAGE_MISSING_FILE_FOLDER.HEADER", page.pageName),
          this.getText("VALIDATIONS.PAGE_MISSING_FILE_FOLDER.FOLDER_PATH_MISSING", page.fullPath, page.fileName), "");
      } else {
        if (!fs.existsSync(page.fullPath + page.fileName)) {
          this.addError(Ch5ValidateProjectConfigCli.RULES.ALL_RULES, this.getText("VALIDATIONS.PAGE_MISSING_FILE_FOLDER.HEADER", page.pageName),
            this.getText("VALIDATIONS.PAGE_MISSING_FILE_FOLDER.FILE_NOT_IN_FOLDER", page.fileName,
              page.fullPath, page.pageName), "");
        }
      }
    }
  }

  /**
   * Check if the widgets defined in project-config.json exists in project
   */
  private verifyWidgetsExist(widgetsArray: string | any[]) {
    for (let i: number = 0; i < widgetsArray.length; i++) {
      const widget = widgetsArray[i];
      if (!(widget.hasOwnProperty("widgetName"))) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.ALL_RULES, this.getText("VALIDATIONS.WIDGET_NAME_MISSING.HEADER", widget.widgetName),
          this.getText("VALIDATIONS.WIDGET_NAME_MISSING.MESSAGE", widget.fullPath, widget.fileName), "");
      } else if (!fs.existsSync(widget.fullPath)) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.ALL_RULES, this.getText("VALIDATIONS.WIDGET_MISSING_FILE_FOLDER.HEADER",
          widget.widgetName),
          this.getText("VALIDATIONS.WIDGET_MISSING_FILE_FOLDER.FOLDER_PATH_MISSING",
            widget.fullPath, widget.fileName), "");
      } else {
        if (!fs.existsSync(widget.fullPath + widget.fileName)) {
          this.addError(Ch5ValidateProjectConfigCli.RULES.ALL_RULES, this.getText("VALIDATIONS.WIDGET_MISSING_FILE_FOLDER.HEADER",
            widget.widgetName),
            this.getText("VALIDATIONS.WIDGET_MISSING_FILE_FOLDER.FILE_NOT_IN_FOLDER",
              widget.fileName, widget.fullPath, widget.widgetName), "");
        }
      }
    }
  }

  /**
   * Check if the selected theme is not empty and available in the list of themes
   */
  private checkInvalidSelectedTheme(projectConfigObject: any) {
    let isThemeAvailable = false;
    const errorOrWarningType = this.getText("VALIDATIONS.SELECTED_THEME_INCORRECT.HEADER");

    if (this.utils.isValidInput(projectConfigObject.selectedTheme)) {
      for (let i: number = 0; i < projectConfigObject.themes.length; i++) {
        if (projectConfigObject.selectedTheme.trim().toLowerCase() === projectConfigObject.themes[i].name.trim().toLowerCase()) {
          if (projectConfigObject.selectedTheme !== projectConfigObject.themes[i].name) {
            this.addWarning(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.SELECTED_THEME_INCORRECT.THEME_NAMING_STYLE", projectConfigObject.selectedTheme, projectConfigObject.themes[i].name), "");
          }
          isThemeAvailable = true;
          break;
        }
      }
      if (isThemeAvailable === false) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.SELECTED_THEME_INCORRECT.THEME_NOT_IN_LIST", projectConfigObject.selectedTheme), "");
      }
    } else {
      this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.SELECTED_THEME_INCORRECT.THEME_NOT_AVAILABLE"), "");
    }
  }

  private verifyPageFolderPath(pagesArray: any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.INVALID_PAGE_FOLDER_PATH.HEADER");
    const pageFolderNamePath: string = "./app/project/components/pages/";
    for (let i: number = 0; i < pagesArray.length; i++) {
      const page = pagesArray[i];
      if (page.hasOwnProperty("fullPath")) {
        if (page.fullPath.toString().startsWith(pageFolderNamePath) === false) {
          this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType,
            this.getText("VALIDATIONS.INVALID_PAGE_FOLDER_PATH.MESSAGE", page.fullPath), "");
        }
      }
    }
  }

  private verifyWidgetFolderPath(widgetArray: any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.INVALID_WIDGET_FOLDER_PATH.HEADER");
    const widgetFolderNamePath: string = "./app/project/components/widgets/";
    for (let i: number = 0; i < widgetArray.length; i++) {
      const widget = widgetArray[i];
      if (widget.hasOwnProperty("fullPath")) {
        if (widget.fullPath.toString().startsWith(widgetFolderNamePath) === false) {
          this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType,
            this.getText("VALIDATIONS.INVALID_WIDGET_FOLDER_PATH.MESSAGE", widget.fullPath), "");
        }
      }
    }
  }

  private verifyPageNameWithFileNames(pagesArray: any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.INVALID_PAGE_WIDGET_NAMES.HEADER");
    for (let i: number = 0; i < pagesArray.length; i++) {
      const page = pagesArray[i];
      if (page.hasOwnProperty("pageName")) {
        const validatePageName = this.namingHelper.camelize(page.fileName.split(".")[0]);
        if (validatePageName !== page.pageName) {
          this.logger.log("  validatePageName: ", validatePageName, page.pageName);
          this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType,
            this.getText("VALIDATIONS.INVALID_PAGE_NAMES.MESSAGE", page.pageName, page.fileName), "");
        }
      }
    }
  }

  private verifyWidgetNameWithFileNames(widgetArray: any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.INVALID_PAGE_WIDGET_NAMES.HEADER");
    for (let i: number = 0; i < widgetArray.length; i++) {
      const widget = widgetArray[i];
      if (widget.hasOwnProperty("widgetName")) {
        const validateWidgetName = this.namingHelper.camelize(widget.fileName.split(".")[0]);
        if (validateWidgetName !== widget.widgetName) {
          this.logger.log("  validateWidgetName: ", validateWidgetName, widget.widgetName);
          this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType,
            this.getText("VALIDATIONS.INVALID_WIDGET_NAMES.MESSAGE", widget.widgetName, widget.fileName), "");
        }
      }
    }
  }

  /**
   * Check if any other folders exist in the app which are not defined in project-config.json
   */
  private checkIfPagesAreRepeated(pagesArray: string | any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.PAGE_NAMES_REPEATED.HEADER");
    const newPageArray: any[] = [];
    for (let i: number = 0; i < pagesArray.length; i++) {
      const page = pagesArray[i];
      if (!(page.hasOwnProperty("pageName"))) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, this.getText("VALIDATIONS.PAGE_NAME_MISSING.HEADER", page.pageName),
          this.getText("VALIDATIONS.PAGE_NAME_MISSING.MESSAGE", page.fullPath, page.fileName), "");
      } else if (newPageArray.includes(page.pageName.trim().toLowerCase())) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.PAGE_NAMES_REPEATED.MESSAGE", page.pageName), "");
      } else {
        newPageArray.push(page.pageName.trim().toLowerCase());
      }
    }
  }

  /**
   * Check if any other folders exist in the app which are not defined in project-config.json
   */
  private checkIfWidgetsAreRepeated(widgetsArray: string | any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.WIDGET_NAMES_REPEATED.HEADER");
    const newWidgetArray: any[] = [];
    for (let i: number = 0; i < widgetsArray.length; i++) {
      const widget = widgetsArray[i];
      if (!(widget.hasOwnProperty("widgetName"))) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, this.getText("VALIDATIONS.WIDGET_NAME_MISSING.HEADER", widget.pageName),
          this.getText("VALIDATIONS.WIDGET_NAME_MISSING.MESSAGE", widget.fullPath, widget.fileName), "");
      } else if (newWidgetArray.includes(widget.widgetName.trim().toLowerCase())) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.PAGE_NAMES_REPEATED.MESSAGE", widget.widgetName), "");
      } else {
        newWidgetArray.push(widget.widgetName.trim().toLowerCase());
      }
    }
  }

  /**
   * Check if any other folders exist in the app which are not defined in project-config.json
   */
  private checkPageSequence(pagesArray: string | any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.NAVIGATION_PAGE_SEQUENCE.HEADER");
    const newPageArraySequence: any[] = [];
    for (let i: number = 0; i < pagesArray.length; i++) {
      if (pagesArray[i].navigation) {
        if (newPageArraySequence.includes(pagesArray[i].navigation.sequence)) {
          this.addWarning(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.NAVIGATION_PAGE_SEQUENCE.MESSAGE", pagesArray[i].pageName), "");
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
  private checkIfThemeNamesAreRepeated(themes: string | any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.REPEATED_THEME_NAME_IN_ARRAY.HEADER");
    const newPageArraySequence: any[] = [];
    for (let i: number = 0; i < themes.length; i++) {
      if (newPageArraySequence.includes(themes[i].name)) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.REPEATED_THEME_NAME_IN_ARRAY.MESSAGE", themes[i].name), "");
      } else {
        newPageArraySequence.push(themes[i].name);
      }
    }
  }

  /**
   * If menuOrientation is either veritcal or horizontal , then check if atleast 1 navigation item exists in the list
   */
  private checkAtleastOneNavigationForMenu(pagesArray: string | any[], menuOrientation: string) {
    if (menuOrientation === "horizontal" || menuOrientation === "vertical") {
      const errorOrWarningType = this.getText("VALIDATIONS.ATLEAST_ONE_MENU.HEADER");
      let menuCount = 0;
      for (let i: number = 0; i < pagesArray.length; i++) {
        if (pagesArray[i].navigation) {
          menuCount++;
        }
      }
      if (menuCount === 0) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.ATLEAST_ONE_MENU.MESSAGE"), "");
      }
    }
  }

  /**
   * Warning for iconPosition for vertical menu orientation
   * @param {*} pagesArray
   * @param {*} menuOrientation
   */
  private checkIconPositionForVerticalMenu(pagesArray: any[], menuOrientation: string) {
    if (menuOrientation === "vertical") {
      const errorOrWarningType = this.getText("VALIDATIONS.ICON_POSITION_VERTICAL.HEADER");
      for (let i: number = 0; i < pagesArray.length; i++) {
        if (pagesArray[i].navigation && pagesArray[i].navigation.iconPosition !== "") {
          this.addWarning(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.ICON_POSITION_VERTICAL.MESSAGE"), "");
          break;
        }
      }
    }
  }

  /**
   * Check if forceDeviceXPanel is set to false for zoom project
   * @param forceDeviceXPanel 
   * @param projectType 
   */
  private checkIfForceDeviceXPanelForZoomRoomControl(forceDeviceXPanel: boolean, projectType: string) {
    if (projectType.toLowerCase() === "zoomroomcontrol" && forceDeviceXPanel === false) {
      const errorOrWarningType = this.getText("VALIDATIONS.FORCE_DEVICE_XPANEL.HEADER");
      this.addError(Ch5ValidateProjectConfigCli.RULES.POST_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.FORCE_DEVICE_XPANEL.MESSAGE"), "");
    }
  }

  /**
   * Check menuOrientation="vertical" and header display="false"
   * @param {*} pagesArray
   * @param {*} menuOrientation
   */
  private checkHeaderAvailabilityForVerticalMenu(headerDisplay: boolean, menuOrientation: string) {
    if (menuOrientation === "vertical" && headerDisplay === false) {
      const errorOrWarningType = this.getText("VALIDATIONS.VERTICAL_MENU_HEADER_AVAILABLE.HEADER");
      this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.VERTICAL_MENU_HEADER_AVAILABLE.MESSAGE"), "");
    }
  }

  /**
   * Check if the header component has navigation
   * @param {*} projectConfigObject
   * @param {*} pagesArray
   * @param {*} headerDisplay
   * @param {*} menuOrientation
   */
  private checkIfHeaderComponentsHaveNavigation(projectConfigObject: { header: { [x: string]: any; }; }, pagesArray: any[], headerDisplay: boolean, menuOrientation: string) {
    if (menuOrientation !== "none" && headerDisplay === true) {
      const headerComponentName = projectConfigObject.header["$component"];
      if (this.utils.isValidInput(headerComponentName)) {
        const errorOrWarningType = this.getText("VALIDATIONS.HEADER_COMPONENT_MISMATCH.HEADER");
        const getPageObject = pagesArray.find((tempObj: { pageName: string; }) =>
          tempObj.pageName.trim().toLowerCase() === headerComponentName.trim().toLowerCase());
        if (getPageObject) {
          if (getPageObject.navigation) {
            // If navigation, then we have to throw error for now
            this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType,
              this.getText("VALIDATIONS.HEADER_COMPONENT_MISMATCH.ERROR_MESSAGE_NAVIGATION"), "");
          } else {
            if (getPageObject.standAloneView === true) {
              this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType,
                this.getText("VALIDATIONS.HEADER_COMPONENT_MISMATCH.ERROR_MESSAGE_STANDALONE_TRUE"), "");
            }
          }
        } else {
          this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.HEADER_COMPONENT_MISMATCH.ERROR_MESSAGE_PAGE_MISSING"), "");
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
  private checkIfFooterComponentsHaveNavigation(projectConfigObject: { footer: { [x: string]: any; }; }, pagesArray: any[], footerDisplay: boolean, menuOrientation: string) {
    if (menuOrientation !== "none" && footerDisplay === true) {
      const footerComponentName = projectConfigObject.footer["$component"];
      if (this.utils.isValidInput(footerComponentName)) {
        const errorOrWarningType = this.getText("VALIDATIONS.FOOTER_COMPONENT_MISMATCH.HEADER");
        const getPageObject = pagesArray.find((tempObj: { pageName: string; }) =>
          tempObj.pageName.trim().toLowerCase() === footerComponentName.trim().toLowerCase());
        if (getPageObject) {
          if (getPageObject.navigation) {
            // If navigation, then we have to throw error for now
            this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.FOOTER_COMPONENT_MISMATCH.ERROR_MESSAGE_NAVIGATION"), "");
          } else {
            if (getPageObject.standAloneView === true) {
              this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.FOOTER_COMPONENT_MISMATCH.ERROR_MESSAGE_STANDALONE_TRUE"), "");
            }
          }
        } else {
          this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.FOOTER_COMPONENT_MISMATCH.ERROR_MESSAGE_PAGE_MISSING"), "");
        }
      }
    }
  }

  /**
   * Pages array is empty
   * @param {*} pagesArray
   */
  private checkIfNoPagesExist(pagesArray: any[]) {
    if (!(pagesArray && pagesArray.length > 0)) {
      const errorOrWarningType = this.getText("VALIDATIONS.EMPTY_PAGES_ARRAY.HEADER");
      this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.EMPTY_PAGES_ARRAY.MESSAGE"), "");
    }
  }

  /**
   * Page and Widget Names collide
   * @param {*} pagesArray
   * @param {*} widgetsArray
   */
  private checkIfPagesAndWidgetNamesDuplicate(pagesArray: any[], widgetsArray: any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.PAGE_AND_WIDGET_DUPLICATES.HEADER");
    for (let i: number = 0; i < pagesArray.length; i++) {
      for (let j = 0; j < widgetsArray.length; j++) {
        if (!(pagesArray[i].hasOwnProperty("pageName"))) {
          this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, this.getText("VALIDATIONS.PAGE_NAME_MISSING.HEADER", pagesArray[i].pageName),
            this.getText("VALIDATIONS.PAGE_NAME_MISSING.MESSAGE",
              pagesArray[i].fullPath, pagesArray[i].fileName), "");
        } else if (!(widgetsArray[j].hasOwnProperty("widgetName"))) {
          this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, this.getText("VALIDATIONS.WIDGET_NAME_MISSING.HEADER", widgetsArray[j].widgetName),
            this.getText("VALIDATIONS.WIDGET_NAME_MISSING.MESSAGE", widgetsArray[j].fullPath, widgetsArray[j].fileName), "");
        } else if (widgetsArray[j].widgetName.trim().toLowerCase() === pagesArray[i].pageName.trim().toLowerCase()) {
          this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType,
            this.getText("VALIDATIONS.PAGE_AND_WIDGET_DUPLICATES.MESSAGE",
              pagesArray[i].pageName, widgetsArray[j].widgetName), "");
        }
      }
    }
  }

  /**
   * Check if default view is valid
   * @param {*} pagesArray
   */
  //response.content.$defaultView
  private checkIfDefaultViewIsValid(defaultView: string, pagesArray: any[]) {
    const errorOrWarningType = this.getText("VALIDATIONS.DEFAULT_VIEW_INVALID.HEADER");
    if (defaultView && this.utils.isValidInput(defaultView)) {
      let defaultViewExists = false;
      for (let i: number = 0; i < pagesArray.length; i++) {
        if (pagesArray[i].pageName.trim().toLowerCase() === defaultView.trim().toLowerCase()) {
          if (pagesArray[i].navigation) {
            defaultViewExists = true;
            break;
          } else {
            // If no navigation, then we have to throw error for now
            this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.DEFAULT_VIEW_INVALID.ERROR_MESSAGE_NO_NAVIGATION", defaultView), "");
            return;
          }
        }
      }
      if (defaultViewExists === false) {
        this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.DEFAULT_VIEW_INVALID.ERROR_MESSAGE", defaultView), "");
      }
    } else {
      this.addError(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.DEFAULT_VIEW_INVALID.WARNING_MESSAGE"), "");
    }
  }

  /**
   * Check if any other folders exist in the app which are not defined in project-config.json
   */
  private async checkIfUnwantedFilesAndFoldersExist(arrayObject: any[], moveFrom: string) {
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
  private checkIfFileExists(objectArray: any[], filePath: string) {
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
      this.addWarning(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.PAGE_AND_WIDGET_DUPLICATES.MESSAGE", newFilePath), "");
    }
  }

  /**
   *
   * @param {*} objectArray
   * @param {*} folderPath
   */
  private checkIfFolderExists(objectArray: any[], folderPath: string) {
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
      this.addWarning(Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES, errorOrWarningType, this.getText("VALIDATIONS.PAGE_AND_WIDGET_DUPLICATES.MESSAGE", newFilePath), "");
    }
  }

  /**
   * Returns errors found
   */
  public getErrors() {
    return this.errorsFound;
  }

  /**
   * Clears the errors array
   */
  private clearErrors() {
    this.errorsFound = [];
  }

  /**
   * Adds error message to the array
   * @param {string} heading
   * @param {string} message
   * @param {string} resolution
   */
  private addError(type: string, heading: string, message: string, resolution: string) {
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
        type: type,
        heading: heading,
        message: message,
        resolution: resolution
      });
    }
  }

  /**
   * Returns warnings found
   */
  public getWarnings() {
    return this.warningsFound;
  }

  /**
   * Clears the warning array
   */
  private clearWarnings() {
    this.warningsFound = [];
  }

  /**
   * Adds warning message to the array
   * @param {string} heading
   * @param {string} message
   * @param {string} resolution
   */
  private addWarning(type: string, heading: string, message: string, resolution: string) {
    this.warningsFound.push({
      type: type,
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
