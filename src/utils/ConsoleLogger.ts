// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { ILogger } from "../interfaces";

export class ConsoleLogger implements ILogger{
  public debug(msg: string): void {
    console.debug(msg);
  }

  public error(msg: string, err: Error): void {
    console.error(err, msg);
  }

  public info(msg: string): void {
    console.info(msg)
  }

  public warn(msg: string, err?: Error): void {
    console.warn(msg, err);
  }
}
