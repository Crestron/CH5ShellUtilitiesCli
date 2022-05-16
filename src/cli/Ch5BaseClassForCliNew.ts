// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import * as commander from "commander";

import { Ch5CliUtil } from "./Ch5CliUtil";
import { Ch5CliLogger } from "./Ch5CliLogger";
import { Ch5CliNamingHelper } from "./Ch5CliNamingHelper";
import { Ch5CliProjectConfig } from "./Ch5CliProjectConfig";
import { Ch5ValidateProjectConfigCli } from "./validate-project-config/Ch5ValidateProjectConfigJsonCli";
import { Ch5CliConfigFileReader } from "./Ch5CliConfigFileReader";
import { ICh5CliConfigFile } from "./ICh5CliConfigFile";
import { Ch5CliError } from "./Ch5CliError";

const { Select, Confirm, prompt } = require('enquirer');
const Enquirer = require('enquirer');
const enquirer = new Enquirer();
const path = require('path');
const fs = require("fs");
const jsonSchema = require('jsonschema');
const child_process = require('child_process');

export abstract class Ch5BaseClassForCliNew {
  private readonly _cliUtil: Ch5CliUtil;
  private readonly _cliLogger: Ch5CliLogger;
  private readonly _cliConfigFileReader: Ch5CliConfigFileReader;
  private readonly _cliNamingHelper: Ch5CliNamingHelper;
  private readonly _cliProjectConfig: Ch5CliProjectConfig;

  private _folderPath: string = "";
  private CONFIG_FILE: ICh5CliConfigFile;
  private TRANSLATION_FILE: any;
  private _inputArgs: any = {};

  protected outputResponse: any = {
    askConfirmation: false,
    result: false,
    errorMessage: "",
    warningMessage: "",
    successMessage: "",
    data: {}
  };

  public get getEnquirer() {
    return enquirer;
  }

  public get getPrompt() {
    return prompt;
  }
  public get getSelect() {
    return Select;
  }

  public get getConfirm() {
    return Confirm;
  }

  protected get inputArgs(): any {
    return this._inputArgs;
  }

  protected get utils() {
    return this._cliUtil;
  }

  protected get logger() {
    return this._cliLogger;
  }

  protected get configFileReader() {
    return this._cliConfigFileReader;
  }

  protected get configFile() {
    return this._cliConfigFileReader.configFile;
  }

  protected get configFileArgs() {
    return this._cliConfigFileReader;
  }

  protected get namingHelper() {
    return this._cliNamingHelper;
  }

  protected get projectConfig() {
    return this._cliProjectConfig;
  }

  public constructor(folderPath: string) {
    this._folderPath = folderPath;
    this._cliUtil = new Ch5CliUtil();
    this._cliNamingHelper = new Ch5CliNamingHelper();
    this._cliProjectConfig = new Ch5CliProjectConfig();
    this._cliConfigFileReader = new Ch5CliConfigFileReader(path.join(__dirname, this._folderPath, "files", "config.json"), JSON.parse(this._cliUtil.readFileContentSync(path.join(__dirname, "files", "environment.json"))));
    this.CONFIG_FILE = this._cliConfigFileReader.configFile;
    this.processArgs();
    this._cliLogger = new Ch5CliLogger(this._inputArgs["verbose"].argsValue);
    this.TRANSLATION_FILE = this.mergeJSON(JSON.parse(this._cliUtil.readFileContentSync(path.join(__dirname, this._folderPath, "i18n", "en.json"))), JSON.parse(this._cliUtil.readFileContentSync(path.join(__dirname, "files", "en.json"))));
  }

  protected initBase() {
    this.outputResponse = {
      askConfirmation: false,
      result: false,
      errorMessage: "",
      warningMessage: "",
      successMessage: "",
      data: {}
    };
  }

  processArgs() {
    const args = process.argv.slice(2);
    return this.processArgsAnalyze(args);
  }

