// Copyright (C) 2023 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForProject } from "../base-classes/Ch5BaseClassForProject";
import { Ch5DeleteComponentsCli } from "../delete-components/Ch5DeleteComponentsCli";
import { Ch5GeneratePageCli } from "../generate-page/Ch5GeneratePageCli";
import { Ch5GenerateWidgetCli } from "../generate-widget/Ch5GenerateWidgetCli";
import { ICh5CliNew } from "../ICh5Cli";

export class Ch5UpdateProjectCli extends Ch5BaseClassForProject implements ICh5CliNew {

  /**
   * Constructor
   */
  public constructor(public showOutputMessages: boolean = true) {
    super(); // This processes the input arguments in the parent class.
  }

  /**
   * Verify input parameters
   */
  async verifyInputParams() {
    this.logger.start("verifyInputParams");
    this.logger.log("verifyInputParams - this.inputArgs: ", this.inputArgs);

    // Step 0: Check if json in the project to be updated is valid or not
    if (!(await this.isConfigFileValid(this.getCreatedOrUpdateProjectPathProjectConfigJsonFile(), this.getCreatedOrUpdateProjectPathProjectConfigJsonSchemaFile()))) {
      throw new Error(this.getText("VERIFY_INPUT_PARAMS.INVALID_PROJECT_CONFIG_JSON"));
    }

    if (this.isCreateOrUpdateBasedOnConfigJson()) {
      // Step 1: Check file extension for json, valid input for 'config' argument, and config file existence
      if (!(this.utils.isValidInput(this.getConfigJsonFilePath()) && this.isConfigFileExist(this.getConfigJsonFilePath()))) {
        throw new Error(this.getText("VERIFY_INPUT_PARAMS.INVALID_CONFIG_INPUT"));
      }
      // Step 2: Check if json is as per its schema (.vscode is hidden folder)
      if (!(await this.isConfigFileValid(this.getConfigJsonFilePath(), this.getConfigFileSchemaPath(), true))) {
        throw new Error(this.getText("VERIFY_INPUT_PARAMS.INVALID_CONFIG_FILE"));
      }
    } else {
      this.logger.log("Project that does not use config json file");

      this.validateAndSetReceivedInputValues();

      // To Check if atleast 1 input is provided
      const updatedDataResponses = this.getOutputResponse().data.updatedInputs.filter((data: any) => data.inputReceived === true);
      if (updatedDataResponses.length === 0) {
        throw new Error(this.getText("VERIFY_INPUT_PARAMS.MISSING_INPUTS_NEED_ATlEAST_ONE_DATA"));
      }

      this.printWarningsOnVerifiedInputs();
    }
    this.logger.end();
  }

  /**
   * Check if there are questions to be prompted to the integrator
   */
  async checkPromptQuestions() {
    this.logger.start("checkPromptQuestions");
    if (this.isCreateOrUpdateBasedOnConfigJson()) {
      // Identify changes
      // const newCheck = new CompareJSON();
      // this.logger.log(newCheck.map(oldProjectConfigJSON, newProjectConfigJSON));
      this.getOutputResponse().askConfirmation = this.utils.toBoolean(await this.getConfirmation());
    } else {
      await this.askQuestionsToUser("update");

      this.getOutputResponse().askConfirmation = true;
    }
    this.logger.end();
  }

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    this.logger.start("processRequest");
    this.logger.log("processRequest - this._outputResponse.data.updatedInputs: ", this.getOutputResponse().data.updatedInputs);
    this.logger.log("this._outputResponse.askConfirmation", this.getOutputResponse().askConfirmation);
    if (this.getOutputResponse().askConfirmation === false) {
      throw new Error(this.getText("ERRORS.DO_NOT_MODIFY_PROJECT"));
    }

    this.setProjectVariables();
    this.updateFilesAsPerProjectType();

