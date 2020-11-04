// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { OutputLevelEnum } from "../enums";
import { IConfigOptions } from "./IConfigOptions";

export interface IUtils {
  checkExistingDirectory(directoryName: string, loggingLevel: OutputLevelEnum): boolean;

  deleteDirectory(directoryName: string): void;

  /**
   * Method for checking a file on the filesystem
   *
   * @param fileName
   */
  validateFileExists(fileName: string): boolean;

  /**
   * Method for checking contract editor config file extension.
   *
   * @param {string} fileName
   */
  validateContractFile(fileName: string): boolean;

  writeToFile(filePath: string, content: string): void;

  /**
   * Method for read the content of the file.
   *
   * @param {string} filePath
   */
  readFromFile(filePath: string, encodingFormat?: string): string;

  /**
   * Method for running a command on device
   *
   * @param distributorOptions
   * @param command
   */
  runSshCommand(distributorOptions: IConfigOptions, command: string): void;

  /**
   * Method for assembling the options object for connect
   * 
   * @param distributorOptions 
   */
  getConnectOptions(distributorOptions: IConfigOptions): {
    host: string,
    username: string,
    password?: string,
    passphrase?: string,
    privateKey?: Buffer
  };
}
