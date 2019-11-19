// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import fs from 'fs';
import { IConfigOptions, IMetadataGenerator, IUtils } from '../interfaces';
import IoConstants from '../ioConstants';
import * as path from "path";

const sha256File = require('sha256-file');

export class MetadataGenerator implements IMetadataGenerator {
    private readonly _utils: IUtils;

    public constructor(utils: IUtils) {
        this._utils = utils;
    }

    public generateMetadataFile(options: IConfigOptions, extension: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const archiveFilePath = `${options.outputDirectory}/${options.projectName}.${extension}`;
            const archiveFile = fs.lstatSync(archiveFilePath);

            try {
                options.additionalProjectManifestParameters = options.additionalProjectManifestParameters || {};

                const metadata = {
                    projectname: `${options.projectName}.${extension}`,
                    modifiedtime: archiveFile.mtime.toISOString(),
                    "sha-256": sha256File(archiveFilePath),
                    ...options.additionalProjectManifestParameters
                };

                fs.writeFileSync(IoConstants.getMetadataFilePath(options.projectName, options.outputDirectory), JSON.stringify(metadata));

                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    public generateAppUiManifest(options: IConfigOptions): void {
        const appUiPath = path.resolve(options.directoryName, 'appui');
        this._utils.checkExistingDirectory(appUiPath, options.outputLevel);

        const manifestFilePath = path.resolve(appUiPath, 'manifest');
        this._utils.writeToFile(manifestFilePath, IoConstants.AppUiManifestContent);
    }

    addAppUiMetadata(options: IConfigOptions, appUiManifestPath: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this._utils.validateFileExists(appUiManifestPath);

                if (!options.additionalAppuiManifestParameters) {
                    resolve();
                }

                const params = options.additionalAppuiManifestParameters as any;

                let stream = fs.createWriteStream(appUiManifestPath, { flags: 'a' });
                Object.keys(options.additionalAppuiManifestParameters).forEach((key : string) => {
                    stream.write(`\r\n${key}:${params[key]}`);
                });
                stream.end();
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }
}