  processArgsAnalyze(args: any): any {
    const completeInputParams = this._cliConfigFileReader.configParamOptions();
    const output: any = {};
    let arrayKey: any = null;
    let arrayParam: any = null;
    let continueProcess = false;
    args.forEach((val: any, index: any, array: any) => {
      if (String(val).indexOf('--') === 0 || String(val).indexOf('-') === 0) {
        const paramObj = completeInputParams.find((tempObj) => tempObj.alias.map((v: string) => v.toLowerCase()).includes(val.trim().toLowerCase()));
        if (paramObj) {
          const outputVal: any = JSON.parse(JSON.stringify(paramObj));
          arrayKey = paramObj.key;
          arrayParam = paramObj.type;
          if (arrayParam === "enum") {
            outputVal["argsValue"] = paramObj.valueIfNotFound;
            outputVal["inputReceived"] = true;
            output[arrayKey] = outputVal;
          } else if (arrayParam === "boolean" || arrayParam === "string" || arrayParam === "number") {
            if (outputVal["isSpecialArgument"] === true) {
              outputVal["argsValue"] = paramObj.default;
            } else {
              outputVal["argsValue"] = paramObj.valueIfNotFound;
            }
            outputVal["inputReceived"] = true;
            output[arrayKey] = outputVal;
          }
          continueProcess = true;
        } else {
          // Currently we don't do anything here. Some thoughts could be to push the data as a value similar to the
          // else statement below. Or we could nullify arrayKey and arrayParam.
        }
      } else {
        if (arrayKey != null) {
          if (arrayParam === "enum") {
            if (!output[arrayKey]["argsValue"]) {
              output[arrayKey]["argsValue"] = [];
            }
            output[arrayKey]["argsValue"].push(val);
          } else if (arrayParam === "boolean" || arrayParam === "string" || arrayParam === "number") {
            if (continueProcess === true) {
              output[arrayKey]["argsValue"] = val;
              continueProcess = false;
            }
          }
        }
      }
    });

    for (let i: number = 0; i < completeInputParams.length; i++) {
      if (!output[completeInputParams[i]["key"]]) {
        output[completeInputParams[i]["key"]] = completeInputParams[i];
        output[completeInputParams[i]["key"]]["inputReceived"] = false;
        output[completeInputParams[i]["key"]]["argsValue"] = completeInputParams[i]["valueIfNotFound"];
      }
    }
    this._inputArgs = JSON.parse(JSON.stringify(output));
    return output;
  }

  public mergeJSON(...args: any) {
    let target = {};
    // Merge the object into the target object

    //Loop through each object and conduct a merge
    for (let i = 0; i < args.length; i++) {
      target = this.merger(target, args[i]);
    }
    return target;
  }

  private merger(target: any, obj: any) {
    for (let prop in obj) {
      // eslint-disable-next-line no-prototype-builtins
      if (obj.hasOwnProperty(prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          // If we're doing a deep merge and the property is an object
          target[prop] = this.mergeJSON(target[prop], obj[prop]);
          // target = merger(target, obj[prop]);
        } else {
          // Otherwise, do a regular merge
          target[prop] = obj[prop];
        }
      }
    }
    return target;
  }

  protected validateCLIInputArgument(inputObj: any, key: string, value: string, errorMessage: string) {
    this.logger.log(key + ": ", value);
    value = String(value).trim().toLowerCase();
    if (inputObj) {
      if (inputObj.allowedAliases && inputObj.allowedAliases.length > 0 && inputObj.allowedAliases.includes(value)) {
        if (inputObj.type === "boolean") {
          if (value) {
            const val: boolean = this.utils.toBoolean(value);
            return {
              value: val,
              warning: ""
            };
          } else {
            return {
              value: value,
              warning: ""
            };
          }
        } else if (inputObj.type === "enum") {
          return {
            value: value,
            warning: ""
          };
        }
      } else {
        if (inputObj.type === "string") {
          if (inputObj.validation !== "") {
            if (inputObj.validation === "validatePackageJsonProjectName") {
              const valOutput: any = this.validatePackageJsonProjectName(value);
              if (valOutput.isValid === false) {
                return {
                  value: null,
                  warning: valOutput.error
                };
              } else {
                return {
                  value: value,
                  warning: ""
                };
              }
            }
            return {
              value: value,
              warning: ""
            };
          } else {
            return {
              value: value,
              warning: ""
            };
          }
        }
      }
      return {
        value: value,
        error: ""
      };
    }
    return {
      value: "",
      error: errorMessage
    };
  }

