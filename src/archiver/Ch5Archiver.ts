// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import fs from 'fs';
import archiver from 'archiver';
import { Stream } from "stream";
import { ICh5Archiver, IConfigOptions, IMetadataGenerator } from "../interfaces";
import { IUtils } from "../interfaces/IUtils";
import { ArchiveExtensions } from "../enums";
import IoConstants from "../ioConstants";

export class Ch5Archiver implements ICh5Archiver {
  private readonly _utils: IUtils;
  private readonly _metadataGenerator: IMetadataGenerator;

  public constructor(utils: IUtils, metadataGenerator: IMetadataGenerator) {
    this._utils = utils;
    this._metadataGenerator = metadataGenerator;
  }

  public async createArchive(options: IConfigOptions): Promise<string> {
    // validate app contents
    this.validateDirectoryContents(options);
    // check for contract editor config file. if exsit then process it.
    if (!!options.contractFile) {
      this.addContractFileToConfig(options);
    }
    // create outputDirectory, else we cannot create temp directory
    this._utils.checkExistingDirectory(options.outputDirectory, options.outputLevel);

    // create app ui manifest file
    this._metadataGenerator.generateAppUiManifest(options);

    // app ui manifest file
    await this._metadataGenerator.addAppUiMetadata(options, IoConstants.getAppUiManifestFilePath(options.directoryName));

    // change target directory to outputDirectory/temp
    const tmpOptions = {...options};
    tmpOptions.outputDirectory = tmpOptions.outputDirectory + '/temp';

    // inner archive
    await this.archive(tmpOptions, ArchiveExtensions.CH5_EXTENSION);

    // project manifest file
    await this._metadataGenerator.generateMetadataFile(tmpOptions, ArchiveExtensions.CH5_EXTENSION);

    // change source directory to outputDirectory/temp
    const tmpOptions2 = {...options};
    tmpOptions2.directoryName = tmpOptions.outputDirectory;
    // final archive
    const result = await this.archive(tmpOptions2, ArchiveExtensions.CH5Z_EXTENSION);

    // delete temp directory
    this._utils.deleteDirectory(tmpOptions.outputDirectory);

    return result;
  }

  private validateDirectoryContents(options: IConfigOptions): void {
    const indexFilePath = `${options.directoryName}/index.html`;
    this._utils.validateFileExists(indexFilePath);
  }

  /**
   * Method addContractFileToConfig create config dir if not exist and
   * read the cse2j file and write file in config folder
   * @param {IConfigOptions} options
   */
  private addContractFileToConfig(options: IConfigOptions): void {
    const contractFile = "" + options.contractFile;
    const dirName: string = `config`;
    const contractFileName: string = `${options.projectName}-contract-editor-config.cse2j`;
    const configDir: string = `${options.directoryName}/${dirName}`;
    const targetFilePath: string = `${options.directoryName}/${dirName}/${contractFileName}`;
    this._utils.validateFileExists(contractFile);
    this._utils.validateContractFile(contractFile);
    // create config folder under project dir if not exist.
    this._utils.checkExistingDirectory(configDir, options.outputLevel);
    const fileContent: string = this._utils.readFromFile(contractFile);
    if (this._utils.checkExistingDirectory(configDir, options.outputLevel)) {
      this._utils.writeToFile(targetFilePath, fileContent);
    }
  }

  private archive(options: IConfigOptions, extension: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const outputDirectory = options.outputDirectory;
      this._utils.checkExistingDirectory(outputDirectory, options.outputLevel);

      const outputFileName = `${outputDirectory}/${options.projectName}.${extension}`;

      const output = fs.createWriteStream(outputFileName);
      this.registerOutputEvents(output, outputFileName, resolve, reject);

      const archive = archiver('zip', {
        zlib: {level: 9}
      });
      this.registerArchiveEvents(archive, outputFileName, resolve, reject);

      // pipe archive data to the file
      archive.pipe(output);

      // append source directory
      archive.directory(options.directoryName, '');

      // wrap up
      archive.finalize();
    });
  }

  private registerOutputEvents(
    output: Stream,
    outputFileName: string,
    resolve: Function,
    reject: Function
  ) {

    output.on('close', () => {
      resolve(outputFileName);
    });

    output.on('finish', () => {
      resolve(outputFileName);
    });

    output.on('end', () => {
      resolve(outputFileName);
    });

    output.on('error', (error: any) => {
      reject(error);
    });
  }

  private registerArchiveEvents(
    archive: archiver.Archiver,
    outputFileName: string,
    resolve: Function,
    reject: Function
  ) {

    archive.on('warning', (err: any) => {
      if (err.code === 'ENOENT') {
        // log warning
        resolve(outputFileName);
      } else {
        reject(err);
      }
    });

    // good practice to catch this error explicitly
    archive.on('error', (error: Error) => {
      reject(error);
    });
  }
}
