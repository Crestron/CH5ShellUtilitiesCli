// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
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

const inquirer = require('inquirer');
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

  protected get commonContentInGeneratedFiles() {
    return this.CONFIG_FILE.commonContentInGeneratedFiles;
  }

  public constructor(folderPath: string) {
    this._folderPath = folderPath;
    this._cliUtil = new Ch5CliUtil();
    this._cliLogger = new Ch5CliLogger();
    this._cliComponentHelper = new Ch5CliComponentsHelper();
    this._cliNamingHelper = new Ch5CliNamingHelper();
    this._cliProjectConfig = new Ch5CliProjectConfig();
    this._inputArguments = this.componentHelper.processArgs();
  }

  /**
  * 
  * @param program 
  */
  public async setupCommand(program: commander.Command) {
    this.TRANSLATION_FILE = JSON.parse(await this.componentHelper.readFileContent(path.join(__dirname, this._folderPath, "i18n", "en.json")));
    this.CONFIG_FILE = JSON.parse(await this.componentHelper.readFileContent(path.join(__dirname, this._folderPath, "files", "config.json")));

    let programObject = program
      .command(this.CONFIG_FILE.command)
      .name(this.CONFIG_FILE.name)
      .usage(this.CONFIG_FILE.usage);

    for (let i: number = 0; i < this.CONFIG_FILE.options.length; i++) {
      programObject = programObject.option(this.CONFIG_FILE.options[i].keys, this.CONFIG_FILE.options[i].description);
    }

    if (this.CONFIG_FILE.additionalHelp === true) {
      const contentForHelp: string = await this.componentHelper.readFileContent(path.join(__dirname, this._folderPath, "files", "help.txt"));
      programObject = programObject.addHelpText('after', contentForHelp);
    }
    programObject.action(async (options) => {
      try {
        await this.run();
      } catch (e) {
        this.utils.writeError(e);
      }
    });
    return programObject;
  }

  /**
   * DO NOT DELETE
   */
  async run() {

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

  private async deploy(archive: string, options: any): Promise<void> {
    this.validateDeployOptions(archive, options);


    // let deviceType = this._cliUtil.getDeviceType(options.deviceType);

    // const userAndPassword = await this.getUserAndPassword(options.promptForCredentials);

    // let configOptions = {
    //   controlSystemHost: options.deviceHost,
    //   deviceType: deviceType,
    //   sftpDirectory: options.deviceDirectory,
    //   sftpUser: userAndPassword.user,
    //   sftpPassword: userAndPassword.password,
    //   outputLevel: this._cliUtil.getOutputLevel(options)
    // } as IConfigOptions;
    // await distributor(archive, configOptions);
    // process.exit(0); // required, takes too long to exit :|
  }

  private validateDeployOptions(archive: string, options: any): void {
    let missingArguments = [];
    let missingOptions = [];

    if (!archive) {
      missingArguments.push('archive');
    }

    if (!options.deviceHost) {
      missingOptions.push('deviceHost');
    }

    if (!options.deviceType) {
      missingOptions.push('deviceType');
    }

    if (missingArguments.length == 0 && missingOptions.length == 0) {
      return;
    }

    const argumentsMessage = missingArguments.length > 0 ? `Missing arguments: ${missingArguments.join(', ')}.` : '';
    const optionsMessage = missingOptions.length > 0 ? `Missing options: ${missingOptions.join('. ')}.` : '';
    throw new Error(`${argumentsMessage} ${optionsMessage} Type 'ch5-cli deploy --help' for usage information.`)
  }

  private async getUserAndPassword(promptForCredentials: boolean): Promise<any> {
    if (!promptForCredentials) {
      return {
        user: 'crestron',
        password: ''
      }
    }
    return await inquirer.prompt(
      [
        {
          type: 'string',
          message: 'Enter SFTP user',
          name: 'user',
          default: 'crestron',
        },
        {
          type: 'password',
          message: 'Enter SFTP password',
          name: 'password',
          mask: '*',
          default: ''
        }
      ]
    );
  }
}
