// Copyright (C) 2020 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.
const process = require("process"); // global object - always available
const rimraf = require("rimraf");

process.env["NODE_CONFIG_DIR"] = "./shell-utilities/config/";
const config = require("config");

const { MultiSelect } = require('enquirer');
const Enquirer = require('enquirer');
const enquirer = new Enquirer();

const utils = require("../helpers/utils");
const logger = require("../helpers/logger");
const projectConfig = require("../project-config/project-config");
const componentHelper = require("../helpers/components");

const deleteComponents = {

  CONFIG_FILE: config.deleteComponents,
  outputResponse: {},
  processArgs: [],
  pagesAndWidgets: [],

  /**
   * Public Method 
   */
  run() {
    this.processArgs = componentHelper.processArgs();
    if (this.processArgs["help"] === true) {
      componentHelper.displayHelp(this.CONFIG_FILE.templatesPath + "help.template");
    } else {
      this.deleteComponents();
    }
  },

  /**
   * 
   * @param {*} processArgs 
   */
  initialize() {
    this.outputResponse = {
      result: false,
      errorMessage: "",
      warningMessage: "",
      data: {
        components: [],
        deleteConfirmation: "N"
      },
      validInputsForComponentNames: [],
      invalidInputsForComponentNames: []
    };
    if (this.processArgs.length === 0) {
      this.processArgs = componentHelper.processArgs();
    }
    this.pagesAndWidgets = projectConfig.getAllPagesAndWidgets();
  },

  /**
   * Method for deleting components
   * @param {*} processArgs 
   */
  async deleteComponents() {
    try {
      // Initialize
      this.initialize();

      // Pre-requisite validations like Check if there are pages to be deleted
      this.checkPrerequisiteValidations();

      // Verify input params
      await this.verifyInputParams();

      // Ask details to developer based on input parameter validation
      await this.checkPromptQuestions();

      // Update project-config first (so that if this fails, we don't worry about file deletion). Next Delete Files
      await this.processRequest();

      // Clean up
      this.cleanUp();

    } catch (e) {
      if (e && utils.isValidInput(e.message)) {
        this.outputResponse.errorMessage = e.message;
      } else {
        this.outputResponse.errorMessage = this.getText("ERRORS.SOMETHING_WENT_WRONG");
        logger.log(e);
      }
    }

    // Show output response
    this.logOutput();

    return this.outputResponse.result; // The return is required to validate in automation test case
  },

  /**
   * Check any validations that need to be done before verifying input parameters
   */
  checkPrerequisiteValidations() {
    if (this.pagesAndWidgets.length === 0) {
      throw new Error(this.getText("ERRORS.NO_PAGES_WIDGETS_AVAILABLE_IN_PROJECT"));
    }
  },

  /**
   * Verify input parameters
   * @param {*} processArgs 
   */
  verifyInputParams() {
    const listOfInputComponents = this.processArgs["list"];
    if (listOfInputComponents && listOfInputComponents.length > 0) {
      for (let i = 0; i < listOfInputComponents.length; i++) {
        const componentObject = this.pagesAndWidgets.find(tempObj => tempObj.name.trim().toLowerCase() === listOfInputComponents[i].trim().toLowerCase());
        if (componentObject) {
          this.outputResponse.validInputsForComponentNames.push(listOfInputComponents[i]);
        } else {
          if (utils.isValidInput(listOfInputComponents[i])) {
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
          for (let i = 0; i < this.outputResponse.invalidInputsForComponentNames.length; i++) {
            this.outputResponse.warningMessage += this.outputResponse.invalidInputsForComponentNames[i] + "\n";
          }
        }
      }
    }

    if (utils.isValidInput(this.outputResponse.warningMessage)) {
      logger.printWarning(this.getText("ERRORS.MESSAGE_TITLE", this.outputResponse.warningMessage));
    }
  },

  /**
   * Check if there are questions to be prompted to the developer
   */
  async checkPromptQuestions() {
    if (this.outputResponse.data.components.length === 0) {
      const choicesList = [];
      for (let i = 0; i < this.pagesAndWidgets.length; i++) {
        const componentType = (this.pagesAndWidgets[i].type === "page") ? "Page" : "Widget";
        //TODO
        choicesList.push({ value: i, hint: this.getText("HINT_COMPONENT_DETAILS", componentType, this.pagesAndWidgets[i].component.fullPath + this.pagesAndWidgets[i].component.fileName), name: this.pagesAndWidgets[i].name, component: this.pagesAndWidgets[i].component, type: this.pagesAndWidgets[i].type });
      }
      logger.log("choicesList", choicesList);

      const componentsQuery = new MultiSelect({
        name: 'value',
        message: this.getText("VALIDATIONS.SELECT_COMPONENT_TO_DELETE"),
        choices: choicesList
      });

      this.outputResponse.data.components = await componentsQuery.run()
        .then(selectedComponents => { return selectedComponents; })
        .catch(error => { return []; });
    }
    logger.log("Components selected", this.outputResponse.data.components);

    if (this.outputResponse.data.components.length > 0) {
      this.outputResponse.validInputsForComponentNames = this.outputResponse.data.components;
      if (this.processArgs["force"] === true) {
        this.outputResponse.data.deleteConfirmation = "Y";
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
        this.outputResponse.data.deleteConfirmation = await enquirer.prompt(questionsArray)
          .then((response) => {
            logger.log(response);
            return response.deleteConfirmation;
          })
          .catch(err => {
            return "N";
          });
      }
    } else {
      throw new Error(this.getText("ERRORS.NO_COMPONENTS_FOR_DELETION"));
    }
  },

  /**
   * Implement this component's main purpose
   */
  async processRequest() {
    if (this.outputResponse.data.deleteConfirmation === "Y") {
      for (let i = 0; i < this.outputResponse.data.components.length; i++) {
        const componentObject = this.pagesAndWidgets.find((tempObj) => tempObj.name.trim().toLowerCase() === this.outputResponse.data.components[i].trim().toLowerCase());
        if (componentObject) {
          rimraf.sync(componentObject.component.fullPath);
        } else {
          //TODO - ERROR - MIGHT NOT HAPPEN
        }
      }
      // Change project config
      projectConfig.removePagesFromJSON(this.outputResponse.data.components);
      projectConfig.removeWidgetsFromJSON(this.outputResponse.data.components);

      this.outputResponse.result = true;
    } else if (this.outputResponse.data.deleteConfirmation === "N") {
      throw new Error(this.getText("ERRORS.DO_NOT_DELETE_COMPONENTS"));
    } else {
      throw new Error(this.getText("ERRORS.PROGRAM_STOPPED_OR_UNKNOWN_ERROR"));
    }
  },

  /**
   * Clean up
   */
  cleanUp() {
    // Nothing to cleanup for this process
  },

  /**
   * Log Final Response Message
   * @param {*} errorMessage 
   */
  logOutput() {
    if (this.outputResponse.result === false) {
      logger.printError(this.outputResponse.errorMessage);
    } else {
      logger.printSuccess(this.getText("SUCCESS_MESSAGE", utils.convertArrayToString(this.outputResponse['validInputsForComponentNames'], ", ")) + "\n");
      if (this.outputResponse['invalidInputsForComponentNames'].length > 0) {
        logger.printSuccess(this.getText("SUCCESS_MESSAGE_WITH_EXCEPTION", utils.convertArrayToString(this.outputResponse['invalidInputsForComponentNames'], ", ")) + "\n");
      }
      logger.printSuccess(this.getText("SUCCESS_MESSAGE_CONCLUSION", utils.convertArrayToString(this.outputResponse['validInputsForComponentNames'], ", ")) + "\n");
    }
  },

  /**
   * Get the String output from default.json file in config
   * @param {*} key 
   * @param  {...any} values 
   */
  getText(key, ...values) {
    const DYNAMIC_TEXT_MESSAGES = this.CONFIG_FILE.textMessages;
    return utils.getText(DYNAMIC_TEXT_MESSAGES, key, ...values);
  }

};

module.exports = deleteComponents;