  /**
   *
   * @param program
   */
  public async setupCommand(program: commander.Command) {
    if (this.CONFIG_FILE.allowedEnvironments.indexOf(String(this.CONFIG_FILE.settings.environment)) >= 0) {
      let programObject = program
        .command(this.CONFIG_FILE.command)
        .name(this.CONFIG_FILE.name)
        .usage(this.CONFIG_FILE.usage)
        .description(this.CONFIG_FILE.description);

      for (let i: number = 0; i < this.CONFIG_FILE.options.length; i++) {
        programObject = programObject.option(this.convertArrayToCommaSeparatedString(this.CONFIG_FILE.options[i].alias), this.CONFIG_FILE.options[i].description);
      }
      programObject = programObject.option("--verbose", "Get detailed output of the process. This is helpful incase any errors are found.");

      if (this.CONFIG_FILE.aliases && this.CONFIG_FILE.aliases.length > 0) {
        programObject = programObject.aliases(this.CONFIG_FILE.aliases);
      }

      if (this.CONFIG_FILE.additionalHelp === true) {
        const contentForHelp: string = await this.utils.readFileContent(path.join(__dirname, this._folderPath, "files", "help.txt"));
        programObject = programObject.addHelpText('after', contentForHelp);
      }

      programObject.allowUnknownOption().action(async (options) => {
        try {
          await this.run();
        } catch (e: any) {
          this.utils.writeError(e);
        }
      });
      return programObject;
    }
  }

  private compareVersions(cliVersionInput: string, userVersionInput: string) {
    const cliVersion = cliVersionInput.split(".");
    const userVersion = userVersionInput.split(".");

    if (Number(userVersion[0]) > Number(cliVersion[0])) {
      return { version: "MAJOR", isShellCliVersionGreater: false };
    } else if (Number(userVersion[0]) < Number(cliVersion[0])) {
      return { version: "MAJOR", isShellCliVersionGreater: true };
    } else {
      if (Number(userVersion[1]) > Number(cliVersion[1])) {
        return { version: "MINOR", isShellCliVersionGreater: false };
      } else if (Number(userVersion[1]) < Number(cliVersion[1])) {
        return { version: "MINOR", isShellCliVersionGreater: true };
      } else {
        if (Number(userVersion[2]) > Number(cliVersion[2])) {
          return { version: "BUILD", isShellCliVersionGreater: false };
        } else if (Number(userVersion[2]) < Number(cliVersion[2])) {
          return { version: "BUILD", isShellCliVersionGreater: true };
        }
      }
    }
    return { version: "", isShellCliVersionGreater: false };
  }

