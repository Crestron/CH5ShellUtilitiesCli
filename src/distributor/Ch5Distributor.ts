// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import path from 'path';
import { IConfigOptions, ILogger } from "../interfaces";
import IoConstants from "../ioConstants";
import { DeviceTypeEnum } from "../enums";
import Client from 'ssh2-sftp-client';
import { IUtils } from "../interfaces/IUtils";

export class Ch5Distributor {
  private readonly _utils: IUtils;
  private readonly _logger: ILogger;

  public constructor(utils: IUtils, logger: ILogger) {
    this._utils = utils;
    this._logger = logger;
  }

  /**
   * Method will validate the existence of archive to be deployed
   * if this file exists it will be deployed to provided target from config
   * also this method provides solution for prompting credentials inline inputs.
   * @param filename
   * @param distributorOptions
   */
  public async initializeTransferWithCredentialsCheck(filename: string, distributorOptions: IConfigOptions): Promise<void> {
    const existsArchive: boolean = this._utils.validateFileExists(filename);

    if (!existsArchive) {
      throw new Error(IoConstants.noArchiveFile(filename));
    }

    distributorOptions.sftpDirectory = Ch5Distributor.getSftpDirectory(distributorOptions);
    distributorOptions.sftpUser = Ch5Distributor.getSftpUser(distributorOptions);
    distributorOptions.sftpPassword = Ch5Distributor.getSftpPassword(distributorOptions);

    await this.transferFiles(distributorOptions, filename);
    await this.reloadDevice(distributorOptions, filename);
  }

  private async reloadDevice(distributorOptions: IConfigOptions, filename: string): Promise<void> {
    let command: string = '';
    switch (distributorOptions.deviceType) {
      case DeviceTypeEnum.TouchScreen:
        command = IoConstants.touchScreenReloadCommand;
        break;
      case DeviceTypeEnum.ControlSystem:
        command = IoConstants.controlSystemReloadCommand + ' -U:CH5 -P:' + `${path.basename(filename)}`;
        break;
      case DeviceTypeEnum.Mobile:
        command = IoConstants.controlSystemReloadCommand + ' -T:MobileApp -U:CH5 -P:' + `${path.basename(filename)}`;
        break;
      case DeviceTypeEnum.Web:
        command = IoConstants.controlSystemReloadCommand + ' -T:WebXPanel -U:CH5 -P:' + `${path.basename(filename)}`;
        break;
      default:
        throw new Error('Unknown device type');
    }
    this._logger.info(IoConstants.sendReloadCommandToDevice(distributorOptions.deviceType) + ':' + command);
    await this._utils.runRestartSshCommand(distributorOptions, command);
  }

  private async transferFiles(distributorOptions: IConfigOptions, filename: string): Promise<void> {
    const sftpOption = {
      host: distributorOptions.controlSystemHost,
      username: distributorOptions.sftpUser,
      password: distributorOptions.sftpPassword,
    };

    const sftp = new Client();
    try {
      await sftp.connect(sftpOption);

      this._logger.info(IoConstants.connectedToDeviceAndUploading);

      const targetPath = `${distributorOptions.sftpDirectory}/${path.basename(filename)}`;
      this._logger.debug(targetPath);

      const pathExists = await sftp.exists(distributorOptions.sftpDirectory);
      // checking if path is a directory. Creating it otherwise
      if (pathExists !== 'd') {
        this._logger.debug(`Creating directory ${distributorOptions.sftpDirectory}.`);
        await sftp.mkdir(`${distributorOptions.sftpDirectory}`, true);
        this._logger.debug(`Created directory ${distributorOptions.sftpDirectory}. Now uploading`);
      }
      this._logger.debug(`Trying to upload file to ${targetPath}.`);
      await sftp.fastPut(filename, targetPath);
      this._logger.debug(`Uploaded file.`);

    } catch (err) {
      throw new Error(IoConstants.errorOnConnectingToHostWithError(distributorOptions.controlSystemHost, err.message));
    }
  }

  private static getSftpDirectory(distributorOptions: IConfigOptions) {
    if (distributorOptions.sftpDirectory) {
      return distributorOptions.sftpDirectory;
    }

    switch (distributorOptions.deviceType) {
      case DeviceTypeEnum.TouchScreen:
        return IoConstants.touchScreenSftpDirectory;
      case DeviceTypeEnum.ControlSystem:
      case DeviceTypeEnum.Mobile:
        return IoConstants.controlSystemSftpDirectory;
      case DeviceTypeEnum.Web:
        return `/${IoConstants.controlSystemSftpDirectory}/${distributorOptions.projectName}`;
      default:
        throw new Error('SFTP directory is not set.');
    }
  }

  private static getSftpUser(distributorOptions: IConfigOptions) {
    return distributorOptions.sftpUser || IoConstants.defaultUser;
  }

  private static getSftpPassword(distributorOptions: IConfigOptions) {
    return distributorOptions.sftpPassword || IoConstants.defaultPassword;
  }
}
