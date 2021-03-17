// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import { Ch5CliUtil } from "./Ch5CliUtil";
import { Ch5CliLogger } from "./Ch5CliLogger";

const fs = require("fs");
const process = require("process");
const path = require("path");
const editJsonFile = require("edit-json-file");
const fsExtra = require("fs-extra");

export class Ch5CliProjectConfig {

  private readonly _cliUtil: Ch5CliUtil;
  private readonly _cliLogger: Ch5CliLogger;
  private file = editJsonFile("./app/project-config.json");

  public constructor() {
    this._cliUtil = new Ch5CliUtil();
    this._cliLogger = new Ch5CliLogger();
  }

  getJson() {
    return fsExtra.readJSONSync("./app/project-config.json");
    // return JSON.parse(JSON.stringify(projectConfigJson));
  }

  getAllPages() {
    let projectConfigObject = this.getJson(); //    JSON.parse(JSON.stringify(projectConfigJson));
    return projectConfigObject.content.pages;
  }

  getAllWidgets() {
    const projectConfigObject = this.getJson(); //JSON.parse(JSON.stringify(projectConfigJson));
    return projectConfigObject.content.widgets;
  }

  getAllPagesAndWidgets() {
    const projectConfigObject = this.getJson(); // JSON.parse(JSON.stringify(projectConfigJson));
    const output = [];
    for (let i: number = 0; i < projectConfigObject.content.pages.length; i++) {
      output.push({ index: i, name: projectConfigObject.content.pages[i].pageName, component: projectConfigObject.content.pages[i], type: "page" });
    }
    for (let i: number = 0; i < projectConfigObject.content.widgets.length; i++) {
      output.push({ index: i + projectConfigObject.content.pages.length, name: projectConfigObject.content.widgets[i].widgetName, component: projectConfigObject.content.widgets[i], type: "widget" });
    }
    return output;
  }

  getAllNavigations() {
    const pages = this.getAllPages();
    let navigations = pages.filter((pageObj: { navigation: any; }) => {
      return this._cliUtil.isValidObject(pageObj.navigation);
    });
    return navigations;
  }

  getHighestNavigationSequence() {
    let pages = this.getAllNavigations();
    pages = pages.sort(this._cliUtil.dynamicsort("desc", "navigation", "sequence"));
    if (pages && pages[0] && pages[0].navigation && pages[0].navigation.sequence) {
      return pages[0].navigation.sequence;
    } else {
      return 0;
    }
  }

  removePageFromJSON(pageName: string) {
    try {
      let pageList = this.getAllPages();
      let pageListNew = [];
      for (let i: number = 0; i < pageList.length; i++) {
        if (pageList[i].widgetName.toLowerCase() !== pageName.toLowerCase()) {
          pageListNew.push(pageList[i]);
        }
      }
      this._cliLogger.log("pageName", pageName);
      this.file.set("content.pages", pageListNew);
      this.file.save();
    } catch (e) {
      this._cliLogger.log("error", e);
      throw e;
    }
  }

  removeWidgetFromJSON(widgetName: string) {
    try {
      let widgetList = this.getAllWidgets();
      let widgetListNew = [];
      for (let i: number = 0; i < widgetList.length; i++) {
        if (widgetList[i].widgetName.toLowerCase() !== widgetName.toLowerCase()) {
          widgetListNew.push(widgetList[i]);
        }
      }
      this._cliLogger.log("widgetName", widgetName);
      this.file.set("content.widgets", widgetListNew);
      this.file.save();
    } catch (e) {
      this._cliLogger.log("error", e);
      throw e;
    }
  }

  savePageToJSON(pageObject: any) {
    try {
      let pagesList = this.getAllPages();
      pagesList.push(pageObject);
      this._cliLogger.log("pageObject", pageObject);
      this.file.set("content.pages", pagesList);
      this.file.save();
    } catch (e) {
      this._cliLogger.log("error", e);
      throw e;
    }
  }

  addPagesToJSON(pageArrayInput: any[]) {
    try {
      if (pageArrayInput && pageArrayInput.length > 0) {
        let newStartingNavigationSequence = this.getHighestNavigationSequence();
        let pagesList = JSON.parse(JSON.stringify(this.getAllPages()));
        let newPageList = this.getAllPages();
        for (let i: number = 0; i < pageArrayInput.length; i++) {
          let isFileExisting = false;
          let pageListIndex = -1;
          for (let j = 0; j < pagesList.length; j++) {
            if (pagesList[j].pageName.trim().toLowerCase() === pageArrayInput[i].pageName.trim().toLowerCase()) {
              isFileExisting = true;
              pageListIndex = j;
              break;
            }
          }
          if (isFileExisting === false) {
            if (pageArrayInput[i].navigation) {
              newStartingNavigationSequence += 1;
              pageArrayInput[i].navigation.sequence = newStartingNavigationSequence;
            }
            newPageList.push(pageArrayInput[i]);
          } else {
            const objIndex = newPageList.findIndex((obj: { pageName: string; }) => obj.pageName.trim().toLowerCase() === pageArrayInput[i].pageName.trim().toLowerCase());
            let oldSequenceNumber = -1;
            if (newPageList[objIndex].navigation) {
              oldSequenceNumber = newPageList[objIndex].navigation.sequence;
            }
            newPageList[objIndex] = pageArrayInput[i];
            if (newPageList[objIndex].navigation) {
              if (oldSequenceNumber === -1) {
                newStartingNavigationSequence += 1;
                oldSequenceNumber = newStartingNavigationSequence;
              }
              newPageList[objIndex].navigation.sequence = oldSequenceNumber;
            }
          }
        }
        this._cliLogger.log("newPageList", newPageList);
        this.file.set("content.pages", newPageList);
        this.file.save();
      }
    } catch (e) {
      this._cliLogger.log("error", e);
      throw e;
    }
  }