  protected checkVersionToExecute() {
    let nodeVersionInstalled = "";
    let npmVersionInstalled = "";
    try {
      nodeVersionInstalled = process.version;
      nodeVersionInstalled = nodeVersionInstalled.replace(/(\r\n|\n|\r)/gm, "");
      nodeVersionInstalled = nodeVersionInstalled.replace("v", "");
      this.logger.log("node Version: ", nodeVersionInstalled);
      const compareVersionOutputForNode = this.compareVersions(this.CONFIG_FILE.settings.minimumNodeVersion, nodeVersionInstalled);
      this.logger.log("compareVersionOutputForNode: ", compareVersionOutputForNode);
      if (compareVersionOutputForNode.version === "MAJOR") {
        if (compareVersionOutputForNode.isShellCliVersionGreater === true) {
          throw new Ch5CliError(this.getText("You seem to be using an older version of nodejs. Please upgrade to " + this.CONFIG_FILE.settings.minimumNodeVersion + " version of nodejs."));
        } else {
          this.logger.printWarning("Note: ch5-shell-cli has not been verified on your node version " + nodeVersionInstalled);
        }
      } else if (compareVersionOutputForNode.version === "MINOR") {
        if (compareVersionOutputForNode.isShellCliVersionGreater === true) {
          throw new Ch5CliError(this.getText("You seem to be using an older version of nodejs. Please upgrade to " + this.CONFIG_FILE.settings.minimumNodeVersion + " version of nodejs."));
        } else {
          // warning not required on minor and build versions
        }
      } else if (compareVersionOutputForNode.version === "BUILD") {
        if (compareVersionOutputForNode.isShellCliVersionGreater === true) {
          throw new Ch5CliError(this.getText("You seem to be using an older version of nodejs. Please upgrade to " + this.CONFIG_FILE.settings.minimumNodeVersion + " version of nodejs."));
        } else {
          // warning not required on minor and build versions
        }
      }

      npmVersionInstalled = child_process.execSync('npm -v').toString();
      npmVersionInstalled = npmVersionInstalled.replace(/(\r\n|\n|\r)/gm, "");
      npmVersionInstalled = npmVersionInstalled.replace("v", "");
      this.logger.log("npmVersionInstalled: ", npmVersionInstalled);
      const compareVersionOutputForNPM = this.compareVersions(this.CONFIG_FILE.settings.minimumNPMVersion, npmVersionInstalled);
      this.logger.log("compareVersionOutputForNPM: ", compareVersionOutputForNPM);
      if (compareVersionOutputForNPM.version === "MAJOR") {
        if (compareVersionOutputForNPM.isShellCliVersionGreater === true) {
          throw new Ch5CliError(this.getText("You seem to be using an older version of npm. Please upgrade to " + this.CONFIG_FILE.settings.minimumNPMVersion + " version of npm."));
        } else {
          this.logger.printWarning("Note: ch5-shell-cli has not been verified on your npm version " + npmVersionInstalled);
        }
      } else if (compareVersionOutputForNPM.version === "MINOR") {
        if (compareVersionOutputForNPM.isShellCliVersionGreater === true) {
          throw new Ch5CliError(this.getText("You seem to be using an older version of npm. Please upgrade to " + this.CONFIG_FILE.settings.minimumNPMVersion + " version of npm."));
        } else {
          // warning not required on minor and build versions
        }
      } else if (compareVersionOutputForNPM.version === "BUILD") {
        if (compareVersionOutputForNPM.isShellCliVersionGreater === true) {
          throw new Ch5CliError(this.getText("You seem to be using an older version of npm. Please upgrade to " + this.CONFIG_FILE.settings.minimumNPMVersion + " version of npm."));
        } else {
          // warning not required on minor and build versions
        }
      }
    } catch (e: any) {
      if (e.name === "Ch5CliError") {
        throw new Error(e.message);
      } else {
        if (nodeVersionInstalled === "") {
          throw new Error(this.getText("You seem to be using an older version of nodejs. Please upgrade to version " + this.CONFIG_FILE.settings.minimumNodeVersion + " of nodejs."));
        } else if (npmVersionInstalled === "") {
          throw new Error(this.getText("You seem to be using an older version of npm. Please upgrade to version " + this.CONFIG_FILE.settings.minimumNPMVersion + " of npm."));
        } else {
          throw new Error(this.getText("To use ch5-shell-cli, please ensure that your nodejs version is " + this.CONFIG_FILE.settings.minimumNodeVersion + " and npm version is " + this.CONFIG_FILE.settings.minimumNPMVersion + ""));
        }
      }
    }
  }

  public async run() {
    this.logger.start("Program Starts");
    try {
      this.checkVersionToExecute();

      this.initBase();

      // Initialize
      await this.initialize();

      // Verify input params
      await this.verifyInputParams();

      // Ask details to developer based on input parameter validation
      await this.checkPromptQuestions();

      // Update project-config first (so that if this fails, we don't worry about file deletion). Next Delete Files
      await this.processRequest();

    } catch (e: any) {
      this.outputResponse.errorMessage = this.logError(e);
    } finally {
      // Clean up
      this.cleanUp();
    }

    // Show output response
    this.logOutput();
    this.logger.end();
    return this.outputResponse.result; // The return is required to validate in automation test case
  }
  private convertArrayToCommaSeparatedString(input: string[]) {
    let output: string = "";
    for (let i: number = 0; i < input.length; i++) {
      output += input[i] + ", ";
    }
    output = output.trim();
    if (output.length > 0) {
      output = output.substring(0, output.length - 1);

    }
    return output;
  }

  /**
   * DO NOT DELETE
   */
  async initialize() { }
  async verifyInputParams() { }
  async checkPromptQuestions() { }
  async processRequest() { }
  async cleanUp() { }

  private logOutput() {
    if (this.outputResponse.result === false) {
      this.logger.printError(this.outputResponse.errorMessage);
    } else {
      this.logger.printSuccess(this.outputResponse.successMessage);
    }
  }

  protected getConfigNode(nodeName: string) {
    return this.CONFIG_FILE[nodeName];
  }

