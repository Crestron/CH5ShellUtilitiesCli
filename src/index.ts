// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { IConfigOptions } from './interfaces';
import { Utils, ConsoleLogger } from './utils';
import { Ch5Archiver } from "./archiver";
import { Ch5Distributor } from "./distributor";
import { MetadataGenerator } from "./metadata";
import { DeviceTypeEnum } from "./enums";

export { IConfigOptions as ConfigOptions } from './interfaces';
export { DeviceTypeEnum as DeviceType } from "./enums";
export { OutputLevelEnum as OutputLevel } from "./enums";

export const archiver = async (options: IConfigOptions): Promise<void> => {
  const logger = new ConsoleLogger();
  const utils = new Utils(logger);
  const metadataGenerator = new MetadataGenerator(utils);
  const ch5Archiver = new Ch5Archiver(utils, metadataGenerator);

  await ch5Archiver.createArchive(options);
};

export const distributor = async (filename: string, options: IConfigOptions): Promise<void> => {
  const logger = new ConsoleLogger();
  const utils = new Utils(logger);
  const dist = new Ch5Distributor(utils, logger);

  await dist.initializeTransferWithCredentialsCheck(filename, options);
};
