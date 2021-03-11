// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import chalk from "chalk";
import { DeviceType, OutputLevel } from "@crestron/ch5-utilities";

process.env["NODE_CONFIG_DIR"] =  __dirname; //"/config"; //"./shell-utilities/config/";
const config = require("config");

export class Ch5CliLogger {
  private allowLogging = config.logger.allowLogging;

  private readonly LOG_LEVELS: any = {
    TRACE: 1,
    DEBUG: 2,
    INFO: 6,
    WARN: 9,
    ERROR: 13,
    FATAL: 20,
    OFF: 99,
  };

  private logLevel: any = config.logger.logLevel;

  private readonly Reset: string = "\x1b[0m";
  private readonly Bright: string = "\x1b[1m";
  private readonly Dim: string = "\x1b[2m";
  private readonly Underscore: string = "\x1b[4m";
  private readonly Blink: string = "\x1b[5m";
  private readonly Reverse: string = "\x1b[7m";
  private readonly Hidden: string = "\x1b[8m";

  private readonly FgBlack: string = "\x1b[30m";
  private readonly FgRed: string = "\x1b[31m";
  private readonly FgGreen: string = "\x1b[32m";
  private readonly FgYellow: string = "\x1b[33m";
  private readonly FgBlue: string = "\x1b[34m";
  private readonly FgMagenta: string = "\x1b[35m";
  private readonly FgCyan: string = "\x1b[36m";
  private readonly FgWhite: string = "\x1b[37m";

  private readonly BgBlack: string = "\x1b[40m";
  private readonly BgRed: string = "\x1b[41m";
  private readonly BgGreen: string = "\x1b[42m";
  private readonly BgYellow: string = "\x1b[43m";
  private readonly BgBlue: string = "\x1b[44m";
  private readonly BgMagenta: string = "\x1b[45m";
  private readonly BgCyan: string = "\x1b[46m";
  private readonly BgWhite: string = "\x1b[47m";

  private readonly SpaceChar: string = "%s";

  /**
   * 
   * @param {*} noOfLineBreaks 
   */
  public linebreak(noOfLineBreaks: number) {
    let lineBreakText = "";
    if (noOfLineBreaks && noOfLineBreaks > 0) {
      for (var i = 0; i < noOfLineBreaks; i++) {
        lineBreakText += "\n";
      }
      console.log(lineBreakText);
    }
  }

  /**
   * 
   * @param  {...any} input 
   */
  public log(...input: any) {
    if (this.allowLogging === true && this.logLevel <= this.LOG_LEVELS.DEBUG) {
      console.log(this.FgBlue, ...input, this.Reset);
    }
  }

  /**
   * 
   * @param  {...any} input 
   */
  public warn(...input: any) {
    if (this.allowLogging === true && this.logLevel <= this.LOG_LEVELS.WARN) {
      console.warn(this.FgYellow, ...input, this.Reset);
    }
  }

  /**
   * 
   * @param  {...any} input 
   */
  public error(...input: any) {
    if (this.allowLogging === true && this.logLevel <= this.LOG_LEVELS.ERROR) {
      console.error(this.FgRed, ...input, this.Reset);
    }
  }

  /**
   * 
   * @param  {...any} input 
   */
  public info(...input: any) {
    if (this.allowLogging === true && this.logLevel <= this.LOG_LEVELS.INFO) {
      console.info(this.FgMagenta, ...input, this.Reset);
    }
  }

  /**
   * 
   * @param  {...any} input 
   */
  public trace(...input: any) {
    if (this.allowLogging === true && this.logLevel <= this.LOG_LEVELS.TRACE) {
      console.trace(this.FgCyan, ...input, this.Reset);
    }
  }

  /**
   * 
   * @param  {...any} input 
   */
  public printSuccess(...input: any) {
    console.info(this.FgGreen, ...input, this.Reset);
  }

  /**
   * 
   * @param  {...any} input 
   */
  public printWarning(...input: any) {
    console.info(this.FgYellow, ...input, this.Reset);
  }

  /**
   * 
   * @param  {...any} input 
   */
  public printError(...input: any) {
    console.error(this.FgRed, ...input, this.Reset);
  }

  /**
   * 
   * @param  {...any} input 
   */
  public printLog(...input: any) {
    console.error(...input);
  }

  /**
   * Throw any error raised
   * @param {any} err
   */
  public onErr(err: any) {
    this.error(err);
    throw err;
  }
}
