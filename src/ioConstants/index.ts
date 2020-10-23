// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import path from 'path';

export default class IoConstants {

  // default values used in the functionality. do not change these without carefull testing.
  public static touchScreenReloadCommand: string = 'projectload';
  public static readonly touchScreenSftpDirectory: string = 'display';
  public static controlSystemReloadCommand: string = 'CSProjectLoad';
  public static readonly controlSystemSftpDirectory: string = 'html';
  public static tempExtension: string = 'ch5';
  public static defaultExtension: string = 'ch5z';
  public static temporaryArchiveDir: string = 'temp';
  public static defaultUser: string = 'Crestron';
  public static defaultPassword: string = '';
  public static readonly AppUiManifestContent: string = 'apptype:ch5';

  public static addingExtraParamsToManifest: string = 'Appending extra parameter from config to manifest file.';
  public static connectedToDeviceAndUploading: string = 'Connected to device. Uploading archive file.';
  public static connectViaSsh: string = 'Connected via ssh to device';
  public static deviceRestarted: string = 'Project has been loaded';
  public static connectionEnded: string = 'Connection has ended. Success executing command.';
  public static sftUserConsoleLabel: string = 'SFTP username: ';
  public static sftPasswordConsoleLabel: string = 'SFTP password: ';

  public static NOENT: string = 'NOENT';
  public static ENOENT: string = 'ENOENT';

  // error messages
  public static noIndexFile: string = 'No index.html file present.';
  public static noManifestAndCreateWithDir: string = 'No appui and manifest file present. Creating directory and manifest file.';
  public static noManifestAndCreate: string = 'No manifest file present. Creating manifest file.';
  public static wrongAppType: string = 'Manifest file contains different type of app type.';
  public static noConfiguration: string = 'Input configuration missing.';
  public static errorConfiguration: string = 'Configuration error: ';
  public static errorProjectName: string = 'Project name cannot be empty.';
  public static errorDirectoryName: string = 'Directory name cannot be empty.';
  public static errorOutputDirectoryName: string = 'Output directory name cannot be empty.';
  public static somethingWentWrong: string = 'Something went wrong.';

  public static helpCommand: string = 'help';
  // success messages
  public static deploymentComplete: string = 'Deployment complete.';

  static archiveCreatedWithSize(projectName: string, extension: string, size: number): string {
    return `Archive ${projectName}.${extension} has been successfully created. ${size} bytes.`
  }

  static errorWithMessage(message: string): string {
    return `Error: ${message}.`
  }

  static directoryCreated(directoryName: string): string {
    return `Directory ${directoryName} is empty. No files to archive.`
  }

  static directoryDoesNotExist(directoryName: string): string {
    return `Directory ${directoryName} does not exist. No files to archive.`
  }

  static noArchiveFile(archiveFilePath: string): string {
    return `Archive ${archiveFilePath} does not exist.`
  }

  static sendReloadCommandToDevice(device: string): string {
    return `Sending reload command to ${device} device`
  }

  static errorOnConnectingToHostWithError(host: string, errorMessage: string): string {
    return `Error on connection to ${host}:  ${errorMessage}. No success executing command.`
  }

  static hashingError(errorMessage: string): string {
    return `Hashing failed: ${errorMessage}`;
  }

  static getMetadataFilePath(projectName: string, directory?: string): string {
    directory = directory || IoConstants.temporaryArchiveDir;
    return path.resolve(directory, `${projectName}_manifest.json`);
  }

  static getAppUiManifestFilePath(sourceDirectory: string) {
    return path.resolve(sourceDirectory, "appui", "manifest");
  }

  static getTempArchiveFilePath(projectName: string, extension?: string, directory?: string): string {
    directory = directory || IoConstants.temporaryArchiveDir;
    extension = extension || IoConstants.tempExtension;
    return `${directory}/${projectName}.${extension}`;
  }


  static checkingDirectoryExists(directoryName: string): string {
    return `Checking for existing folder ${directoryName}.`
  }

  static createdDirectory(directoryName: string): string {
    return `Created directory ${directoryName}.`
  }

  static fileDoesNotExist(fileName: string): string {
    return `File ${fileName} has not been found.`;
  }

  static invalidContractFile(fileName: string): string {
    return `Invalid file ${fileName}.Contract editor config file must have .cse2j extension.`;
  }

  static deviceOutput(data: string): string {
    return `Device output: ${data}`;
  }

  static deviceError(data: string): string {
    return `Device error: ${data}`;
  }

}
