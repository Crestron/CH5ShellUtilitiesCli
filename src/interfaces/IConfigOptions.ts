// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { OutputLevelEnum, DeviceTypeEnum } from '../enums/';

export interface IConfigOptions {
  projectName: string; // used for archive file name and manifest file name
  directoryName: string; // source folder for archiving - everything that is in this folder will be archived
  outputDirectory: string; // destination folder for archive
  outputLevel: OutputLevelEnum; // level of output for logging - value in [quiet, normal, verbose]
  additionalAppuiManifestParameters: IAdditionalParameters; // json object of type key:value pairs that will be added to the manifest file in the appui folder of the source folder
  additionalProjectManifestParameters: IAdditionalParameters; // json object of type key:value pairs that will be added to the metadata file in the archive
  controlSystemHost: string; // hostname to which the archive will be copied
  sftpUser: string; // username for sftp/ssh access. if not provided default value will be 'crestron'
  sftpPassword: string; // password for sftp/ssh access. if not provided default value will be ''
  promptForCredential: boolean; // flag to be used in console addon to do inline credential input
  sftpDirectory: string; // folder on controlSystemHost where the archive will be copied
  deviceType: DeviceTypeEnum; // device type - value in [touchscreen, controlsystem, web]
  contractFile: string | undefined; // Relative or absolute file path for contract editor config.
  privateKey: string | undefined; // Relative or absolute file path for private key.
  passphrase: string | undefined; // Passphrase for the private key 
}

export interface IAdditionalParameters {
  [index: string]: string
}