  addWidgetsToJSON(widgetArrayInput: any[]) {
    try {
      if (widgetArrayInput && widgetArrayInput.length > 0) {
        let widgetsList = JSON.parse(JSON.stringify(this.getAllWidgets()));
        let newWidgetsList = this.getAllWidgets();
        for (let i: number = 0; i < widgetArrayInput.length; i++) {
          let isFileExisting = false;
          for (let j = 0; j < widgetsList.length; j++) {
            if (widgetsList[j].widgetName.trim().toLowerCase() === widgetArrayInput[i].widgetName.trim().toLowerCase()) {
              isFileExisting = true;
              break;
            }
          }
          if (isFileExisting === false) {
            newWidgetsList.push(widgetArrayInput[i]);
          } else {
            const objIndex = newWidgetsList.findIndex((obj: { widgetName: string; }) => obj.widgetName.trim().toLowerCase() === widgetArrayInput[i].widgetName.trim().toLowerCase());
            newWidgetsList[objIndex] = widgetArrayInput[i];
          }
        }
        this._cliLogger.log("newWidgetsList", newWidgetsList);
        this.file.set("content.widgets", newWidgetsList);
        this.file.save();
      }
    } catch (e) {
      this._cliLogger.log("error", e);
      throw e;
    }
  }

  saveWidgetToJSON(widgetObject: any) {
    try {
      let widgetsList = this.getAllWidgets();
      widgetsList.push(widgetObject);
      this._cliLogger.log("widgetObject", widgetObject);
      this.file.set("content.widgets", widgetsList);
      this.file.save();
    } catch (e) {
      this._cliLogger.log("error", e);
      throw e;
    }
  }

  removePagesFromJSON(listOfInputPages: string[]) {
    try {
      if (listOfInputPages && listOfInputPages.length > 0) {
        let pagesList = this.getAllPages();
        const newList = [];
        for (let i: number = 0; i < pagesList.length; i++) {
          let isFileExisting = false;
          for (let j = 0; j < listOfInputPages.length; j++) {
            if (pagesList[i].pageName.trim().toLowerCase() === listOfInputPages[j].trim().toLowerCase()) {
              isFileExisting = true;
              break;
            }
          }
          if (isFileExisting === false) {
            newList.push(pagesList[i]);
          }
        }
        this._cliLogger.log("newList", newList);
        if (newList.length != pagesList.length) {
          this.file.set("content.pages", newList);
          this.file.save();
        }
      }
    } catch (e) {
      this._cliLogger.log("error", e);
      throw e;
    }
  }

  removeWidgetsFromJSON(listOfInputWidgets: any[]) {
    try {
      if (listOfInputWidgets && listOfInputWidgets.length > 0) {
        let widgetList = this.getAllWidgets();
        const newList = [];
        for (let i: number = 0; i < widgetList.length; i++) {
          let isFileExisting = false;
          for (let j = 0; j < listOfInputWidgets.length; j++) {
            if (widgetList[i].widgetName.trim().toLowerCase() === listOfInputWidgets[j].trim().toLowerCase()) {
              isFileExisting = true;
              break;
            }
          }
          if (isFileExisting === false) {
            newList.push(widgetList[i]);
          }
        }
        this._cliLogger.log("newList", newList);
        if (newList.length != widgetList.length) {
          this.file.set("content.widgets", newList);
          this.file.save();
        }
      }
    } catch (e) {
      this._cliLogger.log("error", e);
      throw e;
    }
  }

  isPageExistInJSON(pageName: string) {
    const pagesArray = this.getAllPages();
    let pageExists = false;
    for (let i: number = 0; i < pagesArray.length; i++) {
      if (pagesArray[i].pageName.trim().toLowerCase() === pageName.trim().toLowerCase()) {
        this._cliLogger.log("Page EXISTS: " + pageName);
        pageExists = true;
        break;
      }
    }
    return pageExists;
  }

  isWidgetExistInJSON(widgetName: string) {
    const widgetsArray = this.getAllWidgets();
    let widgetExists = false;
    for (let i: number = 0; i < widgetsArray.length; i++) {
      if (widgetsArray[i].widgetName.trim().toLowerCase() === widgetName.trim().toLowerCase()) {
        this._cliLogger.log("Widget EXISTS: " + widgetName);
        widgetExists = true;
        break;
      }
    }
    return widgetExists;
  }

  isPageExistInFolder(pageName: string) {
    const pagesArray = this.getAllPages();
    for (let i: number = 0; i < pagesArray.length; i++) {
      if (fs.existsSync(pagesArray[i].componentPath)) {
        this._cliLogger.log("Component path EXISTS: " + pagesArray[i].componentPath);
      } else {
        this._cliLogger.log("Component path DOES NOT EXIST: " + pagesArray[i].componentPath);
      }
    }
  }

}
