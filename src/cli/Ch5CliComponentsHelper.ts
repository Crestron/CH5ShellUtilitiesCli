// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import chalk from "chalk";
import { DeviceType, OutputLevel } from "@crestron/ch5-utilities";
import { Ch5CliLogger } from "./Ch5CliLogger";

const fs = require("fs"); 
const process = require("process"); 

export class Ch5CliComponentsHelper {
  private readonly _cliLogger: Ch5CliLogger;

  private readonly COMPLETE_PARAMETERS: any[] = [
    {
      "key": "all",
      "type": "boolean",
      "default": true,
      "valueIfNotFound": false,
      "alias": ['--all']
    },
    {
      "key": "list",
      "type": "array",
      "default": [],
      "valueIfNotFound": [],
      "alias": ['-l', '--list']
    },
    {
      "key": "force",
      "type": "boolean",
      "default": true,
      "valueIfNotFound": false,
      "alias": ['-f', '--force']
    },
    {
      "key": "help",
      "type": "boolean",
      "default": true,
      "valueIfNotFound": false,
      "alias": ['-h', '--help']
    },
    {
      "key": "menu",
      "type": "string",
      "default": "",
      "valueIfNotFound": "",
      "alias": ['-m', '--menu']
    },
    {
      "key": "name",
      "type": "string",
      "default": "",
      "valueIfNotFound": "",
      "alias": ['-n', '--name']
    },
    {
      "key": "zipFile",
      "type": "string",
      "default": "",
      "valueIfNotFound": "",
      "alias": ['-z', '--zipFile']
    }
  ];

  public constructor() {
    this._cliLogger = new Ch5CliLogger();
  }

  public async  getAdditionalHelpContent(path: string) {
    //   console.log("path", path);
    // const output=   fs.readFile(path, { encoding: "utf-8" }, (err:any, data:any) => {
    //     if (!err) {
    //       console.log("A");
    //       return data;
    //       // this._cliLogger.printLog(data);
    //     } else {
    //       console.log("B");
    //       throw this._cliLogger.onErr(err);
    //     }
    //   });
    //   console.log("Z");
    //   console.log("output",output);
    //   return "output";

    const output:string = await this.readFile(path);
    //  fs.readFile(path, { encoding: "utf-8" }, (err: any, data: any) => {
    //   if (!err) {
    //     console.log("A");
    //     return data;
    //     // this._cliLogger.printLog(data);
    //   } else {
    //     console.log("B");
    //     throw this._cliLogger.onErr(err);
    //   }
    // });
    return output;
  }

  async readFile(path: string):Promise<string> {
    return new Promise<string>((resolve, reject) => {
      fs.readFile(path, 'utf8', function (err: any, data: any) {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  processArgs() {
    const args = process.argv.slice(2);
    return this.processArgsAnalyze(args);
  }

  processArgsAnalyze(args: any): any {
    const output: any = {};
    let arrayKey: any = null;
    let arrayParam: any = null;
    let continueProcess = false;
    args.forEach((val: any, index: any, array: any) => {
      if (String(val).indexOf('--') === 0 || String(val).indexOf('-') === 0) {
        let optionName = null;
        if (String(val).indexOf('--') === 0) {
          optionName = val.replace('--', '');
        } else if (String(val).indexOf('-') === 0) {
          optionName = val.replace('-', '');
        }
        const paramObj = this.COMPLETE_PARAMETERS.find((tempObj) => tempObj.alias.map((v: string) => v.toLowerCase()).includes(val.trim().toLowerCase()));
        if (paramObj) {
          arrayKey = paramObj.key;
          arrayParam = paramObj.type;
          if (arrayParam === "array") {
            output[arrayKey] = [];
          } else if (arrayParam === "boolean" || arrayParam === "string") {
            output[arrayKey] = paramObj.default;
          }
          continueProcess = true;
        } else {
          // Currently we don't do anything here. Some thoughts could be to push the data as a value similar to the
          // else statement below. Or we could nullify arrayKey and arrayParam.
        }
      } else {
        if (arrayKey != null) {
          if (arrayParam === "array") {
            output[arrayKey].push(val);
          } else if (arrayParam === "boolean" || arrayParam === "string") {
            if (continueProcess === true) {
              output[arrayKey] = val;
              continueProcess = false;
            }
          }
        }
      }
    });
    this._cliLogger.log("processArgs Before", output);
    for (let i:number = 0; i < this.COMPLETE_PARAMETERS.length; i++) {
      if (!output[this.COMPLETE_PARAMETERS[i]["key"]]) {
        output[this.COMPLETE_PARAMETERS[i]["key"]] = this.COMPLETE_PARAMETERS[i]["valueIfNotFound"];
      }
    }
    this._cliLogger.log("processArgs After", output);
    return output;
  }

}
