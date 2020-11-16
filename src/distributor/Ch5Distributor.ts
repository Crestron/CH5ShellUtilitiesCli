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
    distributorOptions.privateKey = Ch5Distributor.getPrivateKey(distributorOptions);
    distributorOptions.passphrase = Ch5Distributor.getPassphrase(distributorOptions);

    if (distributorOptions.deviceType === DeviceTypeEnum.TouchScreen && distributorOptions.slowMode) {
      this._logger.info(`Sending ${IoConstants.touchScreenUpdateCommand} command to device...`);
      await this._utils.runSshCommand(distributorOptions, IoConstants.touchScreenUpdateCommand);
    }
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
    await this._utils.runSshCommand(distributorOptions, command);
  }

  private async transferFiles(distributorOptions: IConfigOptions, filename: string): Promise<void> {
    const sftp = new Client();

    try {
      await sftp.connect(this._utils.getConnectOptions(distributorOptions));
      let { sftpDirectory } = distributorOptions;
      this._logger.info(IoConstants.connectedToDeviceAndUploading);


      if (distributorOptions.deviceType === DeviceTypeEnum.Web) {
        // find if output directory is HTML or html
        const matchingDirs = await sftp.list('/', `${sftpDirectory.toUpperCase()}|${sftpDirectory.toLowerCase()}`);
        sftpDirectory = `/${matchingDirs[0].name}/${distributorOptions.projectName}`;
      }

      const targetPath = `${sftpDirectory}/${path.basename(filename)}`;
      const pathExists = await sftp.exists(sftpDirectory);

      // checking if path is a directory. Creating it otherwise
      if (pathExists !== 'd') {
        this._logger.debug(`Creating directory ${sftpDirectory}.`);
        await sftp.mkdir(`${sftpDirectory}`, true);
        this._logger.debug(`Created directory ${sftpDirectory}. Now uploading`);
      }

      this._logger.debug(`Trying to upload file to ${targetPath}.`);
      await sftp.put(filename, targetPath, { autoClose: false });
      this._logger.debug(`Uploaded file.`);
    } catch (err) {
      throw new Error(IoConstants.errorOnConnectingToHostWithError(distributorOptions.controlSystemHost, err.message));
    } finally {
      await sftp.end();
      this._logger.debug('Closing sftp connection.');
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
      case DeviceTypeEnum.Web:
        return IoConstants.controlSystemSftpDirectory;
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

  private static getPrivateKey(distributorOptions: IConfigOptions) {
    return distributorOptions.privateKey || undefined;
  }

  private static getPassphrase(distributorOptions: IConfigOptions) {
    return distributorOptions.passphrase || undefined;
  }
}