  private validatePackageJsonProjectName(packageName: string) {
    /*
      - project name length should be greater than zero and cannot exceed 214
      - project name characters must be lowercase i.e., no uppercase or mixed case names are allowed
      - project name can consist of hyphens and numbers, and can only begin with alphabets
      - project name must not contain any non-url-safe characters (since name ends up being part of a URL)
      - project name should not contain any spaces or any of the following characters: ~)('!*
    */
    if (packageName && packageName.trim().length > 0) {
      packageName = packageName.trim().toLowerCase();
      packageName = packageName.substring(0, 213);
      const packageNameValidity = new RegExp(/^[a-z][a-z0-9-._$]*$/).test(packageName);
      if (packageNameValidity === false) {
        return {
          value: null,
          isValid: false,
          error: this.getText("COMMON.VALIDATIONS.PROJECT_NAME")
        };
      } else {
        return {
          value: packageName,
          isValid: true,
          error: ""
        };
      }
    } else {
      return {
        value: "",
        isValid: false,
        error: this.getText("COMMON.VALIDATIONS.PROJECT_NAME")
      };
    }
  }

  /**
   * Get the String output from default.json file in config
   * @param {*} key
   * @param  {...any} values
   */
  getText(key: string, ...values: string[]) {
    return this._cliUtil.getText(this.TRANSLATION_FILE, key, ...values);
  }

  logError(e: any) {
    if (e && this.utils.isValidInput(e.message)) {
      return e.message;
    } else {
      console.log(e);
      return this.getText("COMMON.SOMETHING_WENT_WRONG");
    }
  }

  /**
   * Adds error message to the array
   * @param {string} heading
   * @param {string} message
   * @param {string} resolution
   */
  protected addError(heading: string, message: string, resolution: string) {
    let valueExists = false;
    if (this.outputResponse.errorsFound.length > 0) {
      for (let item of this.outputResponse.errorsFound) {
        if (message === item.message) {
          valueExists = true;
          break;
        }
      }
    }
    if (!valueExists) {
      this.outputResponse.errorsFound.push({
        heading: heading,
        message: message,
        resolution: resolution
      });
    }
  }

  protected async isConfigFileValid(filePath: string, schemaFilePath: string, preBuildValidationOnly: boolean = false) {
    let errorsFound: any[] = [];
    let warningsFound: any[] = [];
    const valProjConfig = new Ch5ValidateProjectConfigCli(false, false);
    valProjConfig.changeConfigParam("projectConfigJSONFile", filePath);
    valProjConfig.changeConfigParam("projectConfigJSONSchemaFile", schemaFilePath);
    const outputForValPC: boolean = await valProjConfig.run();
    this.logger.log("outputForValPC", outputForValPC);
    if (outputForValPC === false) {
      const errorsFoundForValPC = valProjConfig.getErrors();
      if (errorsFoundForValPC && errorsFoundForValPC.length > 0) {
        errorsFound = errorsFound.concat(errorsFoundForValPC);
        this.logger.log("errorsFound in Validate Project Config", errorsFound);
      }
      const warningsFoundForValPC = valProjConfig.getWarnings();
      if (warningsFoundForValPC && warningsFoundForValPC.length > 0) {
        warningsFound = warningsFound.concat(warningsFoundForValPC);
        this.logger.log("warningsFound in Validate Project Config", warningsFound);
      }
    }

    if (preBuildValidationOnly === true) {
      errorsFound = errorsFound.filter((dataObj: any) => { return (dataObj.type === Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES) });
      warningsFound = warningsFound.filter((dataObj: any) => { return (dataObj.type === Ch5ValidateProjectConfigCli.RULES.PRE_BUILD_RULES) });
    }
    this.logger.log("Schema Validation Errors: ", errorsFound.length, errorsFound);
    this.logger.log("Schema Validation Warnings: ", warningsFound.length, warningsFound);

    if (errorsFound.length !== 0) {
      this.logger.printError("Errors / Warnings found while validating input configuration file:\n");
      valProjConfig.printOutputErrorsAndWarnings(errorsFound, warningsFound);
    }
    return (errorsFound.length === 0);
  }

  protected isConfigFileExist(fileName: string) {
    if (fs.existsSync(fileName)) {
      const checkFileOrFolder = fs.statSync(fileName);
      if (checkFileOrFolder && checkFileOrFolder.isFile()) {
        if (path.extname(fileName).trim().toLowerCase() === ".json") {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

}
