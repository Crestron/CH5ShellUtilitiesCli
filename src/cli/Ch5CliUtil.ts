// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import chalk from "chalk";
import { DeviceType, OutputLevel } from "@crestron/ch5-utilities";

const rimraf = require("rimraf");

export class Ch5CliUtil {

  /**
 * Delete directory by path
 * @param {string} directoryName
 */
  public deleteFolderSync(directoryName: string) {
    try {
      return rimraf.sync(directoryName);
    } catch (e) {
      return false;
    }
  }

  /**
* Delete directory by path
* @param {string} directoryName
*/
  public async deleteFolder(directoryName: string) {
    try {
      return await rimraf.sync(directoryName);
    } catch (e) {
      return false;
    }
  }

  /**
   * Delete File
   * @param {string} completeFilePath
   */
  public async deleteFile(completeFilePath: string) {
    try {
      return await rimraf.sync(completeFilePath);
    } catch (e) {
      return false;
    }
  }

  public writeError(error: Error): void {
    console.log(chalk.red(`${error.name}: ${error.message}`));
  }

  public getOutputLevel(options: any): OutputLevel {
    if (options.quiet) {
      return OutputLevel.Quiet;
    }

    if (options.verbose) {
      return OutputLevel.Verbose;
    }

    return OutputLevel.Normal;
  }


  /**
   * Check if input is valid. Invalid are "", 0, {}, [], null, undefined.
   * @param {*} input
   */
  public isValidInput(input: any) {
    if (typeof input === 'undefined' || input === null) {
      return false;
    } else if (typeof input === 'number') {
      return true;
    } else if (typeof input === 'string') {
      if (input && input.trim() !== "") {
        return true;
      } else {
        return false;
      }
    } else if (typeof input === 'boolean') {
      return true;
    } else if (typeof input === 'object') {
      if (input) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   *
   * @param {*} input
   */
  public isValidObject(input: any) {
    // // Polyfill is array check
    // if (!Array.isArray) {
    //   Array.isArray = function (arg) {
    //     return Object.prototype.toString.call(arg) === '[object Array]';
    //   };
    // }
    if (!input || !this.isValidInput(input)) {
      return false;
    } else if (typeof (input) === "object" && !Array.isArray(input)) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Convert string to array
   * @param {*} inputArray
   */
  public convertArrayToString(inputArray: string[], delimiter = ",") {
    if (typeof (delimiter) != "string") {
      delimiter = ', '; // forcing default
    }
    if (typeof (inputArray) === "string") {
      return inputArray; // since its of string type, return as is
    } else if (this.isValidInput(inputArray) && inputArray.length > 0) {
      let output = "";
      for (let i:number = 0; i < inputArray.length; i++) {
        output += inputArray[i] + delimiter;
      }
      if (delimiter.trim() === "") {
        return output.trim();
      } else {
        return output.substr(0, output.length - delimiter.length).trim();
      }
    } else {
      return "";
    }
  }

  /**
   * Convert string to boolean
   * @param {*} input
   */
  public convertStringToBoolean(input: string) {
    if (this.isValidInput(input) && typeof (input) === "string") {
      if (input.trim().toLowerCase() === 'n') {
        return false;
      } else if (input.trim().toLowerCase() === 'y') {
        return true;
      } else {
        return false;
      }
    } else {
      return false
    }
  }

  /**
 * Gets the text from the config default.json file.
 * @param {*} key
 * @param  {...any} values
 */
  public getText(DYNAMIC_TEXT_MESSAGES: any, key: string, ...values: string[]) {
    try {
      let output: any = "";
      if (String(key).indexOf(".") !== -1) {
        const newArray: string[] = key.split(".");
        output = DYNAMIC_TEXT_MESSAGES[newArray[0]];
        for (let i: number = 1; i < newArray.length; i++) {
          output = output[newArray[i]];
        }
      } else {
        output = DYNAMIC_TEXT_MESSAGES[key];
      }
      if (values && values.length > 0) {
        for (let i:number = 0; i < values.length; i++) {
          output = this.replaceAll(output, "{" + i + "}", values[i]);
        }
      }
      return output;
    } catch (e) {
      return key;
    }
  }

  /**
   *
   * @param {*} order
   * @param  {...any} property
   */
  public dynamicsort(order: string, ...property: any) {
    let sort_order = 1;
    if (order === "desc") {
      sort_order = -1;
    }
    return (a: any, b: any) => {
      if (property.length > 1) {
        let propA = a[property[0]];
        let propB = b[property[0]];
        for (let i:number = 1; i < property.length; i++) {
          propA = propA[property[i]];
          propB = propB[property[i]];
        }
        // a should come before b in the sorted order
        if (propA < propB) {
          return -1 * sort_order;
          // a should come after b in the sorted order
        } else if (propA > propB) {
          return 1 * sort_order;
          // a and b are the same
        } else {
          return 0 * sort_order;
        }
      } else {
        // a should come before b in the sorted order
        if (a[property] < b[property]) {
          return -1 * sort_order;
          // a should come after b in the sorted order
        } else if (a[property] > b[property]) {
          return 1 * sort_order;
          // a and b are the same
        } else {
          return 0 * sort_order;
        }
      }
    }
  }

  /**
   *
   * @param {*} input
   */
  public deepCopy(input: string) {
    if (this.isValidInput(input) && typeof (input) === 'object')
      return JSON.parse(JSON.stringify(input));
    else
      return {};
  }

  /**
   *
   * @param {*} str
   * @param {*} find
   * @param {*} replace
   */
  public replaceAll(str: string, find: string, replace: string) {
    if (str && String(str).trim() !== "") {
      return String(str).split(find).join(replace);
    } else {
      return str;
    }
  }

}
