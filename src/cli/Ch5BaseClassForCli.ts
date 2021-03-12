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
const fs = require("fs"); // global object - always available
const process = require("process"); // global object - always available
const fsExtra = require("fs-extra");

const Enquirer = require('enquirer');
const enquirer = new Enquirer();

process.env["NODE_CONFIG_DIR"] = path.join(__dirname, "..", "config");
const config = require("config");

export class Ch5BaseClassForCli {
  private readonly _cliUtil: Ch5CliUtil;
  private readonly _cliLogger: Ch5CliLogger;
  private readonly _cliComponentHelper: Ch5CliComponentsHelper;
  private readonly _cliNamingHelper: Ch5CliNamingHelper;
  private readonly _cliProjectConfig: Ch5CliProjectConfig;

  private CONFIG_FILE: any;
  private _templateFolderPath: string = "";
  private _basePathForPages: string = "";
  private _commonContentInGeneratedFiles: string = "";

  protected get templateFolderPath() {
    return this._templateFolderPath;
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

  protected get basePathForPages() {
    return this._basePathForPages;
  }

  protected get commonContentInGeneratedFiles() {
    return this._commonContentInGeneratedFiles;
  }

  public constructor(templatesPath: string) {
    this._cliUtil = new Ch5CliUtil();
    this._cliLogger = new Ch5CliLogger();
    this._cliComponentHelper = new Ch5CliComponentsHelper();
    this._cliNamingHelper = new Ch5CliNamingHelper();
    this._cliProjectConfig = new Ch5CliProjectConfig();
    this.CONFIG_FILE = config[templatesPath];
    this._templateFolderPath = path.join(__dirname, this.CONFIG_FILE.templatesPath);
    this._basePathForPages = this.CONFIG_FILE.basePathForPages;
    this._commonContentInGeneratedFiles = this.CONFIG_FILE.commonContentInGeneratedFiles;
  }

  public async setupCommand(program: commander.Command) {
    let programObject = program
      .command('generate:page')
      .name('generate:page')
      .usage('[options]');

    programObject = programObject.option("-n, --name", 'Set the Name of the page to be created');
    programObject = programObject.option("-m, --menu", "Allow the page navigation to be added to Menu (valid input values are 'Y', 'y', 'N', 'n'");

    const contentForHelp: string = await this._cliComponentHelper.getAdditionalHelpContent(path.join(this.templateFolderPath, "help.template"));
    programObject = programObject.addHelpText('after', contentForHelp);
    programObject.action(async (options) => {
      try {
        //await this.run(options);
        // await this.deploy(archive, options);
      } catch (e) {
        this._cliUtil.writeError(e);
      }
    });
    // program
    //   .command('generate:page')
    //   .option("-H, --deviceHost <deviceHost>", "Device host or IP. Required.")
    //   .option("-t, --deviceType <deviceType>", "Device type, value in [touchscreen, controlsystem, web]. Required.", /^(touchscreen|controlsystem|web)$/i)
    //   .option("-d, --deviceDirectory <deviceDirectory>",
    //     "Device target deploy directory. Defaults to 'display' when deviceType is touchscreen, to 'HTML' when deviceType is controlsystem. Optional.")
    //   .option("-p, --prompt-for-credentials", "Prompt for credentials. Optional.")
    //   .option("-q, --quiet [quiet]", "Don\'t display messages. Optional.")
    //   .option("-vvv, --verbose [verbose]", "Verbose output. Optional.")
    //   .action(async (options) => {
    //     try {
    //     //  await console.log("Options", options);
    //     //   await console.log("archive", archive);
    //       await this.run(options);
    //       // await this.deploy(archive, options);
    //     } catch (e) {
    //       this._cliUtil.writeError(e);
    //     }
    //   });
  }

  getConfigNode(nodeName: string) {
    return config[nodeName];
  }

  /**
   * Get the String output from default.json file in config
   * @param {*} key 
   * @param  {...any} values 
   */
  getText(key: string, ...values: string[]) {
    const DYNAMIC_TEXT_MESSAGES = this.CONFIG_FILE.textMessages;
    return this._cliUtil.getText(DYNAMIC_TEXT_MESSAGES, key, ...values);
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
