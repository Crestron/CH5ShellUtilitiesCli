// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import * as commander from "commander";
import { IAdditionalParameters, IConfigOptions } from "@crestron/ch5-utilities/build/@types/interfaces";
import { archiver } from "@crestron/ch5-utilities";
import { Ch5CliUtil } from "./Ch5CliUtil";

export class Ch5ArchiveCli {
  private readonly _cliUtil: Ch5CliUtil;

  public constructor() {
    this._cliUtil = new Ch5CliUtil();
  }

  public setupArchiveCommand(program: commander.Command): void {
    program
      .command('archive')
      .option("-p, --project-name <projectName>", "Project name. Required.")
      .option("-d, --directory-name <directoryName>", "Source directory for archiving. Required.")
      .option("-o, --output-directory <outputDirectory>", "Target output directory. Required.")
      .option("-A, --app-ui-manifest-params <appUiManifestParams>",
      "Additional app UI manifest parameters. Send as a comma separated list of key-value pairs ( key1=value1,key2=value2 ). Optional.")
      .option("-P, --project-manifest-params <projectManifestParams>",
      "Additional project manifest parameters. Send as a comma separated list of key-value pairs ( key1=value1,key2=value2 ). Optional.")
      .option("-q, --quiet [quiet]", "Don\'t display messages. Optional.")
      .option("-vvv, --verbose [verbose]", "Verbose output. Optional.")
      .option("-c, --contract-file <contractFile>", "Relative or absolute file path for contract editor config.File name must have .cse2j extension. Optional.")
      .action(async (options) => {
        try {
          await this.archive(options);
        } catch (e) {
          this._cliUtil.writeError(e);
        }
      });
  }

  private async archive(options: any): Promise<void> {
    this.validateArchiveOptions(options);

    let configOptions = {
      projectName: options.projectName,
      directoryName: options.directoryName,
      outputDirectory: options.outputDirectory,
      outputLevel: this._cliUtil.getOutputLevel(options),
      additionalAppuiManifestParameters: this.extractKeyValuePairs(options.appUiManifestParams),
      additionalProjectManifestParameters: this.extractKeyValuePairs(options.projectManifestParams),
      contractFile: options.contractFile
    } as IConfigOptions;
    await archiver(configOptions);
  }

  private validateArchiveOptions(options: any): void {
    let missingOptions = [];

    if (!options.projectName) {
      missingOptions.push('projectName');
    }

    if (!options.directoryName) {
      missingOptions.push('directoryName');
    }

    if (!options.outputDirectory) {
      missingOptions.push('outputDirectory');
    }

    if (missingOptions.length == 0) {
      return;
    }

    throw new Error(`Missing options: ${missingOptions.join('. ')}. Type 'ch5-cli archive --help' for usage information.`)
  }

  private extractKeyValuePairs(commaSeparatedList: string): IAdditionalParameters {
    if (!commaSeparatedList) {
      return {};
    }

    let params = {} as any;
    commaSeparatedList.split(',').forEach(value => {
      const keyValuePair = value.split('=');
      params[keyValuePair[0]] = keyValuePair[1];
    });

    return params as IAdditionalParameters;
  }
}