    if (this.isCreateOrUpdateBasedOnConfigJson()) {
      await this.createBackupForExistingProject();

      const inputConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.getConfigJsonFilePath()));

      // Step 4: Make changes to project-config.json stepwise
      const templateConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.getCreatedOrUpdateProjectPathProjectConfigJsonFile()));

      // 1. Project Data
      for (const k in inputConfigJSON) {
        if ((typeof inputConfigJSON[k] !== 'object' && inputConfigJSON[k] !== null)) {
          if (templateConfigJSON[k] !== inputConfigJSON[k]) {
            templateConfigJSON[k] = inputConfigJSON[k];
            this.projectConfig.changeNodeValues(k, templateConfigJSON[k]);
          }
        }
      }

      // 2. Themes
      templateConfigJSON["themes"] = inputConfigJSON["themes"];
      this.projectConfig.changeNodeValues("themes", templateConfigJSON["themes"]);

      // 3. Config
      templateConfigJSON["config"] = inputConfigJSON["config"];
      this.projectConfig.changeNodeValues("config", templateConfigJSON["config"]);

      // 4. Header
      templateConfigJSON["header"] = inputConfigJSON["header"];
      this.projectConfig.changeNodeValues("header", templateConfigJSON["header"]);

      // 5. Footer
      templateConfigJSON["footer"] = inputConfigJSON["footer"];
      this.projectConfig.changeNodeValues("footer", templateConfigJSON["footer"]);

      // 6. Content
      templateConfigJSON["content"]["triggerViewProperties"] = inputConfigJSON["content"]["triggerViewProperties"];
      this.projectConfig.changeNodeValues("content.triggerViewProperties", templateConfigJSON["content"]["triggerViewProperties"]);

      // 7. Custom Signal
      templateConfigJSON["customSignals"] = inputConfigJSON["customSignals"];
      this.projectConfig.changeNodeValues("customSignals", templateConfigJSON["customSignals"]);

      templateConfigJSON["content"]["$defaultView"] = inputConfigJSON["content"]["$defaultView"];
      this.projectConfig.changeNodeValues("content.$defaultView", templateConfigJSON["content"]["$defaultView"]);

      const pagesToBeCreated: any[] = [];
      const pagesToBeUpdated: any[] = [];
      const pagesToBeDeleted: any[] = [];
      for (let i: number = 0; i < templateConfigJSON["content"]["pages"].length; i++) {
        let pageObj = templateConfigJSON["content"]["pages"][i];
        const pageInNewSet = inputConfigJSON["content"]["pages"].find((page: any) => page.pageName.toString().toLowerCase() === pageObj.pageName.toString().toLowerCase());
        if (pageInNewSet) {
          pagesToBeUpdated.push(pageInNewSet);
        } else {
          // Exists in Old set but not in new - so create page
          pagesToBeDeleted.push(pageObj);
        }
      }
      for (let i: number = 0; i < inputConfigJSON["content"]["pages"].length; i++) {
        const pageObj = inputConfigJSON["content"]["pages"][i];
        const pageInOldSet = templateConfigJSON["content"]["pages"].find((page: any) => page.pageName.toString().toLowerCase() === pageObj.pageName.toString().toLowerCase());
        if (!pageInOldSet) {
          // Exists in New set but not in old - so create page
          pagesToBeCreated.push(pageObj);
        }
      }

      const widgetsToBeCreated: any[] = [];
      const widgetsToBeDeleted: any[] = [];
      const widgetsToBeUpdated: any[] = [];

      for (let i: number = 0; i < templateConfigJSON["content"]["widgets"].length; i++) {
        const widgetObj = templateConfigJSON["content"]["widgets"][i];
        const pageInNewSet = inputConfigJSON["content"]["widgets"].find((widget: any) => widget.widgetName.toString().toLowerCase() === widgetObj.widgetName.toString().toLowerCase());
        if (pageInNewSet) {
          widgetsToBeUpdated.push(pageInNewSet);
        } else {
          // Exists in Old set but not in new - so create page
          widgetsToBeDeleted.push(widgetObj);
        }
      }

      for (let i: number = 0; i < inputConfigJSON["content"]["widgets"].length; i++) {
        const widgetObj = inputConfigJSON["content"]["widgets"][i];
        const pageInOldSet = templateConfigJSON["content"]["widgets"].find((widget: any) => widget.widgetName.toString().toLowerCase() === widgetObj.widgetName.toString().toLowerCase());
        if (!pageInOldSet) {
          // Exists in New set but not in old - so create page
          widgetsToBeCreated.push(widgetObj);
        }
      }

      this.setValueInPackageJson("name", templateConfigJSON.projectName);

      for (let i: number = 0; i < pagesToBeDeleted.length; i++) {
        const delPage: Ch5DeleteComponentsCli = new Ch5DeleteComponentsCli(false);
        delPage.setInputArgsForTesting(["--list", pagesToBeDeleted[i].pageName, "--force"]);
        await delPage.run();
      }

      // Step 5: Save Project-config
      for (let i: number = 0; i < pagesToBeCreated.length; i++) {
        const genPage: Ch5GeneratePageCli = new Ch5GeneratePageCli(false);
        const newPageName = pagesToBeCreated[i].fileName.toLowerCase().split(".")[0]; // pagesToBeCreated[i].pageName - picking file name to accommodate hyphens
        genPage.setInputArgsForTesting(["-n", newPageName, "-m", pagesToBeCreated[i].navigation ? "Y" : "N"]);
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
        const newWidgetName = widgetsToBeCreated[i].fileName.toLowerCase().split(".")[0]; // widgetsToBeCreated[i].widgetName - picking file name to accommodate hyphens
        genWidget.setInputArgsForTesting(["-n", newWidgetName]);
        await genWidget.run();
        this.projectConfig.removeWidgetFromJSON(widgetsToBeCreated[i]);
      }

      for (let i: number = 0; i < widgetsToBeUpdated.length; i++) {
        // Update in project-config
        this.projectConfig.replaceWidgetNodeInJSON(widgetsToBeUpdated[i]);
      }
    } else {
      // Change project config
      const outputResponse = this.getOutputResponse();
      for (let i: number = 0; i < outputResponse.data.updatedInputs.length; i++) {
        if (outputResponse.data.updatedInputs[i].inputReceived === true) {
          this.logger.log("Changed Values", outputResponse.data.updatedInputs[i].key, outputResponse.data.updatedInputs[i].argsValue)
          this.projectConfig.changeNodeValues(outputResponse.data.updatedInputs[i].key, outputResponse.data.updatedInputs[i].argsValue);

          if (outputResponse.data.updatedInputs[i].key === "projectName") {
            this.setValueInPackageJson("name", outputResponse.data.updatedInputs[i].argsValue);
          }
        }
      }

      if (this.projectConfig.getNodeByKey("projectType")?.toLowerCase() === "zoomroomcontrol") {
        const getProjectThemes = this.projectConfig.getNodeByKey("themes");
        const isZoomLightThemeAvailable = getProjectThemes.filter((theme: any) => theme.name === "zoom-light-theme");
        if (isZoomLightThemeAvailable.length === 0) {
          const zoomLightTheme = {
            "name": "zoom-light-theme",
            "extends": "zoom-light-theme",
            "brandLogo": {
              "url": "./app/template/assets/img/ch5-logo-light.svg",
              "alt": "Crestron Logo",
              "receiveStateUrl": ""
            },
            "backgroundProperties": {
              "backgroundColor": [
                "#ffffff"
              ]
            }
          };
          getProjectThemes.push(zoomLightTheme);
          this.projectConfig.changeNodeValues("themes", getProjectThemes);
        }
        const isZoomDarkThemeAvailable = getProjectThemes.filter((theme: any) => theme.name === "zoom-dark-theme");
        if (isZoomDarkThemeAvailable.length === 0) {
          const zoomDarkTheme = {
            "name": "zoom-dark-theme",
            "extends": "zoom-dark-theme",
            "brandLogo": {
              "url": "./app/template/assets/img/ch5-logo-dark.svg",
              "alt": "Crestron Logo",
              "receiveStateUrl": ""
            },
            "backgroundProperties": {
              "backgroundColor": [
                "#242424"
              ]
            }
          };
          getProjectThemes.push(zoomDarkTheme);
          this.projectConfig.changeNodeValues("themes", getProjectThemes);
        }

        let isSelectedThemeUpdated = false;
        for (let i: number = 0; i < outputResponse.data.updatedInputs.length; i++) {
          if (outputResponse.data.updatedInputs[i].inputReceived === true && outputResponse.data.updatedInputs[i].key === "selectedTheme") {
            isSelectedThemeUpdated = true;
          }
        }
        if (isSelectedThemeUpdated === false) {
          if (this.projectConfig.getNodeByKey("selectedTheme") !== "zoom-light-theme" && this.projectConfig.getNodeByKey("selectedTheme") !== "zoom-dark-theme") {
            this.projectConfig.changeNodeValues("selectedTheme", "zoom-light-theme");
          }
        }
      } else {
        let getProjectThemes = this.projectConfig.getNodeByKey("themes");
        const isZoomLightThemeAvailable = getProjectThemes.filter((theme: any) => theme.name === "zoom-light-theme");
        if (isZoomLightThemeAvailable.length > 0) {
          getProjectThemes = getProjectThemes.filter((theme: any) => theme.name !== "zoom-light-theme");
        }
        const isZoomDarkThemeAvailable = getProjectThemes.filter((theme: any) => theme.name === "zoom-dark-theme");
        if (isZoomDarkThemeAvailable.length > 0) {
          getProjectThemes = getProjectThemes.filter((theme: any) => theme.name !== "zoom-dark-theme");
        }
        this.projectConfig.changeNodeValues("themes", JSON.parse(JSON.stringify(getProjectThemes)));

        let isSelectedThemeUpdated = false;
        for (let i: number = 0; i < outputResponse.data.updatedInputs.length; i++) {
          if (outputResponse.data.updatedInputs[i].inputReceived === true && outputResponse.data.updatedInputs[i].key === "selectedTheme") {
            isSelectedThemeUpdated = true;
          }
        }
        if (isSelectedThemeUpdated === false) {
          if (this.projectConfig.getNodeByKey("selectedTheme") === "zoom-light-theme" || this.projectConfig.getNodeByKey("selectedTheme") === "zoom-dark-theme") {
            this.projectConfig.changeNodeValues("selectedTheme", "light-theme");
          }
        }
      }
    }

    if (this.projectConfig.getNodeByKey("projectType")?.toLowerCase() === "zoomroomcontrol") {
      this.projectConfig.changeNodeValues("forceDeviceXPanel", true);
    }

    // Step 6: Run validate:project-config
    if (!(await this.isConfigFileValid(this.getCreatedOrUpdateProjectPathProjectConfigJsonFile(), this.getCreatedOrUpdateProjectPathProjectConfigJsonSchemaFile()))) {
      throw new Error(this.getText("PROCESS_REQUEST.PROJECT_CONFIG_VALIDATION_FAILED"));
    }

    // Step 7: Show proper messages  
    this.getOutputResponse().result = true;
    if (this.isCreateOrUpdateBasedOnConfigJson()) {
      this.getOutputResponse().successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE_WITH_BACKUP", this.getOutputResponse().data.backupFolder);
    } else {
      this.getOutputResponse().successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE");
    }
    this.logger.end();
  }

  /**
   * Do not move this method to base class
   * @returns 
   */
  public getCLIExecutionPath(): any {
    // This method needs to be available here in order to get the current working directory
    return __dirname;
  }

}
