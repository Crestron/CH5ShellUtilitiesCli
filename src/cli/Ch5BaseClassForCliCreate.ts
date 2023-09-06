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
const process = require('process');

export abstract class Ch5BaseClassForCliCreate {
  protected CONFIG_FILE: ICh5CliConfigFile;

  private readonly _cliUtil: Ch5CliUtil;
  private readonly _cliLogger: Ch5CliLogger;
  private readonly _cliConfigFileReader: Ch5CliConfigFileReader;
  private readonly _cliNamingHelper: Ch5CliNamingHelper;
  private readonly _cliProjectConfig: Ch5CliProjectConfig;

  private _folderPath: string = "";
  private TRANSLATION_FILE: any;
  private _inputArgs: any = {};

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

  public get configFileReader() {
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

  public constructor() {
    this._folderPath = this.getCLIExecutionPath();
    this._cliUtil = new Ch5CliUtil();
    this._cliNamingHelper = new Ch5CliNamingHelper();
    this._cliProjectConfig = new Ch5CliProjectConfig();
    this._cliConfigFileReader = new Ch5CliConfigFileReader(path.join(this._folderPath, "files", "config.json"), JSON.parse(this._cliUtil.readFileContentSync(path.join(__dirname, "files", "environment.json"))));
    this.CONFIG_FILE = this._cliConfigFileReader.configFile;
    this.processArgs();
    this._cliLogger = new Ch5CliLogger(this._inputArgs["verbose"].inputValue);
    this.TRANSLATION_FILE = this.mergeJSON(JSON.parse(this._cliUtil.readFileContentSync(path.join(this._folderPath, "i18n", "en.json"))), JSON.parse(this._cliUtil.readFileContentSync(path.join(__dirname, "files", "en.json"))));
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
            outputVal["inputValue"] = paramObj.valueIfNotFound;
            outputVal["inputReceived"] = true;
            output[arrayKey] = outputVal;
          } else if (arrayParam === "boolean" || arrayParam === "string" || arrayParam === "number") {
            if (outputVal["isSpecialArgument"] === true) {
              outputVal["inputValue"] = paramObj.default;
            } else {
              outputVal["inputValue"] = paramObj.valueIfNotFound;
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
          if (arrayParam === "array") {
            if (!output[arrayKey]["inputValue"]) {
              output[arrayKey]["inputValue"] = [];
            }
            output[arrayKey]["inputValue"].push(val);
          } else if (arrayParam === "enum" || arrayParam === "boolean" || arrayParam === "string" || arrayParam === "number") {
            if (continueProcess === true) {
              output[arrayKey]["inputValue"] = val;
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
        output[completeInputParams[i]["key"]]["inputValue"] = completeInputParams[i]["valueIfNotFound"];
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
        const contentForHelp: string = await this.utils.readFileContent(path.join(this._folderPath, "files", "help.txt"));
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

  public checkVersionToExecute() {
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
          throw new Ch5CliError(this.getText("You seem to be using an older version of nodejs (" + nodeVersionInstalled + "). Please upgrade to " + this.CONFIG_FILE.settings.minimumNodeVersion + " version of nodejs."));
        } else {
          this.logger.printWarning("You are currently using the nodejs version " + nodeVersionInstalled + ". ch5-shell-cli has a minimum required node version of " + this.CONFIG_FILE.settings.minimumNodeVersion + ".");
        }
      } else if (compareVersionOutputForNode.version === "MINOR") {
        if (compareVersionOutputForNode.isShellCliVersionGreater === true) {
          throw new Ch5CliError(this.getText("You seem to be using an older version of nodejs (" + nodeVersionInstalled + "). Please upgrade to " + this.CONFIG_FILE.settings.minimumNodeVersion + " version of nodejs."));
        } else {
          // warning not required on minor and build versions
        }
      } else if (compareVersionOutputForNode.version === "BUILD") {
        if (compareVersionOutputForNode.isShellCliVersionGreater === true) {
          throw new Ch5CliError(this.getText("You seem to be using an older version of nodejs (" + nodeVersionInstalled + "). Please upgrade to " + this.CONFIG_FILE.settings.minimumNodeVersion + " version of nodejs."));
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
          throw new Ch5CliError(this.getText("You seem to be using an older version of npm (" + npmVersionInstalled + "). Please upgrade to " + this.CONFIG_FILE.settings.minimumNPMVersion + " version of npm."));
        } else {
          this.logger.printWarning("You are currently using the npm version " + npmVersionInstalled + ". ch5-shell-cli has a minimum required npm version of " + this.CONFIG_FILE.settings.minimumNPMVersion + ".");
        }
      } else if (compareVersionOutputForNPM.version === "MINOR") {
        if (compareVersionOutputForNPM.isShellCliVersionGreater === true) {
          throw new Ch5CliError(this.getText("You seem to be using an older version of npm (" + npmVersionInstalled + "). Please upgrade to " + this.CONFIG_FILE.settings.minimumNPMVersion + " version of npm."));
        } else {
          // warning not required on minor and build versions
        }
      } else if (compareVersionOutputForNPM.version === "BUILD") {
        if (compareVersionOutputForNPM.isShellCliVersionGreater === true) {
          throw new Ch5CliError(this.getText("You seem to be using an older version of npm (" + npmVersionInstalled + "). Please upgrade to " + this.CONFIG_FILE.settings.minimumNPMVersion + " version of npm."));
        } else {
          // warning not required on minor and build versions
        }
      }
    } catch (e: any) {
      if (e.name === "Ch5CliError") {
        this.logger.printError(e.message);
        process.exit(1);
        // throw new Error(e.message);
      } else {
        if (nodeVersionInstalled === "") {
          const errorMessage = this.getText("You seem to be using an older version of nodejs. Please upgrade to version " + this.CONFIG_FILE.settings.minimumNodeVersion + " of nodejs.");
          this.logger.printError(errorMessage);
          process.exit(1);
          // throw new Error((errorMessage));
        } else if (npmVersionInstalled === "") {
          const errorMessage = this.getText("You seem to be using an older version of npm. Please upgrade to version " + this.CONFIG_FILE.settings.minimumNPMVersion + " of npm.");
          this.logger.printError(errorMessage);
          process.exit(1);
          // throw new Error((errorMessage));
        } else {
          const errorMessage = this.getText("To use ch5-shell-cli, please ensure that your nodejs version is " + this.CONFIG_FILE.settings.minimumNodeVersion + " and npm version is " + this.CONFIG_FILE.settings.minimumNPMVersion + "");
          this.logger.printError(errorMessage);
          process.exit(1);
          // throw new Error((errorMessage));
        }
      }
    }
  }

  public async run() {
    this.logger.start("Program Starts");
    try {
      this.checkVersionToExecute();

      // Initialize
      this.initialize();

      // Verify input params
      await this.verifyInputParams();

      // Ask details to developer based on input parameter validation
      await this.checkPromptQuestions();

      // Update project-config first (so that if this fails, we don't worry about file deletion). Next Delete Files
      await this.processRequest();

    } catch (e: any) {
      // Log error
      this.getOutputResponse().errorMessage = this.logError(e);
    } finally {
      // Clean up
      this.cleanUp();
    }

    // Show output response
    this.showOutput();
    this.logger.end();
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
  initialize(): any { }
  async verifyInputParams() { }
  async checkPromptQuestions() { }
  async processRequest() { }
  getOutputResponse(): any { }
  async cleanUp() { }
  getCLIExecutionPath(): any { }

  private showOutput() {
    const outputResponse: any = this.getOutputResponse();
    if (outputResponse.result === false) {
      this.logger.printError(outputResponse.errorMessage);
    } else {
      this.logger.printSuccess(outputResponse.successMessage);
    }
  }

  protected getConfigNode(nodeName: string) {
    return this.CONFIG_FILE[nodeName];
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

  protected getFullPath(...pathValue: any) {
    return path.resolve(path.normalize(path.join(...pathValue)));
  }

  protected isConfigFileExist(fileName: string) {
    if (fs.existsSync(fileName)) {
      const checkFileOrFolder = fs.statSync(fileName);
      if (checkFileOrFolder && checkFileOrFolder.isFile()) {
        if (path.extname(fileName).trim().toLowerCase() === ".json") {
          return true;
        }
      }
    }
    return false;
  }

  protected getCurrentWorkingDirectory() {
    return process.cwd();
  }
}
