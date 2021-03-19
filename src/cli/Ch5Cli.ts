// Copyright (C) 2018 to the present, Crestron Electronics, Inc.
// All rights reserved.
// No part of this software may be reproduced in any form, machine
// or natural, without the express written consent of Crestron Electronics.
// Use of this source code is subject to the terms of the Crestron Software License Agreement
// under which you licensed this source code.

import commander from "commander";
import chalk from 'chalk';

import { Ch5GeneratePageCli } from "./generate-page/Ch5GeneratePageCli";
import { Ch5GenerateWidgetCli } from "./generate-widget/Ch5GenerateWidgetCli";
import { Ch5ExportProjectCli } from "./export-project/Ch5ExportProjectCli";
import { Ch5DeleteComponentsCli } from "./delete-components/Ch5DeleteComponentsCli";
import { Ch5ExportAllCli } from "./export-all/Ch5ExportAllCli";
import { Ch5ExportLibrariesCli } from "./export-libraries/Ch5ExportLibrariesCli";
import { Ch5ExportAssetsCli } from "./export-assets/Ch5ExportAssetsCli";
import { Ch5ExportComponentsCli } from "./export-components/Ch5ExportComponentsCli";
import { Ch5ImportAssetsCli } from "./import-assets/Ch5ImportAssetsCli";
import { Ch5ImportLibrariesCli } from "./import-libraries/Ch5ImportLibrariesCli";
import { Ch5ImportComponentsCli } from "./import-components/Ch5ImportComponentsCli";
import { Ch5ImportAllCli } from "./import-all/Ch5ImportAllCli";
import { Ch5ValidateProjectConfigCli } from "./validate-project-config/Ch5ValidateProjectConfigJsonCli";

const clear = require('clear');
const figlet = require('figlet');
const packageJson = require('../../package.json');
const buildVersion = packageJson.version || 'VERSION_NOT_READ';

export class Ch5ShellCli {
  private readonly deleteComponents: Ch5DeleteComponentsCli;
  private readonly exportAll: Ch5ExportAllCli;
  private readonly exportAssets: Ch5ExportAssetsCli;
  private readonly exportComponents: Ch5ExportComponentsCli;
  private readonly exportLibraries: Ch5ExportLibrariesCli;
  private readonly exportProject: Ch5ExportProjectCli;
  private readonly generatePage: Ch5GeneratePageCli;
  private readonly generateWidget: Ch5GenerateWidgetCli;
  private readonly importAll: Ch5ImportAllCli;
  private readonly importAssets: Ch5ImportAssetsCli;
  private readonly importComponents: Ch5ImportComponentsCli;
  private readonly importLibraries: Ch5ImportLibrariesCli;
  private readonly validateProjectConfig: Ch5ValidateProjectConfigCli;

  public constructor() {
    this.deleteComponents = new Ch5DeleteComponentsCli();
    this.exportAll = new Ch5ExportAllCli();
    this.exportAssets = new Ch5ExportAssetsCli();
    this.exportComponents = new Ch5ExportComponentsCli();
    this.exportLibraries = new Ch5ExportLibrariesCli();
    this.exportProject = new Ch5ExportProjectCli();
    this.generatePage = new Ch5GeneratePageCli();
    this.generateWidget = new Ch5GenerateWidgetCli();
    this.importAll = new  Ch5ImportAllCli();
    this.importAssets = new  Ch5ImportAssetsCli();
    this.importComponents = new  Ch5ImportComponentsCli();
    this.importLibraries = new  Ch5ImportLibrariesCli();
    this.validateProjectConfig = new  Ch5ValidateProjectConfigCli();
  }

  public async run(): Promise<void> {
    const program = new commander.Command();
    program
      .version(buildVersion)
      .description("CH5 Shell Utilities CLI");

    // clear();
    console.log(
      chalk.green(
        figlet.textSync('crestron-shell-cli', { horizontalLayout: 'full' })
      )
    );

    await this.deleteComponents.setupCommand(program);
    await this.exportAll.setupCommand(program);
    await this.exportAssets.setupCommand(program);
    await this.exportComponents.setupCommand(program);
    await this.exportLibraries.setupCommand(program);
    await this.exportProject.setupCommand(program);
    await this.generatePage.setupCommand(program);
    await this.generateWidget.setupCommand(program);
    await this.importAll.setupCommand(program);
    await this.importAssets.setupCommand(program);
    await this.importComponents.setupCommand(program);
    await this.importLibraries.setupCommand(program);
    await this.validateProjectConfig.setupCommand(program);

    // error on unknown command
    program.on('command:*', function () {
      console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
      process.exit(1);
    });

    program.parse(process.argv);

    // if (!process.argv.slice(2).length) {
    //   clear();
    //   console.log(
    //     chalk.blue(
    //       figlet.textSync(`Crestron CH5 Utilities © ${new Date().getFullYear()}`,
    //         {
    //           font: 'Standard',
    //           horizontalLayout: 'full',
    //           verticalLayout: 'full'
    //         })
    //     )
    //   );
    //   program.outputHelp();
    // }
  }
}
