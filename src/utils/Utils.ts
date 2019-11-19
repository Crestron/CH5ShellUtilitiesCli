// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import fs from 'fs';
import rimraf from 'rimraf';
import { OutputLevelEnum, ConfigExtensions} from '../enums';
import { Client, ClientChannel } from 'ssh2';
import { IConfigOptions, ILogger } from '../interfaces';
import IoConstants from '../ioConstants';
import { IUtils } from "../interfaces/IUtils";

export class Utils implements IUtils {
  private readonly _logger: ILogger;
  public constructor(logger: ILogger) {
    this._logger = logger;
  }

  public checkExistingDirectory(directoryName: string, loggingLevel: OutputLevelEnum): boolean {
    this._logger.debug(IoConstants.checkingDirectoryExists(directoryName));

    const existsDir = fs.existsSync(`${directoryName}`) ? fs.lstatSync(directoryName) : null;
    if (!existsDir || !existsDir.isDirectory) {
      fs.mkdirSync(directoryName);

      this._logger.debug(IoConstants.createdDirectory(directoryName));

      return false;
    }
    return true;
  }

  public deleteDirectory(directoryName: string): void {
    const existsDir = fs.existsSync(`${directoryName}`) ? fs.lstatSync(directoryName) : null;
    if (existsDir && existsDir.isDirectory) {
      rimraf.sync(directoryName);
    }
  }

  /**
   * Method for checking input contract file must have cse2j extension
   *
   * @param fileName
   */
  public validateFileExists(fileName: string): boolean {
    const existsArchive = fs.existsSync(fileName) ? fs.lstatSync(fileName).isFile() : null;
    if (!existsArchive) {
      throw new Error(IoConstants.fileDoesNotExist(fileName));
    }
    return true;
  }

  public writeToFile(filePath: string, content: string): void {
    fs.writeFileSync(filePath, content);
  }

  /**
   * Method readFromFile read content of file and return content as string.
   * @param {string} filePath
   * @param {string} [encodingFormat='utf8']
   */
  public readFromFile(filePath: string, encodingFormat: string = 'utf8'): string {
    const fileContent: string = fs.readFileSync(filePath, encodingFormat);
    return fileContent;
  }
  
  /**
   * Method for checking contract editor config file extension.
   *
   * @param fileName
   */
  public validateContractFile(fileName: string): boolean {
    const fileExtension: string = "" + fileName.split('.').pop();
    if (fileExtension.toLocaleLowerCase() !== ConfigExtensions.CSE2J_CONFIG_EXTENSION) {
      throw new Error(IoConstants.invalidContractFile(fileName));
    }
    return true;
  }

  /**
   * Method for running restart/reload command on device
   *
   * @param distributorOptions
   * @param command
   */
  public runRestartSshCommand(distributorOptions: IConfigOptions, command: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const ssh2 = new Client();
      ssh2.on('ready', () => {
        this._logger.info(IoConstants.connectViaSsh);

        ssh2.exec(command, (err: Error, stream: ClientChannel) => {
          if (err) throw err;
          stream.on('close', () => {
            this._logger.debug(IoConstants.deviceRestarted);
            ssh2.end();
          }).on('data', (data: string) => {
            this._logger.debug(IoConstants.deviceOutput(data));
          }).stderr.on('data', (data: string) => {
            this._logger.debug(IoConstants.deviceError(data));
            reject(data);
          });
        });
      }).on('end', () => {
        this._logger.info(IoConstants.connectionEnded);
        resolve('done');
      }).connect({
        host: distributorOptions.controlSystemHost,
        username: distributorOptions.sftpUser,
        password: distributorOptions.sftpPassword
      });
    });
  }
}
