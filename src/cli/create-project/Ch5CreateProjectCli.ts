// Copyright (C) 2023 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForProject } from "../base-classes/Ch5BaseClassForProject";
import { Ch5GeneratePageCli } from "../generate-page/Ch5GeneratePageCli";
import { Ch5GenerateWidgetCli } from "../generate-widget/Ch5GenerateWidgetCli";
import { ICh5CliNew } from "../ICh5Cli";

export class Ch5CreateProjectCli extends Ch5BaseClassForProject implements ICh5CliNew {

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
      // Do Nothing
    } else {
      await this.askQuestionsToUser("create");
    }
    this.logger.end();
  }

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    this.logger.start("processRequest");
    this.logger.log("processRequest - this._outputResponse.data.updatedInputs: ", this.getOutputResponse().data.updatedInputs);
    const workingDirectory = this.getCurrentWorkingDirectory(); // Keeping this value to ensure that changes to folder can give us the initial working directory

    try {
      await this.traverseAndValidateProjectFolderAndVariables();
    } catch (e: any) {
      throw new Error(e.message);
    }

    this.copyShellFolderContentsToProjectFolder();

    this.updateTemplateFiles();

    if (this.isCreateOrUpdateBasedOnConfigJson()) {
      const inputConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.getConfigJsonFilePath()));

      // Step 4: Make changes to project-config.json stepwise
      const templateConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.getShellTemplateProjectConfigPath()));

      // 1. Project Data
      for (const k in inputConfigJSON) {
        if ((typeof inputConfigJSON[k] !== 'object' && inputConfigJSON[k] !== null)) {
          if (templateConfigJSON[k] !== inputConfigJSON[k]) {
            templateConfigJSON[k] = inputConfigJSON[k];
            this.projectConfig.changeNodeValues(k, templateConfigJSON[k]);
          }
        }
      }

      if (this.getOutputResponse().data.projectType.toLowerCase() === "zoomroomcontrol") {
        this.projectConfig.changeNodeValues("forceDeviceXPanel", true);
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

      templateConfigJSON["content"]["$defaultView"] = inputConfigJSON["content"]["$defaultView"];
      this.projectConfig.changeNodeValues("content.$defaultView", templateConfigJSON["content"]["$defaultView"]);

      const pagesToBeCreated: any[] = [];
      for (let i: number = 0; i < inputConfigJSON["content"]["pages"].length; i++) {
        const pageObj = inputConfigJSON["content"]["pages"][i];
        const pageInOldSet = templateConfigJSON["content"]["pages"].find((page: any) => page.pageName.toString().toLowerCase() === pageObj.pageName.toString().toLowerCase());
        if (!pageInOldSet) {
          // Exists in New set but not in old - so create page
          pagesToBeCreated.push(pageObj);
        }
      }

      const widgetsToBeCreated: any[] = [];
      for (let i: number = 0; i < inputConfigJSON["content"]["widgets"].length; i++) {
        const widgetObj = inputConfigJSON["content"]["widgets"][i];
        const pageInOldSet = templateConfigJSON["content"]["widgets"].find((widget: any) => widget.widgetName.toString().toLowerCase() === widgetObj.widgetName.toString().toLowerCase());
        if (!pageInOldSet) {
          // Exists in New set but not in old - so create page
          widgetsToBeCreated.push(widgetObj);
        }
      }

      this.setValueInPackageJson("name", templateConfigJSON.projectName);
      
      // Step 5: Save Project-config
      for (let i: number = 0; i < pagesToBeCreated.length; i++) {
        const genPage: Ch5GeneratePageCli = new Ch5GeneratePageCli(false);
        const newPageName = pagesToBeCreated[i].fileName.toLowerCase().split(".")[0]; // pagesToBeCreated[i].pageName - picking file name to accommodate hyphens
        genPage.setInputArgsForTesting(["-n", newPageName, "-m", pagesToBeCreated[i].navigation ? "Y" : "N"]);
        await genPage.run();
        this.projectConfig.replacePageNodeInJSON(pagesToBeCreated[i]);
      }

      for (let i: number = 0; i < widgetsToBeCreated.length; i++) {
        const genWidget: Ch5GenerateWidgetCli = new Ch5GenerateWidgetCli(false);
        const newWidgetName = widgetsToBeCreated[i].fileName.toLowerCase().split(".")[0]; // widgetsToBeCreated[i].widgetName - picking file name to accommodate hyphens
        genWidget.setInputArgsForTesting(["-n", newWidgetName]);
        await genWidget.run();
        this.projectConfig.removeWidgetFromJSON(widgetsToBeCreated[i]);
      }

    } else {

      // Step 4: Make changes to project-config.json stepwise
      const templateConfigJSON: any = JSON.parse(this.utils.readFileContentSync(this.getShellTemplateProjectConfigPath()));

      if (this.getOutputResponse().data.projectType.toLowerCase() === "zoomroomcontrol") {
        this.projectConfig.changeNodeValues("forceDeviceXPanel", true);
      } else {
        const forceDeviceXPanelObject = this.getOutputResponse().data.updatedInputs.find((objValue: any) => objValue.key === "forceDeviceXPanel");
        templateConfigJSON["forceDeviceXPanel"] = forceDeviceXPanelObject.argsValue;
        this.projectConfig.changeNodeValues("forceDeviceXPanel", templateConfigJSON["forceDeviceXPanel"]);
      }

      this.projectConfig.changeNodeValues("projectName", this.getOutputResponse().data.projectName);
      this.projectConfig.changeNodeValues("projectType", this.getOutputResponse().data.projectType);

      this.setValueInPackageJson("name", this.getOutputResponse().data.projectName);
      
      const defaultPageName = "page1";
      const defaultPageMenuValue = "Y";
      const genPage: Ch5GeneratePageCli = new Ch5GeneratePageCli(false);
      genPage.setInputArgsForTesting(["-n", defaultPageName, "-m", defaultPageMenuValue]);
      await genPage.run();
      templateConfigJSON["content"]["$defaultView"] = defaultPageName;
      this.projectConfig.changeNodeValues("content.$defaultView", templateConfigJSON["content"]["$defaultView"]);
    }

    // Step 6: Run validate:project-config
    if (!(await this.isConfigFileValid(this.getCreatedOrUpdateProjectPathProjectConfigJsonFile(), this.getCreatedOrUpdateProjectPathProjectConfigJsonSchemaFile()))) {
      throw new Error(this.getText("PROCESS_REQUEST.PROJECT_CONFIG_VALIDATION_FAILED"));
    }

    // Step 7: Show proper messages  
    this.getOutputResponse().result = true;
    this.getOutputResponse().successMessage = this.getText("LOG_OUTPUT.SUCCESS_MESSAGE", this.getOutputResponse().data.projectName, workingDirectory);

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
