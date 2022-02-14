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
import { Ch5CliComponentsHelper } from "./Ch5CliComponentsHelper";
import { Ch5CliProjectConfig } from "./Ch5CliProjectConfig";

const path = require('path');

export class Ch5BaseClassForCli {
  private readonly _cliUtil: Ch5CliUtil;
  private readonly _cliLogger: Ch5CliLogger;
  private readonly _cliComponentHelper: Ch5CliComponentsHelper;
  private readonly _cliNamingHelper: Ch5CliNamingHelper;
  private readonly _cliProjectConfig: Ch5CliProjectConfig;

  private _folderPath: string = "";
  private CONFIG_FILE: any;
  private TRANSLATION_FILE: any;
  private _inputArguments: any = {};

  protected get inputArguments(): any {
    return this._inputArguments;
  }

  protected get utils() {
    return this._cliUtil;
  }

  protected get logger() {
    return this._cliLogger;
  }

  protected get componentHelper() {
    return this._cliComponentHelper;
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
    this._cliComponentHelper = new Ch5CliComponentsHelper();
    this.CONFIG_FILE = JSON.parse(this.componentHelper.readFileContentSync(path.join(__dirname, this._folderPath, "files", "config.json")));
    this._cliComponentHelper.configParams = this.CONFIG_FILE.options;
    this._inputArguments = this.componentHelper.processArgs();
    this._cliLogger = new Ch5CliLogger(this._inputArguments["verbose"]);
    this.TRANSLATION_FILE = JSON.parse(this.componentHelper.readFileContentSync(path.join(__dirname, this._folderPath, "i18n", "en.json")));
  }

  public setInputArgsForTesting(args: any) {
    this._inputArguments = this.componentHelper.processArgsAnalyze(args);
  }

  public changeConfigParam(key: string, value: any) {
    const attrs = key.split('.');
    for (let i = 0; i < attrs.length - 1; i++) {
      this.CONFIG_FILE = this.CONFIG_FILE[attrs[i]];
    }
    this.CONFIG_FILE[attrs[attrs.length - 1]] = value;
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
      const contentForHelp: string = await this.componentHelper.readFileContent(path.join(__dirname, this._folderPath, "files", "help.txt"));
      programObject = programObject.addHelpText('after', contentForHelp);
    }

    programObject.action(async (options) => {
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
