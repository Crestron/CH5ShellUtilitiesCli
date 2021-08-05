// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5BaseClassForCli } from "../Ch5BaseClassForCli";
import { ICh5Cli } from "../ICh5Cli";

const { MultiSelect } = require('enquirer');
const Enquirer = require('enquirer');
const enquirer = new Enquirer();

export class Ch5DeleteComponentsCli extends Ch5BaseClassForCli implements ICh5Cli {

  private outputResponse: any = {};
  private pagesAndWidgets: any = [];

  /**
   * Constructor
   */
  public constructor() {
    super("delete-components");
  }

  public get getEnquirer() {
    return enquirer;
  }

  public get getMultiSelect() {
    return MultiSelect;
  }

  /**
   * Method for deleting components
   */
  async run() {
    try {
      // Initialize
      await this.initialize();

      // Pre-requisite validations like Check if there are pages to be deleted
      await this.checkPrerequisiteValidations();

      // Verify input params
      await this.verifyInputParams();

      // Ask details to developer based on input parameter validation
      await this.checkPromptQuestions();
      // Update project-config first (so that if this fails, we don't worry about file deletion). Next Delete Files
      await this.processRequest();

    } catch (e) {
      if (e && this.utils.isValidInput(e.message)) {
        this.outputResponse.errorMessage = e.message;
      } else {
        this.outputResponse.errorMessage = this.getText("ERRORS.SOMETHING_WENT_WRONG");
        this.logger.log(e);
      }
    } finally {
      // Clean up
      await this.cleanUp();
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
        components: [],
        deleteConfirmation: false
      },
      validInputsForComponentNames: [],
      invalidInputsForComponentNames: []
    };
    this.pagesAndWidgets = this.projectConfig.getAllPagesAndWidgets();
  }

  /**
   * Check any validations that need to be done before verifying input parameters
   */
  checkPrerequisiteValidations() {
    if (this.pagesAndWidgets.length === 0) {
      throw new Error(this.getText("ERRORS.NO_PAGES_WIDGETS_AVAILABLE_IN_PROJECT"));
    }
  }

  /**
   * Verify input parameters
   */
  verifyInputParams() {
    const listOfInputComponents = this.inputArguments["list"];
    if (listOfInputComponents && listOfInputComponents.length > 0) {
      for (let i: number = 0; i < listOfInputComponents.length; i++) {
        const componentObject = this.pagesAndWidgets.find((tempObj: { name: string; }) => tempObj.name.trim().toLowerCase() === listOfInputComponents[i].trim().toLowerCase());
        if (componentObject) {
          this.outputResponse.validInputsForComponentNames.push(listOfInputComponents[i]);
        } else {
          if (this.utils.isValidInput(listOfInputComponents[i])) {
            // This code is to check if empty input values are provided.
            this.outputResponse.invalidInputsForComponentNames.push(listOfInputComponents[i]);
          }
        }
      }

      if (this.outputResponse.validInputsForComponentNames.length === 0) {
        this.outputResponse.warningMessage = this.getText("ERRORS.INVALID_PARAM_INPUTS");
      } else {
        this.outputResponse.data.components = this.outputResponse.validInputsForComponentNames;
        if (this.outputResponse.invalidInputsForComponentNames.length > 0) {
          for (let i: number = 0; i < this.outputResponse.invalidInputsForComponentNames.length; i++) {
            this.outputResponse.warningMessage += this.outputResponse.invalidInputsForComponentNames[i] + "\n";
          }
        }
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
    if (this.outputResponse.data.components.length === 0) {
      const choicesList = [];
      for (let i: number = 0; i < this.pagesAndWidgets.length; i++) {
        const componentType = (this.pagesAndWidgets[i].type === "page") ? "Page" : "Widget";
        choicesList.push({ value: i, hint: this.getText("HINT_COMPONENT_DETAILS", componentType, this.pagesAndWidgets[i].component.fullPath + this.pagesAndWidgets[i].component.fileName), name: this.pagesAndWidgets[i].name, component: this.pagesAndWidgets[i].component, type: this.pagesAndWidgets[i].type });
      }
      this.logger.log("choicesList", choicesList);

      const componentsQuery = new this.getMultiSelect({
        name: 'value',
        message: this.getText("VALIDATIONS.SELECT_COMPONENT_TO_DELETE"),
        choices: choicesList
      });

      this.outputResponse.data.components = await componentsQuery.run()
        .then((selectedComponents: any) => { return selectedComponents; })
        .catch((error: any) => { return []; });
    }
    this.logger.log("Components selected", this.outputResponse.data.components);

    if (this.outputResponse.data.components.length > 0) {
      this.outputResponse.validInputsForComponentNames = this.outputResponse.data.components;
      if (this.inputArguments["force"] === true) {
        this.outputResponse.data.deleteConfirmation = true;
      } else {
        // Lists of the questions that will be asked to the developer for creating a page
        const questionsArray = [
          {
            type: 'select',
            name: 'deleteConfirmation',
            message: this.getText("VALIDATIONS.ARE_YOU_SURE_TO_DELETE"),
            choices: [
              { message: this.getText("VALIDATIONS.CONFIRMATION_OPTION_YES"), hint: this.getText("VALIDATIONS.CONFIRMATION_OPTION_YES_DESCRIPTION"), value: "Y" },
              { message: this.getText("VALIDATIONS.CONFIRMATION_OPTION_NO"), hint: this.getText("VALIDATIONS.CONFIRMATION_OPTION_NO_DESCRIPTION"), value: "N" }
            ],
            initial: 0
          }
        ];
        this.outputResponse.data.deleteConfirmation = await this.getEnquirer.prompt(questionsArray)
          .then((response: { deleteConfirmation: any; }) => {
            this.logger.log(response);
            return this.utils.convertStringToBoolean(response.deleteConfirmation);
          })
          .catch((err: any) => {
            return false;
          });
      }
    } else {
      throw new Error(this.getText("ERRORS.NO_COMPONENTS_FOR_DELETION"));
    }
  }

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    if (this.outputResponse.data.deleteConfirmation === true) {
      for (let i: number = 0; i < this.outputResponse.data.components.length; i++) {
        const componentObject = this.pagesAndWidgets.find((tempObj: { name: string; }) => tempObj.name.trim().toLowerCase() === this.outputResponse.data.components[i].trim().toLowerCase());
        if (componentObject) {
          this.utils.deleteFolder(componentObject.component.fullPath);
        } else {
          throw new Error(this.getText("ERRORS.SOMETHING_WENT_WRONG"));
        }
      }
      // Change project config
      this.projectConfig.removePagesFromJSON(this.outputResponse.data.components);
      this.projectConfig.removeWidgetsFromJSON(this.outputResponse.data.components);

      this.outputResponse.result = true;
    } else if (this.outputResponse.data.deleteConfirmation === false) {
      throw new Error(this.getText("ERRORS.DO_NOT_DELETE_COMPONENTS"));
    } else {
      throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
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
      this.logger.printError(this.outputResponse.errorMessage);
    } else {
      this.logger.printSuccess(this.getText("SUCCESS_MESSAGE", this.utils.convertArrayToString(this.outputResponse['validInputsForComponentNames'], ", ")) + "\n");
      if (this.outputResponse['invalidInputsForComponentNames'].length > 0) {
        this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_WITH_EXCEPTION", this.utils.convertArrayToString(this.outputResponse['invalidInputsForComponentNames'], ", ")) + "\n");
      }
      this.logger.printSuccess(this.getText("SUCCESS_MESSAGE_CONCLUSION", this.utils.convertArrayToString(this.outputResponse['validInputsForComponentNames'], ", ")) + "\n");
    }
  }

}
