// Copyright (C) 2021 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.
const process = require('process');
export const LOG_LEVELS: any = {
  TRACE: 1,
  DEBUG: 2,
  INFO: 6,
  WARN: 9,
  ERROR: 13,
  FATAL: 20,
  OFF: 99,
};

export class Ch5CliLogger {

  private allowLogging = true;
  private logLevel: any = LOG_LEVELS.TRACE;

  public readonly FORMATTING: any = {
    Reset: "\x1b[0m",
    Bright: "\x1b[1m",
    Dim: "\x1b[2m",
    Underscore: "\x1b[4m",
    Blink: "\x1b[5m",
    Reverse: "\x1b[7m",
    Hidden: "\x1b[8m",
    SpaceChar: "%s"
  };

  public readonly FOREGROUND_COLORS: any = {
    Black: "\x1b[30m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Magenta: "\x1b[35m",
    Cyan: "\x1b[36m",
    White: "\x1b[37m"
  };

  public readonly BACKGROUND_COLORS: any = {
    Black: "\x1b[40m",
    Red: "\x1b[41m",
    Green: "\x1b[42m",
    Yellow: "\x1b[43m",
    Blue: "\x1b[44m",
    Magenta: "\x1b[45m",
    Cyan: "\x1b[46m",
    White: "\x1b[47m"
  };

  constructor(allowLogging: boolean = false, logLevel: any = LOG_LEVELS.TRACE) {
    this.allowLogging = allowLogging;
    this.logLevel = logLevel;
  }

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
    if (this.allowLogging === true && this.logLevel <= LOG_LEVELS.DEBUG) {
      console.log(this.FOREGROUND_COLORS.Blue, ...input, this.FORMATTING.Reset);
    }
  }

  public start(...input: any) {
    if (this.allowLogging === true && this.logLevel <= LOG_LEVELS.DEBUG) {
      console.group(this.FOREGROUND_COLORS.Blue, ...input, this.FORMATTING.Reset);
    }
  }

  public end() {
    if (this.allowLogging === true && this.logLevel <= LOG_LEVELS.DEBUG) {
      console.groupEnd();
    }
  }

  /**
   *
   * @param  {...any} input
   */
  public warn(...input: any) {
    if (this.allowLogging === true && this.logLevel <= LOG_LEVELS.WARN) {
      console.warn(this.FOREGROUND_COLORS.Yellow, ...input, this.FORMATTING.Reset);
    }
  }

  /**
   *
   * @param  {...any} input
   */
  public error(...input: any) {
    if (this.allowLogging === true && this.logLevel <= LOG_LEVELS.ERROR) {
      console.error(this.FOREGROUND_COLORS.Red, ...input, this.FORMATTING.Reset);
    }
  }

  /**
   *
   * @param  {...any} input
   */
  public info(...input: any) {
    if (this.allowLogging === true && this.logLevel <= LOG_LEVELS.INFO) {
      console.info(this.FOREGROUND_COLORS.Magenta, ...input, this.FORMATTING.Reset);
    }
  }

  /**
   *
   * @param  {...any} input
   */
  public trace(...input: any) {
    if (this.allowLogging === true && this.logLevel <= LOG_LEVELS.TRACE) {
      console.trace(this.FOREGROUND_COLORS.Cyan, ...input, this.FORMATTING.Reset);
    }
  }

  /**
   *
   * @param  {...any} input
   */
  public printSuccess(...input: any) {
    console.log(this.FOREGROUND_COLORS.Green, ...input, this.FORMATTING.Reset);
  }

  /**
   *
   * @param  {...any} input
   */
  public printWarning(...input: any) {
    console.log(this.FOREGROUND_COLORS.Yellow, ...input, this.FORMATTING.Reset);
  }

  /**
   *
   * @param  {...any} input
   */
  public printError(...input: any) {
    let outputString = "";
    for (let i = 0; i < input.length; i++) {
      outputString += input[i] + ", ";
    }
    outputString = outputString.substring(0, outputString.length - 2);
    outputString = this.FOREGROUND_COLORS.Red + outputString + this.FORMATTING.Reset + "\n";
    process.stderr.write(outputString);
  }

  /**
   *
   * @param  {...any} input
   */
  public printLog(...input: any) {
    console.log(this.FOREGROUND_COLORS.Blue, ...input, this.FORMATTING.Reset);
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
