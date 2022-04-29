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
import { Ch5CliConfigFileReader } from "./Ch5CliConfigFileReader";

const path = require('path');
export class Ch5BaseClassForCli {
  private readonly _cliUtil: Ch5CliUtil;
  private readonly _cliLogger: Ch5CliLogger;
  private readonly _cliNamingHelper: Ch5CliNamingHelper;
  private readonly _cliProjectConfig: Ch5CliProjectConfig;
  private readonly _cliConfigFileReader: Ch5CliConfigFileReader;

  private _folderPath: string = "";
  private CONFIG_FILE: any;
  private TRANSLATION_FILE: any;
  private _inputArguments: any = {};

  private readonly COMMON_INPUT_PARAMS: any[] = [
    {
      "key": "verbose",
      "description": "",
      "type": "boolean",
      "default": true,
      "valueIfNotFound": false,
      "alias": ["--verbose"]
    },
    {
      "key": "help",
      "description": "",
      "type": "boolean",
      "default": true,
      "valueIfNotFound": false,
      "alias": ["-h", "--help"]
    }
  ];

  protected get inputArguments(): any {
    return this._inputArguments;
  }

  protected get utils() {
    return this._cliUtil;
  }

  protected get logger() {
    return this._cliLogger;
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
    this._cliConfigFileReader = new Ch5CliConfigFileReader(path.join(__dirname, this._folderPath, "files", "config.json"));
    this.CONFIG_FILE = JSON.parse(this.utils.readFileContentSync(path.join(__dirname, this._folderPath, "files", "config.json")));
    this._inputArguments = this.processArgs();
    this._cliLogger = new Ch5CliLogger(this._inputArguments["verbose"]);
    this.TRANSLATION_FILE = JSON.parse(this.utils.readFileContentSync(path.join(__dirname, this._folderPath, "i18n", "en.json")));
  }

  public setInputArgsForTesting(args: any) {
    this._inputArguments = this.processArgsAnalyze(args);
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
        let optionName = null;
        if (String(val).indexOf('--') === 0) {
          optionName = val.replace('--', '');
        } else if (String(val).indexOf('-') === 0) {
          optionName = val.replace('-', '');
        }
        const paramObj = completeInputParams.find((tempObj) => tempObj.alias.map((v: string) => v.toLowerCase()).includes(val.trim().toLowerCase()));
        if (paramObj) {
          arrayKey = paramObj.key;
          arrayParam = paramObj.type;
          if (arrayParam === "array") {
            output[arrayKey] = [];
          } else if (arrayParam === "boolean" || arrayParam === "string") {
            output[arrayKey] = paramObj.default;
          }
          continueProcess = true;
        } else {
          // Currently we don't do anything here. Some thoughts could be to push the data as a value similar to the
          // else statement below. Or we could nullify arrayKey and arrayParam.
        }
      } else {
        if (arrayKey != null) {
          if (arrayParam === "array") {
            output[arrayKey].push(val);
          } else if (arrayParam === "boolean" || arrayParam === "string") {
            if (continueProcess === true) {
              output[arrayKey] = val;
              continueProcess = false;
            }
          }
        }
      }
    });
    for (let i: number = 0; i < completeInputParams.length; i++) {
      if (!output[completeInputParams[i]["key"]]) {
        output[completeInputParams[i]["key"]] = completeInputParams[i]["valueIfNotFound"];
      }
    }

    return output;
  }

  public changeConfigParam(key: string, value: any) {
    const attrs = key.split('.');
    for (let i = 0; i < attrs.length - 1; i++) {
      this.CONFIG_FILE = this.CONFIG_FILE[attrs[i]];
    }
    this.CONFIG_FILE[attrs[attrs.length - 1]] = value;
  }

  protected validateCLIInputArgument(inputObj: any, key: string, value: string, errorMessage: string) {
    this.logger.log(key + ": ", value);
    value = String(value).trim().toLowerCase();
    if (inputObj) {
      if (inputObj.allowedAliases.length > 0 && inputObj.allowedAliases.includes(value)) {
        if (inputObj.type === "boolean") {
          const val: boolean = this.utils.toBoolean(value);
          return {
            value: val,
            error: ""
          };
        } else if (inputObj.type === "enum") {
          return {
            value: value,
            error: ""
          };
        }
      } else {
        if (inputObj.type === "string") {
          if (inputObj.validation !== "") {
            if (inputObj.validation === "validatePackageName") {
              const valOutput: any = this.validatePackage(value);
              if (valOutput.isValid === false) {
                return {
                  value: null,
                  error: valOutput.error
                };
              } else {
                return {
                  value: value,
                  error: ""
                };
              }
            }
            return {
              value: value,
              error: ""
            };
          } else {
            return {
              value: value,
              error: ""
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
    let programObject = program
      .command(this.CONFIG_FILE.command)
      .name(this.CONFIG_FILE.name)
      .usage(this.CONFIG_FILE.usage);

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
  async run(): Promise<void | boolean> {
  }

  protected getConfigNode(nodeName: string) {
    return this.CONFIG_FILE[nodeName];
  }

  private validatePackage(packageName: string) {
    /*
      - package name length should be greater than zero
      - all the characters in the package name must be lowercase i.e., no uppercase or mixed case names are allowed
      - package name can consist of hyphens
      - package name must not contain any non-url-safe characters (since name ends up being part of a URL)
      - package name should not start with . or _
      - package name should not contain any leading or trailing spaces
      - package name should not contain any of the following characters: ~)('!*
      - package name length cannot exceed 214      
    */
    if (packageName && packageName.trim().length > 0) {
      packageName = packageName.trim().toLowerCase();
      packageName = packageName.substring(0, 213);
      const packageNameValidity = new RegExp(/^[a-z][a-z0-9-_ $]*$/).test(packageName);
      if (packageNameValidity === false) {
        return {
          value: null,
          isValid: false,
          error: "Package name should not start with number or hyphen or underscore"
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
        error: "Empty Package Name"
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
      return this.getText("ERRORS.SOMETHING_WENT_WRONG");
    }
  }

}
