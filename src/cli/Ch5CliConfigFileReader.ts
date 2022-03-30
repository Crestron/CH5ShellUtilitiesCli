// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { ICh5CliConfigFile, ICh5CliConfigFileParamOptions } from "./ICh5CliConfigFile";

const fs = require("fs");

export class Ch5CliConfigFileReader {

  private _configFile: ICh5CliConfigFile;
  private _configFileOptions: ICh5CliConfigFileParamOptions[] = [];

  private readonly COMMON_INPUT_PARAMS: ICh5CliConfigFileParamOptions[] = [
    {
      "key": "verbose",
      "description": "",
      "type": "boolean",
      "default": true,
      "valueIfNotFound": false,
      "alias": ["--verbose"],
      "isSpecialArgument": true
    },
    {
      "key": "help",
      "description": "",
      "type": "boolean",
      "default": true,
      "valueIfNotFound": false,
      "alias": ["-h", "--help"],
      "isSpecialArgument": true
    }
  ];

  public get configFile(): ICh5CliConfigFile {
    return this._configFile;
  }

  public constructor(path: string) {
    this._configFile = JSON.parse(fs.readFileSync(path, 'utf8')) as ICh5CliConfigFile;
    this._configFileOptions = [...this._configFile.options, ...this.COMMON_INPUT_PARAMS];
  }

  public configParamOptions(): ICh5CliConfigFileParamOptions[] {
    return this._configFileOptions;
  }

}
